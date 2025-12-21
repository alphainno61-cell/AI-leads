const express = require('express');
const router = express.Router();
const ValidationService = require('../services/ValidationService');

const validationService = new ValidationService();

// Validate email endpoint
router.post('/email', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Email is required'
            });
        }

        const result = await validationService.validateEmail(email);
        
        res.json({
            success: true,
            email: email,
            validation: result
        });

    } catch (error) {
        console.error('Email validation error:', error);
        res.status(500).json({
            success: false,
            error: 'Email validation failed',
            message: error.message
        });
    }
});

// Validate phone endpoint
router.post('/phone', async (req, res) => {
    try {
        const { phone } = req.body;
        
        if (!phone) {
            return res.status(400).json({
                success: false,
                error: 'Phone number is required'
            });
        }

        const result = validationService.validatePhone(phone);
        
        res.json({
            success: true,
            phone: phone,
            validation: result
        });

    } catch (error) {
        console.error('Phone validation error:', error);
        res.status(500).json({
            success: false,
            error: 'Phone validation failed',
            message: error.message
        });
    }
});

// Validate business endpoint
router.post('/business', async (req, res) => {
    try {
        const { businessName, website } = req.body;
        
        if (!businessName) {
            return res.status(400).json({
                success: false,
                error: 'Business name is required'
            });
        }

        const result = await validationService.enrichBusinessData(businessName, website);
        
        res.json({
            success: true,
            businessName: businessName,
            validation: result
        });

    } catch (error) {
        console.error('Business validation error:', error);
        res.status(500).json({
            success: false,
            error: 'Business validation failed',
            message: error.message
        });
    }
});

// Validate complete lead endpoint
router.post('/lead', async (req, res) => {
    try {
        const leadData = req.body;
        
        if (!leadData.businessName) {
            return res.status(400).json({
                success: false,
                error: 'Business name is required'
            });
        }

        const result = await validationService.validateLead(leadData);
        
        res.json({
            success: true,
            validatedLead: result
        });

    } catch (error) {
        console.error('Lead validation error:', error);
        res.status(500).json({
            success: false,
            error: 'Lead validation failed',
            message: error.message
        });
    }
});

module.exports = router;