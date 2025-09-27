// Timetable service for college-specific operations
import { 
  Timetable, 
  ScheduledClass, 
  Subject, 
  Faculty as DbFaculty, 
  Classroom, 
  TimeSlot,
  ApiResponse,
  PaginatedResponse 
} from '../database/schema';
import { 
  Faculty, 
  Subject as EngineSubject, 
  Classroom as EngineClassroom, 
  TimeSlot as EngineTimeSlot,
  TimetableInput 
} from '../types';
import { generateTimetable } from '../engine';

export class TimetableService {
  // Get all timetables for a college
  static async getCollegeTimetables(collegeId: string, page = 1, limit = 10): Promise<ApiResponse<PaginatedResponse<Timetable>>> {
    try {
      // TODO: Fetch from database with pagination
      // const timetables = await db.collection('timetables')
      //   .where('collegeId', '==', collegeId)
      //   .orderBy('createdAt', 'desc')
      //   .limit(limit)
      //   .offset((page - 1) * limit)
      //   .get();
      
      // Mock data
      const mockTimetables: Timetable[] = [
        {
          id: 'tt_001',
          collegeId: collegeId,
          name: 'Fall 2024 Timetable',
          academicYear: '2024',
          semester: '1',
          status: 'published',
          generatedBy: 'admin_001',
          generatedAt: new Date('2024-01-15'),
          publishedAt: new Date('2024-01-16'),
          isActive: true,
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-16')
        },
        {
          id: 'tt_002',
          collegeId: collegeId,
          name: 'Spring 2024 Timetable',
          academicYear: '2024',
          semester: '2',
          status: 'draft',
          generatedBy: 'admin_001',
          generatedAt: new Date('2024-06-15'),
          isActive: true,
          createdAt: new Date('2024-06-15'),
          updatedAt: new Date('2024-06-15')
        }
      ];

      const response: PaginatedResponse<Timetable> = {
        data: mockTimetables,
        pagination: {
          page,
          limit,
          total: mockTimetables.length,
          totalPages: Math.ceil(mockTimetables.length / limit)
        }
      };

      return {
        success: true,
        data: response
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get timetables'
      };
    }
  }

  // Generate timetable for a college
  static async generateTimetable(
    collegeId: string, 
    input: any, 
    generatedBy: string
  ): Promise<ApiResponse<Timetable>> {
    try {
      // Get college-specific data
      const subjects = await this.getCollegeSubjects(collegeId);
      const faculty = await this.getCollegeFaculty(collegeId);
      const classrooms = await this.getCollegeClassrooms(collegeId);
      const timeSlots = await this.getCollegeTimeSlots(collegeId);

      if (!subjects.success || !faculty.success || !classrooms.success || !timeSlots.success) {
        return {
          success: false,
          error: 'Failed to load college data for timetable generation'
        };
      }

      // Convert to the format expected by the engine
      // Transform database objects to engine-compatible types
      const transformedSubjects: EngineSubject[] = (subjects.data || []).map(subject => ({
        id: subject.id,
        name: subject.name,
        hoursPerWeek: subject.hoursPerWeek
      }));

      const transformedFaculty: Faculty[] = (faculty.data || []).map((fac: DbFaculty) => ({
        id: fac.id,
        name: `${fac.employeeId}`, // Use employeeId as name since database Faculty doesn't have name
        canTeach: fac.canTeach
      }));

      const transformedClassrooms: EngineClassroom[] = (classrooms.data || []).map(classroom => ({
        id: classroom.id,
        name: classroom.name,
        capacity: classroom.capacity,
        type: classroom.type === 'Lecture Hall' || classroom.type === 'Lab' ? classroom.type : 'Lecture Hall'
      }));

      const transformedTimeSlots: EngineTimeSlot[] = (timeSlots.data || []).map(slot => ({
        id: slot.id,
        day: slot.day === 'Sunday' ? 'Saturday' : slot.day, // Map Sunday to Saturday if needed
        startTime: slot.startTime,
        endTime: slot.endTime
      }));

      const timetableInput: TimetableInput = {
        subjects: transformedSubjects,
        faculty: transformedFaculty,
        classrooms: transformedClassrooms,
        timeSlots: transformedTimeSlots
      };

      // Generate timetable using the existing engine
      const scheduledClasses = generateTimetable(timetableInput);

      // Create timetable record
      const timetable: Timetable = {
        id: `tt_${collegeId}_${Date.now()}`,
        collegeId: collegeId,
        name: input.name || `Timetable ${new Date().toISOString().split('T')[0]}`,
        academicYear: input.academicYear || new Date().getFullYear().toString(),
        semester: input.semester || '1',
        status: 'draft',
        generatedBy: generatedBy,
        generatedAt: new Date(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save scheduled classes
      const scheduledClassesData: ScheduledClass[] = scheduledClasses.map((sc, index) => ({
        id: `sc_${timetable.id}_${index}`,
        timetableId: timetable.id,
        collegeId: collegeId,
        subjectId: sc.subjectId,
        facultyId: sc.facultyId,
        classroomId: sc.classroomId,
        timeSlotId: sc.timeSlotId,
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      // TODO: Save to database
      // await db.collection('timetables').doc(timetable.id).set(timetable);
      // await db.collection('scheduled_classes').add(scheduledClassesData);

      return {
        success: true,
        data: timetable,
        message: 'Timetable generated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate timetable'
      };
    }
  }

  // Get timetable details with scheduled classes
  static async getTimetableDetails(timetableId: string, collegeId: string): Promise<ApiResponse<{
    timetable: Timetable;
    scheduledClasses: ScheduledClass[];
    resolvedClasses: any[];
  }>> {
    try {
      // TODO: Fetch from database
      // const timetable = await db.collection('timetables').doc(timetableId).get();
      // const scheduledClasses = await db.collection('scheduled_classes')
      //   .where('timetableId', '==', timetableId)
      //   .get();

      // Mock data
      const timetable: Timetable = {
        id: timetableId,
        collegeId: collegeId,
        name: 'Fall 2024 Timetable',
        academicYear: '2024',
        semester: '1',
        status: 'published',
        generatedBy: 'admin_001',
        generatedAt: new Date('2024-01-15'),
        publishedAt: new Date('2024-01-16'),
        isActive: true,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-16')
      };

      const scheduledClasses: ScheduledClass[] = [
        {
          id: 'sc_001',
          timetableId: timetableId,
          collegeId: collegeId,
          subjectId: 'sub_001',
          facultyId: 'fac_001',
          classroomId: 'room_001',
          timeSlotId: 'time_001',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      // Resolve class details
      const subjects = await this.getCollegeSubjects(collegeId);
      const faculty = await this.getCollegeFaculty(collegeId);
      const classrooms = await this.getCollegeClassrooms(collegeId);
      const timeSlots = await this.getCollegeTimeSlots(collegeId);

      const resolvedClasses = scheduledClasses.map(sc => {
        const subject = subjects.data?.find(s => s.id === sc.subjectId);
        const facultyMember = faculty.data?.find(f => f.id === sc.facultyId);
        const classroom = classrooms.data?.find(c => c.id === sc.classroomId);
        const timeSlot = timeSlots.data?.find(t => t.id === sc.timeSlotId);

        return {
          id: sc.id,
          subject: subject?.name || 'Unknown Subject',
          faculty: facultyMember?.employeeId || 'Unknown Faculty',
          classroom: classroom?.name || 'Unknown Classroom',
          day: timeSlot?.day || 'Unknown Day',
          time: timeSlot ? `${timeSlot.startTime} - ${timeSlot.endTime}` : 'Unknown Time'
        };
      });

      return {
        success: true,
        data: {
          timetable,
          scheduledClasses,
          resolvedClasses
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get timetable details'
      };
    }
  }

  // Helper methods to get college-specific data
  private static async getCollegeSubjects(collegeId: string): Promise<ApiResponse<Subject[]>> {
    try {
      // TODO: Fetch from database
      // const subjects = await db.collection('subjects')
      //   .where('collegeId', '==', collegeId)
      //   .where('isActive', '==', true)
      //   .get();

      // Mock data
      const subjects: Subject[] = [
        {
          id: 'sub_001',
          collegeId: collegeId,
          name: 'Mathematics',
          code: 'MATH101',
          hoursPerWeek: 4,
          department: 'Mathematics',
          semester: 1,
          credits: 4,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'sub_002',
          collegeId: collegeId,
          name: 'Physics',
          code: 'PHY101',
          hoursPerWeek: 4,
          department: 'Physics',
          semester: 1,
          credits: 4,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      return {
        success: true,
        data: subjects
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get subjects'
      };
    }
  }

  private static async getCollegeFaculty(collegeId: string): Promise<ApiResponse<DbFaculty[]>> {
    try {
      // TODO: Fetch from database
      const faculty: DbFaculty[] = [
        {
          id: 'fac_001',
          collegeId: collegeId,
          userId: 'user_001',
          employeeId: 'EMP001',
          department: 'Mathematics',
          designation: 'Professor',
          canTeach: ['sub_001'],
          maxHoursPerWeek: 20,
          preferences: {
            preferredTimeSlots: [],
            preferredDays: [],
            maxConsecutiveHours: 3,
            lunchBreakRequired: true,
            unavailableTimeSlots: []
          },
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      return {
        success: true,
        data: faculty
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get faculty'
      };
    }
  }

  private static async getCollegeClassrooms(collegeId: string): Promise<ApiResponse<Classroom[]>> {
    try {
      // TODO: Fetch from database
      const classrooms: Classroom[] = [
        {
          id: 'room_001',
          collegeId: collegeId,
          name: 'Lecture Hall 1',
          code: 'LH1',
          capacity: 50,
          type: 'Lecture Hall',
          building: 'Main Building',
          floor: 1,
          equipment: ['Projector', 'Whiteboard'],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      return {
        success: true,
        data: classrooms
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get classrooms'
      };
    }
  }

  private static async getCollegeTimeSlots(collegeId: string): Promise<ApiResponse<TimeSlot[]>> {
    try {
      // TODO: Fetch from database
      const timeSlots: TimeSlot[] = [
        {
          id: 'time_001',
          collegeId: collegeId,
          day: 'Monday',
          startTime: '09:00',
          endTime: '10:00',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'time_002',
          collegeId: collegeId,
          day: 'Monday',
          startTime: '10:00',
          endTime: '11:00',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      return {
        success: true,
        data: timeSlots
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get time slots'
      };
    }
  }
}
