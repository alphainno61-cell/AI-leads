import { useState, useEffect } from 'react';
import './AllLeads.css';

function AllLeads() {
    const [leads, setLeads] = useState([]);
    const [filteredLeads, setFilteredLeads] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSource, setFilterSource] = useState('all');
    const [filterIndustry, setFilterIndustry] = useState('all');
    const [sortBy, setSortBy] = useState('dateAdded');
    const [sortOrder, setSortOrder] = useState('desc');
    
    // Selection functionality
    const [selectedLeads, setSelectedLeads] = useState(new Set());
    const selectedCount = selectedLeads.size;
    
    // Delete confirmation state
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [showSuccessNotification, setShowSuccessNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    
    // Handle lead selection
    const handleSelectLead = (leadId) => {
        const newSelected = new Set(selectedLeads);
        if (newSelected.has(leadId)) {
            newSelected.delete(leadId);
        } else {
            newSelected.add(leadId);
        }
        setSelectedLeads(newSelected);
    };
    
    // Handle select all
    const handleSelectAll = () => {
        if (selectedLeads.size === filteredLeads.length) {
            setSelectedLeads(new Set());
        } else {
            setSelectedLeads(new Set(filteredLeads.map(lead => lead.id)));
        }
    };
    
    // Handle delete selected leads
    const handleDeleteSelected = () => {
        if (selectedLeads.size === 0) {
            setNotificationMessage('Please select at least one lead to delete.');
            setShowSuccessNotification(true);
            setTimeout(() => setShowSuccessNotification(false), 3000);
            return;
        }
        setShowDeleteConfirmation(true);
    };
    
    // Confirm delete operation
    const confirmDelete = () => {
        const remainingLeads = leads.filter(lead => !selectedLeads.has(lead.id));
        setLeads(remainingLeads);
        localStorage.setItem('alphaLeads_allLeads', JSON.stringify(remainingLeads));
        
        setNotificationMessage(`Successfully deleted ${selectedLeads.size} lead${selectedLeads.size > 1 ? 's' : ''}!`);
        setSelectedLeads(new Set());
        setShowDeleteConfirmation(false);
        setShowSuccessNotification(true);
        setTimeout(() => setShowSuccessNotification(false), 3000);
    };
    
    // Cancel delete operation
    const cancelDelete = () => {
        setShowDeleteConfirmation(false);
    };

    // Load leads from localStorage on component mount
    useEffect(() => {
        const loadLeadsFromStorage = () => {
            try {
                // Try to load from All Leads storage first
                let storedLeads = localStorage.getItem('alphaLeads_allLeads');
                
                // Fallback to main leads storage if All Leads storage is empty
                if (!storedLeads || JSON.parse(storedLeads).length === 0) {
                    storedLeads = localStorage.getItem('alphaLeads_leads');
                }
                
                if (storedLeads) {
                    const parsedLeads = JSON.parse(storedLeads);
                    if (Array.isArray(parsedLeads)) {
                        setLeads(parsedLeads);
                    } else if (parsedLeads.leads && Array.isArray(parsedLeads.leads)) {
                        setLeads(parsedLeads.leads);
                    }
                }
            } catch (error) {
                console.error('Error loading leads from storage:', error);
            }
        };

        loadLeadsFromStorage();
        
        // Listen for storage changes to update in real-time
        const handleStorageChange = (e) => {
            if (e.key === 'alphaLeads_allLeads' || e.key === 'alphaLeads_leads') {
                loadLeadsFromStorage();
            }
        };
        
        window.addEventListener('storage', handleStorageChange);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    // Filter and sort leads based on current filters
    useEffect(() => {
        let filtered = [...leads];

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(lead => 
                (lead.businessName && lead.businessName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (lead.contactName && lead.contactName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (lead.phone && lead.phone.includes(searchTerm)) ||
                (lead.location && lead.location.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // Apply source filter
        if (filterSource !== 'all') {
            filtered = filtered.filter(lead => lead.source === filterSource);
        }

        // Apply industry filter (based on business name patterns)
        if (filterIndustry !== 'all') {
            filtered = filtered.filter(lead => {
                const businessName = lead.businessName?.toLowerCase() || '';
                switch (filterIndustry) {
                    case 'real-estate':
                        return businessName.includes('realty') || businessName.includes('real estate') || 
                               businessName.includes('properties') || businessName.includes('homes') || 
                               businessName.includes('land') || businessName.includes('estate');
                    case 'mortgage':
                        return businessName.includes('mortgage') || businessName.includes('lending') || 
                               businessName.includes('loans') || businessName.includes('finance') || 
                               businessName.includes('capital');
                    case 'insurance':
                        return businessName.includes('insurance') || businessName.includes('assurance') || 
                               businessName.includes('protection') || businessName.includes('coverage');
                    case 'construction':
                        return businessName.includes('construction') || businessName.includes('builders') || 
                               businessName.includes('contractors') || businessName.includes('building');
                    case 'property-management':
                        return businessName.includes('management') || businessName.includes('rental') || 
                               businessName.includes('property care');
                    default:
                        return true;
                }
            });
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let aValue = a[sortBy];
            let bValue = b[sortBy];

            // Handle different data types
            if (sortBy === 'confidence') {
                aValue = parseInt(aValue) || 0;
                bValue = parseInt(bValue) || 0;
            } else if (sortBy === 'dateAdded' || sortBy === 'lastUpdated') {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            } else {
                aValue = String(aValue || '').toLowerCase();
                bValue = String(bValue || '').toLowerCase();
            }

            if (sortOrder === 'asc') {
                return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            } else {
                return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
            }
        });

        setFilteredLeads(filtered);
    }, [leads, searchTerm, filterSource, filterIndustry, sortBy, sortOrder]);

    const handleSort = (column) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('desc');
        }
    };

    const getSortIcon = (column) => {
        if (sortBy !== column) return '↕️';
        return sortOrder === 'asc' ? '↑' : '↓';
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'Validated': return 'badge-success';
            case 'Pending': return 'badge-warning';
            case 'Failed': return 'badge-danger';
            default: return 'badge-secondary';
        }
    };

    const getConfidenceColor = (confidence) => {
        if (confidence >= 90) return '#10b981';
        if (confidence >= 70) return '#f59e0b';
        if (confidence >= 50) return '#ef4444';
        return '#6b7280';
    };

    // Get unique sources for filter dropdown
    const uniqueSources = [...new Set(leads.map(lead => lead.source).filter(Boolean))];

    return (
        <div className="all-leads">
            {/* Header Section */}
            <div className="page-header">
                <div className="header-content">
                    <h1 className="page-title">All Leads</h1>
                    <p className="page-description">
                        Comprehensive view of all validated leads with advanced filtering and sorting options
                    </p>
                </div>
                <div className="header-stats">
                    <div className="stat-card">
                        <div className="stat-value">{leads.length}</div>
                        <div className="stat-label">Total Leads</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{leads.filter(l => l.status === 'Validated').length}</div>
                        <div className="stat-label">Validated</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{leads.filter(l => l.status === 'Pending').length}</div>
                        <div className="stat-label">Pending</div>
                    </div>
                </div>
            </div>

            {/* Filters Section */}
            <div className="filters-section">
                <div className="search-bar">
                    <div className="search-input-wrapper">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Search leads by name, email, phone, or location..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                </div>
                
                <div className="filter-controls">
                    <div className="filter-group">
                        <label className="filter-label">Source</label>
                        <select
                            value={filterSource}
                            onChange={(e) => setFilterSource(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">All Sources</option>
                            {uniqueSources.map(source => (
                                <option key={source} value={source}>{source}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label className="filter-label">Industry</label>
                        <select
                            value={filterIndustry}
                            onChange={(e) => setFilterIndustry(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">All Industries</option>
                            <option value="real-estate">Real Estate</option>
                            <option value="mortgage">Mortgage & Lending</option>
                            <option value="insurance">Insurance</option>
                            <option value="construction">Construction</option>
                            <option value="property-management">Property Management</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label className="filter-label">Sort By</label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="filter-select"
                        >
                            <option value="dateAdded">Date Added</option>
                            <option value="businessName">Business Name</option>
                            <option value="contactName">Contact Name</option>
                            <option value="confidence">Confidence</option>
                            <option value="status">Status</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Results Summary */}
            <div className="results-summary">
                <span className="results-count">
                    Showing {filteredLeads.length} of {leads.length} leads
                </span>
                {searchTerm && (
                    <span className="search-results">
                        for "{searchTerm}"
                    </span>
                )}
            </div>

            {/* Batch Actions */}
            {selectedCount > 0 && (
                <div className="batch-actions">
                    <span className="selected-count">{selectedCount} selected</span>
                    <button 
                        className="btn btn-danger btn-sm"
                        onClick={handleDeleteSelected}
                        disabled={selectedCount === 0}
                    >
                        <span>🗑️</span>
                        Delete Selected
                    </button>
                </div>
            )}

            {/* Leads Table */}
            <div className="leads-table-container">
                <table className="leads-table">
                    <thead>
                        <tr>
                            <th>
                                <input
                                    type="checkbox"
                                    checked={selectedLeads.size === filteredLeads.length && filteredLeads.length > 0}
                                    onChange={handleSelectAll}
                                />
                            </th>
                            <th onClick={() => handleSort('businessName')} className="sortable">
                                Business Name {getSortIcon('businessName')}
                            </th>
                            <th onClick={() => handleSort('contactName')} className="sortable">
                                Contact Person {getSortIcon('contactName')}
                            </th>
                            <th>Phone</th>
                            <th>Email</th>
                            <th onClick={() => handleSort('location')} className="sortable">
                                Location {getSortIcon('location')}
                            </th>
                            <th onClick={() => handleSort('source')} className="sortable">
                                Source {getSortIcon('source')}
                            </th>
                            <th onClick={() => handleSort('status')} className="sortable">
                                Status {getSortIcon('status')}
                            </th>
                            <th onClick={() => handleSort('confidence')} className="sortable">
                                Confidence {getSortIcon('confidence')}
                            </th>
                            <th onClick={() => handleSort('dateAdded')} className="sortable">
                                Date Added {getSortIcon('dateAdded')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLeads.length > 0 ? (
                            filteredLeads.map((lead) => (
                                <tr key={lead.id} className={`lead-row ${selectedLeads.has(lead.id) ? 'selected' : ''}`}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedLeads.has(lead.id)}
                                            onChange={() => handleSelectLead(lead.id)}
                                        />
                                    </td>
                                    <td className="business-name">
                                        <div className="business-info">
                                            <strong>{lead.businessName || 'N/A'}</strong>
                                        </div>
                                    </td>
                                    <td>{lead.contactName || 'N/A'}</td>
                                    <td>
                                        {lead.phone ? (
                                            <a href={`tel:${lead.phone}`} className="phone-link">
                                                {lead.phone}
                                            </a>
                                        ) : 'N/A'}
                                    </td>
                                    <td>
                                        {lead.email ? (
                                            <a href={`mailto:${lead.email}`} className="email-link">
                                                {lead.email}
                                            </a>
                                        ) : 'N/A'}
                                    </td>
                                    <td>{lead.location || 'N/A'}</td>
                                    <td>
                                        <span className="source-badge">{lead.source || 'Unknown'}</span>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${getStatusBadgeClass(lead.status)}`}>
                                            {lead.status || 'Unknown'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="confidence-display">
                                            <div className="confidence-bar">
                                                <div 
                                                    className="confidence-fill"
                                                    style={{ 
                                                        width: `${lead.confidence || 0}%`,
                                                        backgroundColor: getConfidenceColor(lead.confidence || 0)
                                                    }}
                                                ></div>
                                            </div>
                                            <span className="confidence-text">{lead.confidence || 0}%</span>
                                        </div>
                                    </td>
                                    <td className="date-cell">
                                        {lead.dateAdded ? new Date(lead.dateAdded).toLocaleDateString() : 'N/A'}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="9" className="no-results">
                                    {leads.length === 0 ? (
                                        <div className="empty-state">
                                            <span className="empty-icon">📋</span>
                                            <h3>No Leads Found</h3>
                                            <p>Start collecting leads to see them here</p>
                                        </div>
                                    ) : (
                                        <div className="empty-state">
                                            <span className="empty-icon">🔍</span>
                                            <h3>No Matching Results</h3>
                                            <p>Try adjusting your search or filter criteria</p>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirmation && (
                <div className="notification-overlay">
                    <div className="notification-popup delete-confirmation">
                        <div className="notification-header">
                            <div className="notification-icon">❓</div>
                            <h3 className="notification-title">Confirm Delete</h3>
                        </div>
                        <div className="notification-content">
                            <p>Are you sure you want to delete {selectedCount} selected lead{selectedCount > 1 ? 's' : ''}?</p>
                            <div className="notification-count">
                                <span className="count-badge">{selectedCount} leads selected</span>
                            </div>
                        </div>
                        <div className="notification-actions">
                            <button className="btn btn-secondary" onClick={cancelDelete}>
                                Cancel
                            </button>
                            <button className="btn btn-danger" onClick={confirmDelete}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Notification */}
            {showSuccessNotification && (
                <div className="notification-overlay">
                    <div className="notification-popup success">
                        <div className="notification-header">
                            <div className="notification-icon">✅</div>
                            <h3 className="notification-title">Success</h3>
                        </div>
                        <div className="notification-content">
                            <p>{notificationMessage}</p>
                        </div>
                        <div className="notification-actions">
                            <button className="btn btn-primary" onClick={() => setShowSuccessNotification(false)}>
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AllLeads;