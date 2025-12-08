# Alpha Leads - Real Estate Cold Calling Platform

A comprehensive SaaS platform for automated lead generation and AI-powered cold calling specifically designed for real estate and other industries.

![Platform Version](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-18.x-61dafb)
![Vite](https://img.shields.io/badge/Vite-7.x-646cff)
![License](https://img.shields.io/badge/license-MIT-green)

## 🚀 Features

### ✅ Implemented Modules

#### 1. **Dashboard**
- Real-time AI call progress tracking with live indicators
- Comprehensive lead summary with visual breakdowns
- Appointment overview (today's meetings & upcoming)
- Geographic activity heat map (placeholder)
- Recent AI activities feed with real-time updates
- Performance metrics cards with trend indicators

#### 2. **Lead Collection**
- Industry and location-based filtering
- Multi-level location selection (Country → State → City)
- Automated lead scraping with progress tracking
- Lead preview table with batch operations
- Confidence score indicators for each lead
- CSV upload functionality
- Lead validation status tracking

#### 3. **Call Automation**
- AI voice selection with multiple voice options
- Call settings configuration (max calls/hour, timezone, calling hours)
- Live call monitoring with real-time status
- Interactive transcript display (AI vs Customer)
- Call queue management
- Manual takeover capability
- Comprehensive call statistics

### 🔜 Upcoming Modules

#### 4. **Appointments & CRM Integration**
- Calendar view (Month/Week/Day)
- Google Calendar & Outlook synchronization
- Automatic appointment booking
- CRM integration (HubSpot, Salesforce, Zoho)
- Appointment reminders & notifications

#### 5. **Analytics & Reporting**
- Call outcome charts & visualizations
- Conversion funnel analysis
- Voice sentiment analysis
- Geographic performance insights
- Team performance metrics
- Export functionality (PDF/Excel)

#### 6. **Settings & Profile**
- User profile management
- AI voice customization
- Business profile configuration
- Billing & subscription management
- User roles & permissions
- Integration management

## 🎨 Design System

### Color Palette
- **Primary Blue**: `#2563EB` - Main brand color, buttons, links
- **Secondary Green**: `#22C55E` - Success states, conversions
- **Warning Orange**: `#F59E0B` - Alerts, retries
- **Error Red**: `#EF4444` - Failed calls, errors
- **Info Cyan**: `#06B6D4` - Information messages

### Typography
- **Font Family**: Inter (Google Fonts)
- **Headings**: Bold (700) / Semi-Bold (600)
- **Body Text**: Regular (400)
- **Line Height**: 1.5 for readability

### UI Principles
- Clean, minimal, and professional aesthetic
- Card-based layout for content organization
- Smooth animations and transitions
- Responsive design for all screen sizes
- Accessible color contrast ratios (WCAG AA compliant)

## 🛠️ Technology Stack

- **Frontend Framework**: React 18.x
- **Build Tool**: Vite 7.x
- **Routing**: React Router DOM
- **Styling**: Vanilla CSS with custom design system
- **Icons**: Unicode emojis (can be replaced with icon library)

## 📦 Installation

### Prerequisites
- Node.js 16.x or higher
- npm or yarn package manager

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-lead-tools
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

5. **Preview production build**
   ```bash
   npm run preview
   ```

## 🏗️ Project Structure

```
ai-lead-tools/
├── src/
│   ├── components/
│   │   └── Layout/
│   │       ├── Layout.jsx          # Main layout with sidebar & topbar
│   │       └── Layout.css
│   ├── pages/
│   │   ├── Dashboard/
│   │   │   ├── Dashboard.jsx       # Dashboard with stats & metrics
│   │   │   └── Dashboard.css
│   │   ├── LeadCollection/
│   │   │   ├── LeadCollection.jsx  # Lead filtering & management
│   │   │   └── LeadCollection.css
│   │   ├── CallAutomation/
│   │   │   ├── CallAutomation.jsx  # AI calling control center
│   │   │   └── CallAutomation.css
│   │   ├── Appointments/
│   │   │   ├── Appointments.jsx    # (Placeholder)
│   │   │   └── Appointments.css
│   │   ├── Analytics/
│   │   │   ├── Analytics.jsx       # (Placeholder)
│   │   │   └── Analytics.css
│   │   └── Settings/
│   │       ├── Settings.jsx        # (Placeholder)
│   │       └── Settings.css
│   ├── App.jsx                     # Main app component with routing
│   ├── main.jsx                    # React entry point
│   └── index.css                   # Global styles & design system
├── index.html                      # HTML entry point
├── vite.config.js                  # Vite configuration
├── package.json                    # Dependencies & scripts
└── README.md                       # This file
```

## 🎯 Key User Types

### 1. Admin (Business Owner / Team Leader)
- Manage subscription and team
- Monitor overall pipeline
- Configure AI settings
- View comprehensive analytics

### 2. Agent / Sales Rep
- View assigned leads
- Monitor AI calls
- Handle escalations
- Book appointments

## 🔑 Core Workflows

### Lead Generation Workflow
1. Admin selects industry + filter criteria
2. AI Agent auto-scrapes leads (Company name, phone, contact person)
3. Lead validation & qualification
4. Leads added to calling queue

### AI Calling Workflow
1. Configure AI voice and call settings
2. Start AI calling agent
3. Monitor live calls with real-time transcripts
4. AI qualifies leads and books appointments
5. CRM automatically updated
6. Dashboard shows real-time progress

### Appointment Management Workflow
1. Interested leads automatically scheduled
2. Calendar sync with Google/Outlook
3. Reminders sent to both parties
4. CRM integration for follow-up tracking

## 🌐 Internationalization Support

- Multi-language UI (English default)
- Multiple timezone support
- International phone number formatting
- Regulatory compliance (TCPA for USA)

## 📊 Performance Features

- Lazy loading for optimal performance
- Responsive design for mobile/tablet/desktop
- Smooth animations with CSS transitions
- Optimized bundle size with Vite

## 🔐 Security Considerations

- User authentication (to be implemented)
- Role-based access control
- Secure API communication
- Data encryption for sensitive information
- GDPR & TCPA compliance

## 🚧 Development Roadmap

### Phase 1: Foundation ✅
- [x] Project setup with Vite + React
- [x] Design system implementation
- [x] Layout with navigation
- [x] Dashboard module
- [x] Lead Collection module
- [x] Call Automation module

### Phase 2: Core Features (In Progress)
- [ ] Appointments & Calendar integration
- [ ] Analytics & Reporting
- [ ] Settings & Configuration
- [ ] User authentication
- [ ] Backend API development

### Phase 3: AI Integration
- [ ] Voice AI service integration
- [ ] Real-time call transcription
- [ ] Sentiment analysis
- [ ] Natural language processing

### Phase 4: Integrations
- [ ] Google Places API for lead scraping
- [ ] CRM integrations (HubSpot, Salesforce, Zoho)
- [ ] Calendar sync (Google Calendar, Outlook)
- [ ] Payment gateway integration

### Phase 5: Production Ready
- [ ] Comprehensive testing
- [ ] Performance optimization
- [ ] Security audit
- [ ] Deployment setup
- [ ] Documentation completion

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📧 Contact

For questions or support, please contact:
- Email: support@alphaleads.com
- Website: https://alphaleads.com

## 🙏 Acknowledgments

- Design inspiration from modern SaaS platforms
- Inter font by Google Fonts
- React community for excellent documentation
- Vite for blazing fast development experience

---

**Built with ❤️ for real estate professionals worldwide**
