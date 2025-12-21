const axios = require('axios');
const NodeCache = require('node-cache');

class YelpService {
    constructor() {
        this.apiKey = process.env.YELP_API_KEY;
        this.cache = new NodeCache({ stdTTL: 3600 });
        this.baseUrl = 'https://api.yelp.com/v3';
    }

    async searchBusinesses(term, location, categories = '', limit = 50) {
        if (!this.apiKey) {
            throw new Error('Yelp API key not configured');
        }

        const cacheKey = `yelp_${term}_${location}_${categories}_${limit}`;
        const cached = this.cache.get(cacheKey);
        if (cached) return cached;

        try {
            const response = await axios.get(`${this.baseUrl}/businesses/search`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                },
                params: {
                    term: term,
                    location: location,
                    categories: categories,
                    limit: limit,
                    sort_by: 'best_match'
                }
            });

            const businesses = response.data.businesses.map(business => 
                this.formatBusinessData(business)
            );

            this.cache.set(cacheKey, businesses);
            return businesses;

        } catch (error) {
            console.error('Yelp API error:', error);
            throw new Error(`Failed to fetch from Yelp: ${error.message}`);
        }
    }

    async getBusinessDetails(businessId) {
        try {
            const response = await axios.get(`${this.baseUrl}/businesses/${businessId}`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });

            return response.data;
        } catch (error) {
            console.error('Error fetching Yelp business details:', error);
            return null;
        }
    }

    formatBusinessData(business) {
        const categoryMapping = {
            'realestate': 'real-estate',
            'mortgagebrokers': 'mortgage',
            'insurance': 'insurance',
            'contractors': 'construction',
            'propertymgmt': 'property-management',
            'physicians': 'healthcare',
            'lawyers': 'legal',
            'auto': 'automotive',
            'shopping': 'retail'
        };

        // Determine industry from categories
        let industry = 'other';
        if (business.categories && business.categories.length > 0) {
            for (const category of business.categories) {
                const alias = category.alias.toLowerCase();
                if (categoryMapping[alias]) {
                    industry = categoryMapping[alias];
                    break;
                }
            }
        }

        return {
            businessName: business.name,
            businessType: business.categories?.[0]?.title || 'Business',
            industry: industry,
            phone: business.phone || business.display_phone || null,
            website: business.url || null,
            address: {
                street: business.location?.address1 || '',
                city: business.location?.city || '',
                state: business.location?.state || '',
                zipCode: business.location?.zip_code || '',
                country: business.location?.country || 'US',
                coordinates: {
                    lat: business.coordinates?.latitude || null,
                    lng: business.coordinates?.longitude || null
                }
            },
            businessDetails: {
                description: business.review_snippet || '',
                rating: business.rating || null,
                reviewCount: business.review_count || 0,
                hours: business.hours?.[0]?.open || [],
                yearEstablished: null
            },
            sources: [{
                name: 'yelp',
                sourceId: business.id,
                url: business.url,
                collectedAt: new Date(),
                confidence: 80
            }],
            confidence: this.calculateConfidence(business),
            status: 'new'
        };
    }

    calculateConfidence(business) {
        let confidence = 60;

        if (business.rating && business.rating >= 4.0) confidence += 15;
        if (business.review_count && business.review_count > 20) confidence += 10;
        if (business.phone) confidence += 15;
        if (business.location?.address1) confidence += 10;
        if (business.is_claimed) confidence += 10;

        return Math.min(confidence, 100);
    }

    // Category mapping for different industries
    getCategoriesForIndustry(industry) {
        const industryCategories = {
            'real-estate': 'realestate',
            'mortgage': 'mortgagebrokers',
            'insurance': 'insurance',
            'construction': 'contractors,generalcontractors',
            'property-management': 'propertymgmt',
            'healthcare': 'physicians,dentists',
            'legal': 'lawyers',
            'automotive': 'auto',
            'retail': 'shopping'
        };

        return industryCategories[industry] || '';
    }
}

module.exports = YelpService;