import { useState, useEffect } from 'react';
import './Dashboard.css';

function Dashboard() {
    const [stats, setStats] = useState({
        activeCalls: 12,
        completedCalls: 156,
        successRate: 68,
        totalLeads: 1247,
        validatedLeads: 1089,
        calledLeads: 892,
        convertedLeads: 156,
        todayAppointments: 8,
        upcomingAppointments: 23
    });

    const [recentActivities, setRecentActivities] = useState([
        { id: 1, type: 'success', message: 'AI called John Doe - Interested', time: '2 min ago' },
        { id: 2, type: 'info', message: 'New lead validated: ABC Realty', time: '5 min ago' },
        { id: 3, type: 'success', message: 'Appointment booked with Sarah Smith', time: '12 min ago' },
        { id: 4, type: 'warning', message: 'Call retry scheduled for Mike Johnson', time: '18 min ago' },
        { id: 5, type: 'info', message: '50 new leads collected from Real Estate sector', time: '25 min ago' }
    ]);

    const [callProgress, setCallProgress] = useState({
        current: 12,
        total: 50,
        percentage: 24
    });

    return (
        <div className="dashboard">
            {/* Quick Actions */}
            <div className="quick-actions">
                <button className="btn btn-primary btn-lg">
                    <span className="btn-icon">▶️</span>
                    Start AI Agent
                </button>
                <button className="btn btn-secondary btn-lg">
                    <span className="btn-icon">⏸️</span>
                    Pause Calling
                </button>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                {/* AI Call Progress */}
                <div className="card stat-card highlight-card">
                    <div className="card-header">
                        <h3 className="card-title">AI Call Progress (Today)</h3>
                        <span className="badge badge-primary">Live</span>
                    </div>
                    <div className="card-body">
                        <div className="stat-main">
                            <div className="stat-number">{stats.activeCalls}</div>
                            <div className="stat-label">Active Calls</div>
                        </div>
                        <div className="progress-bar-container">
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${callProgress.percentage}%` }}
                                ></div>
                            </div>
                            <div className="progress-text">
                                {callProgress.current} of {callProgress.total} calls completed
                            </div>
                        </div>
                        <div className="stat-row">
                            <div className="stat-item">
                                <div className="stat-value">{stats.completedCalls}</div>
                                <div className="stat-label-sm">Completed</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-value text-success">{stats.successRate}%</div>
                                <div className="stat-label-sm">Success Rate</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lead Summary */}
                <div className="card stat-card">
                    <div className="card-header">
                        <h3 className="card-title">Lead Summary</h3>
                    </div>
                    <div className="card-body">
                        <div className="stat-main">
                            <div className="stat-number">{stats.totalLeads}</div>
                            <div className="stat-label">Total Leads</div>
                        </div>
                        <div className="stat-breakdown">
                            <div className="breakdown-item">
                                <div className="breakdown-bar">
                                    <div
                                        className="breakdown-fill validated"
                                        style={{ width: `${(stats.validatedLeads / stats.totalLeads) * 100}%` }}
                                    ></div>
                                </div>
                                <div className="breakdown-label">
                                    <span className="breakdown-count">{stats.validatedLeads}</span>
                                    <span className="breakdown-text">Validated</span>
                                </div>
                            </div>
                            <div className="breakdown-item">
                                <div className="breakdown-bar">
                                    <div
                                        className="breakdown-fill called"
                                        style={{ width: `${(stats.calledLeads / stats.totalLeads) * 100}%` }}
                                    ></div>
                                </div>
                                <div className="breakdown-label">
                                    <span className="breakdown-count">{stats.calledLeads}</span>
                                    <span className="breakdown-text">Called</span>
                                </div>
                            </div>
                            <div className="breakdown-item">
                                <div className="breakdown-bar">
                                    <div
                                        className="breakdown-fill converted"
                                        style={{ width: `${(stats.convertedLeads / stats.totalLeads) * 100}%` }}
                                    ></div>
                                </div>
                                <div className="breakdown-label">
                                    <span className="breakdown-count">{stats.convertedLeads}</span>
                                    <span className="breakdown-text">Converted</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Appointment Summary */}
                <div className="card stat-card">
                    <div className="card-header">
                        <h3 className="card-title">Appointments</h3>
                    </div>
                    <div className="card-body">
                        <div className="appointment-stats">
                            <div className="appointment-item today">
                                <div className="appointment-icon">📅</div>
                                <div className="appointment-info">
                                    <div className="appointment-number">{stats.todayAppointments}</div>
                                    <div className="appointment-label">Today's Meetings</div>
                                </div>
                            </div>
                            <div className="appointment-divider"></div>
                            <div className="appointment-item upcoming">
                                <div className="appointment-icon">🗓️</div>
                                <div className="appointment-info">
                                    <div className="appointment-number">{stats.upcomingAppointments}</div>
                                    <div className="appointment-label">Upcoming</div>
                                </div>
                            </div>
                        </div>
                        <button className="btn btn-secondary btn-sm mt-md" style={{ width: '100%' }}>
                            View Calendar
                        </button>
                    </div>
                </div>

                {/* Geographic Heat Map Placeholder */}
                <div className="card stat-card map-card">
                    <div className="card-header">
                        <h3 className="card-title">Geographic Activity</h3>
                        <span className="badge badge-info">Global</span>
                    </div>
                    <div className="card-body">
                        <div className="map-placeholder">
                            <div className="map-icon">🗺️</div>
                            <p className="map-text">Interactive heat map showing call distribution</p>
                            <div className="map-stats">
                                <div className="map-stat-item">
                                    <span className="map-stat-label">Top Region:</span>
                                    <span className="map-stat-value">California, USA</span>
                                </div>
                                <div className="map-stat-item">
                                    <span className="map-stat-label">Active Regions:</span>
                                    <span className="map-stat-value">12 States</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activities */}
            <div className="card activities-card">
                <div className="card-header">
                    <h3 className="card-title">Recent AI Activities</h3>
                    <button className="btn btn-sm btn-secondary">View All</button>
                </div>
                <div className="card-body">
                    <div className="activities-list">
                        {recentActivities.map((activity) => (
                            <div key={activity.id} className="activity-item">
                                <div className={`activity-indicator ${activity.type}`}></div>
                                <div className="activity-content">
                                    <div className="activity-message">{activity.message}</div>
                                    <div className="activity-time">{activity.time}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Performance Metrics */}
            <div className="metrics-grid">
                <div className="card metric-card">
                    <div className="metric-icon success">📞</div>
                    <div className="metric-content">
                        <div className="metric-value">342</div>
                        <div className="metric-label">Total Calls Today</div>
                        <div className="metric-change positive">+12% from yesterday</div>
                    </div>
                </div>

                <div className="card metric-card">
                    <div className="metric-icon primary">⏱️</div>
                    <div className="metric-content">
                        <div className="metric-value">3.2 min</div>
                        <div className="metric-label">Avg Call Duration</div>
                        <div className="metric-change neutral">Same as yesterday</div>
                    </div>
                </div>

                <div className="card metric-card">
                    <div className="metric-icon warning">🔄</div>
                    <div className="metric-content">
                        <div className="metric-value">23</div>
                        <div className="metric-label">Callbacks Scheduled</div>
                        <div className="metric-change positive">+5 new</div>
                    </div>
                </div>

                <div className="card metric-card">
                    <div className="metric-icon info">💰</div>
                    <div className="metric-content">
                        <div className="metric-value">$12,450</div>
                        <div className="metric-label">Potential Revenue</div>
                        <div className="metric-change positive">+18% this week</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
