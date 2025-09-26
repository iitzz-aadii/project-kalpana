// src/index.ts
import express from 'express';
import cors from 'cors';
import { generateTimetable } from './engine';
import { TimetableInput } from './types';
import collegeRoutes from './routes/collegeRoutes';

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/colleges', collegeRoutes);

// Legacy routes for backward compatibility
app.get('/', (req, res) => {
  res.json({
    message: 'Kalpana Nationwide Timetable Platform API',
    version: '2.0.0',
    endpoints: {
      colleges: '/api/colleges',
      legacy: '/generate'
    }
  });
});

app.get('/generate', (req, res) => {
  console.log('Received request to generate timetable...');

  // --- DUMMY DATA FOR TESTING ---
  const testInput: TimetableInput = {
    subjects: [
      { id: 'S1', name: 'Math', hoursPerWeek: 4 },
      { id: 'S2', name: 'Science', hoursPerWeek: 4 },
      { id: 'S3', name: 'History', hoursPerWeek: 2 },
    ],
    faculty: [
      { id: 'F1', name: 'Dr. Sharma', canTeach: ['S1', 'S2'] },
      { id: 'F2', name: 'Prof. Verma', canTeach: ['S3'] },
      { id: 'F3', name: 'Dr. Gupta', canTeach: ['S2'] },
    ],
    classrooms: [
      { id: 'C1', name: 'Room 101', capacity: 30, type: 'Lecture Hall' },
      { id: 'C2', name: 'Lab A', capacity: 30, type: 'Lab' },
    ],
    timeSlots: [
      { id: 'T1', day: 'Monday', startTime: '09:00', endTime: '10:00' },
      { id: 'T2', day: 'Monday', startTime: '10:00', endTime: '11:00' },
      { id: 'T3', day: 'Tuesday', startTime: '09:00', endTime: '10:00' },
      { id: 'T4', day: 'Tuesday', startTime: '10:00', endTime: '11:00' },
      // Add more time slots for a better schedule
      { id: 'T5', day: 'Wednesday', startTime: '09:00', endTime: '10:00' },
      { id: 'T6', day: 'Wednesday', startTime: '10:00', endTime: '11:00' },
      { id: 'T7', day: 'Thursday', startTime: '09:00', endTime: '10:00' },
      { id: 'T8', day: 'Thursday', startTime: '10:00', endTime: '11:00' },
      { id: 'T9', day: 'Friday', startTime: '09:00', endTime: '10:00' },
      { id: 'T10', day: 'Friday', startTime: '10:00', endTime: '11:00' },
    ],
  };
  
  try {
    const timetable = generateTimetable(testInput);

    // NEW: Map IDs to full names before sending
    const resolvedTimetable = timetable.map(scheduledClass => {
      const subject = testInput.subjects.find(s => s.id === scheduledClass.subjectId);
      const faculty = testInput.faculty.find(f => f.id === scheduledClass.facultyId);
      const classroom = testInput.classrooms.find(c => c.id === scheduledClass.classroomId);
      const timeSlot = testInput.timeSlots.find(t => t.id === scheduledClass.timeSlotId);
      
      return {
        day: timeSlot?.day,
        time: `${timeSlot?.startTime} - ${timeSlot?.endTime}`,
        subject: subject?.name,
        faculty: faculty?.name,
        classroom: classroom?.name,
      }
    });

    res.json(resolvedTimetable); // Send the new, more readable data
  } catch (error) {
    console.error("Error during timetable generation:", error);
    res.status(500).send("Failed to generate timetable.");
  }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

app.listen(port, () => {
  console.log(`🚀 Kalpana Nationwide Platform API running at http://localhost:${port}`);
  console.log(`📚 College endpoints: http://localhost:${port}/api/colleges`);
  console.log(`🔧 Legacy endpoint: http://localhost:${port}/generate`);
});