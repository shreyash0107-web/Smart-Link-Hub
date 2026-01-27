# 🔗 Smart Link Hub Generator

A sophisticated, intelligent link hub system with dynamic content routing, rule-based display, real-time analytics, and enterprise-grade architecture.

## 🌟 Features

### 1. **Link Hub Management**
- Create multiple link hubs with unique public URLs
- Customize hubs with title, description, and theme (light/dark/auto)
- Drag-and-drop link reordering
- Bulk link management (add, edit, delete)
- Support for unlimited links per hub

### 2. **Intelligent Rule Engine**
The system supports four types of conditional rules:

#### ⏰ Time-Based Rules
- **Working Hours**: Automatically show different links during 9 AM - 5 PM on weekdays
- **Specific Time Ranges**: Show links only during specific hours
- Perfect for: Business hours vs after-hours links, seasonal promotions

#### 📱 Device-Based Rules  
- **Mobile vs Desktop**: Display different links based on device type
- Automatically detects user agent and serves appropriate content
- Perfect for: Mobile-specific resources, desktop tools

#### 🌍 Location-Based Rules
- **Country/Region Targeting**: Show links based on user's geographic location
- Support for country and regional filtering
- Perfect for: Localized content, regional services

#### 📊 Performance-Based Rules
- **Top Performers**: Auto-promote the most clicked links
- Configurable threshold (minimum clicks required)
- Dynamic reordering based on real-time click data
- Perfect for: Always showing what users actually click on

### 3. **Analytics & Monitoring**
- **Hub Analytics**: Total visits, click tracking over time
- **Link Performance**: Individual click counts with click-through rate (CTR)
- **Top Performers Dashboard**: Visual charts showing most clicked links
- **Exportable Reports**: Export analytics as JSON for external analysis
- **Real-time Tracking**: Instant click and visit recording
- **Daily Aggregates**: Track performance trends day by day

### 4. **Backend & API Design**

#### Database Layer
- SQLite-based storage with pure JavaScript implementation
- Tables for: LinkHubs, Links, Analytics, LinkAnalytics
- Persistent data storage with automatic save
- Support for future database migrations

#### API Endpoints
```
HUB MANAGEMENT
POST   /api/hubs              - Create new hub
GET    /api/hubs/:hubId       - Get hub details
PUT    /api/hubs/:hubId       - Update hub
DELETE /api/hubs/:hubId       - Delete hub

LINK MANAGEMENT
POST   /api/hubs/:hubId/links           - Add link
PUT    /api/hubs/:hubId/links/:linkId   - Update link
DELETE /api/hubs/:hubId/links/:linkId   - Delete link
POST   /api/hubs/:hubId/links/reorder   - Reorder links

RULE MANAGEMENT
POST   /api/hubs/:hubId/rules     - Save rules
GET    /api/hubs/:hubId/rules     - Get rules

ANALYTICS
GET    /api/hubs/:hubId/analytics - Get analytics

PUBLIC ENDPOINTS
GET    /hubs/:hubId              - Get public hub (applies rules)
POST   /hubs/:hubId/click/:linkId - Track link click
```

### 5. **Security & Rate Limiting**
- **Rate Limiting**: 
  - API: 30 requests per 15 minutes
  - Clicks: 50 per minute per IP
  - General: 100 requests per 15 minutes
- **Input Validation**: All user inputs validated for type, length, and format
- **URL Validation**: Only valid URLs accepted
- **CORS Enabled**: Secure cross-origin requests
- **Error Handling**: Comprehensive error messages and proper HTTP status codes

### 6. **Admin Dashboard**
Professional, feature-rich admin interface with:
- **Tab-based Navigation**: Easy access to all features
- **Dark Mode Support**: Auto-detect system preference or manual toggle
- **Hub Card View**: Visual overview of all hubs
- **Link Management**: Inline editing and reordering
- **Rule Builder**: Visual rule configuration with type-specific options
- **Analytics Dashboard**: Real-time stats and charts
- **Export Functionality**: Download hub analytics as JSON
- **Responsive Design**: Mobile-friendly interface

### 7. **Public Link Display**
- **Dynamic Rendering**: Rules applied in real-time based on user context
- **Responsive Design**: Works perfectly on mobile and desktop
- **Interactive Links**: Visual feedback on hover
- **Click Tracking**: Automatic tracking with no page reload
- **Performance**: Optimized for fast loading

## 🚀 Getting Started

### Prerequisites
- Node.js 14+ 
- npm or yarn
- Modern web browser

### Installation

1. **Install dependencies**:
   ```bash
   cd "c:\JPD hacakathon"
   npm install
   ```

2. **Start the server**:
   ```bash
   npm run dev
   ```

3. **Access the application**:
   - **Homepage**: http://localhost:3000
   - **Admin Dashboard**: http://localhost:3000/admin.html
   - **API Base**: http://localhost:3000/api

## 📖 Usage Examples

### Creating a Hub

```javascript
POST /api/hubs
{
  "title": "My Smart Links",
  "description": "All my important resources",
  "theme": "light"
}
```

### Adding Links

```javascript
POST /api/hubs/{hubId}/links
{
  "name": "GitHub Profile",
  "url": "https://github.com/username"
}
```

### Setting Up Rules

```javascript
POST /api/hubs/{hubId}/rules
{
  "rules": [
    {
      "type": "time-based",
      "config": {
        "type": "working-hours",
        "workingHoursLinks": ["link-id-1", "link-id-2"]
      }
    },
    {
      "type": "device-based",
      "config": {
        "type": "device-specific",
        "mobileLinks": ["link-id-3"],
        "desktopLinks": ["link-id-1", "link-id-2"]
      }
    },
    {
      "type": "performance-based",
      "config": {
        "type": "top-performers",
        "topN": 3,
        "minClicks": 5
      }
    }
  ]
}
```

### Getting Analytics

```javascript
GET /api/hubs/{hubId}/analytics
```

Response:
```json
{
  "success": true,
  "data": {
    "totalVisits": 150,
    "totalClicks": 87,
    "topLinks": [
      {"name": "GitHub", "clicks": 45},
      {"name": "Portfolio", "clicks": 28},
      {"name": "Blog", "clicks": 14}
    ],
    "linkDetails": [...]
  }
}
```

## 🏗️ Architecture

### Project Structure
```
JPD hacakathon/
├── Backend/
│   ├── server.js           # Main Express server + API endpoints
│   ├── database.js         # SQLite database layer
│   ├── ruleEngine.js       # Rule evaluation engine
│   ├── data.json          # Legacy data (not used in new system)
│   └── linkhub.db         # SQLite database file
├── Frontend/
│   ├── index.html         # Public landing page
│   ├── admin.html         # Admin dashboard
│   ├── style.css          # Public site styles
│   ├── admin-style.css    # Admin dashboard styles
│   ├── script.js          # Public site functionality
│   ├── admin-script.js    # Admin dashboard functionality
│   └── public-script.js   # Public hub display script
├── package.json           # Dependencies
└── README.md             # This file
```

### Technology Stack
- **Backend**: Node.js + Express.js
- **Database**: SQLite3 (sql.js)
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Security**: express-rate-limit, input validation
- **UUID Generation**: uuid library
- **CORS**: express-cors

### Data Models

#### LinkHub
```javascript
{
  id: string (UUID),
  title: string,
  description: string,
  theme: 'light' | 'dark' | 'auto',
  rules_config: JSON string,
  total_visits: number,
  created_at: ISO string,
  updated_at: ISO string
}
```

#### Link
```javascript
{
  id: string (UUID),
  hub_id: string,
  name: string,
  url: string,
  clicks: number,
  position: number,
  is_active: boolean,
  created_at: ISO string
}
```

#### Analytics
```javascript
{
  id: string (UUID),
  hub_id: string,
  date: string (YYYY-MM-DD),
  visits: number,
  timestamp: number
}
```

## 🔧 Advanced Features

### Rule Engine Evaluation
The rule engine processes rules in order:
1. Filter links based on rule conditions
2. Apply device detection from User-Agent
3. Check geographic location (if available)
4. Reorder based on performance metrics
5. Return final filtered/prioritized list

### Performance Optimization
- Efficient database queries with proper indexing
- Client-side caching of hub data
- Minimal JSON payloads
- CDN-ready static asset serving

### Scalability Considerations
The architecture supports:
- **Horizontal Scaling**: Stateless API design
- **Database Migration**: Easy upgrade to PostgreSQL/MySQL
- **Caching Layer**: Ready for Redis integration
- **CDN Integration**: Static assets can be served from CDN
- **Load Balancing**: No session affinity required

## 📊 Monitoring & Debugging

### Server Logs
```bash
✓ Database initialized
✓ Smart Link Hub running on http://localhost:3000
✓ Admin API: http://localhost:3000/api
```

### Analytics Export
Export hub analytics as JSON for:
- Data analysis
- Business intelligence
- Integration with third-party tools
- Backup and archival

## 🛡️ Security Best Practices

1. **Input Validation**: All inputs validated on server-side
2. **Rate Limiting**: Prevent abuse and DDoS attacks
3. **URL Validation**: Only valid URLs accepted
4. **CORS Configuration**: Restrict cross-origin access
5. **No Authentication**: Public by design (add auth layer as needed)
6. **Error Handling**: Generic error messages to users

## 🔮 Future Enhancements

### Planned Features
- [ ] QR code generation for hubs
- [ ] User authentication and multi-user support
- [ ] URL shortening service integration
- [ ] Advanced analytics with charts library
- [ ] A/B testing for links
- [ ] Custom domain support
- [ ] Link previews and meta tags
- [ ] Social media integration
- [ ] Password protection for hubs
- [ ] Custom CSS/branding
- [ ] Email notifications
- [ ] API key authentication
- [ ] Webhooks for click events
- [ ] Mobile app (React Native)

### Possible Integrations
- Bitly for URL shortening
- Google Analytics for detailed tracking
- Stripe for monetization
- SendGrid for email notifications
- Twilio for SMS notifications
- AWS S3 for file hosting

## 🧪 Testing

### Manual Testing Checklist
- [ ] Create hub with all fields
- [ ] Add multiple links
- [ ] Test all rule types
- [ ] Verify analytics tracking
- [ ] Check responsive design
- [ ] Test dark mode toggle
- [ ] Verify link clicks are counted
- [ ] Export analytics
- [ ] Delete hubs and links
- [ ] Test on mobile device

### Example Test Cases
```javascript
// Test 1: Hub Creation
POST /api/hubs
Expected: 201 Created with hub ID

// Test 2: Add Link
POST /api/hubs/{hubId}/links
Expected: 201 Created with link details

// Test 3: Track Click
POST /hubs/{hubId}/click/{linkId}
Expected: 200 OK

// Test 4: Get Analytics
GET /api/hubs/{hubId}/analytics
Expected: 200 OK with analytics data

// Test 5: Rate Limiting
Send 31 API requests in 15 minutes
Expected: 429 Too Many Requests
```

## 📞 Support & Documentation

- **Issue Reporting**: Check existing issues before creating new ones
- **Feature Requests**: Suggest improvements via issue tracker
- **Documentation**: Inline code comments explain complex logic
- **API Documentation**: See endpoint descriptions above

## 📄 License

This project is part of JPD Hackathon. Feel free to use, modify, and distribute.

## 🎯 Project Goals Achieved

✅ Generate single public URL for link hubs
✅ Dynamic link prioritization based on configurable rules
✅ Comprehensive analytics with visualization
✅ Scalable backend with proper API design
✅ Input validation and error handling
✅ Rate limiting and abuse prevention
✅ Clean, modular architecture
✅ Professional admin dashboard
✅ Mobile-responsive design
✅ Real-time click tracking

---

**Status**: ✨ Production Ready  
**Version**: 1.0.0  
**Last Updated**: January 27, 2026
