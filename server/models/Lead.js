const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
    // Business Information
    businessName: {
        type: String,
        required: true,
        trim: true
    },
    businessType: {
        type: String,
        required: true
    },
    industry: {
        type: String,
        required: true,
        enum: ['real-estate', 'mortgage', 'insurance', 'construction', 'property-management', 'healthcare', 'legal', 'automotive', 'retail', 'other']
    },
    
    // Contact Information
    contactName: String,
    phone: {
        type: String,
        validate: {
            validator: function(v) {
                return /^\+?[\d\s\-\(\)]+$/.test(v);
            },
            message: 'Invalid phone number format'
        }
    },
    email: {
        type: String,
        validate: {
            validator: function(v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: 'Invalid email format'
        }
    },
    website: String,
    
    // Location
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String,
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    
    // Lead Quality & Validation
    confidence: {
        type: Number,
        min: 0,
        max: 100,
        default: 50
    },
    status: {
        type: String,
        enum: ['new', 'validated', 'contacted', 'qualified', 'converted', 'rejected'],
        default: 'new'
    },
    validationStatus: {
        email: {
            verified: Boolean,
            deliverable: Boolean,
            risk: String // 'low', 'medium', 'high'
        },
        phone: {
            verified: Boolean,
            type: String, // 'mobile', 'landline', 'voip'
            carrier: String
        },
        business: {
            verified: Boolean,
            exists: Boolean,
            yearsInBusiness: Number
        }
    },
    
    // Data Sources
    sources: [{
        name: String, // 'google_maps', 'yelp', 'yellow_pages', etc.
        sourceId: String,
        url: String,
        collectedAt: Date,
        confidence: Number
    }],
    
    // Social Media Presence
    socialMedia: {
        facebook: String,
        linkedin: String,
        instagram: String,
        twitter: String
    },
    
    // Business Details
    businessDetails: {
        description: String,
        yearEstablished: Number,
        employeeCount: String,
        revenue: String,
        rating: Number,
        reviewCount: Number,
        hours: [{
            day: String,
            open: String,
            close: String,
            closed: Boolean
        }]
    },
    
    // Compliance & Privacy
    consent: {
        marketing: {
            granted: Boolean,
            grantedAt: Date,
            source: String
        },
        dataProcessing: {
            granted: Boolean,
            grantedAt: Date
        }
    },
    
    // Metadata
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    lastContactedAt: Date,
    tags: [String],
    notes: [String]
});

// Indexes for performance
leadSchema.index({ businessName: 1 });
leadSchema.index({ industry: 1 });
leadSchema.index({ 'address.city': 1, 'address.state': 1 });
leadSchema.index({ email: 1 });
leadSchema.index({ phone: 1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ status: 1 });

// Update timestamp on save
leadSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

module.exports = mongoose.model('Lead', leadSchema);