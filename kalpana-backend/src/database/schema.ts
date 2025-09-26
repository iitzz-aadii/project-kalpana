// Database schema for multi-tenant college system
export interface College {
  id: string;
  name: string;
  domain: string; // e.g., "nit-srinagar.ac.in"
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  isActive: boolean;
  subscriptionTier: 'free' | 'premium' | 'enterprise';
  maxUsers: number;
  maxFaculty: number;
  maxStudents: number;
  createdAt: Date;
  updatedAt: Date;
  settings: CollegeSettings;
}

export interface CollegeSettings {
  allowStudentRegistration: boolean;
  allowFacultySelfRegistration: boolean;
  requireEmailVerification: boolean;
  defaultTimeSlots: TimeSlot[];
  workingDays: string[];
  academicYear: string;
  semester: string;
  customFields?: Record<string, any>;
}

export interface User {
  id: string;
  email: string;
  collegeId: string;
  role: 'super_admin' | 'college_admin' | 'faculty' | 'student';
  firstName: string;
  lastName: string;
  profilePicture?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  // College-specific user data
  collegeData: CollegeUserData;
}

export interface CollegeUserData {
  // For faculty
  employeeId?: string;
  department?: string;
  designation?: string;
  subjects?: string[];
  maxHoursPerWeek?: number;
  
  // For students
  studentId?: string;
  batch?: string;
  course?: string;
  semester?: number;
  rollNumber?: string;
  
  // Common
  phoneNumber?: string;
  emergencyContact?: string;
  customFields?: Record<string, any>;
}

export interface Subject {
  id: string;
  collegeId: string;
  name: string;
  code: string;
  hoursPerWeek: number;
  department: string;
  semester: number;
  credits: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Faculty {
  id: string;
  collegeId: string;
  userId: string;
  employeeId: string;
  department: string;
  designation: string;
  canTeach: string[]; // Subject IDs
  maxHoursPerWeek: number;
  preferences: FacultyPreferences;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FacultyPreferences {
  preferredTimeSlots: string[];
  preferredDays: string[];
  maxConsecutiveHours: number;
  lunchBreakRequired: boolean;
  unavailableTimeSlots: string[];
}

export interface Classroom {
  id: string;
  collegeId: string;
  name: string;
  code: string;
  capacity: number;
  type: 'Lecture Hall' | 'Lab' | 'Seminar Hall' | 'Computer Lab' | 'Library';
  building: string;
  floor: number;
  equipment: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeSlot {
  id: string;
  collegeId: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string; // "09:00"
  endTime: string;   // "10:00"
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Timetable {
  id: string;
  collegeId: string;
  name: string;
  academicYear: string;
  semester: string;
  status: 'draft' | 'published' | 'archived';
  generatedBy: string; // User ID
  generatedAt: Date;
  publishedAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScheduledClass {
  id: string;
  timetableId: string;
  collegeId: string;
  subjectId: string;
  facultyId: string;
  classroomId: string;
  timeSlotId: string;
  batch?: string; // For student batches
  createdAt: Date;
  updatedAt: Date;
}

export interface CollegeIntegration {
  id: string;
  collegeId: string;
  websiteUrl: string;
  integrationType: 'iframe' | 'api' | 'widget';
  apiKey: string;
  isActive: boolean;
  customCSS?: string;
  customJS?: string;
  createdAt: Date;
  updatedAt: Date;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
