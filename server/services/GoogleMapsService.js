const axios = require('axios');
const NodeCache = require('node-cache');

class GoogleMapsService {
    constructor() {
        this.apiKey = process.env.GOOGLE_MAPS_API_KEY;
        this.cache = new NodeCache({ stdTTL: 3600 }); // 1 hour cache
        this.baseUrl = 'https://maps.googleapis.com/maps/api';
    }

    async searchBusinesses(query, location, radius = 5000) {
        if (!this.apiKey) {
            throw new Error('Google Maps API key not configured');
        }

        const cacheKey = `gmaps_${query}_${location}_${radius}`;
        const cached = this.cache.get(cacheKey);
        if (cached) return cached;

        try {
            // First, get coordinates for the location
            const geocodeResponse = await axios.get(`${this.baseUrl}/geocode/json`, {
                params: {
                    address: location,
                    key: this.apiKey
                }
            });

            if (geocodeResponse.data.results.length === 0) {
                throw new Error('Location not found');
            }

            const coordinates = geocodeResponse.data.results[0].geometry.location;

            // Search for businesses using Places API
            const placesResponse = await axios.get(`${this.baseUrl}/place/nearbysearch/json`, {
                params: {
                    location: `${coordinates.lat},${coordinates.lng}`,
                    radius: radius,
                    keyword: query,
                    type: 'establishment',
                    key: this.apiKey
                }
            });

            const businesses = await Promise.all(
                placesResponse.data.results.map(async (place) => {
                    const details = await this.getPlaceDetails(place.place_id);
                    return this.formatBusinessData(place, details, coordinates);
                })
            );

            this.cache.set(cacheKey, businesses);
            return businesses;

        } catch (error) {
            console.error('Google Maps API error:', error);
            throw new Error(`Failed to fetch businesses: ${error.message}`);
        }
    }

    async getPlaceDetails(placeId) {
        try {
            const response = await axios.get(`${this.baseUrl}/place/details/json`, {
                params: {
                    place_id: placeId,
                    fields: 'name,formatted_address,formatted_phone_number,website,opening_hours,rating,user_ratings_total,business_status,types',
                    key: this.apiKey
                }
            });

            return response.data.result;
        } catch (error) {
            console.error('Error fetching place details:', error);
            return null;
        }
    }

    formatBusinessData(place, details, searchLocation) {
        const businessTypes = {
            'real_estate_agency': 'real-estate',
            'insurance_agency': 'insurance',
            'general_contractor': 'construction',
            'lawyer': 'legal',
            'car_dealer': 'automotive',
            'hospital': 'healthcare',
            'store': 'retail'
        };

        // Determine industry from place types
        let industry = 'other';
        for (const type of place.types) {
            if (businessTypes[type]) {
                industry = businessTypes[type];
                break;
            }
        }

        return {
            businessName: place.name,
            businessType: place.types[0]?.replace(/_/g, ' ') || 'Business',
            industry: industry,
            phone: details?.formatted_phone_number || null,
            website: details?.website || null,
            address: {
                street: details?.formatted_address || place.vicinity,
                coordinates: {
                    lat: place.geometry.location.lat,
                    lng: place.geometry.location.lng
                }
            },
            businessDetails: {
                rating: place.rating || details?.rating || null,
                reviewCount: place.user_ratings_total || details?.user_ratings_total || 0,
                hours: details?.opening_hours?.weekday_text || []
            },
            sources: [{
                name: 'google_maps',
                sourceId: place.place_id,
                url: `https://maps.google.com/maps?place_id=${place.place_id}`,
                collectedAt: new Date(),
                confidence: 85
            }],
            confidence: this.calculateConfidence(place, details),
            status: 'new'
        };
    }

    calculateConfidence(place, details) {
        let confidence = 50;

        if (place.rating && place.rating >= 4.0) confidence += 20;
        if (place.user_ratings_total && place.user_ratings_total > 10) confidence += 10;
        if (details?.formatted_phone_number) confidence += 15;
        if (details?.website) confidence += 15;
        if (details?.opening_hours) confidence += 10;

        return Math.min(confidence, 100);
    }
}

module.exports = GoogleMapsService;