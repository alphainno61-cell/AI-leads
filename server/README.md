# Real Lead Generation API Setup Guide

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Configure API Keys
Copy `.env` file and add your real API keys:

```bash
# Required for real lead generation
GOOGLE_MAPS_API_KEY=your_actual_google_maps_key
YELP_API_KEY=your_actual_yelp_key

# Optional for enhanced validation
HUNTER_IO_API_KEY=your_hunter_io_key
CLEARBIT_API_KEY=your_clearbit_key

# Database (optional - uses in-memory if not configured)
MONGODB_URI=mongodb://localhost:27017/alpha-leads
```

### 3. Start the Server
```bash
npm run dev
```

## 🔑 Getting API Keys

### Google Maps API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Places API" and "Geocoding API"
4. Create credentials (API Key)
5. Add billing information (required for production)

**Pricing**: ~$2-5 per 1000 requests

### Yelp API
1. Visit [Yelp Developers](https://www.yelp.com/developers)
2. Create an app
3. Get your API key from the app dashboard

**Pricing**: 5000 requests/month free, then $1 per 1000 requests

### Hunter.io (Email Verification)
1. Sign up at [Hunter.io](https://hunter.io/)
2. Get API key from dashboard

**Pricing**: 100 verifications/month free, then $49/month

### Clearbit (Business Enrichment)
1. Sign up at [Clearbit](https://clearbit.com/)
2. Get API key from dashboard

**Pricing**: Custom pricing, contact for quote

## 📡 API Endpoints

### Generate Real Leads
```bash
POST /api/leads/generate
{
  "industry": "real-estate",
  "city": "Los Angeles",
  "state": "CA",
  "limit": 50
}
```

### Get Generated Leads
```bash
GET /api/leads?industry=real-estate&city=Los Angeles
```

### Validate Data
```bash
POST /api/validate/email
{
  "email": "john@example.com"
}
```

### Check API Status
```bash
GET /api/sources
```

## 🎯 What This Provides

### Real Business Data From:
- ✅ **Google Maps/Places**: Business listings, contact info, reviews
- ✅ **Yelp**: Local businesses, reviews, hours, photos
- ✅ **Email Verification**: Validate email deliverability
- ✅ **Business Enrichment**: Company data, social media, employee count

### Data Quality Features:
- ✅ **Email Validation**: Check if emails are deliverable
- ✅ **Phone Validation**: Format and verify phone numbers
- ✅ **Business Verification**: Confirm business exists
- ✅ **Duplicate Removal**: Automatically remove duplicate leads
- ✅ **Confidence Scoring**: Rate lead quality 0-100%

### Compliance Features:
- ✅ **GDPR Compliant**: Data privacy controls
- ✅ **Rate Limiting**: Respect API limits
- ✅ **Data Validation**: Ensure data quality
- ✅ **Audit Trail**: Track data sources

## ⚠️ Important Notes

### Legal Compliance
- Ensure you have proper consent for marketing
- Follow GDPR, CCPA, and local privacy laws
- Respect website terms of service
- Implement opt-out mechanisms

### API Costs
- Start with free tiers to test
- Monitor usage to avoid unexpected charges
- Implement caching to reduce API calls
- Set up billing alerts

### Data Quality
- Always validate data before use
- Remove duplicates and invalid entries
- Regularly clean your database
- Respect do-not-contact lists

## 🔧 Integration with Frontend

Update your frontend to use the real API:

```javascript
// In LeadCollection.jsx
const handleCollectLeads = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/leads/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        industry: selectedIndustry,
        city: selectedCity,
        state: selectedState,
        limit: 10
      })
    });
    
    const data = await response.json();
    if (data.success) {
      setLeads(prevLeads => [...prevLeads, ...data.leads]);
    }
  } catch (error) {
    console.error('Failed to generate real leads:', error);
  }
};
```

This transforms your app from simulation to **real lead generation**! 🎉