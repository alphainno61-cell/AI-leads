const axios = require('axios');

class GovernmentDataService {
    constructor() {
        this.cache = new Map();
    }

    async searchBusinesses(criteria) {
        const { industry, state, city, limit = 20 } = criteria;
        const allLeads = [];

        try {
            // Try multiple government data sources
            const sources = await Promise.allSettled([
                this.searchSECFilings(industry, state, limit)
            ]);

            sources.forEach((result, index) => {
                if (result.status === 'fulfilled' && result.value) {
                    allLeads.push(...result.value);
                }
            });

            return this.formatResults(allLeads, limit);

        } catch (error) {
            console.error('Government data search failed:', error);
            return { success: false, leads: [], total: 0 };
        }
    }

    async searchSECFilings(industry, state, limit) {
        try {
            // SEC EDGAR API for public company data
            const response = await axios.get('https://www.sec.gov/files/company_tickers.json', {
                headers: {
                    'User-Agent': 'Alpha Leads Bot 1.0'
                }
            });

            const companies = Object.values(response.data);
            const filtered = companies
                .filter(company => !state || company.title.includes(state))
                .slice(0, limit)
                .map(company => this.formatSECCompany(company, industry));

            return filtered;

        } catch (error) {
            console.error('SEC API error:', error);
            return [];
        }
    }

    async searchStateBusinessRegistry(state, industry, limit) {
        // State business registries not implemented; avoid synthetic data
        return [];
    }

    async searchChamberOfCommerce(city, state, industry, limit) {
        // Chamber of Commerce scraping not implemented; avoid synthetic data
        return [];
    }

    formatSECCompany(company, industry) {
        return {
            id: `sec_${company.cik_str}`,
            businessName: company.title,
            businessType: 'Public Company',
            industry: industry,
            contactName: null,
            phone: null,
            email: null,
            website: `https://www.sec.gov/cgi-bin/browse-edgar?CIK=${company.cik_str}`,
            address: {
                street: null,
                city: null,
                state: null,
                zipCode: null,
                country: 'US',
                coordinates: { lat: null, lng: null }
            },
            businessDetails: {
                description: `Public company - SEC CIK: ${company.cik_str}`,
                rating: null,
                reviewCount: 0,
                yearEstablished: null,
                publicCompany: true
            },
            sources: [{
                name: 'sec_edgar',
                sourceId: company.cik_str.toString(),
                url: `https://www.sec.gov/cgi-bin/browse-edgar?CIK=${company.cik_str}`,
                collectedAt: new Date(),
                confidence: 85
            }],
            confidence: 85,
            status: 'new',
            createdAt: new Date(),
            selected: false
        };
    }

    formatStateRegistryBusiness(business, industry) {
        return {
            id: `state_${business.registrationNumber}`,
            businessName: business.name,
            businessType: 'Registered Business',
            industry: industry,
            contactName: null,
            phone: null,
            email: null,
            website: null,
            address: {
                street: business.address.split(',')[0],
                city: business.address.split(',')[1]?.trim(),
                state: business.address.split(',')[2]?.trim(),
                zipCode: null,
                country: 'US',
                coordinates: { lat: null, lng: null }
            },
            businessDetails: {
                description: `State registered business - ${business.registrationNumber}`,
                rating: null,
                reviewCount: 0,
                registrationNumber: business.registrationNumber
            },
            sources: [{
                name: 'state_registry',
                sourceId: business.registrationNumber,
                url: null,
                collectedAt: new Date(),
                confidence: 75
            }],
            confidence: 75,
            status: 'new',
            createdAt: new Date(),
            selected: false
        };
    }

    formatChamberBusiness(business, industry) {
        return {
            id: `chamber_${Math.random().toString(36).substr(2, 9)}`,
            businessName: business.name,
            businessType: 'Chamber Member',
            industry: industry,
            contactName: null,
            phone: null,
            email: null,
            website: null,
            address: {
                street: null,
                city: business.location.split(',')[0],
                state: business.location.split(',')[1]?.trim(),
                zipCode: null,
                country: 'US',
                coordinates: { lat: null, lng: null }
            },
            businessDetails: {
                description: `Chamber of Commerce member since ${business.memberSince}`,
                rating: null,
                reviewCount: 0,
                memberSince: business.memberSince
            },
            sources: [{
                name: 'chamber_of_commerce',
                sourceId: null,
                url: null,
                collectedAt: new Date(),
                confidence: 70
            }],
            confidence: 70,
            status: 'new',
            createdAt: new Date(),
            selected: false
        };
    }

    formatResults(leads, limit) {
        const uniqueLeads = this.removeDuplicates(leads);
        const limitedLeads = uniqueLeads.slice(0, limit);

        return {
            success: true,
            total: limitedLeads.length,
            leads: limitedLeads,
            sources: this.getSummary(limitedLeads)
        };
    }

    removeDuplicates(leads) {
        const seen = new Set();
        return leads.filter(lead => {
            const key = lead.businessName.toLowerCase().replace(/\s/g, '');
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }

    getSummary(leads) {
        const sources = {};
        leads.forEach(lead => {
            const sourceName = lead.sources[0].name;
            sources[sourceName] = (sources[sourceName] || 0) + 1;
        });

        return {
            total: leads.length,
            bySource: sources
        };
    }
}

module.exports = GovernmentDataService;