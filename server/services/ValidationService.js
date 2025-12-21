const validator = require('email-validator');
const phone = require('phone');
const axios = require('axios');

class ValidationService {
    constructor() {
        this.hunterApiKey = process.env.HUNTER_IO_API_KEY;
        this.clearbitApiKey = process.env.CLEARBIT_API_KEY;
    }

    async validateEmail(email) {
        if (!email) return { valid: false, deliverable: false, risk: 'high' };

        const basicValid = validator.validate(email);
        if (!basicValid) {
            return { valid: false, deliverable: false, risk: 'high' };
        }

        // Use Hunter.io for advanced email validation if API key is available
        if (this.hunterApiKey) {
            try {
                const response = await axios.get('https://api.hunter.io/v2/email-verifier', {
                    params: {
                        email: email,
                        api_key: this.hunterApiKey
                    }
                });

                const data = response.data.data;
                return {
                    valid: data.result !== 'undeliverable',
                    deliverable: data.result === 'deliverable',
                    risk: this.mapHunterResultToRisk(data.result),
                    score: data.score,
                    sources: data.sources?.length || 0
                };
            } catch (error) {
                console.error('Hunter.io validation error:', error);
                // Fallback to basic validation
                return { valid: true, deliverable: true, risk: 'medium' };
            }
        }

        // Basic email validation without external service
        const domain = email.split('@')[1];
        const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com'];
        const isCommonDomain = commonDomains.includes(domain);

        return {
            valid: true,
            deliverable: true,
            risk: isCommonDomain ? 'low' : 'medium'
        };
    }

    validatePhone(phoneNumber) {
        if (!phoneNumber) return { valid: false, type: null, carrier: null };

        try {
            const parsedPhone = phone(phoneNumber, { country: 'US' });
            
            if (parsedPhone.length === 0) {
                return { valid: false, type: null, carrier: null };
            }

            const formattedPhone = parsedPhone[0];
            const areaCode = formattedPhone.substring(2, 5);
            
            // Basic phone type detection (this is simplified)
            const mobileAreaCodes = ['310', '323', '424', '747', '818', '213']; // Sample mobile area codes
            const type = mobileAreaCodes.includes(areaCode) ? 'mobile' : 'landline';

            return {
                valid: true,
                formatted: formattedPhone,
                type: type,
                carrier: 'Unknown' // Would need additional service for carrier detection
            };
        } catch (error) {
            return { valid: false, type: null, carrier: null };
        }
    }

    async enrichBusinessData(businessName, website) {
        if (!this.clearbitApiKey || !businessName) {
            return { exists: true, verified: false };
        }

        try {
            let enrichmentData = {};

            // Try to enrich using website if available
            if (website) {
                const response = await axios.get(`https://company.clearbit.com/v2/companies/find`, {
                    params: { domain: this.extractDomain(website) },
                    headers: { 'Authorization': `Bearer ${this.clearbitApiKey}` }
                });
                enrichmentData = response.data;
            } else {
                // Try to find company by name
                const response = await axios.get(`https://autocomplete.clearbit.com/v1/companies/suggest`, {
                    params: { query: businessName },
                    headers: { 'Authorization': `Bearer ${this.clearbitApiKey}` }
                });
                
                if (response.data && response.data.length > 0) {
                    enrichmentData = response.data[0];
                }
            }

            return {
                exists: true,
                verified: !!enrichmentData.name,
                yearsInBusiness: this.calculateYearsInBusiness(enrichmentData.foundedYear),
                employeeCount: enrichmentData.metrics?.employees,
                industry: enrichmentData.category?.industry,
                description: enrichmentData.description,
                logo: enrichmentData.logo,
                socialMedia: {
                    facebook: enrichmentData.facebook?.handle,
                    linkedin: enrichmentData.linkedin?.handle,
                    twitter: enrichmentData.twitter?.handle
                }
            };

        } catch (error) {
            console.error('Business enrichment error:', error);
            return { exists: true, verified: false };
        }
    }

    async validateLead(lead) {
        const validationResults = {};

        // Validate email
        if (lead.email) {
            validationResults.email = await this.validateEmail(lead.email);
        }

        // Validate phone
        if (lead.phone) {
            validationResults.phone = this.validatePhone(lead.phone);
        }

        // Enrich business data
        if (lead.businessName) {
            validationResults.business = await this.enrichBusinessData(
                lead.businessName, 
                lead.website
            );
        }

        // Calculate overall confidence score
        const confidence = this.calculateOverallConfidence(validationResults, lead);

        return {
            ...lead,
            validationStatus: validationResults,
            confidence: confidence,
            status: confidence > 70 ? 'validated' : 'new'
        };
    }

    calculateOverallConfidence(validation, lead) {
        let score = 30; // Base score

        // Email validation score
        if (validation.email) {
            if (validation.email.valid) score += 20;
            if (validation.email.deliverable) score += 15;
            if (validation.email.risk === 'low') score += 10;
        }

        // Phone validation score
        if (validation.phone && validation.phone.valid) {
            score += 15;
            if (validation.phone.type === 'mobile') score += 5;
        }

        // Business verification score
        if (validation.business && validation.business.verified) {
            score += 20;
        }

        // Additional data points
        if (lead.website) score += 10;
        if (lead.address && lead.address.street) score += 10;
        if (lead.businessDetails && lead.businessDetails.rating > 4.0) score += 5;

        return Math.min(score, 100);
    }

    mapHunterResultToRisk(result) {
        const riskMapping = {
            'deliverable': 'low',
            'risky': 'medium',
            'undeliverable': 'high',
            'unknown': 'medium'
        };
        return riskMapping[result] || 'medium';
    }

    extractDomain(url) {
        try {
            const domain = new URL(url).hostname;
            return domain.replace('www.', '');
        } catch (error) {
            return url;
        }
    }

    calculateYearsInBusiness(foundedYear) {
        if (!foundedYear) return null;
        return new Date().getFullYear() - foundedYear;
    }
}

module.exports = ValidationService;