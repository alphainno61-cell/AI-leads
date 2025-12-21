const express = require('express');
const router = express.Router();

// Get available data sources and their status
router.get('/', async (req, res) => {
    try {
        const sources = {
            googleMaps: {
                name: 'Google Maps/Places',
                enabled: !!process.env.GOOGLE_MAPS_API_KEY,
                description: 'Business listings from Google Maps and Google My Business',
                features: ['Business info', 'Contact details', 'Reviews', 'Hours', 'Location'],
                rateLimit: 'Standard API limits apply'
            },
            yelp: {
                name: 'Yelp Business',
                enabled: !!process.env.YELP_API_KEY,
                description: 'Local business data from Yelp platform',
                features: ['Business info', 'Reviews', 'Photos', 'Hours', 'Categories'],
                rateLimit: '5000 requests/month on free tier'
            },
            hunterIo: {
                name: 'Hunter.io Email Verification',
                enabled: !!process.env.HUNTER_IO_API_KEY,
                description: 'Email verification and validation service',
                features: ['Email verification', 'Deliverability check', 'Risk assessment'],
                rateLimit: '100 requests/month on free tier'
            },
            clearbit: {
                name: 'Clearbit Business Enrichment',
                enabled: !!process.env.CLEARBIT_API_KEY,
                description: 'Business data enrichment and company information',
                features: ['Company data', 'Social media', 'Employee count', 'Revenue'],
                rateLimit: 'Varies by plan'
            }
        };

        const enabledSources = Object.keys(sources).filter(key => sources[key].enabled);
        const totalSources = Object.keys(sources).length;

        res.json({
            success: true,
            sources: sources,
            summary: {
                total: totalSources,
                enabled: enabledSources.length,
                disabled: totalSources - enabledSources.length,
                enabledSources: enabledSources
            },
            recommendations: generateRecommendations(sources)
        });

    } catch (error) {
        console.error('Sources status error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get sources status',
            message: error.message
        });
    }
});

// Test data source connectivity
router.post('/test', async (req, res) => {
    try {
        const { source } = req.body;
        
        if (!source) {
            return res.status(400).json({
                success: false,
                error: 'Source parameter is required'
            });
        }

        const testResults = {};

        switch (source) {
            case 'googleMaps':
                testResults.googleMaps = await testGoogleMaps();
                break;
            case 'yelp':
                testResults.yelp = await testYelp();
                break;
            case 'hunterIo':
                testResults.hunterIo = await testHunterIo();
                break;
            case 'clearbit':
                testResults.clearbit = await testClearbit();
                break;
            case 'all':
                testResults.googleMaps = await testGoogleMaps();
                testResults.yelp = await testYelp();
                testResults.hunterIo = await testHunterIo();
                testResults.clearbit = await testClearbit();
                break;
            default:
                return res.status(400).json({
                    success: false,
                    error: 'Invalid source specified'
                });
        }

        res.json({
            success: true,
            testResults: testResults,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Source test error:', error);
        res.status(500).json({
            success: false,
            error: 'Source test failed',
            message: error.message
        });
    }
});

// Test Google Maps API
async function testGoogleMaps() {
    if (!process.env.GOOGLE_MAPS_API_KEY) {
        return { status: 'disabled', message: 'API key not configured' };
    }

    try {
        const GoogleMapsService = require('../services/GoogleMapsService');
        const service = new GoogleMapsService();
        
        // Test with a simple search
        await service.searchBusinesses('real estate', 'New York, NY');
        
        return { status: 'connected', message: 'Google Maps API is working' };
    } catch (error) {
        return { status: 'error', message: error.message };
    }
}

// Test Yelp API
async function testYelp() {
    if (!process.env.YELP_API_KEY) {
        return { status: 'disabled', message: 'API key not configured' };
    }

    try {
        const YelpService = require('../services/YelpService');
        const service = new YelpService();
        
        // Test with a simple search
        await service.searchBusinesses('restaurant', 'San Francisco, CA');
        
        return { status: 'connected', message: 'Yelp API is working' };
    } catch (error) {
        return { status: 'error', message: error.message };
    }
}

// Test Hunter.io API
async function testHunterIo() {
    if (!process.env.HUNTER_IO_API_KEY) {
        return { status: 'disabled', message: 'API key not configured' };
    }

    try {
        const ValidationService = require('../services/ValidationService');
        const service = new ValidationService();
        
        // Test with a simple email validation
        await service.validateEmail('test@example.com');
        
        return { status: 'connected', message: 'Hunter.io API is working' };
    } catch (error) {
        return { status: 'error', message: error.message };
    }
}

// Test Clearbit API
async function testClearbit() {
    if (!process.env.CLEARBIT_API_KEY) {
        return { status: 'disabled', message: 'API key not configured' };
    }

    try {
        const ValidationService = require('../services/ValidationService');
        const service = new ValidationService();
        
        // Test with a simple business lookup
        await service.enrichBusinessData('Example Company', 'example.com');
        
        return { status: 'connected', message: 'Clearbit API is working' };
    } catch (error) {
        return { status: 'error', message: error.message };
    }
}

// Generate setup recommendations
function generateRecommendations(sources) {
    const recommendations = [];

    if (!sources.googleMaps.enabled) {
        recommendations.push({
            priority: 'high',
            source: 'Google Maps',
            message: 'Enable Google Maps API for comprehensive business data',
            setup: 'Get API key from Google Cloud Console and set GOOGLE_MAPS_API_KEY'
        });
    }

    if (!sources.yelp.enabled) {
        recommendations.push({
            priority: 'high',
            source: 'Yelp',
            message: 'Enable Yelp API for local business reviews and data',
            setup: 'Get API key from Yelp Developers and set YELP_API_KEY'
        });
    }

    if (!sources.hunterIo.enabled) {
        recommendations.push({
            priority: 'medium',
            source: 'Hunter.io',
            message: 'Enable email verification for better lead quality',
            setup: 'Sign up at hunter.io and set HUNTER_IO_API_KEY'
        });
    }

    if (!sources.clearbit.enabled) {
        recommendations.push({
            priority: 'medium',
            source: 'Clearbit',
            message: 'Enable business enrichment for detailed company data',
            setup: 'Sign up at clearbit.com and set CLEARBIT_API_KEY'
        });
    }

    return recommendations;
}

module.exports = router;