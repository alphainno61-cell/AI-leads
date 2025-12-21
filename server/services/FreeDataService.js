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
        const { industry, city, state, limit = 20 } = criteria;
        const allLeads = [];

        try {
            // Try Yelp API first (best quality data)
            if (this.yelpApiKey) {
                console.log('🔍 Searching Yelp for real business data...');
                const yelpResults = await this.searchYelp(industry, city, state, Math.min(limit, 50));
                allLeads.push(...yelpResults);
            }

            // If we need more results or Yelp failed, use OpenStreetMap
            if (allLeads.length < limit) {
                console.log('🌍 Searching OpenStreetMap for additional data...');
                const remaining = limit - allLeads.length;
                const osmResults = await this.searchOpenStreetMap(industry, city, state, remaining);
                allLeads.push(...osmResults);
            }

            // Remove duplicates
            const uniqueLeads = this.removeDuplicates(allLeads);

            return {
                success: true,
                total: uniqueLeads.length,
                leads: uniqueLeads.slice(0, limit),
                sources: {
                    yelp: allLeads.filter(l => l.sources[0]?.name === 'yelp').length,
                    openstreetmap: allLeads.filter(l => l.sources[0]?.name === 'openstreetmap').length
                }
            };

        } catch (error) {
            console.error('Free data search failed:', error);
            throw error;
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

    async searchOpenStreetMap(industry, city, state, limit) {
        const cacheKey = `osm_${industry}_${city}_${state}_${limit}`;
        const cached = this.cache.get(cacheKey);
        if (cached) return cached;

        try {
            // Build Overpass query for business data
            const query = this.buildOSMQuery(industry, city, state, limit);
            
            const response = await axios.post(this.osmBaseUrl, query, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                timeout: 15000 // 15 second timeout
            });

            const businesses = this.parseOSMResponse(response.data, industry);
            
            this.cache.set(cacheKey, businesses);
            console.log(`✅ Found ${businesses.length} businesses from OpenStreetMap`);
            return businesses;

        } catch (error) {
            console.error('OpenStreetMap error:', error.message);
            return [];
        }
    }

    buildOSMQuery(industry, city, state, limit) {
        const businessTypes = this.getOSMTags(industry);
        const area = city && state ? `"${city}", "${state}"` : state || 'United States';
        
        // Overpass QL query to find businesses
        const query = `
            [out:json][timeout:25];
            (
                area["name"~"${area}",i]->.searchArea;
                (
                    ${businessTypes.map(type => 
                        `node["${type.key}"~"${type.value}",i](area.searchArea);`
                    ).join('')}
                    ${businessTypes.map(type => 
                        `way["${type.key}"~"${type.value}",i](area.searchArea);`
                    ).join('')}
                );
            );
            out geom ${limit || 20};
        `;

        return query;
    }

    parseOSMResponse(data, industry) {
        if (!data.elements || data.elements.length === 0) return [];

        return data.elements
            .filter(element => element.tags && element.tags.name)
            .map(element => this.formatOSMBusiness(element, industry))
            .filter(business => business.businessName); // Remove invalid entries
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

    formatOSMBusiness(element, industry) {
        const tags = element.tags;
        
        return {
            id: `osm_${element.id}`,
            businessName: tags.name,
            businessType: tags.shop || tags.office || tags.amenity || 'Business',
            industry: industry,
            contactName: tags.operator || null,
            phone: tags.phone || tags['contact:phone'],
            email: tags.email || tags['contact:email'],
            website: tags.website || tags['contact:website'],
            address: {
                street: tags['addr:street'] ? `${tags['addr:housenumber'] || ''} ${tags['addr:street']}`.trim() : null,
                city: tags['addr:city'],
                state: tags['addr:state'],
                zipCode: tags['addr:postcode'],
                country: tags['addr:country'] || 'US',
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
                confidence: 70
            }],
            confidence: this.calculateOSMConfidence(tags),
            status: 'new',
            createdAt: new Date(),
            selected: false
        };
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
        if (tags.phone) score += 25;
        if (tags.website) score += 15;
        if (tags.email) score += 15;
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
            const key = `${lead.businessName}_${lead.phone}`.toLowerCase().replace(/\s/g, '');
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
}

module.exports = FreeDataService;