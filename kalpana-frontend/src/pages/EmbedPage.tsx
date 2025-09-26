// Embed page for college website integration
import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';

interface EmbedConfig {
  collegeId: string;
  type: 'timetable' | 'faculty-schedule' | 'student-schedule' | 'login';
  theme: 'light' | 'dark';
  primaryColor: string;
  secondaryColor: string;
  language: string;
  facultyId?: string;
  studentId?: string;
}

const EmbedPage: React.FC = () => {
  const { collegeId } = useParams<{ collegeId: string }>();
  const [searchParams] = useSearchParams();
  const [config, setConfig] = useState<EmbedConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEmbedConfig = async () => {
      try {
        if (!collegeId) {
          throw new Error('College ID not provided');
        }

        // Extract configuration from URL parameters
        const embedConfig: EmbedConfig = {
          collegeId,
          type: (searchParams.get('type') as any) || 'timetable',
          theme: (searchParams.get('theme') as any) || 'light',
          primaryColor: searchParams.get('primaryColor') || '#6366f1',
          secondaryColor: searchParams.get('secondaryColor') || '#8b5cf6',
          language: searchParams.get('language') || 'en',
          facultyId: searchParams.get('facultyId') || undefined,
          studentId: searchParams.get('studentId') || undefined,
        };

        // Fetch college configuration from API
        const response = await fetch(`/api/colleges/embed/config?collegeId=${collegeId}`);
        const data = await response.json();

        if (data.success && data.data) {
          // Merge with college-specific customization
          embedConfig.primaryColor = data.data.customization?.primaryColor || embedConfig.primaryColor;
          embedConfig.secondaryColor = data.data.customization?.secondaryColor || embedConfig.secondaryColor;
        }

        setConfig(embedConfig);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load embed configuration');
        setLoading(false);
      }
    };

    loadEmbedConfig();
  }, [collegeId, searchParams]);

  // Apply custom CSS variables for theming
  useEffect(() => {
    if (config) {
      const root = document.documentElement;
      root.style.setProperty('--kalpana-primary', config.primaryColor);
      root.style.setProperty('--kalpana-secondary', config.secondaryColor);
      
      // Apply theme class
      document.body.className = `kalpana-embed ${config.theme}-theme`;
    }
  }, [config]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading timetable...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md mx-4"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load</h2>
          <p className="text-gray-600 mb-4">{error || 'Configuration not found'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center mr-3"
                style={{ backgroundColor: config.primaryColor }}
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-lg font-semibold text-gray-900">Timetable</h1>
            </div>
            <div className="text-sm text-gray-500">
              Powered by Kalpana
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {config.type === 'timetable' && <TimetableEmbed config={config} />}
        {config.type === 'faculty-schedule' && <FacultyScheduleEmbed config={config} />}
        {config.type === 'student-schedule' && <StudentScheduleEmbed config={config} />}
        {config.type === 'login' && <LoginEmbed config={config} />}
      </div>
    </div>
  );
};

// Timetable Embed Component
const TimetableEmbed: React.FC<{ config: EmbedConfig }> = ({ config }) => {
  const [timetables, setTimetables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimetable, setSelectedTimetable] = useState<string | null>(null);

  useEffect(() => {
    const loadTimetables = async () => {
      try {
        const response = await fetch(`/api/colleges/timetables?collegeId=${config.collegeId}`);
        const data = await response.json();
        
        if (data.success && data.data) {
          setTimetables(data.data.data || []);
          if (data.data.data && data.data.data.length > 0) {
            setSelectedTimetable(data.data.data[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to load timetables:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTimetables();
  }, [config.collegeId]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Timetable Selector */}
      {timetables.length > 1 && (
        <div className="p-6 border-b">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Timetable
          </label>
          <select
            value={selectedTimetable || ''}
            onChange={(e) => setSelectedTimetable(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {timetables.map((timetable) => (
              <option key={timetable.id} value={timetable.id}>
                {timetable.name} ({timetable.academicYear} - Semester {timetable.semester})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Timetable Display */}
      <div className="p-6">
        {selectedTimetable ? (
          <TimetableDisplay timetableId={selectedTimetable} collegeId={config.collegeId} />
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Timetables Available</h3>
            <p className="text-gray-500">No published timetables found for this college.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Timetable Display Component
const TimetableDisplay: React.FC<{ timetableId: string; collegeId: string }> = ({ timetableId, collegeId }) => {
  const [timetableData, setTimetableData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTimetableData = async () => {
      try {
        const response = await fetch(`/api/colleges/timetables/${timetableId}?collegeId=${collegeId}`);
        const data = await response.json();
        
        if (data.success && data.data) {
          setTimetableData(data.data);
        }
      } catch (error) {
        console.error('Failed to load timetable data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTimetableData();
  }, [timetableId, collegeId]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-6 gap-4 mb-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-8 bg-gray-200 rounded"></div>
          ))}
        </div>
        <div className="grid grid-cols-6 gap-4">
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!timetableData || !timetableData.resolvedClasses) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No timetable data available.</p>
      </div>
    );
  }

  // Group classes by day and time
  const groupedClasses = timetableData.resolvedClasses.reduce((acc: any, cls: any) => {
    if (!acc[cls.day]) {
      acc[cls.day] = {};
    }
    if (!acc[cls.day][cls.time]) {
      acc[cls.day][cls.time] = [];
    }
    acc[cls.day][cls.time].push(cls);
    return acc;
  }, {});

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = ['09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00', '12:00 - 13:00', '13:00 - 14:00', '14:00 - 15:00', '15:00 - 16:00'];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Time
            </th>
            {days.map((day) => (
              <th key={day} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {timeSlots.map((time) => (
            <tr key={time}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {time}
              </td>
              {days.map((day) => (
                <td key={day} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {groupedClasses[day] && groupedClasses[day][time] ? (
                    <div className="space-y-1">
                      {groupedClasses[day][time].map((cls: any, index: number) => (
                        <div
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                        >
                          <div className="font-medium">{cls.subject}</div>
                          <div className="text-blue-600">{cls.faculty}</div>
                          <div className="text-blue-600">{cls.classroom}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Faculty Schedule Embed Component
const FacultyScheduleEmbed: React.FC<{ config: EmbedConfig }> = ({ config }) => {
  return (
    <div className="bg-white rounded-lg shadow p-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Faculty Schedule</h2>
      <p className="text-gray-600">Faculty schedule for ID: {config.facultyId}</p>
      {/* Implement faculty schedule display */}
    </div>
  );
};

// Student Schedule Embed Component
const StudentScheduleEmbed: React.FC<{ config: EmbedConfig }> = ({ config }) => {
  return (
    <div className="bg-white rounded-lg shadow p-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Student Schedule</h2>
      <p className="text-gray-600">Student schedule for ID: {config.studentId}</p>
      {/* Implement student schedule display */}
    </div>
  );
};

// Login Embed Component
const LoginEmbed: React.FC<{ config: EmbedConfig }> = ({ config }) => {
  return (
    <div className="bg-white rounded-lg shadow p-8 max-w-md mx-auto">
      <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">Login</h2>
      <p className="text-gray-600 text-center mb-6">Access your timetable and schedule</p>
      {/* Implement login form */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your email"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your password"
          />
        </div>
        <button
          className="w-full py-2 px-4 rounded-md text-white font-medium"
          style={{ backgroundColor: config.primaryColor }}
        >
          Sign In
        </button>
      </div>
    </div>
  );
};

export default EmbedPage;
