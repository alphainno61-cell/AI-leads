import { useState, useEffect } from 'react';
import './LeadCollection.css';
import RealLeadService from '../../services/RealLeadService';

function LeadCollection() {
    const [selectedIndustry, setSelectedIndustry] = useState('real-estate');
    const [selectedCountry, setSelectedCountry] = useState('usa');
    const [selectedState, setSelectedState] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [isCollecting, setIsCollecting] = useState(false);
    const [collectionProgress, setCollectionProgress] = useState(0);
    const [showSuccessNotification, setShowSuccessNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [deletedCount, setDeletedCount] = useState(0);
    const [pendingDeleteLeads, setPendingDeleteLeads] = useState([]);
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [leadsPerPage] = useState(30);
    const [useRealData, setUseRealData] = useState(false);
    const [apiConnected, setApiConnected] = useState(false);
    const [currentStage, setCurrentStage] = useState(''); // 'searching', 'validating', 'processing'

    // Initialize real lead service
    const realLeadService = new RealLeadService();
    
    // Get stage status for timeline
    const getStageStatus = (stageName) => {
        const stages = ['searching', 'validating', 'processing'];
        const currentIndex = stages.indexOf(currentStage);
        const stageIndex = stages.indexOf(stageName);
        
        if (stageIndex < currentIndex) return 'completed';
        if (stageIndex === currentIndex) return 'active';
        return 'pending';
    };

    // Load leads from localStorage on component mount
    const [leads, setLeads] = useState(() => {
        const savedLeads = localStorage.getItem('alphaLeads_generatedLeads');
        if (savedLeads) {
            const parsedLeads = JSON.parse(savedLeads);
            // Reset all selections on page load/refresh
            return parsedLeads.map(lead => ({
                ...lead,
                selected: false
            }));
        }
        return [];
    });

    // Save leads to localStorage whenever leads change
    useEffect(() => {
        localStorage.setItem('alphaLeads_generatedLeads', JSON.stringify(leads));
    }, [leads]);

    // Check API connection on component mount
    useEffect(() => {
        checkApiConnection();
        checkApiStatus();
    }, []);

    const checkApiConnection = async () => {
        const connected = await realLeadService.testConnection();
        setApiConnected(connected);
    };

    const checkApiStatus = async () => {
        try {
            const status = await realLeadService.getApiStatus();
            if (status.success) {
                const hasFreeSources = status.summary.free_sources > 0;
                setApiConnected(hasFreeSources);
                if (hasFreeSources) {
                    setUseRealData(true); // Auto-enable real data if free sources available
                }
            }
        } catch (error) {
            console.error('API status check failed:', error);
        }
    };

    const industries = [
        { value: 'real-estate', label: 'Real Estate' },
        { value: 'mortgage', label: 'Mortgage Brokers' },
        { value: 'insurance', label: 'Insurance Agencies' },
        { value: 'construction', label: 'Construction' },
        { value: 'property-management', label: 'Property Management' }
    ];

    // Generate sample leads based on selected filters
    const generateNewLeads = () => {
        const businessTypes = {
            'real-estate': ['Realty', 'Real Estate', 'Properties', 'Homes', 'Land Co', 'Estate Group'],
            'mortgage': ['Mortgage', 'Home Loans', 'Lending', 'Finance', 'Capital'],
            'insurance': ['Insurance', 'Assurance', 'Protection', 'Coverage', 'Risk Management'],
            'construction': ['Construction', 'Builders', 'Contractors', 'Development', 'Building Co'],
            'property-management': ['Property Management', 'Rental Services', 'Property Care', 'Management Group']
        };

        // Country-specific data
        const countryData = {
            'bangladesh': {
                firstNames: ['Mohammad', 'Abdul', 'Rahim', 'Karim', 'Fatima', 'Ayesha', 'Nasrin', 'Rashed', 'Shakib', 'Tamim'],
                lastNames: ['Rahman', 'Ahmed', 'Khan', 'Islam', 'Hossain', 'Ali', 'Uddin', 'Chowdhury', 'Alam', 'Hassan'],
                cities: ['Dhaka', 'Chittagong', 'Khulna', 'Rajshahi', 'Sylhet', 'Barisal', 'Rangpur', 'Mymensingh', 'Gazipur', 'Narayanganj'],
                phonePrefix: '+880',
                phoneFormat: () => `+880 1${Math.floor(Math.random() * 9 + 1)}${Math.floor(Math.random() * 90000000 + 10000000)}`,
                sources: ['Google Maps', 'Bangladesh Trade Directory', 'Local Business Registry', 'Facebook Business', 'Yellow Pages BD']
            },
            'usa': {
                firstNames: ['John', 'Sarah', 'Michael', 'Emily', 'David', 'Lisa', 'Robert', 'Jennifer', 'William', 'Amanda'],
                lastNames: ['Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez'],
                cities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'],
                phonePrefix: '+1',
                phoneFormat: () => `+1 (555) ${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
                sources: ['Google Places', 'Yellow Pages', 'LinkedIn', 'Company Website', 'Business Directory']
            },
            'uk': {
                firstNames: ['James', 'Oliver', 'Emma', 'Charlotte', 'George', 'Sophie', 'William', 'Amelia', 'Harry', 'Emily'],
                lastNames: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Wilson', 'Taylor', 'Anderson'],
                cities: ['London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow', 'Liverpool', 'Newcastle', 'Sheffield', 'Bristol', 'Edinburgh'],
                phonePrefix: '+44',
                phoneFormat: () => `+44 20 ${Math.floor(Math.random() * 9000 + 1000)} ${Math.floor(Math.random() * 9000 + 1000)}`,
                sources: ['Google Maps', 'UK Business Directory', 'Companies House', 'Yell.com', 'Thomson Local']
            }
        };

        const data = countryData[selectedCountry] || countryData['usa'];
        const statuses = ['Validated', 'Pending', 'New'];

        const newLeads = [];
        const businessTypeNames = businessTypes[selectedIndustry] || businessTypes['real-estate'];

        for (let i = 0; i < 10; i++) {
            const firstName = data.firstNames[Math.floor(Math.random() * data.firstNames.length)];
            const lastName = data.lastNames[Math.floor(Math.random() * data.lastNames.length)];
            const businessType = businessTypeNames[Math.floor(Math.random() * businessTypeNames.length)];
            const city = selectedCity || data.cities[Math.floor(Math.random() * data.cities.length)];
            const source = data.sources[Math.floor(Math.random() * data.sources.length)];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            
            newLeads.push({
                id: `lead_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
                businessName: `${businessType} ${lastName}`,
                contactName: `${firstName} ${lastName}`,
                phone: data.phoneFormat(),
                email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${businessType.toLowerCase().replace(/\s+/g, '')}.com`,
                location: `${city}, ${selectedState || selectedCountry.toUpperCase()}`,
                source: source,
                status: status,
                confidence: Math.floor(Math.random() * 20 + 80),
                selected: false
            });
        }

        return newLeads;
    };

    // Generate Leads page now persists data across refreshes
    // Leads are removed only when deleted or validated (moved to All Leads)

    const handleCollectLeads = async () => {
        setIsCollecting(true);
        setCollectionProgress(0);

        try {
            if (useRealData && apiConnected) {
                // Use real lead generation API
                await generateRealLeads();
            } else {
                // Use simulated lead generation
                await generateSimulatedLeads();
            }
        } catch (error) {
            console.error('Lead generation failed:', error);
            setNotificationMessage(`Failed to generate leads: ${error.message}`);
            setShowSuccessNotification(true);
            setIsCollecting(false);
            setCurrentStage('');
            setTimeout(() => setShowSuccessNotification(false), 3000);
        }
    };

    const generateRealLeads = async () => {
        let progress = 0;
        setCollectionProgress(0);
        setCurrentStage('searching');
        
        return new Promise((resolve, reject) => {
            // Animate progress bar while waiting for API
            const interval = setInterval(() => {
                progress += Math.floor(Math.random() * 10) + 5; // Increment by 5-15%
                
                // Update timeline stages based on progress
                if (progress >= 35 && progress < 70) {
                    setCurrentStage('validating');
                } else if (progress >= 70) {
                    setCurrentStage('processing');
                }
                
                if (progress >= 90) progress = 90; // Cap at 90% until API returns
                setCollectionProgress(progress);
            }, 400);
            
            realLeadService.generateLeads({
                industry: selectedIndustry,
                city: selectedCity || undefined,
                state: selectedState || undefined,
                country: selectedCountry || 'usa',
                limit: 10
            }).then((response) => {
                clearInterval(interval);
                setCollectionProgress(100);
                setCurrentStage('processing'); // Ensure we're at processing stage

                if (response.success) {
                    const newLeads = response.leads.map(lead => ({
                        ...lead,
                        selected: false,
                        dateAdded: new Date().toISOString()
                    }));

                    setLeads(prevLeads => [...prevLeads, ...newLeads]);
                    setNotificationMessage(`Successfully generated ${newLeads.length} real leads from ${response.sources.bySource ? Object.keys(response.sources.bySource).join(', ') : 'multiple sources'}!`);
                    setDeletedCount(newLeads.length);
                    setShowSuccessNotification(true);
                    
                    setTimeout(() => {
                        setShowSuccessNotification(false);
                        setIsCollecting(false);
                        setCurrentStage('');
                        resolve();
                    }, 3000);
                } else {
                    throw new Error('Failed to generate real leads');
                }
            }).catch((error) => {
                clearInterval(interval);
                setCollectionProgress(0);
                setIsCollecting(false);
                setCurrentStage('');
                reject(error);
            });
        });
    };

    const generateSimulatedLeads = async () => {
        // Simulate progress
        return new Promise((resolve) => {
            setCurrentStage('searching');
            let currentProgress = 0;
            
            const interval = setInterval(() => {
                currentProgress += 10;
                
                // Update stage based on progress
                if (currentProgress >= 35 && currentProgress < 70) {
                    setCurrentStage('validating');
                } else if (currentProgress >= 70 && currentProgress < 100) {
                    setCurrentStage('processing');
                }
                
                setCollectionProgress(currentProgress);
                
                if (currentProgress >= 100) {
                    clearInterval(interval);
                    
                    // Generate 10 new leads
                    const newLeads = generateNewLeads();
                    setLeads(prevLeads => {
                        const updatedLeads = [...prevLeads, ...newLeads];
                        return updatedLeads;
                    });
                    
                    // Show success notification
                    setNotificationMessage(`Successfully generated ${newLeads.length} new leads!`);
                    setDeletedCount(newLeads.length);
                    setIsConfirmingDelete(false);
                    setShowSuccessNotification(true);
                    
                    // Resolve the promise after showing notification
                    setTimeout(() => {
                        setShowSuccessNotification(false);
                        setNotificationMessage('');
                        setDeletedCount(0);
                        setIsCollecting(false);
                        setCurrentStage('');
                        resolve();
                    }, 3000);
                }
            }, 500);
        });
    };

    const toggleSelectAll = () => {
        const allSelected = leads.every(lead => lead.selected);
        const updatedLeads = leads.map(lead => ({ ...lead, selected: !allSelected }));
        setLeads(updatedLeads);
    };

    const toggleSelectLead = (id) => {
        const updatedLeads = leads.map(lead =>
            lead.id === id ? { ...lead, selected: !lead.selected } : lead
        );
        setLeads(updatedLeads);
    };

    const handleValidateSelected = () => {
        const selectedLeads = leads.filter(lead => lead.selected);
        
        if (selectedLeads.length === 0) {
            setNotificationMessage('Please select at least one lead to validate.');
            setDeletedCount(0);
            setIsConfirmingDelete(false);
            setShowSuccessNotification(true);
            setTimeout(() => {
                setShowSuccessNotification(false);
                setNotificationMessage('');
            }, 3000);
            return;
        }

        // Update status of selected leads to 'Validated'
        const validatedLeads = selectedLeads.map(lead => ({
            ...lead,
            status: 'Validated',
            lastUpdated: new Date().toISOString(),
            confidence: Math.min(lead.confidence + 10, 100), // Boost confidence after validation
            selected: false // Reset selection
        }));

        // Get existing leads from All Leads storage
        const existingAllLeads = JSON.parse(localStorage.getItem('alphaLeads_allLeads') || '[]');
        
        // Check for duplicates and add only new leads
        const newLeads = validatedLeads.filter(validatedLead => 
            !existingAllLeads.some(existingLead => 
                existingLead.email === validatedLead.email && 
                existingLead.phone === validatedLead.phone
            )
        );

        // Update existing leads if they already exist
        const updatedAllLeads = existingAllLeads.map(existingLead => {
            const updatedLead = validatedLeads.find(validatedLead =>
                existingLead.email === validatedLead.email && 
                existingLead.phone === validatedLead.phone
            );
            return updatedLead ? updatedLead : existingLead;
        });

        // Add new leads
        const finalAllLeads = [...updatedAllLeads, ...newLeads];
        
        // Save to All Leads storage
        localStorage.setItem('alphaLeads_allLeads', JSON.stringify(finalAllLeads));
        
        // Remove validated leads from current collection (this moves them from generate leads list)
        const remainingLeads = leads.filter(lead => !lead.selected);
        setLeads(remainingLeads);
        
        // Show modern success notification
        setNotificationMessage(`Successfully validated and moved ${selectedLeads.length} lead${selectedLeads.length > 1 ? 's' : ''} to All Leads section!`);
        setDeletedCount(selectedLeads.length);
        setIsConfirmingDelete(false);
        setShowSuccessNotification(true);
        setTimeout(() => {
            setShowSuccessNotification(false);
            setNotificationMessage('');
            setDeletedCount(0);
        }, 3000);
    };

    const handleDeleteSelected = () => {
        const selectedLeads = leads.filter(lead => lead.selected);
        
        if (selectedLeads.length === 0) {
            setNotificationMessage('Please select at least one lead to delete.');
            setDeletedCount(0);
            setIsConfirmingDelete(false);
            setShowSuccessNotification(true);
            setTimeout(() => {
                setShowSuccessNotification(false);
                setNotificationMessage('');
            }, 3000);
            return;
        }

        // Show confirmation notification instead of deleting immediately
        setPendingDeleteLeads(selectedLeads);
        setDeletedCount(selectedLeads.length);
        setNotificationMessage(`Are you sure you want to delete ${selectedLeads.length} selected lead${selectedLeads.length > 1 ? 's' : ''}?`);
        setIsConfirmingDelete(true);
        setShowSuccessNotification(true);
    };

    const performDelete = (selectedLeads) => {
        // Remove selected leads from current collection
        const remainingLeads = leads.filter(lead => !lead.selected);
        
        // Update the state immediately
        setLeads(remainingLeads);
        
        // Show modern success notification
        setDeletedCount(selectedLeads.length);
        setNotificationMessage(`Successfully deleted ${selectedLeads.length} lead${selectedLeads.length > 1 ? 's' : ''} from the collection.`);
        setShowSuccessNotification(true);
        
        // Auto-hide notification after 3 seconds
        setTimeout(() => {
            setShowSuccessNotification(false);
            setNotificationMessage('');
            setDeletedCount(0);
        }, 3000);
    };



    const selectedCount = leads.filter(lead => lead.selected).length;

    // Pagination logic
    const totalPages = Math.ceil(leads.length / leadsPerPage);
    const startIndex = (currentPage - 1) * leadsPerPage;
    const endIndex = startIndex + leadsPerPage;
    const currentLeads = leads.slice(startIndex, endIndex);

    const goToPage = (page) => {
        setCurrentPage(page);
    };

    const goToPrevious = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    const goToNext = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };

    return (
        <div className="lead-collection">
            {/* Filter Section */}
            <div className="card filter-card">
                <div className="card-header">
                    <h3 className="card-title">Lead Collection Filters</h3>
                </div>
                <div className="card-body">
                    {/* Data Source Display */}
                    <div className="data-source-toggle">
                        <label className="toggle-label">
                            <span>Data Source:</span>
                            <span className="data-source-mode">Free Data (OpenStreetMap, Government Registries)</span>
                        </label>
                    </div>
                    
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
                            
                            {/* Loading Timeline */}
                            <div className="progress-timeline">
                                <div className={`timeline-stage ${getStageStatus('searching')}`}>
                                    <div className="timeline-dot">🔍</div>
                                    <div className="timeline-label">Searching</div>
                                </div>
                                <div className={`timeline-stage ${getStageStatus('validating')}`}>
                                    <div className="timeline-dot">✓</div>
                                    <div className="timeline-label">Validating</div>
                                </div>
                                <div className={`timeline-stage ${getStageStatus('processing')}`}>
                                    <div className="timeline-dot">⚙️</div>
                                    <div className="timeline-label">Processing</div>
                                </div>
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
                            <button 
                                className="btn btn-success btn-sm"
                                onClick={handleValidateSelected}
                                disabled={selectedCount === 0}
                            >
                                <span>✓</span>
                                Validate Selected
                            </button>
                            <button 
                                className="btn btn-danger btn-sm"
                                onClick={handleDeleteSelected}
                                disabled={selectedCount === 0}
                                title="Delete selected leads instantly"
                            >
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
                                {currentLeads.length === 0 ? (
                                    <tr>
                                        <td colSpan="10" style={{ textAlign: 'center', padding: '40px' }}>
                                            <div style={{ color: 'var(--color-gray-500)' }}>
                                                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                                                <h3 style={{ margin: '0 0 8px 0', color: 'var(--color-gray-700)' }}>No Leads Generated</h3>
                                                <p style={{ margin: 0 }}>Click "Collect & Validate Leads" to generate new leads</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    currentLeads.map((lead) => (
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
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="pagination-container">
                        <div className="pagination-info">
                            <span>Showing {startIndex + 1} to {Math.min(endIndex, leads.length)} of {leads.length} leads</span>
                        </div>
                        <div className="pagination">
                            <button 
                                className="pagination-btn"
                                onClick={goToPrevious}
                                disabled={currentPage === 1}
                            >
                                ← Previous
                            </button>
                            
                            {Array.from({ length: Math.min(totalPages, 5) }, (_, index) => {
                                let pageNumber;
                                if (totalPages <= 5) {
                                    pageNumber = index + 1;
                                } else if (currentPage <= 3) {
                                    pageNumber = index + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNumber = totalPages - 4 + index;
                                } else {
                                    pageNumber = currentPage - 2 + index;
                                }
                                
                                return (
                                    <button
                                        key={pageNumber}
                                        className={`pagination-btn ${currentPage === pageNumber ? 'active' : ''}`}
                                        onClick={() => goToPage(pageNumber)}
                                    >
                                        {pageNumber}
                                    </button>
                                );
                            })}
                            
                            <button 
                                className="pagination-btn"
                                onClick={goToNext}
                                disabled={currentPage === totalPages}
                            >
                                Next →
                            </button>
                        </div>
                    </div>
                )}
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

            {/* Modern Success/Confirmation Notification */}
            {showSuccessNotification && (
                <div className="notification-overlay">
                    <div className="notification-popup success">
                        <div className="notification-header">
                            <div className="notification-icon">
                                {isConfirmingDelete ? '❓' : (deletedCount > 0 ? '✅' : '⚠️')}
                            </div>
                            <h3 className="notification-title">
                                {isConfirmingDelete ? 'Confirm Delete' : (deletedCount > 0 ? 'Success' : 'Notice')}
                            </h3>
                        </div>
                        <div className="notification-body">
                            <p className="notification-message">{notificationMessage}</p>
                            {(deletedCount > 0 && !isConfirmingDelete) && (
                                <div className="notification-details">
                                    <span className="deleted-count">{deletedCount}</span>
                                    <span className="deleted-label">
                                        {notificationMessage.includes('generated') ? 'leads generated' : 
                                         notificationMessage.includes('validated') ? 'leads validated' : 'leads removed'}
                                    </span>
                                </div>
                            )}
                            {isConfirmingDelete && (
                                <div className="leads-to-delete">
                                    {pendingDeleteLeads.slice(0, 3).map((lead, index) => (
                                        <div key={lead.id} className="lead-item">
                                            <span className="business-name">{lead.businessName}</span>
                                            <span className="contact-name">{lead.contactName}</span>
                                        </div>
                                    ))}
                                    {pendingDeleteLeads.length > 3 && (
                                        <div className="more-leads">
                                            +{pendingDeleteLeads.length - 3} more lead{pendingDeleteLeads.length - 3 > 1 ? 's' : ''}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="notification-footer">
                            {isConfirmingDelete ? (
                                <>
                                    <button 
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => {
                                            setShowSuccessNotification(false);
                                            setNotificationMessage('');
                                            setDeletedCount(0);
                                            setPendingDeleteLeads([]);
                                            setIsConfirmingDelete(false);
                                        }}
                                        style={{ marginRight: '10px' }}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        className="btn btn-danger btn-sm"
                                        onClick={() => {
                                            // Actually perform the deletion
                                            performDelete(pendingDeleteLeads);
                                            setIsConfirmingDelete(false);
                                            setPendingDeleteLeads([]);
                                        }}
                                    >
                                        <span>🗑️</span>
                                        Delete {pendingDeleteLeads.length} Lead{pendingDeleteLeads.length > 1 ? 's' : ''}
                                    </button>
                                </>
                            ) : (
                                <button 
                                    className="btn btn-primary btn-sm"
                                    onClick={() => {
                                        setShowSuccessNotification(false);
                                        setNotificationMessage('');
                                        setDeletedCount(0);
                                    }}
                                >
                                    OK
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default LeadCollection;
