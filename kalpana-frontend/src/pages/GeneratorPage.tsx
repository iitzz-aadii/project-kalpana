// src/pages/GeneratorPage.tsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import DataUploadModal from '../components/DataUploadModal';
import { aiService, type TimetableEntry, type TimetableResult, type TimetableData } from '../services/aiService';

const GeneratorPage: React.FC = () => {
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [timetableResult, setTimetableResult] = useState<TimetableResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [institutionData, setInstitutionData] = useState<TimetableData | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);

  const handleDataUploaded = (data: { students: any[]; faculty: any[]; classrooms: any[]; subjects: any[] }) => {
    const timetableData: TimetableData = {
      students: data.students,
      faculty: data.faculty,
      classrooms: data.classrooms,
      subjects: data.subjects,
      constraints: {
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        workingHours: { start: '08:00', end: '18:00' },
        breakTime: { start: '12:00', end: '13:00' },
        maxClassesPerDay: 8,
        maxClassesPerFacultyPerDay: 6
      }
    };
    
    setInstitutionData(timetableData);
    setShowUploadModal(false);
  };

  const handleGenerate = async () => {
    if (!institutionData) {
      setShowUploadModal(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    setTimetable([]);
    setTimetableResult(null);
    setGenerationProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 10;
        });
      }, 500);

      const result = await aiService.generateTimetable(institutionData);
      
      clearInterval(progressInterval);
      setGenerationProgress(100);
      
      setTimetable(result.timetable);
      setTimetableResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate timetable with AI.');
      console.error('AI Generation Error:', err);
    } finally {
      setIsLoading(false);
      setGenerationProgress(0);
    }
  };

  // Group timetable by day
  const groupedTimetable = timetable.reduce((acc, entry) => {
    if (!acc[entry.day]) {
      acc[entry.day] = [];
    }
    acc[entry.day].push(entry);
    return acc;
  }, {} as Record<string, TimetableEntry[]>);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="min-h-screen bg-indigo-950 text-white">
      {/* Header */}
      <div className="bg-indigo-900 px-6 py-4 border-b border-indigo-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold">NIT Srinagar - AI Timetable Management</h1>
                <p className="text-indigo-300 text-sm">Schedule &gt; AI Generated</p>
              </div>
            </Link>
          </div>
          <div className="flex space-x-4">
            <button 
              onClick={() => setShowUploadModal(true)}
              className="px-6 py-3 bg-gray-700 text-white font-semibold rounded-lg shadow-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75 transition-all duration-200"
            >
              📊 Upload Data
            </button>
            <button 
              onClick={handleGenerate} 
              disabled={isLoading} 
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-75 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '🤖 AI Generating...' : '✨ Generate Timetable'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {isLoading && (
            <div className="mb-6 p-6 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <div>
                  <h3 className="text-lg font-semibold text-white">AI is generating your timetable...</h3>
                  <p className="text-gray-400">Processing {institutionData?.students.length} students, {institutionData?.faculty.length} faculty, and {institutionData?.classrooms.length} classrooms</p>
                </div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${generationProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-400 mt-2">{Math.round(generationProgress)}% complete</p>
            </div>
          )}

          {timetable.length > 0 ? (
            <div>
              <h2 className="text-xl font-bold mb-6">Generated Timetable</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {days.map((day) => (
                  <div key={day} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <h3 className="font-bold text-lg mb-4 text-center">{day}</h3>
                    <div className="space-y-3">
                      {groupedTimetable[day]?.map((entry, index) => (
                        <div key={index} className="bg-gray-700/50 rounded-lg p-3 border border-gray-600 hover:bg-gray-700 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-indigo-300">{entry.startTime} - {entry.endTime}</span>
                            <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"></div>
                          </div>
                          <div className="space-y-1">
                            <p className="font-semibold text-white">{entry.subject}</p>
                            <p className="text-sm text-gray-300">{entry.faculty}</p>
                            <p className="text-xs text-gray-400">{entry.classroom}</p>
                          </div>
                        </div>
                      )) || (
                        <p className="text-gray-500 text-center py-4">No classes scheduled</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">NIT Srinagar - AI Timetable Generation</h3>
              <p className="text-gray-400 mb-6">
                {institutionData 
                  ? `Ready to generate optimized timetable for ${institutionData.students.length} students, ${institutionData.faculty.length} faculty, and ${institutionData.classrooms.length} classrooms at NIT Srinagar`
                  : 'Upload your NIT Srinagar institution data first, then let AI create an optimized timetable for your engineering programs'
                }
              </p>
              {!institutionData && (
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors"
                >
                  📊 Upload NIT Srinagar Data
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="w-80 bg-gray-800/30 border-l border-gray-700 p-6">
          <div className="space-y-6">
            {/* Stats Section */}
            <div className="bg-gray-700/50 rounded-lg p-4">
              <h3 className="font-bold text-lg mb-4">🤖 AI TIMETABLE STATS</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Total Classes</span>
                  <span className="font-semibold">{timetableResult?.stats.totalClasses || timetable.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Days Scheduled</span>
                  <span className="font-semibold">{Object.keys(groupedTimetable).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Utilization Rate</span>
                  <span className="font-semibold">{timetableResult?.stats.utilizationRate || 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Conflicts</span>
                  <span className={`font-semibold ${timetableResult?.stats.conflicts === 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {timetableResult?.stats.conflicts || 0}
                  </span>
                </div>
                {institutionData && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Students</span>
                      <span className="font-semibold">{institutionData.students.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Faculty</span>
                      <span className="font-semibold">{institutionData.faculty.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Classrooms</span>
                      <span className="font-semibold">{institutionData.classrooms.length}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Faculty Section */}
            <div className="bg-gray-700/50 rounded-lg p-4">
              <h3 className="font-bold text-lg mb-4">FACULTY WORKLOAD</h3>
              <div className="space-y-3">
                {Object.entries(
                  timetable.reduce((acc, entry) => {
                    acc[entry.faculty] = (acc[entry.faculty] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([faculty, count]) => (
                  <div key={faculty} className="flex items-center justify-between">
                    <span className="text-sm text-gray-300 truncate">{faculty}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full" 
                          style={{ width: `${Math.min((count / Math.max(...Object.values(timetable.reduce((acc, entry) => {
                            acc[entry.faculty] = (acc[entry.faculty] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>)))) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-semibold">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Schedule Overview */}
            <div className="bg-gray-700/50 rounded-lg p-4">
              <h3 className="font-bold text-lg mb-4">SCHEDULE OVERVIEW</h3>
              <div className="space-y-2">
                {days.map((day) => (
                  <div key={day} className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">{day}</span>
                    <div className="flex space-x-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div 
                          key={i} 
                          className={`w-2 h-2 rounded-full ${
                            groupedTimetable[day] && groupedTimetable[day].length > i 
                              ? 'bg-gradient-to-r from-purple-500 to-indigo-500' 
                              : 'bg-gray-600'
                          }`}
                        ></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Recommendations */}
            {timetableResult?.optimization.recommendations && timetableResult.optimization.recommendations.length > 0 && (
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h3 className="font-bold text-lg mb-4">🤖 AI RECOMMENDATIONS</h3>
                <div className="space-y-3">
                  {timetableResult.optimization.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-gray-300">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Data Upload Modal */}
      <DataUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onDataUploaded={handleDataUploaded}
      />
    </div>
  );
};

export default GeneratorPage;