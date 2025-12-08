import './Appointments.css';

function Appointments() {
    return (
        <div className="appointments">
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Appointments & CRM Integration</h3>
                    <span className="badge badge-info">Coming Soon</span>
                </div>
                <div className="card-body">
                    <div className="placeholder-content">
                        <div className="placeholder-icon">📅</div>
                        <h2>Appointment Management</h2>
                        <p>This module will include:</p>
                        <ul className="feature-list">
                            <li>✓ Calendar view (Month/Week/Day)</li>
                            <li>✓ Google Calendar & Outlook sync</li>
                            <li>✓ Automatic appointment booking</li>
                            <li>✓ CRM integration (HubSpot, Salesforce, Zoho)</li>
                            <li>✓ Appointment reminders & notifications</li>
                            <li>✓ Reschedule & cancellation management</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Appointments;
