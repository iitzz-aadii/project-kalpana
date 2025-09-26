# 🧪 NIT Srinagar - Test Data Files

## 📁 **Available Test Files**

### 1. **Complete Test Data** (`nit-srinagar-sample-data.json`)

- **15 Students** across multiple engineering departments
- **10 Faculty Members** with specialized subjects
- **12 Classrooms** in different buildings
- **35 Subjects** covering all engineering branches
- **Perfect for comprehensive testing**

### 2. **Quick Test Data** (`nit-srinagar-quick-test.json`)

- **4 Students** from 3 different departments
- **5 Faculty Members** with core subjects
- **5 Classrooms** with different types
- **5 Subjects** for basic testing
- **Perfect for quick AI testing**

## 🚀 **How to Use Test Data**

### **Method 1: Upload JSON File**

1. Go to the AI Timetable Generator page
2. Click "📊 Upload NIT Srinagar Data"
3. Select "Upload JSON File"
4. Choose one of the test files:
   - `nit-srinagar-sample-data.json` (comprehensive)
   - `nit-srinagar-quick-test.json` (quick test)
5. Click "Confirm & Generate"

### **Method 2: Direct File Access**

- **Complete Data**: `http://localhost:5175/nit-srinagar-sample-data.json`
- **Quick Test**: `http://localhost:5175/nit-srinagar-quick-test.json`

## 📊 **Test Data Structure**

### **Students**

```json
{
  "id": "NIT001",
  "name": "Aarav Sharma",
  "email": "aarav.sharma@nitsri.ac.in",
  "department": "Computer Science & Engineering",
  "year": 1,
  "section": "A",
  "subjects": ["MATH101", "PHYS101", "CS101"]
}
```

### **Faculty**

```json
{
  "id": "NITFAC001",
  "name": "Dr. Rajesh Kumar",
  "email": "rajesh.kumar@nitsri.ac.in",
  "department": "Computer Science & Engineering",
  "subjects": ["Data Structures", "Programming"],
  "maxHoursPerWeek": 20,
  "preferredTimeSlots": ["09:00-10:00", "10:00-11:00"],
  "unavailableTimeSlots": []
}
```

### **Classrooms**

```json
{
  "id": "NITROOM001",
  "name": "Main Lecture Hall 1",
  "capacity": 60,
  "type": "lecture",
  "equipment": ["Projector", "Whiteboard", "Sound System"],
  "location": "Main Building"
}
```

### **Subjects**

```json
{
  "id": "MATH101",
  "name": "Mathematics-I",
  "code": "MATH101",
  "credits": 4,
  "hoursPerWeek": 4,
  "type": "theory",
  "department": "Mathematics",
  "prerequisites": []
}
```

## 🎯 **Testing Scenarios**

### **Quick Test (Recommended for First Time)**

1. Use `nit-srinagar-quick-test.json`
2. Should generate timetable in 30-60 seconds
3. Perfect for testing AI functionality
4. Minimal data for fast processing

### **Comprehensive Test**

1. Use `nit-srinagar-sample-data.json`
2. Will take 2-5 minutes to generate
3. Tests AI with realistic NIT Srinagar data
4. Shows full optimization capabilities

## 🔍 **Expected Results**

### **AI Generation Output**

- **Conflict-free timetables** for all students
- **Optimized faculty workload** distribution
- **Efficient classroom utilization**
- **AI recommendations** for improvements
- **Detailed statistics** and analytics

### **Sample AI Recommendations**

- "Consider adding more lab sessions for practical subjects"
- "Faculty workload is well distributed across departments"
- "Classroom utilization rate: 85% - excellent optimization"
- "No scheduling conflicts detected"

## 🛠️ **Troubleshooting**

### **If AI Generation Fails**

1. Check if Gemini API key is configured
2. Verify internet connection
3. Try with quick test data first
4. Check browser console for errors

### **If Upload Fails**

1. Ensure JSON file is valid
2. Check file size (should be < 1MB)
3. Verify all required fields are present
4. Try the sample data generator instead

## 📈 **Performance Expectations**

### **Quick Test Data**

- **Generation Time**: 30-60 seconds
- **Classes Generated**: ~15-20
- **Conflicts**: 0 (AI optimized)
- **Utilization Rate**: 80-90%

### **Complete Test Data**

- **Generation Time**: 2-5 minutes
- **Classes Generated**: ~80-120
- **Conflicts**: 0 (AI optimized)
- **Utilization Rate**: 85-95%

## 🎓 **NIT Srinagar Specific Features**

### **Engineering Departments**

- Computer Science & Engineering
- Electronics & Communication Engineering
- Mechanical Engineering
- Civil Engineering
- Electrical Engineering
- Chemical Engineering

### **Academic Structure**

- **B.Tech Programs**: 4-year engineering
- **Year-wise Organization**: 1st, 2nd, 3rd, 4th year
- **Section-wise Grouping**: A, B, C sections
- **Subject Prerequisites**: Proper academic flow

### **Institutional Constraints**

- **Working Hours**: 8 AM to 6 PM
- **Break Time**: 12 PM to 1 PM
- **Working Days**: Monday to Saturday
- **Class Duration**: 1-hour slots
- **Faculty Limits**: Max 6 classes per day

## 🚀 **Ready to Test!**

The test data files are now available in the `public` folder and can be accessed directly or uploaded through the AI Timetable Generator interface. Start with the quick test data to verify everything is working, then try the comprehensive data for a full demonstration of the AI capabilities!

---

**Happy Testing! 🎉**
