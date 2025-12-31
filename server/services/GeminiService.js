const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.enabled = !!this.apiKey;
    
    if (this.enabled) {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      console.log('✨ Gemini AI Service initialized');
    } else {
      console.log('⚠️  Gemini API key not found - AI features disabled');
    }
  }

  /**
   * Enrich lead data with AI-generated insights
   */
  async enrichLeadData(lead) {
    if (!this.enabled) return lead;

    try {
      const prompt = `Analyze this business lead and provide a professional enrichment in JSON format:

Business Name: ${lead.name}
Industry: ${lead.industry || 'Unknown'}
Location: ${lead.city}, ${lead.state || lead.country}
Phone: ${lead.phone || 'N/A'}
Website: ${lead.website || 'N/A'}

Provide:
1. businessDescription - 2-3 sentence professional description
2. potentialServices - Array of 3-5 services they likely offer
3. targetMarket - Who their typical customers are
4. leadQualityScore - Score 1-10 based on available information
5. engagementTips - 2-3 tips for contacting this business

Return ONLY valid JSON, no markdown formatting.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse JSON response
      const enrichment = JSON.parse(text.replace(/```json\n?/g, '').replace(/```\n?/g, ''));
      
      return {
        ...lead,
        aiEnriched: true,
        enrichedData: enrichment,
        confidenceScore: Math.min(100, lead.confidenceScore + 15) // Boost confidence
      };
    } catch (error) {
      console.error('Gemini enrichment error:', error.message);
      return lead; // Return original lead if AI fails
    }
  }

  /**
   * Batch enrich multiple leads
   */
  async enrichLeads(leads, maxConcurrent = 3) {
    if (!this.enabled) return leads;

    const enriched = [];
    
    // Process in batches to avoid rate limits
    for (let i = 0; i < leads.length; i += maxConcurrent) {
      const batch = leads.slice(i, i + maxConcurrent);
      const batchResults = await Promise.all(
        batch.map(lead => this.enrichLeadData(lead))
      );
      enriched.push(...batchResults);
      
      // Small delay between batches
      if (i + maxConcurrent < leads.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    return enriched;
  }

  /**
   * Validate and score lead quality using AI
   */
  async scoreLeadQuality(lead) {
    if (!this.enabled) return lead.confidenceScore || 50;

    try {
      const prompt = `Rate this business lead quality from 1-100:

Name: ${lead.name}
Industry: ${lead.industry}
Phone: ${lead.phone || 'Missing'}
Email: ${lead.email || 'Missing'}
Website: ${lead.website || 'Missing'}
Address: ${lead.address || 'Incomplete'}

Consider:
- Data completeness
- Business legitimacy indicators
- Contact information quality
- Industry relevance

Respond with ONLY a number between 1-100.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const score = parseInt(response.text().trim());
      
      return isNaN(score) ? 50 : Math.min(100, Math.max(1, score));
    } catch (error) {
      console.error('Gemini scoring error:', error.message);
      return lead.confidenceScore || 50;
    }
  }

  /**
   * Generate missing business details using AI
   */
  async generateMissingDetails(lead) {
    if (!this.enabled) return lead;

    const missing = [];
    if (!lead.email) missing.push('email');
    if (!lead.website) missing.push('website');
    if (!lead.description) missing.push('description');

    if (missing.length === 0) return lead;

    try {
      const prompt = `For this Bangladesh business, suggest likely values:

Business: ${lead.name}
Industry: ${lead.industry}
Location: ${lead.city}
Phone: ${lead.phone}

Missing: ${missing.join(', ')}

Provide realistic Bangladesh business data in JSON:
{
  "email": "likely professional email",
  "website": "likely website URL or null",
  "description": "1-2 sentence business description"
}

Return ONLY valid JSON.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const suggestions = JSON.parse(text.replace(/```json\n?/g, '').replace(/```\n?/g, ''));

      return {
        ...lead,
        email: lead.email || suggestions.email,
        website: lead.website || suggestions.website,
        description: lead.description || suggestions.description,
        aiGenerated: missing
      };
    } catch (error) {
      console.error('Gemini generation error:', error.message);
      return lead;
    }
  }

  /**
   * Categorize industry more accurately
   */
  async categorizeIndustry(businessName, existingIndustry) {
    if (!this.enabled) return existingIndustry;

    try {
      const prompt = `Categorize this business into ONE primary industry:

Business Name: ${businessName}
Current Category: ${existingIndustry || 'Unknown'}

Choose from: Retail, Restaurant, Healthcare, Technology, Construction, Real Estate, Education, Finance, Manufacturing, Services, E-commerce, Hospitality, Transportation, Agriculture

Respond with ONLY the single industry category name.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Gemini categorization error:', error.message);
      return existingIndustry;
    }
  }
}

module.exports = GeminiService;
