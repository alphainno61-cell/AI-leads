import { useState } from 'react';
import './CallAutomation.css';

function CallAutomation() {
    const [isCallActive, setIsCallActive] = useState(false);
    const [selectedVoice, setSelectedVoice] = useState('professional-female');
    const [maxCallsPerHour, setMaxCallsPerHour] = useState(50);

    const [liveCall, setLiveCall] = useState({
        contactName: 'John Anderson',
        businessName: 'Sunset Realty Group',
        phone: '+1 (555) 123-4567',
        duration: '00:02:34',
        status: 'In Progress'
    });

    const [transcript, setTranscript] = useState([
        { id: 1, speaker: 'ai', text: 'Hello, is this John Anderson from Sunset Realty Group?', time: '00:00:05' },
        { id: 2, speaker: 'customer', text: 'Yes, this is John speaking. Who is this?', time: '00:00:12' },
        { id: 3, speaker: 'ai', text: 'Hi John! This is Alex calling on behalf of Prime Lead Solutions. I wanted to reach out regarding our AI-powered lead generation service specifically designed for real estate professionals. Do you have a quick moment to chat?', time: '00:00:18' },
        { id: 4, speaker: 'customer', text: 'Sure, I have a few minutes. What is this about?', time: '00:00:35' },
        { id: 5, speaker: 'ai', text: 'Great! We help real estate agencies like yours automate lead generation and qualification, saving you hours of manual work. Our AI can identify and reach out to potential clients 24/7. Would you be interested in learning more about how this could benefit your business?', time: '00:00:42' }
    ]);

    const [callQueue, setCallQueue] = useState([
        { id: 1, name: 'Sarah Mitchell', business: 'Prime Properties LLC', phone: '+1 (555) 234-5678', status: 'Queued' },
        { id: 2, name: 'Michael Chen', business: 'Metro Real Estate', phone: '+1 (555) 345-6789', status: 'Queued' },
        { id: 3, name: 'Emily Rodriguez', business: 'Coastal Homes', phone: '+1 (555) 456-7890', status: 'Queued' }
    ]);

    const [callStats, setCallStats] = useState({
        totalCalls: 156,
        successful: 106,
        busy: 28,
        noAnswer: 22,
        avgDuration: '3:24'
    });

    const voices = [
        { value: 'professional-female', label: 'Professional Female (Sarah)' },
        { value: 'professional-male', label: 'Professional Male (David)' },
        { value: 'friendly-female', label: 'Friendly Female (Emma)' },
        { value: 'friendly-male', label: 'Friendly Male (James)' },
        { value: 'casual-female', label: 'Casual Female (Lisa)' },
        { value: 'casual-male', label: 'Casual Male (Mike)' }
    ];

    const handleStartCalling = () => {
        setIsCallActive(true);
    };

    const handleStopCalling = () => {
        setIsCallActive(false);
    };

    const handleTakeOver = () => {
        alert('Manual takeover initiated. You can now speak directly with the customer.');
    };

    return (
        <div className="call-automation">
            {/* Control Panel */}
            <div className="card control-panel">
                <div className="card-header">
                    <h3 className="card-title">AI Call Control Center</h3>
                    <div className="status-indicator">
                        <span className={`status-dot ${isCallActive ? 'active' : 'inactive'}`}></span>
                        <span className="status-text">
                            {isCallActive ? 'AI Agent Active' : 'AI Agent Idle'}
                        </span>
                    </div>
                </div>
                <div className="card-body">
                    <div className="control-grid">
                        {/* Voice Selection */}
                        <div className="input-group">
                            <label className="input-label">AI Voice Selection</label>
                            <select
                                className="select"
                                value={selectedVoice}
                                onChange={(e) => setSelectedVoice(e.target.value)}
                            >
                                {voices.map(voice => (
                                    <option key={voice.value} value={voice.value}>
                                        {voice.label}
                                    </option>
                                ))}
                            </select>
                            <button className="btn btn-sm btn-secondary mt-sm">
                                🔊 Preview Voice
                            </button>
                        </div>

                        {/* Call Settings */}
                        <div className="input-group">
                            <label className="input-label">Max Calls Per Hour</label>
                            <input
                                type="number"
                                className="input"
                                value={maxCallsPerHour}
                                onChange={(e) => setMaxCallsPerHour(e.target.value)}
                                min="1"
                                max="100"
                            />
                        </div>

                        {/* Timezone */}
                        <div className="input-group">
                            <label className="input-label">Timezone</label>
                            <select className="select">
                                <option value="pst">Pacific Time (PST)</option>
                                <option value="mst">Mountain Time (MST)</option>
                                <option value="cst">Central Time (CST)</option>
                                <option value="est">Eastern Time (EST)</option>
                            </select>
                        </div>

                        {/* Calling Hours */}
                        <div className="input-group">
                            <label className="input-label">Calling Hours</label>
                            <div className="time-range">
                                <input type="time" className="input" defaultValue="09:00" />
                                <span>to</span>
                                <input type="time" className="input" defaultValue="17:00" />
                            </div>
                        </div>
                    </div>

                    <div className="control-actions">
                        {!isCallActive ? (
                            <button className="btn btn-success btn-lg" onClick={handleStartCalling}>
                                <span>▶️</span>
                                Start AI Calling
                            </button>
                        ) : (
                            <button className="btn btn-danger btn-lg" onClick={handleStopCalling}>
                                <span>⏸️</span>
                                Stop AI Calling
                            </button>
                        )}
                        <button className="btn btn-secondary">
                            <span>✏️</span>
                            Edit Call Script
                        </button>
                        <button className="btn btn-secondary">
                            <span>⚙️</span>
                            Advanced Settings
                        </button>
                    </div>
                </div>
            </div>

            <div className="call-monitoring-grid">
                {/* Live Call Monitor */}
                <div className="card live-call-card">
                    <div className="card-header">
                        <h3 className="card-title">Live Call Monitor</h3>
                        {isCallActive && <span className="badge badge-success animate-pulse">Live</span>}
                    </div>
                    <div className="card-body">
                        {isCallActive ? (
                            <>
                                <div className="call-info">
                                    <div className="call-avatar">📞</div>
                                    <div className="call-details">
                                        <div className="call-name">{liveCall.contactName}</div>
                                        <div className="call-business">{liveCall.businessName}</div>
                                        <div className="call-phone">{liveCall.phone}</div>
                                    </div>
                                    <div className="call-duration">
                                        <div className="duration-label">Duration</div>
                                        <div className="duration-time">{liveCall.duration}</div>
                                    </div>
                                </div>

                                <div className="transcript-container">
                                    <div className="transcript-header">
                                        <h4>Live Transcript</h4>
                                        <button className="btn btn-sm btn-primary" onClick={handleTakeOver}>
                                            🎤 Take Over Call
                                        </button>
                                    </div>
                                    <div className="transcript-messages">
                                        {transcript.map((message) => (
                                            <div key={message.id} className={`transcript-message ${message.speaker}`}>
                                                <div className="message-header">
                                                    <span className="message-speaker">
                                                        {message.speaker === 'ai' ? '🤖 AI Agent' : '👤 Customer'}
                                                    </span>
                                                    <span className="message-time">{message.time}</span>
                                                </div>
                                                <div className="message-text">{message.text}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="call-actions">
                                    <button className="btn btn-sm btn-success">✓ Mark as Interested</button>
                                    <button className="btn btn-sm btn-warning">🔄 Schedule Callback</button>
                                    <button className="btn btn-sm btn-danger">✕ End Call</button>
                                </div>
                            </>
                        ) : (
                            <div className="no-active-call">
                                <div className="no-call-icon">📞</div>
                                <p>No active calls</p>
                                <p className="text-muted">Start the AI agent to begin calling</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Call Queue */}
                <div className="card queue-card">
                    <div className="card-header">
                        <h3 className="card-title">Call Queue</h3>
                        <span className="badge badge-primary">{callQueue.length} in queue</span>
                    </div>
                    <div className="card-body">
                        <div className="queue-list">
                            {callQueue.map((item, index) => (
                                <div key={item.id} className="queue-item">
                                    <div className="queue-number">{index + 1}</div>
                                    <div className="queue-info">
                                        <div className="queue-name">{item.name}</div>
                                        <div className="queue-business">{item.business}</div>
                                        <div className="queue-phone">{item.phone}</div>
                                    </div>
                                    <span className="badge badge-neutral">{item.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Call Statistics */}
            <div className="call-stats-grid">
                <div className="card stat-card">
                    <div className="stat-icon-lg">📊</div>
                    <div className="stat-content">
                        <div className="stat-value-lg">{callStats.totalCalls}</div>
                        <div className="stat-label">Total Calls</div>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon-lg success">✅</div>
                    <div className="stat-content">
                        <div className="stat-value-lg">{callStats.successful}</div>
                        <div className="stat-label">Successful</div>
                        <div className="stat-percentage">
                            {Math.round((callStats.successful / callStats.totalCalls) * 100)}%
                        </div>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon-lg warning">📵</div>
                    <div className="stat-content">
                        <div className="stat-value-lg">{callStats.busy}</div>
                        <div className="stat-label">Busy</div>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon-lg error">📞</div>
                    <div className="stat-content">
                        <div className="stat-value-lg">{callStats.noAnswer}</div>
                        <div className="stat-label">No Answer</div>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon-lg info">⏱️</div>
                    <div className="stat-content">
                        <div className="stat-value-lg">{callStats.avgDuration}</div>
                        <div className="stat-label">Avg Duration</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CallAutomation;
