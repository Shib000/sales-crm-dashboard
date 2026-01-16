# Sales & CRM Analytics System

A comprehensive, location-aware Sales and CRM Analytics system for real-estate companies built with React and Vite.

## 🎯 Features

### 1. User & Role Management
- **Three Role Types**: Admin, Sales Manager, and Sales Executive
- **Authentication System**: Secure login with role-based access control
- **User Profiles**: Employee profiles with assigned sites and working areas
- **Role-Based Permissions**: Different access levels for each role

### 2. Location Tracking & Geo-Fencing
- **Real-time Location Tracking**: Uses browser Geolocation API
- **Geo-Fence Validation**: Validates employee presence within predefined circular geo-fences
- **Automatic Logging**: Entry and exit times are logged automatically
- **Site Configuration**: Admin can define site latitude, longitude, and allowed radius

### 3. Lead Management (CRM Core)
- **Complete Lead Information**: Client name, phone, email, lead source, assigned executive, interested site, and status
- **Lead Sources**: Walk-in, Campaign, Referral
- **Lead Statuses**: New, Visit Done, Follow-up, Booked, Lost
- **Workflows**: 
  - Sales executives create leads during on-site visits
  - Managers can reassign leads
  - All status updates are timestamped
  - Automatic booking creation when lead status changes to "Booked"

### 4. Site & Visit Tracking
- **Site Statistics**: Total leads, visits, meetings, bookings, and revenue per site
- **Visit Details**: Client details, assigned executive, date/time, and location verification status
- **Check-in/Check-out**: Employees can check in and out with location verification

### 5. Employee Performance Analytics
- **Key Performance Indicators**:
  - Leads generated
  - Visits handled
  - Conversion rate
  - Bookings closed
  - Average time spent on site
- **Dashboards**: 
  - Employee-wise analysis
  - Site-wise analysis
  - Time-based views (daily, weekly, monthly, all-time)

### 6. Business Intelligence
- **Advanced Insights**:
  - Best-performing sites
  - Best-performing executives
  - Lead status distribution
  - Lead source analysis
  - Daily trends
  - Conversion rate analysis
- **Visual Analytics**: Interactive charts and graphs using Recharts

## 🛠️ Technology Stack

- **React 18**: Modern React with hooks
- **Vite**: Fast build tool and dev server
- **React Router DOM**: Client-side routing
- **Recharts**: Beautiful and responsive charts
- **LocalStorage**: Data persistence (can be easily replaced with a backend API)
- **Date-fns**: Date manipulation utilities

## 📦 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev
```

The application will open at `http://localhost:3000`

### Build

```bash
# Build for production
npm run build
```

### Preview Production Build

```bash
# Preview production build
npm run preview
```

## 🔐 Default Login Credentials

### Admin
- **Email**: admin@example.com
- **Password**: admin123
- **Access**: Full system access, can manage sites, employees, and all data

### Sales Manager
- **Email**: manager@example.com
- **Password**: manager123
- **Access**: Can view and reassign leads, view analytics, manage sites and employees

### Sales Executive
- **Email**: executive@example.com
- **Password**: executive123
- **Access**: Can create leads, check in/out for visits, view own performance

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.jsx      # Main layout with sidebar navigation
│   └── Layout.css
├── pages/              # Page components
│   ├── Login.jsx       # Authentication page
│   ├── Dashboard.jsx   # Main dashboard with overview
│   ├── Leads.jsx       # Lead management
│   ├── Sites.jsx       # Site management
│   ├── Visits.jsx      # Visit tracking
│   ├── Analytics.jsx   # Analytics and BI dashboard
│   ├── Employees.jsx   # Employee management
│   └── Profile.jsx      # User profile
├── context/            # React Context for state management
│   └── AuthContext.jsx # Authentication context
├── utils/              # Utility functions
│   └── geoFence.js     # Geo-fencing calculations
├── services/           # Data services
│   ├── authService.js  # Authentication service
│   └── dataService.js  # Data persistence service (localStorage)
├── App.jsx             # Main app component with routing
├── main.jsx            # Application entry point
└── index.css           # Global styles
```

## 🎨 Key Features Implementation

### Location Tracking
- Uses browser Geolocation API to get current location
- Validates employee presence within geo-fenced areas using Haversine formula
- Logs entry and exit times automatically
- Shows location verification status for each visit

### Data Persistence
- All data is stored in browser localStorage
- Includes sample data for demonstration
- Can be easily replaced with a backend API by updating the dataService

### Role-Based Access Control
- **Admin**: Full access to all features
- **Sales Manager**: Can view and manage leads, sites, employees, and analytics
- **Sales Executive**: Can create leads, check in/out for visits, view own performance

### Geo-Fencing Algorithm
- Uses Haversine formula to calculate distance between coordinates
- Validates if employee is within the allowed radius of the site
- Prevents check-in if employee is outside the geo-fence

## 📊 Data Models

### User
- id, name, email, password, role, assignedSiteId

### Site
- id, name, latitude, longitude, radius, createdAt

### Lead
- id, clientName, phone, email, leadSource, assignedExecutiveId, siteId, status, createdAt, updatedAt

### Visit
- id, leadId, executiveId, siteId, checkinTime, checkoutTime, locationVerified, latitude, longitude

### Booking
- id, leadId, siteId, executiveId, amount, bookingDate, createdAt

## 🚀 Usage Guide

### For Sales Executives
1. **Login** with executive credentials
2. **Check In** when arriving at a site (location will be verified)
3. **Create Leads** for clients you meet
4. **Update Lead Status** as you progress through the sales process
5. **Check Out** when leaving the site
6. **View Performance** in your profile and analytics dashboard

### For Sales Managers
1. **Login** with manager credentials
2. **View All Leads** and reassign them as needed
3. **Monitor Site Performance** in the sites page
4. **Track Employee Performance** in the employees page
5. **Analyze Trends** in the analytics dashboard

### For Admins
1. **Login** with admin credentials
2. **Manage Sites** - Create and configure sites with geo-fences
3. **Manage Employees** - Create and assign employees to sites
4. **View All Data** - Full access to all features
5. **Monitor System** - Complete analytics and insights

## 🔄 Workflow

1. **Admin creates sites** with location and radius
2. **Admin assigns employees** to sites
3. **Sales executive arrives at site** and checks in (location verified)
4. **Executive creates leads** for clients
5. **Executive updates lead status** as they progress
6. **When lead is booked**, booking is automatically created
7. **Executive checks out** when leaving
8. **Managers and admins** monitor performance through analytics

## 🎯 Future Enhancements

- Backend API integration
- Real-time notifications
- Mobile app (React Native)
- Advanced reporting and exports
- Email/SMS notifications
- Calendar integration
- Document management
- AI-based lead scoring
- Predictive analytics

## 🚀 Deployment

### Netlify Deployment

The project is configured for Netlify deployment with proper SPA routing support.

**Important**: The project includes:
- `netlify.toml` - Netlify configuration file
- `public/_redirects` - Redirect rules for SPA routing

**Deployment Steps**:
1. Build the project: `npm run build`
2. Deploy to Netlify (via CLI, GitHub, or drag-and-drop)
3. Netlify will automatically detect the build settings from `netlify.toml`

**Fixing 404 Errors on Mobile/Direct Access**:
If you're experiencing 404 errors when accessing routes directly (especially on mobile), ensure:
- The `public/_redirects` file exists (it's included in the project)
- The `netlify.toml` file is in the root directory
- After deploying, the redirect rules will handle all routes properly

The redirect rule (`/* /index.html 200`) tells Netlify to serve `index.html` for all routes, allowing React Router to handle client-side routing.

## 📝 Notes

- This is a frontend-only implementation using localStorage for data persistence
- In a production environment, you would replace the dataService with API calls to a backend
- Location tracking requires browser permissions
- The system includes sample data for demonstration purposes
- For Netlify deployment, the `_redirects` file ensures proper SPA routing on all devices

## 🤝 Contributing

This is a demonstration project. For production use, consider:
- Adding proper backend API
- Implementing proper authentication (JWT tokens)
- Adding database persistence
- Implementing real-time updates
- Adding error handling and validation
- Adding unit and integration tests

## 📄 License

This project is created for demonstration purposes.
