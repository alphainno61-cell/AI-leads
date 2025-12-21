const express = require('express');
const router = express.Router();
const Joi = require('joi');
const LeadGenerationService = require('../services/LeadGenerationService');
const FreeDataService = require('../services/FreeDataService');

const leadService = new LeadGenerationService();
const freeDataService = new FreeDataService();

// Helper function to safely require Lead model
const getLeadModel = () => {
    try {
        return require('../models/Lead');
    } catch (error) {
        console.warn('Database not available, operating in memory-only mode');
        return null;
    }
};

// Validation schema for lead generation request
const generateLeadsSchema = Joi.object({
    industry: Joi.string().valid(
        'real-estate', 'mortgage', 'insurance', 'construction', 
        'property-management', 'healthcare', 'legal', 'automotive', 'retail', 'other'
    ).required(),
    location: Joi.string().optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    businessType: Joi.string().optional(),
    limit: Joi.number().min(1).max(100).default(50)
});

// Generate leads endpoint
router.post('/generate', async (req, res) => {
    try {
        const { error, value } = generateLeadsSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: error.details[0].message
            });
        }

        // Use free data service by default
        const result = await freeDataService.searchBusinesses(value);
        
        res.json(result);

    } catch (error) {
        console.error('Lead generation error:', error);
        res.status(500).json({
            success: false,
            error: 'Lead generation failed',
            message: error.message
        });
    }
});

// Generate leads with premium APIs (fallback)
router.post('/generate-premium', async (req, res) => {
    try {
        const { error, value } = generateLeadsSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: error.details[0].message
            });
        }

        const result = await leadService.generateLeads(value);
        
        res.json(result);

    } catch (error) {
        console.error('Premium lead generation error:', error);
        res.status(500).json({
            success: false,
            error: 'Premium lead generation failed',
            message: error.message
        });
    }
});

// Get leads with filtering
router.get('/', async (req, res) => {
    try {
        const filters = {
            industry: req.query.industry,
            status: req.query.status,
            city: req.query.city,
            state: req.query.state,
            minConfidence: parseInt(req.query.minConfidence) || 0,
            hasEmail: req.query.hasEmail === 'true',
            hasPhone: req.query.hasPhone === 'true',
            limit: parseInt(req.query.limit) || 100
        };

        // Remove undefined values
        Object.keys(filters).forEach(key => {
            if (filters[key] === undefined || filters[key] === null) {
                delete filters[key];
            }
        });

        const result = await leadService.getLeads(filters);
        res.json(result);

    } catch (error) {
        console.error('Get leads error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve leads',
            message: error.message
        });
    }
});

// Get single lead by ID
router.get('/:id', async (req, res) => {
    try {
        const Lead = getLeadModel();
        if (!Lead) {
            return res.status(503).json({
                success: false,
                error: 'Database not available'
            });
        }
        
        const lead = await Lead.findById(req.params.id);
        
        if (!lead) {
            return res.status(404).json({
                success: false,
                error: 'Lead not found'
            });
        }

        res.json({
            success: true,
            lead: lead
        });

    } catch (error) {
        console.error('Get lead error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve lead',
            message: error.message
        });
    }
});

// Update lead status
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['new', 'validated', 'contacted', 'qualified', 'converted', 'rejected'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status',
                validStatuses: validStatuses
            });
        }

        const Lead = getLeadModel();
        if (!Lead) {
            return res.status(503).json({
                success: false,
                error: 'Database not available'
            });
        }
        
        const lead = await Lead.findByIdAndUpdate(
            req.params.id,
            { status: status, updatedAt: new Date() },
            { new: true }
        );

        if (!lead) {
            return res.status(404).json({
                success: false,
                error: 'Lead not found'
            });
        }

        res.json({
            success: true,
            lead: lead
        });

    } catch (error) {
        console.error('Update lead status error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update lead status',
            message: error.message
        });
    }
});

// Delete lead
router.delete('/:id', async (req, res) => {
    try {
        const Lead = getLeadModel();
        if (!Lead) {
            return res.status(503).json({
                success: false,
                error: 'Database not available'
            });
        }
        
        const lead = await Lead.findByIdAndDelete(req.params.id);
        
        if (!lead) {
            return res.status(404).json({
                success: false,
                error: 'Lead not found'
            });
        }

        res.json({
            success: true,
            message: 'Lead deleted successfully'
        });

    } catch (error) {
        console.error('Delete lead error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete lead',
            message: error.message
        });
    }
});

// Bulk operations
router.post('/bulk/delete', async (req, res) => {
    try {
        const { leadIds } = req.body;
        
        if (!Array.isArray(leadIds) || leadIds.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Lead IDs array is required'
            });
        }

        const Lead = getLeadModel();
        if (!Lead) {
            return res.status(503).json({
                success: false,
                error: 'Database not available'
            });
        }
        
        const result = await Lead.deleteMany({ _id: { $in: leadIds } });

        res.json({
            success: true,
            deletedCount: result.deletedCount,
            message: `${result.deletedCount} leads deleted successfully`
        });

    } catch (error) {
        console.error('Bulk delete error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete leads',
            message: error.message
        });
    }
});

// Get API status and available free sources
router.get('/sources/status', async (req, res) => {
    try {
        const status = {
            free_apis: {
                yelp: {
                    enabled: !!process.env.YELP_API_KEY,
                    limit: '5,000 requests/month',
                    cost: 'FREE',
                    quality: 'High'
                },
                openstreetmap: {
                    enabled: true,
                    limit: 'Unlimited (rate limited)',
                    cost: 'FREE',
                    quality: 'Medium'
                },
                government_data: {
                    enabled: true,
                    limit: 'Varies by source',
                    cost: 'FREE',
                    quality: 'High'
                }
            },
            premium_apis: {
                google_maps: {
                    enabled: !!process.env.GOOGLE_MAPS_API_KEY,
                    cost: '$2-5 per 1000 requests'
                },
                hunter_io: {
                    enabled: !!process.env.HUNTER_IO_API_KEY,
                    cost: '$49/month after 100 free'
                }
            }
        };

        const enabledFree = Object.values(status.free_apis).filter(api => api.enabled).length;
        const enabledPremium = Object.values(status.premium_apis).filter(api => api.enabled).length;

        res.json({
            success: true,
            status,
            summary: {
                free_sources: enabledFree,
                premium_sources: enabledPremium,
                total_sources: enabledFree + enabledPremium,
                recommended: enabledFree > 0 ? 'Ready to generate real leads!' : 'Add Yelp API key for best results'
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to get API status'
        });
    }
});
router.get('/export/csv', async (req, res) => {
    try {
        const filters = req.query;
        const result = await leadService.getLeads(filters);
        
        if (!result.success) {
            return res.status(500).json(result);
        }

        // Convert to CSV format
        const csvData = this.convertToCSV(result.leads);
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=leads.csv');
        res.send(csvData);

    } catch (error) {
        console.error('CSV export error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to export leads',
            message: error.message
        });
    }
});

// Helper function to convert leads to CSV
function convertToCSV(leads) {
    const headers = [
        'Business Name', 'Contact Name', 'Phone', 'Email', 'Website',
        'Address', 'City', 'State', 'Industry', 'Confidence', 'Status', 'Created At'
    ];
    
    const csvRows = [headers.join(',')];
    
    leads.forEach(lead => {
        const row = [
            `"${lead.businessName || ''}"`,
            `"${lead.contactName || ''}"`,
            `"${lead.phone || ''}"`,
            `"${lead.email || ''}"`,
            `"${lead.website || ''}"`,
            `"${lead.address?.street || ''}"`,
            `"${lead.address?.city || ''}"`,
            `"${lead.address?.state || ''}"`,
            `"${lead.industry || ''}"`,
            lead.confidence || 0,
            `"${lead.status || ''}"`,
            `"${lead.createdAt || ''}"`
        ];
        csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
}

module.exports = router;