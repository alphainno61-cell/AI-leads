import './Settings.css';

function Settings() {
    return (
        <div className="settings">
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Settings & Configuration</h3>
                    <span className="badge badge-info">Coming Soon</span>
                </div>
                <div className="card-body">
                    <div className="placeholder-content">
                        <div className="placeholder-icon">⚙️</div>
                        <h2>Platform Settings</h2>
                        <p>This module will include:</p>
                        <ul className="feature-list">
                            <li>✓ User profile management</li>
                            <li>✓ AI voice configuration & customization</li>
                            <li>✓ Business profile settings</li>
                            <li>✓ Billing & subscription management</li>
                            <li>✓ User roles & permissions</li>
                            <li>✓ Notification preferences</li>
                            <li>✓ Integration management (CRM, Calendar)</li>
                            <li>✓ API keys & webhooks</li>
                            <li>✓ Compliance & regulatory settings</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Settings;
