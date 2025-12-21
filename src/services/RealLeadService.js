class RealLeadService {
    constructor() {
        this.apiUrl = 'http://localhost:5001/api';
    }

    async generateLeads(criteria) {
        try {
            const response = await fetch(`${this.apiUrl}/leads/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(criteria)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Real lead generation failed:', error);
            throw error;
        }
    }

    async getApiStatus() {
        try {
            const response = await fetch(`${this.apiUrl}/leads/sources/status`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API status check failed:', error);
            return { success: false, error: error.message };
        }
    }

    async testConnection() {
        try {
            const response = await fetch(`${this.apiUrl}/health`);
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    async validateEmail(email) {
        try {
            const response = await fetch(`${this.apiUrl}/validate/email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Email validation failed:', error);
            return { success: false, error: error.message };
        }
    }

    async validatePhone(phone) {
        try {
            const response = await fetch(`${this.apiUrl}/validate/phone`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ phone })
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Phone validation failed:', error);
            return { success: false, error: error.message };
        }
    }

    async getLeads(filters = {}) {
        try {
            const queryParams = new URLSearchParams();
            
            Object.keys(filters).forEach(key => {
                if (filters[key]) {
                    queryParams.append(key, filters[key]);
                }
            });

            const response = await fetch(`${this.apiUrl}/leads?${queryParams}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Get leads failed:', error);
            return { success: false, error: error.message };
        }
    }
}

export default RealLeadService;