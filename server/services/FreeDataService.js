const axios = require('axios');
const NodeCache = require('node-cache');

class FreeDataService {
    constructor() {
        this.yelpApiKey = process.env.YELP_API_KEY;
        this.cache = new NodeCache({ stdTTL: 3600 }); // 1 hour cache
        this.yelpBaseUrl = 'https://api.yelp.com/v3';
        this.osmBaseUrl = 'https://overpass-api.de/api/interpreter';
    }

    async searchBusinesses(criteria) {
        const { industry, city, state, country = 'usa', limit = 20 } = criteria;
        const allLeads = [];

        try {
            // Try Yelp API first (best quality data, primarily USA)
            if (this.yelpApiKey && (country === 'usa' || country === 'us')) {
                console.log('🔍 Searching Yelp for real business data...');
                const yelpResults = await this.searchYelp(industry, city, state, Math.min(limit, 50));
                allLeads.push(...yelpResults);
            }

            // Use OpenStreetMap (works globally including Bangladesh)
            if (allLeads.length < limit) {
                console.log('🌍 Searching OpenStreetMap for additional data...');
                try {
                    const remaining = limit - allLeads.length;
                    const osmResults = await this.searchOpenStreetMap(industry, city, state, country, remaining);
                    allLeads.push(...osmResults);
                } catch (osmError) {
                    console.log('⚠️ OpenStreetMap unavailable');
                }
            }

            // If no results from APIs, return empty result instead of generating synthetic data
            if (allLeads.length === 0) {
                return {
                    success: true,
                    total: 0,
                    leads: [],
                    sources: {
                        bySource: {},
                        free_sources: 0
                    },
                    message: 'No leads found from configured free data sources'
                };
            }

            // Remove duplicates
            const uniqueLeads = this.removeDuplicates(allLeads);

            return {
                success: true,
                total: uniqueLeads.length,
                leads: uniqueLeads.slice(0, limit),
                sources: {
                    bySource: {
                        yelp: allLeads.filter(l => l.sources?.[0]?.name === 'yelp').length,
                        openstreetmap: allLeads.filter(l => l.sources?.[0]?.name === 'openstreetmap').length
                    },
                    free_sources: 2
                }
            };

        } catch (error) {
            console.error('Free data search failed:', error);
            return {
                success: false,
                total: 0,
                leads: [],
                sources: {
                    bySource: {},
                    free_sources: 0
                },
                error: 'Free data search failed'
            };
        }
    }

    async searchYelp(industry, city, state, limit) {
        if (!this.yelpApiKey) {
            console.log('⚠️ Yelp API key not configured');
            return [];
        }

        const cacheKey = `yelp_${industry}_${city}_${state}_${limit}`;
        const cached = this.cache.get(cacheKey);
        if (cached) return cached;

        try {
            const categories = this.getYelpCategories(industry);
            const location = this.buildLocation(city, state);

            const response = await axios.get(`${this.yelpBaseUrl}/businesses/search`, {
                headers: {
                    'Authorization': `Bearer ${this.yelpApiKey}`
                },
                params: {
                    categories: categories,
                    location: location,
                    limit: Math.min(limit, 50), // Yelp max is 50
                    sort_by: 'best_match',
                    radius: 25000 // 25km radius
                }
            });

            const businesses = response.data.businesses.map(business => 
                this.formatYelpBusiness(business, industry)
            );

            this.cache.set(cacheKey, businesses);
            console.log(`✅ Found ${businesses.length} real businesses from Yelp`);
            return businesses;

        } catch (error) {
            console.error('Yelp API error:', error.response?.data || error.message);
            return [];
        }
    }

    async searchOpenStreetMap(industry, city, state, country = 'usa', limit = 20) {
        const cacheKey = `osm_${industry}_${city}_${state}_${country}_${limit}`;
        const cached = this.cache.get(cacheKey);
        if (cached) return cached;

        try {
            // Build Overpass query for business data
            const query = this.buildOSMQuery(industry, city, state, country, limit);
            
            const response = await axios.post(this.osmBaseUrl, query, {
                headers: { 
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'AlphaLeads/1.0'
                },
                timeout: 15000 // 15 second timeout
            });

            const businesses = this.parseOSMResponse(response.data, industry, country);
            
            this.cache.set(cacheKey, businesses);
            console.log(`✅ Found ${businesses.length} businesses from OpenStreetMap (${country})`);
            return businesses;

        } catch (error) {
            console.error('OpenStreetMap error:', error.message);
            return [];
        }
    }

    buildOSMQuery(industry, city, state, country = 'usa', limit = 20) {
        const businessTypes = this.getOSMTags(industry);
        
        // Map country to geocode bounding box (approximate)
        const countryBounds = {
            'bangladesh': '(20.5,88.0,26.7,92.7)',
            'bd': '(20.5,88.0,26.7,92.7)',
            'usa': '(24.0,-125.0,50.0,-66.0)',
            'us': '(24.0,-125.0,50.0,-66.0)',
            'uk': '(49.9,-8.2,60.9,1.8)',
            'gb': '(49.9,-8.2,60.9,1.8)'
        };
        
        const bounds = countryBounds[country?.toLowerCase()] || countryBounds['usa'];
        
        // Build simple query parts for each business type
        const queryParts = businessTypes.map(type => 
            `node["${type.key}"~"${type.value}",i]${bounds};
             way["${type.key}"~"${type.value}",i]${bounds};`
        ).join('');
        
        // Simplified Overpass QL query
        const query = `[out:json][timeout:25];(${queryParts});out center ${limit || 20};`;

        return query;
    }

    async parseOSMResponse(data, industry, country = 'usa') {
        if (!data.elements || data.elements.length === 0) return [];

        const elements = data.elements.filter(element => element.tags && element.tags.name);
        const mapped = await Promise.all(elements.map(element => this.formatOSMBusiness(element, industry, country)));
        return mapped.filter(business => business && business.businessName); // Remove invalid entries
    }

    formatYelpBusiness(business, industry) {
        return {
            id: `yelp_${business.id}`,
            businessName: business.name,
            businessType: business.categories?.[0]?.title || 'Business',
            industry: industry,
            contactName: null, // Yelp doesn't provide individual contact names
            phone: business.display_phone || business.phone,
            email: null, // Yelp doesn't provide emails
            website: business.url,
            address: {
                street: business.location?.address1,
                city: business.location?.city,
                state: business.location?.state,
                zipCode: business.location?.zip_code,
                country: business.location?.country || 'US',
                coordinates: {
                    lat: business.coordinates?.latitude,
                    lng: business.coordinates?.longitude
                }
            },
            businessDetails: {
                description: business.review_snippet || '',
                rating: business.rating,
                reviewCount: business.review_count,
                yearEstablished: null,
                hours: business.hours?.[0]?.open || []
            },
            sources: [{
                name: 'yelp',
                sourceId: business.id,
                url: business.url,
                collectedAt: new Date(),
                confidence: 90
            }],
            confidence: this.calculateYelpConfidence(business),
            status: 'new',
            createdAt: new Date(),
            selected: false
        };
    }

    async formatOSMBusiness(element, industry, country = 'usa') {
        const tags = element.tags;
        
        // Prefer source phone; otherwise try to enrich from website
        const website = tags.website || tags['contact:website'] || null;
        const sourcePhone = tags.phone || tags['contact:phone'] || null;
        let phone = sourcePhone;
        if (!phone && website) {
            phone = await this.enrichPhoneFromWebsite(website, country);
        }
        const contactName = tags.operator || null;
        const email = tags.email || tags['contact:email'] || null;
        
        return {
            id: `osm_${element.id}`,
            businessName: tags.name,
            businessType: tags.shop || tags.office || tags.amenity || 'Business',
            industry: industry,
            contactName: tags.operator || null,
            phone: phone,
            email: email,
            website: website,
            address: {
                street: tags['addr:street'] ? `${tags['addr:housenumber'] || ''} ${tags['addr:street']}`.trim() : null,
                city: tags['addr:city'],
                state: tags['addr:state'],
                zipCode: tags['addr:postcode'],
                country: tags['addr:country'] || country.toUpperCase(),
                coordinates: {
                    lat: element.lat || (element.center ? element.center.lat : null),
                    lng: element.lon || (element.center ? element.center.lon : null)
                }
            },
            businessDetails: {
                description: tags.description || '',
                rating: null,
                reviewCount: 0,
                yearEstablished: tags.start_date ? parseInt(tags.start_date) : null,
                hours: this.parseOSMHours(tags)
            },
            sources: [{
                name: 'openstreetmap',
                sourceId: element.id.toString(),
                url: `https://www.openstreetmap.org/${element.type}/${element.id}`,
                collectedAt: new Date(),
                confidence: phone ? 80 : 70
            }],
            confidence: this.calculateOSMConfidence(tags),
            status: 'new',
            createdAt: new Date(),
            selected: false
        };
    }
    
    generateCountryPhone(country) {
        const countryCode = country?.toLowerCase();
        if (countryCode === 'bangladesh' || countryCode === 'bd') {
            // Strict E.164: +8801[3-9][8 digits]
            const secondDigit = ['3','4','5','6','7','8','9'][Math.floor(Math.random() * 7)];
            const tail = String(Math.floor(Math.random() * 100000000)).padStart(8, '0');
            return `+8801${secondDigit}${tail}`;
        }
        return null; // Don't generate fake phone for other countries
    }

    getYelpCategories(industry) {
        const categories = {
            'real-estate': 'realestate',
            'mortgage': 'mortgagebrokers',
            'insurance': 'insurance',
            'construction': 'contractors',
            'property-management': 'propertymgmt',
            'healthcare': 'physicians',
            'legal': 'lawyers',
            'automotive': 'auto',
            'retail': 'shopping'
        };
        return categories[industry] || 'professional';
    }

    getOSMTags(industry) {
        const tags = {
            'real-estate': [
                { key: 'office', value: 'estate_agent' },
                { key: 'shop', value: 'estate_agent' }
            ],
            'insurance': [
                { key: 'office', value: 'insurance' },
                { key: 'shop', value: 'insurance' }
            ],
            'construction': [
                { key: 'office', value: 'construction' },
                { key: 'craft', value: 'builder' }
            ],
            'healthcare': [
                { key: 'amenity', value: 'clinic' },
                { key: 'healthcare', value: 'doctor' }
            ],
            'legal': [
                { key: 'office', value: 'lawyer' },
                { key: 'amenity', value: 'courthouse' }
            ],
            'retail': [
                { key: 'shop', value: '.*' }
            ]
        };
        return tags[industry] || [{ key: 'office', value: '.*' }];
    }

    calculateYelpConfidence(business) {
        let score = 50;
        if (business.phone) score += 20;
        if (business.rating >= 4.0) score += 15;
        if (business.review_count > 10) score += 10;
        if (business.location?.address1) score += 5;
        return Math.min(score, 100);
    }

    calculateOSMConfidence(tags) {
        let score = 40;
        if (tags.phone || tags['contact:phone']) score += 25;
        if (tags.website) score += 15;
        if (tags.email || tags['contact:email']) score += 15;
        if (tags['addr:street']) score += 5;
        return Math.min(score, 100);
    }

    parseOSMHours(tags) {
        const hours = [];
        if (tags.opening_hours) {
            // Simple parsing of opening hours
            hours.push({ day: 'General', hours: tags.opening_hours });
        }
        return hours;
    }

    removeDuplicates(leads) {
        const seen = new Set();
        return leads.filter(lead => {
            const key = `${lead.businessName}_${lead.phone || ''}`.toLowerCase().replace(/\s/g, '');
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }

    buildLocation(city, state) {
        if (city && state) return `${city}, ${state}`;
        if (state) return state;
        return 'United States';
    }

    // Try to extract a real phone number from the business website and normalize it
    async enrichPhoneFromWebsite(website, country = 'usa') {
        try {
            const url = website.startsWith('http') ? website : `https://${website}`;
            const resp = await axios.get(url, { timeout: 8000 });
            const html = String(resp.data || '');

            const patterns = [
                /\+8801[3-9][0-9]{8}/g,      // BD E.164
                /\b8801[3-9][0-9]{8}\b/g,    // BD without plus
                /\b01[3-9][0-9]{8}\b/g,      // BD local mobile
                /\+\d{1,3}[\s-]?\d{6,14}\b/g // generic international
            ];

            for (const re of patterns) {
                const match = html.match(re);
                if (match && match.length) {
                    const normalized = this.normalizePhone(match[0], country);
                    if (normalized) return normalized;
                }
            }
            return null;
        } catch {
            return null;
        }
    }

    normalizePhone(raw, country = 'usa') {
        const digits = String(raw).replace(/[^0-9+]/g, '');
        const cc = country?.toLowerCase();
        if (cc === 'bangladesh' || cc === 'bd') {
            if (/^\+8801[3-9]\d{8}$/.test(digits)) return digits;
            if (/^8801[3-9]\d{8}$/.test(digits)) return `+${digits}`;
            if (/^01[3-9]\d{8}$/.test(digits)) return `+880${digits}`;
            return null;
        }
        if (digits.startsWith('+')) return digits;
        return `+${digits}`;
    }
}

module.exports = FreeDataService;