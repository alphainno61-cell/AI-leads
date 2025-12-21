const GoogleMapsService = require('../services/GoogleMapsService');
const YelpService = require('../services/YelpService');
const ValidationService = require('../services/ValidationService');

// Helper function to safely require Lead model
const getLeadModel = () => {
    try {
        return require('../models/Lead');
    } catch (error) {
        console.warn('Database not available in LeadGenerationService, operating without persistence');
        return null;
    }
};

class LeadGenerationService {
    constructor() {
        this.googleMaps = new GoogleMapsService();
        this.yelp = new YelpService();
        this.validator = new ValidationService();
    }

    async generateLeads(criteria) {
        const { industry, location, city, state, businessType, limit = 50 } = criteria;
        
        try {
            const allLeads = [];
            
            // Collect leads from multiple sources in parallel
            const searchPromises = [];
            
            // Google Maps search
            if (process.env.GOOGLE_MAPS_API_KEY) {
                const searchTerm = this.buildSearchTerm(industry, businessType);
                const locationString = this.buildLocationString(city, state, location);
                searchPromises.push(
                    this.googleMaps.searchBusinesses(searchTerm, locationString)
                        .catch(err => {
                            console.error('Google Maps search failed:', err);
                            return [];
                        })
                );
            }

            // Yelp search
            if (process.env.YELP_API_KEY) {
                const searchTerm = this.buildSearchTerm(industry, businessType);
                const locationString = this.buildLocationString(city, state, location);
                const categories = this.yelp.getCategoriesForIndustry(industry);
                searchPromises.push(
                    this.yelp.searchBusinesses(searchTerm, locationString, categories, limit)
                        .catch(err => {
                            console.error('Yelp search failed:', err);
                            return [];
                        })
                );
            }

            // Execute all searches
            const searchResults = await Promise.all(searchPromises);
            
            // Flatten and combine results
            searchResults.forEach(results => {
                allLeads.push(...results);
            });

            // Remove duplicates based on business name and phone
            const uniqueLeads = this.removeDuplicates(allLeads);

            // Validate and enrich leads
            const validatedLeads = await this.validateLeads(uniqueLeads);

            // Sort by confidence score
            validatedLeads.sort((a, b) => b.confidence - a.confidence);

            // Limit results
            const finalLeads = validatedLeads.slice(0, limit);

            // Save to database
            await this.saveLeads(finalLeads);

            return {
                success: true,
                total: finalLeads.length,
                leads: finalLeads,
                sources: this.getSummary(finalLeads),
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('Lead generation failed:', error);
            throw new Error(`Lead generation failed: ${error.message}`);
        }
    }

    buildSearchTerm(industry, businessType) {
        const industryTerms = {
            'real-estate': ['real estate', 'realty', 'property', 'homes'],
            'mortgage': ['mortgage', 'loan', 'lending', 'finance'],
            'insurance': ['insurance', 'coverage', 'protection'],
            'construction': ['construction', 'contractor', 'builder'],
            'property-management': ['property management', 'rental', 'leasing'],
            'healthcare': ['medical', 'healthcare', 'clinic', 'doctor'],
            'legal': ['law', 'attorney', 'lawyer', 'legal'],
            'automotive': ['auto', 'car', 'automotive', 'vehicle'],
            'retail': ['store', 'shop', 'retail', 'business']
        };

        const terms = industryTerms[industry] || [businessType || 'business'];
        return businessType || terms[0];
    }

    buildLocationString(city, state, location) {
        if (location) return location;
        if (city && state) return `${city}, ${state}`;
        if (city) return city;
        if (state) return state;
        return 'United States';
    }

    removeDuplicates(leads) {
        const seen = new Set();
        return leads.filter(lead => {
            const key = `${lead.businessName}_${lead.phone}_${lead.email}`.toLowerCase();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }

    async validateLeads(leads) {
        const validationPromises = leads.map(lead => 
            this.validator.validateLead(lead).catch(err => {
                console.error('Lead validation failed:', err);
                return { ...lead, confidence: 30 };
            })
        );

        return await Promise.all(validationPromises);
    }

    async saveLeads(leads) {
        try {
            const Lead = getLeadModel();
            if (!Lead) {
                console.warn('Database not available, skipping lead persistence');
                return leads.map(lead => ({ ...lead, _id: Date.now() + Math.random() }));
            }
            
            // Check if MongoDB is connected (if using MongoDB)
            const savePromises = leads.map(leadData => {
                const lead = new Lead(leadData);
                return lead.save().catch(err => {
                    console.error('Failed to save lead:', err);
                    return null;
                });
            });

            await Promise.all(savePromises);
        } catch (error) {
            console.error('Database save failed:', error);
            // Continue without saving to database
        }
    }

    getSummary(leads) {
        const sources = {};
        leads.forEach(lead => {
            lead.sources.forEach(source => {
                sources[source.name] = (sources[source.name] || 0) + 1;
            });
        });

        return {
            total: leads.length,
            bySource: sources,
            averageConfidence: Math.round(
                leads.reduce((sum, lead) => sum + lead.confidence, 0) / leads.length
            )
        };
    }

    // Get leads with advanced filtering
    async getLeads(filters = {}) {
        try {
            const Lead = getLeadModel();
            if (!Lead) {
                return {
                    success: false,
                    error: 'Database not available',
                    leads: []
                };
            }
            
            const query = this.buildDatabaseQuery(filters);
            const leads = await Lead.find(query)
                .sort({ confidence: -1, createdAt: -1 })
                .limit(filters.limit || 100);

            return {
                success: true,
                total: leads.length,
                leads: leads
            };
        } catch (error) {
            console.error('Database query failed:', error);
            return { success: false, error: error.message };
        }
    }

    buildDatabaseQuery(filters) {
        const query = {};

        if (filters.industry) query.industry = filters.industry;
        if (filters.status) query.status = filters.status;
        if (filters.minConfidence) query.confidence = { $gte: filters.minConfidence };
        if (filters.city) query['address.city'] = new RegExp(filters.city, 'i');
        if (filters.state) query['address.state'] = new RegExp(filters.state, 'i');
        if (filters.hasEmail) query.email = { $ne: null };
        if (filters.hasPhone) query.phone = { $ne: null };

        return query;
    }
}

module.exports = LeadGenerationService;