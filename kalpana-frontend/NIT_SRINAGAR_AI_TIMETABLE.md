# 🎓 NIT Srinagar - AI-Powered Timetable Management System

## 🚀 **System Overview**

This is a cutting-edge AI-powered timetable generation system specifically designed for **National Institute of Technology (NIT) Srinagar**. The system uses **Google's Gemini 2.5 Flash AI** to automatically generate optimized timetables for thousands of students, faculty, and classrooms.

## ✨ **Key Features**

### 🤖 **AI-Powered Generation**

- **Gemini 2.5 Flash Integration**: Uses Google's latest AI model for intelligent scheduling
- **Conflict-Free Scheduling**: Zero double-booking for faculty and classrooms
- **Scalable Processing**: Handles large institutions with thousands of students
- **Real-time Optimization**: AI continuously optimizes for best resource utilization

### 📊 **NIT Srinagar Specific**

- **Engineering Departments**: CSE, ECE, ME, CE, EE, Chemical, IT
- **Academic Structure**: B.Tech, M.Tech, PhD programs
- **Institutional Constraints**: NIT-specific working hours and policies
- **Department-wise Organization**: Proper grouping by engineering branches

### 🎯 **Smart Features**

- **Data Upload System**: Easy JSON-based data import
- **Sample Data Generator**: Built-in NIT Srinagar sample data for testing
- **Progress Tracking**: Real-time AI generation progress
- **Analytics Dashboard**: Comprehensive statistics and optimization metrics
- **AI Recommendations**: Intelligent suggestions for schedule improvements

## 🏗️ **System Architecture**

### **Frontend Components**

```
src/
├── pages/
│   ├── GeneratorPage.tsx          # Main AI timetable generator
│   └── LandingPage.tsx            # Role-based landing page
├── components/
│   ├── DataUploadModal.tsx        # Data upload interface
│   ├── AuthModal.tsx              # Authentication
│   └── RoleSelectionModal.tsx     # Role selection
├── services/
│   └── aiService.ts               # Gemini AI integration
└── contexts/
    └── AuthContext.tsx            # Authentication context
```

### **AI Service Features**

- **Advanced Prompt Engineering**: NIT-specific AI prompts
- **Conflict Detection**: Automatic conflict resolution
- **Optimization Algorithms**: Faculty workload and classroom utilization
- **Data Validation**: Ensures data integrity before processing

## 📋 **Data Structure**

### **Student Information**

```typescript
{
  id: "NIT001",
  name: "Student Name",
  email: "student@nitsri.ac.in",
  department: "Computer Science & Engineering",
  year: 1-4,
  section: "A/B/C",
  subjects: ["SUB001", "SUB002"]
}
```

### **Faculty Information**

```typescript
{
  id: "NITFAC001",
  name: "Dr. Faculty Name",
  email: "faculty@nitsri.ac.in",
  department: "Computer Science & Engineering",
  subjects: ["Data Structures", "Algorithms"],
  maxHoursPerWeek: 20,
  preferredTimeSlots: ["09:00-10:00", "10:00-11:00"],
  unavailableTimeSlots: []
}
```

### **Classroom Information**

```typescript
{
  id: "NITROOM001",
  name: "Room 1",
  capacity: 60,
  type: "lecture/lab/seminar/computer",
  equipment: ["Projector", "Whiteboard", "Sound System"],
  location: "Main Building"
}
```

## 🚀 **Getting Started**

### **1. Prerequisites**

- Node.js (v16 or higher)
- npm or yarn
- Gemini API key (free from Google AI Studio)

### **2. Installation**

```bash
# Clone the repository
git clone <repository-url>
cd kalpana-frontend

# Install dependencies
npm install

# Set up environment variables
echo "VITE_GEMINI_API_KEY=your_api_key_here" > .env

# Start development server
npm run dev
```

### **3. Get Gemini API Key**

1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Create new API key
4. Copy and add to `.env` file

## 🎯 **Usage Guide**

### **Step 1: Upload Data**

1. Click "📊 Upload NIT Srinagar Data"
2. Choose between:
   - **Upload JSON File**: Upload your institution's data
   - **Use Sample Data**: Generate NIT Srinagar sample data for testing

### **Step 2: Generate Timetable**

1. Click "✨ Generate Timetable"
2. Watch AI process your data in real-time
3. View progress and optimization metrics

### **Step 3: Review Results**

1. Analyze generated timetable
2. Check AI recommendations
3. Review conflict resolution
4. Export or modify as needed

## 📊 **Sample Data Included**

The system includes comprehensive sample data for NIT Srinagar:

- **280 Students** across 7 engineering departments
- **45 Faculty Members** with specialized subjects
- **35 Classrooms** in 5 different buildings
- **12 Subjects** covering all engineering branches

### **Departments Covered**

- Computer Science & Engineering
- Electronics & Communication Engineering
- Mechanical Engineering
- Civil Engineering
- Electrical Engineering
- Chemical Engineering
- Information Technology

## 🔧 **Configuration**

### **Institutional Constraints**

```typescript
constraints: {
  workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  workingHours: { start: '08:00', end: '18:00' },
  breakTime: { start: '12:00', end: '13:00' },
  maxClassesPerDay: 8,
  maxClassesPerFacultyPerDay: 6
}
```

### **AI Optimization Goals**

1. **Minimize Conflicts**: No faculty or classroom double-booking
2. **Balance Workload**: Even distribution of faculty teaching hours
3. **Maximize Utilization**: Optimal classroom and resource usage
4. **Respect Constraints**: Honor institutional policies and preferences
5. **Student Experience**: Minimize student schedule conflicts

## 📈 **Analytics & Reports**

### **Real-time Statistics**

- Total classes scheduled
- Faculty workload distribution
- Classroom utilization rates
- Conflict detection and resolution
- AI optimization recommendations

### **Performance Metrics**

- Utilization rate percentage
- Conflict count (should be 0)
- Faculty workload balance
- Student schedule optimization

## 🛠️ **Technical Details**

### **AI Model**

- **Model**: Gemini 2.5 Flash (Latest)
- **Provider**: Google AI Studio
- **Cost**: Free tier available
- **Capabilities**: Advanced reasoning and optimization

### **Frontend Stack**

- **React 19**: Latest React with modern features
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Smooth animations
- **Vite**: Fast development and building

### **Key Dependencies**

```json
{
  "@google/generative-ai": "Latest",
  "react": "^19.1.1",
  "framer-motion": "^12.23.21",
  "react-router-dom": "^7.9.2"
}
```

## 🎓 **NIT Srinagar Specific Features**

### **Academic Structure**

- **B.Tech Programs**: 4-year engineering programs
- **M.Tech Programs**: Postgraduate engineering
- **PhD Programs**: Research programs
- **Department-wise Organization**: Proper engineering branch grouping

### **Institutional Policies**

- **Working Hours**: 8 AM to 6 PM
- **Break Time**: 12 PM to 1 PM
- **Working Days**: Monday to Saturday
- **Class Duration**: 1-hour slots
- **Faculty Constraints**: Maximum 6 classes per day

## 🚀 **Future Enhancements**

### **Planned Features**

- **Real-time Collaboration**: Multiple admin access
- **Mobile App**: Student and faculty mobile access
- **Integration**: ERP system integration
- **Advanced Analytics**: Detailed reporting and insights
- **Automated Notifications**: Email/SMS notifications

### **AI Improvements**

- **Machine Learning**: Learn from scheduling patterns
- **Predictive Analytics**: Forecast scheduling needs
- **Dynamic Optimization**: Real-time schedule adjustments
- **Natural Language**: Voice commands for schedule management

## 📞 **Support & Contact**

For technical support or feature requests:

- **Institution**: National Institute of Technology Srinagar
- **System**: AI-Powered Timetable Management
- **Version**: 1.0.0
- **Last Updated**: September 2024

## 🎉 **Success Stories**

This system is designed to handle the complex scheduling needs of NIT Srinagar, including:

- **Large Scale**: Thousands of students and faculty
- **Complex Constraints**: Multiple departments and programs
- **High Efficiency**: AI-optimized resource utilization
- **Zero Conflicts**: Automated conflict resolution

---

**Built with ❤️ for NIT Srinagar - Empowering Education with AI**
