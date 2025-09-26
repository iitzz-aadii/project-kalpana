// src/services/aiService.ts

import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/env';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(config.geminiApiKey);

export interface Student {
  id: string;
  name: string;
  email: string;
  department: string;
  year: number;
  section: string;
  subjects: string[];
}

export interface Faculty {
  id: string;
  name: string;
  email: string;
  department: string;
  subjects: string[];
  maxHoursPerWeek: number;
  preferredTimeSlots: string[];
  unavailableTimeSlots: string[];
}

export interface Classroom {
  id: string;
  name: string;
  capacity: number;
  type: 'lecture' | 'lab' | 'seminar' | 'computer';
  equipment: string[];
  location: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  credits: number;
  hoursPerWeek: number;
  type: 'theory' | 'practical' | 'tutorial';
  department: string;
  prerequisites: string[];
}

export interface TimetableEntry {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  subject: string;
  subjectCode: string;
  faculty: string;
  classroom: string;
  studentGroup: string;
  type: 'theory' | 'practical' | 'tutorial';
  department: string;
}

export interface TimetableData {
  students: Student[];
  faculty: Faculty[];
  classrooms: Classroom[];
  subjects: Subject[];
  constraints: {
    workingDays: string[];
    workingHours: { start: string; end: string };
    breakTime: { start: string; end: string };
    maxClassesPerDay: number;
    maxClassesPerFacultyPerDay: number;
  };
}

export interface TimetableResult {
  timetable: TimetableEntry[];
  stats: {
    totalClasses: number;
    totalFaculty: number;
    totalStudents: number;
    totalClassrooms: number;
    utilizationRate: number;
    conflicts: number;
  };
  optimization: {
    facultyWorkloadDistribution: Record<string, number>;
    classroomUtilization: Record<string, number>;
    studentScheduleConflicts: number;
    recommendations: string[];
  };
}

class AIService {
  private model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  async generateTimetable(data: TimetableData): Promise<TimetableResult> {
    try {
      if (!config.isGeminiConfigured) {
        throw new Error('Gemini API key not configured. Please set VITE_GEMINI_API_KEY in your environment variables.');
      }

      const prompt = this.buildPrompt(data);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse the AI response
      return this.parseAIResponse(text, data);
    } catch (error) {
      console.error('AI Generation Error:', error);
      if (error instanceof Error && error.message.includes('API key')) {
        throw error;
      }
      throw new Error('Failed to generate timetable with AI. Please try again.');
    }
  }

  private buildPrompt(data: TimetableData): string {
    return `
You are an expert academic timetable generator for the National Institute of Technology (NIT) Srinagar, a premier engineering institution in India. Generate an optimized timetable for ${data.students.length} students, ${data.faculty.length} faculty members, and ${data.classrooms.length} classrooms.

**INSTITUTION CONTEXT:**
- Institution: National Institute of Technology (NIT) Srinagar
- Type: Premier Engineering Institute
- Location: Jammu and Kashmir, India
- Academic Structure: Engineering departments with B.Tech, M.Tech, and PhD programs
- Typical Departments: Computer Science, Electronics, Mechanical, Civil, Electrical, Chemical, etc.

**INSTITUTION DATA:**
- Students: ${data.students.length} (${this.getDepartmentBreakdown(data.students)})
- Faculty: ${data.faculty.length} (${this.getDepartmentBreakdown(data.faculty)})
- Classrooms: ${data.classrooms.length} (${this.getCapacityBreakdown(data.classrooms)})
- Subjects: ${data.subjects.length} (${this.getSubjectBreakdown(data.subjects)})

**CONSTRAINTS:**
- Working Days: ${data.constraints.workingDays.join(', ')}
- Working Hours: ${data.constraints.workingHours.start} - ${data.constraints.workingHours.end}
- Break Time: ${data.constraints.breakTime.start} - ${data.constraints.breakTime.end}
- Max Classes per Day: ${data.constraints.maxClassesPerDay}
- Max Classes per Faculty per Day: ${data.constraints.maxClassesPerFacultyPerDay}

**OPTIMIZATION GOALS:**
1. Minimize faculty conflicts (no double booking)
2. Minimize classroom conflicts (no double booking)
3. Minimize student conflicts (no overlapping classes for same student group)
4. Optimize faculty workload distribution
5. Maximize classroom utilization
6. Respect faculty preferences and constraints
7. Ensure proper subject sequencing and prerequisites

**OUTPUT FORMAT:**
Return a JSON object with this exact structure:
{
  "timetable": [
    {
      "id": "unique_id",
      "day": "Monday",
      "startTime": "09:00",
      "endTime": "10:00",
      "subject": "Mathematics",
      "subjectCode": "MATH101",
      "faculty": "Dr. John Smith",
      "classroom": "Room A101",
      "studentGroup": "CS-1A",
      "type": "theory",
      "department": "Computer Science"
    }
  ],
  "stats": {
    "totalClasses": 0,
    "totalFaculty": 0,
    "totalStudents": 0,
    "totalClassrooms": 0,
    "utilizationRate": 0,
    "conflicts": 0
  },
  "optimization": {
    "facultyWorkloadDistribution": {},
    "classroomUtilization": {},
    "studentScheduleConflicts": 0,
    "recommendations": []
  }
}

**IMPORTANT:**
- Generate realistic time slots (1-hour or 1.5-hour classes)
- Ensure no faculty is double-booked
- Ensure no classroom is double-booked
- Group students by department, year, and section
- Respect faculty availability and preferences
- Consider classroom capacity and equipment requirements
- Provide detailed statistics and optimization metrics
- Include actionable recommendations for improvement

Generate a comprehensive timetable that handles the scale of this institution efficiently.
    `;
  }

  private getDepartmentBreakdown(items: any[]): string {
    const deptCount = items.reduce((acc, item) => {
      acc[item.department] = (acc[item.department] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(deptCount)
      .map(([dept, count]) => `${dept}: ${count}`)
      .join(', ');
  }

  private getCapacityBreakdown(classrooms: Classroom[]): string {
    const totalCapacity = classrooms.reduce((sum, room) => sum + room.capacity, 0);
    const avgCapacity = Math.round(totalCapacity / classrooms.length);
    return `Total: ${totalCapacity}, Avg: ${avgCapacity}`;
  }

  private getSubjectBreakdown(subjects: Subject[]): string {
    const typeCount = subjects.reduce((acc, subject) => {
      acc[subject.type] = (acc[subject.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(typeCount)
      .map(([type, count]) => `${type}: ${count}`)
      .join(', ');
  }

  private parseAIResponse(text: string, data: TimetableData): TimetableResult {
    try {
      // Extract JSON from the response (handle markdown formatting)
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : text;
      
      const parsed = JSON.parse(jsonString);
      
      // Validate and enhance the response
      return {
        timetable: parsed.timetable || [],
        stats: {
          totalClasses: parsed.timetable?.length || 0,
          totalFaculty: data.faculty.length,
          totalStudents: data.students.length,
          totalClassrooms: data.classrooms.length,
          utilizationRate: this.calculateUtilizationRate(parsed.timetable || [], data),
          conflicts: this.detectConflicts(parsed.timetable || [])
        },
        optimization: {
          facultyWorkloadDistribution: this.calculateFacultyWorkload(parsed.timetable || []),
          classroomUtilization: this.calculateClassroomUtilization(parsed.timetable || []),
          studentScheduleConflicts: this.detectStudentConflicts(parsed.timetable || []),
          recommendations: parsed.optimization?.recommendations || []
        }
      };
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      throw new Error('AI generated invalid response format. Please try again.');
    }
  }

  private calculateUtilizationRate(timetable: TimetableEntry[], data: TimetableData): number {
    const totalPossibleSlots = data.constraints.workingDays.length * 
                              data.constraints.maxClassesPerDay * 
                              data.classrooms.length;
    return Math.round((timetable.length / totalPossibleSlots) * 100);
  }

  private detectConflicts(timetable: TimetableEntry[]): number {
    let conflicts = 0;
    const facultySlots = new Map<string, Set<string>>();
    const classroomSlots = new Map<string, Set<string>>();

    for (const entry of timetable) {
      const slot = `${entry.day}-${entry.startTime}`;
      
      // Check faculty conflicts
      if (!facultySlots.has(entry.faculty)) {
        facultySlots.set(entry.faculty, new Set());
      }
      if (facultySlots.get(entry.faculty)!.has(slot)) {
        conflicts++;
      } else {
        facultySlots.get(entry.faculty)!.add(slot);
      }

      // Check classroom conflicts
      if (!classroomSlots.has(entry.classroom)) {
        classroomSlots.set(entry.classroom, new Set());
      }
      if (classroomSlots.get(entry.classroom)!.has(slot)) {
        conflicts++;
      } else {
        classroomSlots.get(entry.classroom)!.add(slot);
      }
    }

    return conflicts;
  }

  private calculateFacultyWorkload(timetable: TimetableEntry[]): Record<string, number> {
    return timetable.reduce((acc, entry) => {
      acc[entry.faculty] = (acc[entry.faculty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private calculateClassroomUtilization(timetable: TimetableEntry[]): Record<string, number> {
    return timetable.reduce((acc, entry) => {
      acc[entry.classroom] = (acc[entry.classroom] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private detectStudentConflicts(timetable: TimetableEntry[]): number {
    const studentSlots = new Map<string, Set<string>>();
    let conflicts = 0;

    for (const entry of timetable) {
      const slot = `${entry.day}-${entry.startTime}`;
      const studentKey = entry.studentGroup;

      if (!studentSlots.has(studentKey)) {
        studentSlots.set(studentKey, new Set());
      }
      if (studentSlots.get(studentKey)!.has(slot)) {
        conflicts++;
      } else {
        studentSlots.get(studentKey)!.add(slot);
      }
    }

    return conflicts;
  }
}

export const aiService = new AIService();
