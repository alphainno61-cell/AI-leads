import { useState } from 'react';
import './LeadCollection.css';

function LeadCollection() {
    const [selectedIndustry, setSelectedIndustry] = useState('real-estate');
    const [selectedCountry, setSelectedCountry] = useState('usa');
    const [selectedState, setSelectedState] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [isCollecting, setIsCollecting] = useState(false);
    const [collectionProgress, setCollectionProgress] = useState(0);

    const [leads, setLeads] = useState([
        {
            id: 1,
            businessName: 'Sunset Realty Group',
            contactName: 'John Anderson',
            phone: '+1 (555) 123-4567',
            email: 'john@sunsetrealty.com',
            location: 'Los Angeles, CA',
            source: 'Google Places',
            status: 'Validated',
            confidence: 98,
            selected: false
        },
        {
            id: 2,
            businessName: 'Prime Properties LLC',
            contactName: 'Sarah Mitchell',
            phone: '+1 (555) 234-5678',
            email: 'sarah@primeproperties.com',
            location: 'San Francisco, CA',
            source: 'Google Places',
            status: 'Validated',
            confidence: 95,
            selected: false
        },
        {
            id: 3,
            businessName: 'Metro Real Estate',
            contactName: 'Michael Chen',
            phone: '+1 (555) 345-6789',
            email: 'michael@metrorealestate.com',
            location: 'San Diego, CA',
            source: 'Google Places',
            status: 'Pending',
            confidence: 87,
            selected: false
        }
    ]);

    const industries = [
        { value: 'real-estate', label: 'Real Estate' },
        { value: 'mortgage', label: 'Mortgage Brokers' },
        { value: 'insurance', label: 'Insurance Agencies' },
        { value: 'construction', label: 'Construction' },
        { value: 'property-management', label: 'Property Management' }
    ];

    const handleCollectLeads = () => {
        setIsCollecting(true);
        setCollectionProgress(0);

        // Simulate progress
        const interval = setInterval(() => {
            setCollectionProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setIsCollecting(false);
                    return 100;
                }
                return prev + 10;
            });
        }, 500);
    };

    const toggleSelectAll = () => {
        const allSelected = leads.every(lead => lead.selected);
        setLeads(leads.map(lead => ({ ...lead, selected: !allSelected })));
    };

    const toggleSelectLead = (id) => {
        setLeads(leads.map(lead =>
            lead.id === id ? { ...lead, selected: !lead.selected } : lead
        ));
    };

    const selectedCount = leads.filter(lead => lead.selected).length;

    return (
        <div className="lead-collection">
            {/* Filter Section */}
            <div className="card filter-card">
                <div className="card-header">
                    <h3 className="card-title">Lead Collection Filters</h3>
                    <span className="badge badge-info">Auto-Scraping Enabled</span>
                </div>
                <div className="card-body">
                    <div className="filter-grid">
                        {/* Industry Selection */}
                        <div className="input-group">
                            <label className="input-label">Industry</label>
                            <select
                                className="select"
                                value={selectedIndustry}
                                onChange={(e) => setSelectedIndustry(e.target.value)}
                            >
                                {industries.map(industry => (
                                    <option key={industry.value} value={industry.value}>
                                        {industry.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Country Selection */}
                        <div className="input-group">
                            <label className="input-label">Country</label>
                            <select
                                className="select"
                                value={selectedCountry}
                                onChange={(e) => setSelectedCountry(e.target.value)}
                            >
                                <option value="usa">United States</option>
                                <option value="canada">Canada</option>
                                <option value="uk">United Kingdom</option>
                                <option value="australia">Australia</option>
                                <option value="bangladesh">Bangladesh</option>
                            </select>
                        </div>

                        {/* State Selection */}
                        <div className="input-group">
                            <label className="input-label">
                                {selectedCountry === 'bangladesh' ? 'Division' : 'State / Province'}
                            </label>
                            <select className="select" value={selectedState} onChange={(e) => setSelectedState(e.target.value)}>
                                <option value="">
                                    {selectedCountry === 'bangladesh' ? 'All Divisions' : 'All States'}
                                </option>
                                {selectedCountry === 'usa' && (
                                    <>
                                        <option value="ca">California</option>
                                        <option value="ny">New York</option>
                                        <option value="tx">Texas</option>
                                        <option value="fl">Florida</option>
                                    </>
                                )}
                                {selectedCountry === 'bangladesh' && (
                                    <>
                                        <option value="dhaka">Dhaka</option>
                                        <option value="chittagong">Chittagong</option>
                                        <option value="rajshahi">Rajshahi</option>
                                        <option value="khulna">Khulna</option>
                                        <option value="barisal">Barisal</option>
                                        <option value="sylhet">Sylhet</option>
                                        <option value="rangpur">Rangpur</option>
                                        <option value="mymensingh">Mymensingh</option>
                                    </>
                                )}
                                {selectedCountry === 'canada' && (
                                    <>
                                        <option value="on">Ontario</option>
                                        <option value="qc">Quebec</option>
                                        <option value="bc">British Columbia</option>
                                        <option value="ab">Alberta</option>
                                    </>
                                )}
                                {selectedCountry === 'uk' && (
                                    <>
                                        <option value="england">England</option>
                                        <option value="scotland">Scotland</option>
                                        <option value="wales">Wales</option>
                                        <option value="ni">Northern Ireland</option>
                                    </>
                                )}
                                {selectedCountry === 'australia' && (
                                    <>
                                        <option value="nsw">New South Wales</option>
                                        <option value="vic">Victoria</option>
                                        <option value="qld">Queensland</option>
                                        <option value="wa">Western Australia</option>
                                    </>
                                )}
                            </select>
                        </div>

                        {/* City Selection */}
                        <div className="input-group">
                            <label className="input-label">City</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="Enter city name"
                                value={selectedCity}
                                onChange={(e) => setSelectedCity(e.target.value)}
                            />
                        </div>

                        {/* Additional Filters */}
                        <div className="input-group">
                            <label className="input-label">Minimum Rating</label>
                            <select className="select">
                                <option value="">Any Rating</option>
                                <option value="4">4+ Stars</option>
                                <option value="4.5">4.5+ Stars</option>
                            </select>
                        </div>

                        <div className="input-group">
                            <label className="input-label">Business Type</label>
                            <select className="select">
                                <option value="">All Types</option>
                                <option value="verified">Verified Only</option>
                                <option value="website">Has Website</option>
                            </select>
                        </div>
                    </div>

                    <div className="filter-actions">
                        <button
                            className="btn btn-primary btn-lg"
                            onClick={handleCollectLeads}
                            disabled={isCollecting}
                        >
                            {isCollecting ? (
                                <>
                                    <span className="spinner spinner-sm"></span>
                                    Collecting Leads...
                                </>
                            ) : (
                                <>
                                    <span>🔍</span>
                                    Collect & Validate Leads
                                </>
                            )}
                        </button>
                        <button className="btn btn-secondary">
                            <span>📤</span>
                            Upload CSV
                        </button>
                    </div>

                    {isCollecting && (
                        <div className="collection-progress">
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${collectionProgress}%` }}
                                ></div>
                            </div>
                            <div className="progress-text">
                                Collecting leads... {collectionProgress}%
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Lead Preview Section */}
            <div className="card leads-table-card">
                <div className="card-header">
                    <div>
                        <h3 className="card-title">Lead Preview</h3>
                        <p className="card-subtitle">{leads.length} leads collected</p>
                    </div>
                    {selectedCount > 0 && (
                        <div className="batch-actions">
                            <span className="selected-count">{selectedCount} selected</span>
                            <button className="btn btn-success btn-sm">
                                <span>✓</span>
                                Validate Selected
                            </button>
                            <button className="btn btn-primary btn-sm">
                                <span>📞</span>
                                Start Calling
                            </button>
                            <button className="btn btn-danger btn-sm">
                                <span>🗑️</span>
                                Delete
                            </button>
                        </div>
                    )}
                </div>
                <div className="card-body" style={{ padding: 0 }}>
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>
                                        <input
                                            type="checkbox"
                                            onChange={toggleSelectAll}
                                            checked={leads.length > 0 && leads.every(lead => lead.selected)}
                                        />
                                    </th>
                                    <th>Business Name</th>
                                    <th>Contact Person</th>
                                    <th>Phone</th>
                                    <th>Email</th>
                                    <th>Location</th>
                                    <th>Source</th>
                                    <th>Status</th>
                                    <th>Confidence</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leads.map((lead) => (
                                    <tr key={lead.id}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={lead.selected}
                                                onChange={() => toggleSelectLead(lead.id)}
                                            />
                                        </td>
                                        <td className="font-semibold">{lead.businessName}</td>
                                        <td>{lead.contactName}</td>
                                        <td>{lead.phone}</td>
                                        <td>{lead.email}</td>
                                        <td>{lead.location}</td>
                                        <td>
                                            <span className="badge badge-info">{lead.source}</span>
                                        </td>
                                        <td>
                                            <span className={`badge ${lead.status === 'Validated' ? 'badge-success' : 'badge-warning'}`}>
                                                {lead.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="confidence-indicator">
                                                <div className="confidence-bar">
                                                    <div
                                                        className="confidence-fill"
                                                        style={{ width: `${lead.confidence}%` }}
                                                    ></div>
                                                </div>
                                                <span className="confidence-text">{lead.confidence}%</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button className="btn-icon" title="View Details">👁️</button>
                                                <button className="btn-icon" title="Edit">✏️</button>
                                                <button className="btn-icon" title="Delete">🗑️</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="stats-summary">
                <div className="card summary-card">
                    <div className="summary-icon">📊</div>
                    <div className="summary-content">
                        <div className="summary-value">{leads.length}</div>
                        <div className="summary-label">Total Leads</div>
                    </div>
                </div>
                <div className="card summary-card">
                    <div className="summary-icon">✅</div>
                    <div className="summary-content">
                        <div className="summary-value">
                            {leads.filter(l => l.status === 'Validated').length}
                        </div>
                        <div className="summary-label">Validated</div>
                    </div>
                </div>
                <div className="card summary-card">
                    <div className="summary-icon">⏳</div>
                    <div className="summary-content">
                        <div className="summary-value">
                            {leads.filter(l => l.status === 'Pending').length}
                        </div>
                        <div className="summary-label">Pending</div>
                    </div>
                </div>
                <div className="card summary-card">
                    <div className="summary-icon">🎯</div>
                    <div className="summary-content">
                        <div className="summary-value">
                            {Math.round(leads.reduce((acc, l) => acc + l.confidence, 0) / leads.length)}%
                        </div>
                        <div className="summary-label">Avg Confidence</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LeadCollection;
