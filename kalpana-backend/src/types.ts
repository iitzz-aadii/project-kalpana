export interface Subject {
  id: string;
  name: string;
  hoursPerWeek: number;
}

export interface Faculty {
  id: string;
  name: string;
  canTeach: string[]; // array of Subject IDs
}

export interface Classroom {
  id: string;
  name: string;
  capacity: number;
  type: 'Lecture Hall' | 'Lab';
}

export interface TimeSlot {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  startTime: string; // e.g., "09:00"
  endTime: string;   // e.g., "10:00"
}

export interface ScheduledClass {
  subjectId: string;
  facultyId: string;
  classroomId: string;
  timeSlotId: string;
}

export interface TimetableInput {
  subjects: Subject[];
  faculty: Faculty[];
  classrooms: Classroom[];
  timeSlots: TimeSlot[];
}
