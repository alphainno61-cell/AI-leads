const axios = require('axios');

class OpenStreetMapService {
    constructor() {
        this.baseUrl = 'https://nominatim.openstreetmap.org';
        this.overpassUrl = 'https://overpass-api.de/api/interpreter';
    }

    /**
     * Search for businesses using Overpass API (OpenStreetMap data)
     * @param {string} industry - Business industry/type
     * @param {string} location - City or location
     * @param {string} country - Country code (e.g., 'bd' for Bangladesh)
     * @param {number} limit - Maximum results
     */
    async searchBusinesses(industry, location, country = 'bd', limit = 50) {
        try {
            // Get location coordinates first
            const coords = await this.getLocationCoordinates(location, country);
            if (!coords) {
                console.warn(`Could not find coordinates for ${location}, ${country}`);
                return [];
            }

            console.log(`📍 Searching Dhaka (${coords.lat}, ${coords.lon}) for ${industry}...`);

            // Build Overpass query
            const query = this.buildOverpassQuery(coords, limit);
            
            // Execute query with proper error handling
            const response = await axios.post(this.overpassUrl, query, {
                headers: {
                    'Content-Type': 'text/plain',
                    'User-Agent': 'AlphaLeads/1.0'
                },
                timeout: 35000,
                validateStatus: () => true // Don't throw on any status code
            });

            if (response.status !== 200) {
                console.error(`Overpass API error ${response.status}:`, response.data);
                return [];
            }

            // Parse and format results
            const leads = this.parseOverpassResults(response.data, location, country);
            console.log(`✅ Found ${leads.length} businesses from OpenStreetMap`);
            
            return leads;

        } catch (error) {
            console.error('OpenStreetMap search failed:', error.message);
            return [];
        }
    }

    /**
     * Get coordinates for a location
     */
    async getLocationCoordinates(location, country) {
        try {
            const response = await axios.get(`${this.baseUrl}/search`, {
                params: {
                    q: `${location}, ${country}`,
                    format: 'json',
                    limit: 1
                },
                headers: {
                    'User-Agent': 'AlphaLeads/1.0'
                }
            });

            if (response.data && response.data.length > 0) {
                return {
                    lat: parseFloat(response.data[0].lat),
                    lon: parseFloat(response.data[0].lon)
                };
            }
            return null;
        } catch (error) {
            console.error('Geocoding failed:', error.message);
            return null;
        }
    }

    /**
     * Map industry to OpenStreetMap tags
     */
    getOSMTagsForIndustry(industry) {
        const tagMap = {
            'real-estate': ['office=estate_agent', 'office=property_management', 'shop=real_estate'],
            'construction': ['office=construction_company', 'craft=builder', 'shop=building_materials'],
            'insurance': ['office=insurance', 'amenity=insurance'],
            'mortgage': ['office=financial', 'amenity=bank'],
            'property-management': ['office=property_management', 'office=estate_agent'],
            'healthcare': ['amenity=clinic', 'amenity=hospital', 'amenity=doctors'],
            'retail': ['shop=*'],
            'restaurant': ['amenity=restaurant', 'amenity=cafe'],
            'hotel': ['tourism=hotel', 'tourism=guest_house']
        };

        return tagMap[industry] || ['office=company', 'shop=*'];
    }

    /**
     * Build Overpass API query - simplified for better results
     */
    buildOverpassQuery(coords, limit) {
        // Query for all named places (shops, offices, amenities)
        const query = `[out:json];
(
  node["name"](around:3000,${coords.lat},${coords.lon});
  way["name"](around:3000,${coords.lat},${coords.lon});
);
out center ${limit};`;
        
        return query;
    }

    /**
     * Parse Overpass API results into lead format
     */
    parseOverpassResults(data, location, country) {
        const leads = [];
        
        if (!data.elements || data.elements.length === 0) {
            console.log('No elements found in Overpass response');
            return leads;
        }

        console.log(`Processing ${data.elements.length} elements from Overpass API...`);

        data.elements.forEach(element => {
            try {
                if (!element.tags || !element.tags.name) {
                    return; // Skip if no name
                }
                
                const tags = element.tags;
                
                // Extract business information
                const businessName = tags.name || tags.brand || 'Unknown Business';
                const phone = tags.phone || tags['contact:phone'] || null;
                const email = tags.email || tags['contact:email'] || null;
                const website = tags.website || tags['contact:website'] || '';
                const address = this.buildAddress(tags, location, country);
                const industry = this.identifyIndustry(tags);

                leads.push({
                    id: `osm_${element.id}`,
                    businessName: businessName,
                    contactName: tags['operator'] || tags['contact:name'] || businessName,
                    phone: phone,
                    email: email,
                    website: website,
                    location: address,
                    city: location,
                    state: country.toUpperCase(),
                    industry: industry,
                    source: 'OpenStreetMap',
                    status: 'New',
                    confidence: Math.min(95, this.calculateConfidence(tags)),
                    selected: false,
                    dateAdded: new Date().toISOString(),
                    rawData: {
                        osmId: element.id,
                        osmType: element.type,
                        lat: element.lat,
                        lon: element.lon,
                        tags: tags
                    }
                });
            } catch (err) {
                console.error('Error parsing element:', err.message);
            }
        });

        console.log(`✅ Parsed ${leads.length} valid leads`);
        return leads;
    }

    /**
     * Identify industry from OSM tags
     */
    identifyIndustry(tags) {
        if (tags.shop) return 'Retail';
        if (tags.office) return 'Business Services';
        if (tags.amenity === 'restaurant') return 'Restaurant';
        if (tags.amenity === 'cafe') return 'Cafe';
        if (tags.amenity === 'bank') return 'Financial';
        if (tags.amenity === 'clinic' || tags.amenity === 'hospital') return 'Healthcare';
        if (tags.amenity === 'pharmacy') return 'Healthcare';
        if (tags.tourism === 'hotel') return 'Hospitality';
        if (tags.craft) return 'Services';
        return 'General Business';
    }

    /**
     * Build address from OSM tags
     */
    buildAddress(tags, location, country) {
        const parts = [];
        
        if (tags['addr:housenumber']) parts.push(tags['addr:housenumber']);
        if (tags['addr:street']) parts.push(tags['addr:street']);
        if (tags['addr:district']) parts.push(tags['addr:district']);
        if (tags['addr:city'] || location) parts.push(tags['addr:city'] || location);
        if (tags['addr:postcode']) parts.push(tags['addr:postcode']);
        if (country) parts.push(country.toUpperCase());
        
        return parts.join(', ') || `${location}, ${country.toUpperCase()}`;
    }

    /**
     * Calculate confidence score based on available data
     */
    calculateConfidence(tags) {
        let confidence = 50; // Base confidence
        
        if (tags.name) confidence += 10;
        if (tags.phone || tags['contact:phone']) confidence += 15;
        if (tags.email || tags['contact:email']) confidence += 10;
        if (tags.website || tags['contact:website']) confidence += 10;
        if (tags['addr:street']) confidence += 5;
        
        return Math.min(confidence, 95);
    }

}

module.exports = OpenStreetMapService;
