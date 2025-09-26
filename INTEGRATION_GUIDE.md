# 🏛️ Kalpana Nationwide Timetable Platform - Integration Guide

## Overview

The Kalpana Timetable Platform is a nationwide AI-powered timetable management system designed to be integrated with any college's website. This guide will help you integrate our platform into your college's existing website.

## 🚀 Quick Start

### 1. Register Your College

First, register your college with our platform:

```bash
curl -X POST https://api.kalpana-timetable.com/api/colleges/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Your College Name",
    "domain": "yourcollege.edu.in",
    "contactEmail": "admin@yourcollege.edu.in",
    "contactPhone": "+91-1234567890",
    "address": "Your College Address"
  }'
```

### 2. Include the SDK

Add our JavaScript SDK to your website:

```html
<!-- Include the Kalpana SDK -->
<script src="https://app.kalpana-timetable.com/kalpana-sdk.js"></script>
```

### 3. Initialize the SDK

```javascript
// Initialize the SDK with your college ID
const kalpana = new KalpanaSDK({
  apiBaseUrl: "https://api.kalpana-timetable.com",
  frontendUrl: "https://app.kalpana-timetable.com",
  theme: "light", // or 'dark'
  primaryColor: "#6366f1", // Your college's primary color
  secondaryColor: "#8b5cf6", // Your college's secondary color
  language: "en",
  debug: true, // Set to false in production
});

// Initialize with your college ID
kalpana.init("your-college-id-here").then((result) => {
  if (result.success) {
    console.log("Kalpana SDK initialized successfully");
  } else {
    console.error("Failed to initialize SDK:", result.error);
  }
});
```

## 📋 Integration Methods

### Method 1: JavaScript SDK (Recommended)

#### Timetable Widget

```html
<!-- Create a container for the timetable -->
<div id="timetable-container"></div>

<script>
  // Create a timetable widget
  const widgetId = kalpana.createTimetableWidget("timetable-container", {
    height: "600px",
    showControls: true,
    allowFullscreen: true,
  });
</script>
```

#### Faculty Schedule Widget

```html
<!-- Create a container for faculty schedule -->
<div id="faculty-schedule-container"></div>

<script>
  // Create a faculty schedule widget
  const facultyWidgetId = kalpana.createFacultyWidget(
    "faculty-schedule-container",
    "faculty-id-123",
    {
      height: "400px",
      showPersonalInfo: false,
    }
  );
</script>
```

#### Student Schedule Widget

```html
<!-- Create a container for student schedule -->
<div id="student-schedule-container"></div>

<script>
  // Create a student schedule widget
  const studentWidgetId = kalpana.createStudentWidget(
    "student-schedule-container",
    "student-id-456",
    {
      height: "400px",
      showAssignments: true,
    }
  );
</script>
```

#### Login Widget

```html
<!-- Create a container for login -->
<div id="login-container"></div>

<script>
  // Create a login widget
  const loginWidgetId = kalpana.createLoginWidget("login-container", {
    height: "500px",
    showRegistration: true,
    allowGoogleLogin: true,
  });
</script>
```

### Method 2: HTML Data Attributes (Auto-initialization)

```html
<!-- Timetable Widget -->
<div
  id="timetable-widget"
  data-kalpana-widget="timetable"
  data-college-id="your-college-id"
  data-options='{"height": "600px", "showControls": true}'
></div>

<!-- Faculty Schedule Widget -->
<div
  id="faculty-widget"
  data-kalpana-widget="faculty"
  data-college-id="your-college-id"
  data-faculty-id="faculty-id-123"
  data-options='{"height": "400px"}'
></div>

<!-- Student Schedule Widget -->
<div
  id="student-widget"
  data-kalpana-widget="student"
  data-college-id="your-college-id"
  data-student-id="student-id-456"
  data-options='{"height": "400px"}'
></div>

<!-- Login Widget -->
<div
  id="login-widget"
  data-kalpana-widget="login"
  data-college-id="your-college-id"
  data-options='{"height": "500px", "showRegistration": true}'
></div>
```

### Method 3: Direct Iframe Embedding

```html
<!-- Direct iframe embedding -->
<iframe
  src="https://app.kalpana-timetable.com/embed/your-college-id?theme=light&primaryColor=%236366f1"
  width="100%"
  height="600"
  frameborder="0"
  allow="fullscreen"
>
</iframe>
```

## 🎨 Customization Options

### Theme Customization

```javascript
// Light theme
kalpana.init("your-college-id", {
  theme: "light",
  primaryColor: "#6366f1",
  secondaryColor: "#8b5cf6",
});

// Dark theme
kalpana.init("your-college-id", {
  theme: "dark",
  primaryColor: "#8b5cf6",
  secondaryColor: "#a855f7",
});
```

### Widget Customization

```javascript
// Customize timetable widget
kalpana.createTimetableWidget("container", {
  height: "700px",
  showControls: true,
  allowFullscreen: true,
  showFilters: true,
  defaultView: "week", // 'day', 'week', 'month'
  showFacultyInfo: true,
  showClassroomInfo: true,
});

// Customize faculty widget
kalpana.createFacultyWidget("container", "faculty-id", {
  height: "500px",
  showPersonalInfo: true,
  showContactInfo: false,
  showOfficeHours: true,
  showUpcomingClasses: true,
});

// Customize student widget
kalpana.createStudentWidget("container", "student-id", {
  height: "500px",
  showAssignments: true,
  showGrades: false,
  showAttendance: true,
  showUpcomingExams: true,
});
```

## 🔧 Advanced Integration

### API Integration

```javascript
// Get college information
const collegeInfo = await kalpana.getCollegeInfo();
console.log("College Info:", collegeInfo);

// Get timetable data
const timetableData = await kalpana.getTimetableData();
console.log("Timetable Data:", timetableData);

// Get specific timetable
const specificTimetable = await kalpana.getTimetableData("timetable-id-123");
console.log("Specific Timetable:", specificTimetable);
```

### Event Handling

```javascript
// Listen for widget events
kalpana.on("widgetLoaded", (widgetId, widgetType) => {
  console.log(`Widget ${widgetId} of type ${widgetType} loaded`);
});

kalpana.on("widgetError", (widgetId, error) => {
  console.error(`Widget ${widgetId} error:`, error);
});

kalpana.on("userLogin", (userData) => {
  console.log("User logged in:", userData);
});

kalpana.on("userLogout", () => {
  console.log("User logged out");
});
```

### Dynamic Widget Management

```javascript
// Update widget configuration
kalpana.updateWidget(widgetId, {
  height: "800px",
  theme: "dark",
});

// Remove widget
kalpana.removeWidget(widgetId);

// Get all widgets
const widgets = kalpana.getWidgets();
console.log("Active widgets:", widgets);
```

## 🔐 Authentication & Security

### API Key Authentication

```javascript
// Initialize with API key
kalpana.init("your-college-id", {
  apiKey: "your-api-key-here",
  // ... other options
});
```

### User Authentication

The platform supports multiple authentication methods:

1. **Email/Password**: Standard login
2. **Google OAuth**: Google Sign-In integration
3. **SSO Integration**: Single Sign-On with your college's system
4. **LDAP Integration**: Active Directory integration

### Role-Based Access

The platform supports four user roles:

- **Super Admin**: Platform-wide access
- **College Admin**: College-specific administrative access
- **Faculty**: Faculty-specific features and data
- **Student**: Student-specific features and data

## 📱 Responsive Design

The widgets are fully responsive and will adapt to different screen sizes:

```css
/* Ensure your container is responsive */
.timetable-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

/* Mobile-specific styling */
@media (max-width: 768px) {
  .timetable-container {
    padding: 0 16px;
  }
}
```

## 🌐 Multi-Language Support

```javascript
// Initialize with different languages
kalpana.init("your-college-id", {
  language: "hi", // Hindi
  // language: 'en', // English (default)
  // language: 'ta', // Tamil
  // language: 'te', // Telugu
  // language: 'bn', // Bengali
});
```

## 🔧 Troubleshooting

### Common Issues

1. **Widget not loading**

   - Check if the college ID is correct
   - Verify the container element exists
   - Check browser console for errors

2. **Authentication issues**

   - Verify API key is correct
   - Check if the college is active
   - Ensure proper CORS configuration

3. **Styling conflicts**
   - Use CSS isolation techniques
   - Check for conflicting CSS rules
   - Use iframe embedding for complete isolation

### Debug Mode

```javascript
// Enable debug mode for troubleshooting
kalpana.init("your-college-id", {
  debug: true,
});
```

## 📊 Analytics & Monitoring

### Usage Analytics

```javascript
// Get usage statistics
const stats = await kalpana.getUsageStats();
console.log("Usage Stats:", stats);
```

### Performance Monitoring

The platform includes built-in performance monitoring:

- Widget load times
- API response times
- User interaction tracking
- Error rate monitoring

## 🚀 Deployment Checklist

- [ ] College registered with platform
- [ ] API key obtained and configured
- [ ] SDK included in website
- [ ] Widgets tested in development environment
- [ ] Custom styling applied
- [ ] Authentication configured
- [ ] Analytics setup completed
- [ ] Performance testing completed
- [ ] Mobile responsiveness verified
- [ ] Cross-browser compatibility tested

## 📞 Support

### Documentation

- [API Documentation](https://docs.kalpana-timetable.com)
- [SDK Reference](https://docs.kalpana-timetable.com/sdk)
- [Widget Gallery](https://docs.kalpana-timetable.com/widgets)

### Contact

- **Email**: support@kalpana-timetable.com
- **Phone**: +91-9876543210
- **Live Chat**: Available on our website
- **GitHub**: [github.com/kalpana-timetable](https://github.com/kalpana-timetable)

### Community

- **Discord**: [discord.gg/kalpana-timetable](https://discord.gg/kalpana-timetable)
- **Stack Overflow**: Tag your questions with `kalpana-timetable`
- **Reddit**: [r/kalpana-timetable](https://reddit.com/r/kalpana-timetable)

## 📄 License

This integration guide and the Kalpana Timetable Platform are licensed under the MIT License. See [LICENSE](LICENSE) for more information.

---

**Happy Integrating! 🎉**

For more examples and advanced use cases, visit our [GitHub repository](https://github.com/kalpana-timetable/examples).
