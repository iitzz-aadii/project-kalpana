// src/components/DataUploadModal.tsx

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Student, Faculty, Classroom, Subject } from '../services/aiService';

interface DataUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataUploaded: (data: { students: Student[]; faculty: Faculty[]; classrooms: Classroom[]; subjects: Subject[] }) => void;
}

type UploadStep = 'select' | 'upload' | 'preview' | 'complete';

const DataUploadModal: React.FC<DataUploadModalProps> = ({ isOpen, onClose, onDataUploaded }) => {
  const [currentStep, setCurrentStep] = useState<UploadStep>('select');
  const [uploadedData, setUploadedData] = useState<{
    students: Student[];
    faculty: Faculty[];
    classrooms: Classroom[];
    subjects: Subject[];
  }>({
    students: [],
    faculty: [],
    classrooms: [],
    subjects: []
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      // Validate and process the data
      const processedData = {
        students: data.students || [],
        faculty: data.faculty || [],
        classrooms: data.classrooms || [],
        subjects: data.subjects || []
      };

      setUploadedData(processedData);
      setCurrentStep('preview');
    } catch (err) {
      setError('Invalid file format. Please upload a valid JSON file.');
      console.error('File processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualData = () => {
    // Generate sample data for demonstration
    const sampleData = {
      students: generateSampleStudents(),
      faculty: generateSampleFaculty(),
      classrooms: generateSampleClassrooms(),
      subjects: generateSampleSubjects()
    };
    
    setUploadedData(sampleData);
    setCurrentStep('preview');
  };

  const handleConfirm = () => {
    onDataUploaded(uploadedData);
    setCurrentStep('complete');
    setTimeout(() => {
      onClose();
      setCurrentStep('select');
      setUploadedData({ students: [], faculty: [], classrooms: [], subjects: [] });
    }, 2000);
  };

  const generateSampleStudents = (): Student[] => {
    const departments = ['Computer Science & Engineering', 'Electronics & Communication Engineering', 'Mechanical Engineering', 'Civil Engineering', 'Electrical Engineering', 'Chemical Engineering', 'Information Technology'];
    const years = [1, 2, 3, 4];
    const sections = ['A', 'B', 'C'];
    
    return Array.from({ length: 280 }, (_, i) => ({
      id: `NIT${String(i + 1).padStart(3, '0')}`,
      name: `Student ${i + 1}`,
      email: `student${i + 1}@nitsri.ac.in`,
      department: departments[i % departments.length],
      year: years[i % years.length],
      section: sections[i % sections.length],
      subjects: [`SUB${String((i % 6) + 1).padStart(3, '0')}`]
    }));
  };

  const generateSampleFaculty = (): Faculty[] => {
    const departments = ['Computer Science & Engineering', 'Electronics & Communication Engineering', 'Mechanical Engineering', 'Civil Engineering', 'Electrical Engineering', 'Chemical Engineering', 'Information Technology'];
    const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Data Structures', 'Algorithms', 'Digital Electronics', 'Thermodynamics', 'Fluid Mechanics', 'Structural Analysis', 'Power Systems', 'Chemical Process', 'Database Management'];
    
    return Array.from({ length: 45 }, (_, i) => ({
      id: `NITFAC${String(i + 1).padStart(3, '0')}`,
      name: `Dr. Faculty ${i + 1}`,
      email: `faculty${i + 1}@nitsri.ac.in`,
      department: departments[i % departments.length],
      subjects: [subjects[i % subjects.length]],
      maxHoursPerWeek: 18 + (i % 8),
      preferredTimeSlots: ['09:00-10:00', '10:00-11:00', '11:00-12:00', '14:00-15:00'],
      unavailableTimeSlots: []
    }));
  };

  const generateSampleClassrooms = (): Classroom[] => {
    const types: ('lecture' | 'lab' | 'seminar' | 'computer')[] = ['lecture', 'lab', 'seminar', 'computer'];
    const buildings = ['Main Building', 'Engineering Block', 'Science Block', 'Computer Center', 'Workshop Block'];
    
    return Array.from({ length: 35 }, (_, i) => ({
      id: `NITROOM${String(i + 1).padStart(3, '0')}`,
      name: `Room ${i + 1}`,
      capacity: 40 + (i % 6) * 15,
      type: types[i % types.length],
      equipment: i % 3 === 0 ? ['Projector', 'Whiteboard', 'Sound System'] : 
                 i % 3 === 1 ? ['Computers', 'Projector', 'Network'] : 
                 ['Lab Equipment', 'Safety Gear', 'Whiteboard'],
      location: buildings[i % buildings.length]
    }));
  };

  const generateSampleSubjects = (): Subject[] => {
    const subjects = [
      { name: 'Mathematics-I', code: 'MATH101', credits: 4, type: 'theory' as const, dept: 'All Departments' },
      { name: 'Physics', code: 'PHYS101', credits: 3, type: 'theory' as const, dept: 'All Departments' },
      { name: 'Chemistry', code: 'CHEM101', credits: 3, type: 'theory' as const, dept: 'All Departments' },
      { name: 'Data Structures', code: 'CS201', credits: 4, type: 'theory' as const, dept: 'Computer Science & Engineering' },
      { name: 'Programming Lab', code: 'CS202', credits: 2, type: 'practical' as const, dept: 'Computer Science & Engineering' },
      { name: 'Digital Electronics', code: 'EC201', credits: 4, type: 'theory' as const, dept: 'Electronics & Communication Engineering' },
      { name: 'Thermodynamics', code: 'ME201', credits: 4, type: 'theory' as const, dept: 'Mechanical Engineering' },
      { name: 'Structural Analysis', code: 'CE201', credits: 4, type: 'theory' as const, dept: 'Civil Engineering' },
      { name: 'Power Systems', code: 'EE201', credits: 4, type: 'theory' as const, dept: 'Electrical Engineering' },
      { name: 'Chemical Process', code: 'CH201', credits: 4, type: 'theory' as const, dept: 'Chemical Engineering' },
      { name: 'Database Management', code: 'IT201', credits: 4, type: 'theory' as const, dept: 'Information Technology' },
      { name: 'Engineering Drawing', code: 'ENG101', credits: 2, type: 'practical' as const, dept: 'All Departments' }
    ];
    
    return subjects.map((subject, i) => ({
      id: `SUB${String(i + 1).padStart(3, '0')}`,
      name: subject.name,
      code: subject.code,
      credits: subject.credits,
      hoursPerWeek: subject.credits,
      type: subject.type,
      department: subject.dept,
      prerequisites: []
    }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-900 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Upload NIT Srinagar Data</h2>
              <p className="text-gray-400">Provide your NIT Srinagar institution data for AI-powered timetable generation</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              {['select', 'upload', 'preview', 'complete'].map((step, index) => (
                <div key={step} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                    currentStep === step ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white' :
                    ['select', 'upload', 'preview', 'complete'].indexOf(currentStep) > index ? 'bg-green-500 text-white' :
                    'bg-gray-700 text-gray-400'
                  }`}>
                    {index + 1}
                  </div>
                  {index < 3 && (
                    <div className={`w-16 h-1 mx-2 ${
                      ['select', 'upload', 'preview', 'complete'].indexOf(currentStep) > index ? 'bg-green-500' : 'bg-gray-700'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          {currentStep === 'select' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="mb-8">
                <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Choose Data Source</h3>
                <p className="text-gray-400 mb-8">Select how you want to provide your institution's data</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-8 bg-gray-800/50 border-2 border-dashed border-gray-600 rounded-xl hover:border-purple-500 transition-colors group"
                >
                  <svg className="w-12 h-12 text-gray-400 group-hover:text-purple-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h4 className="text-xl font-semibold text-white mb-2">Upload JSON File</h4>
                  <p className="text-gray-400">Upload a structured JSON file with your institution's data</p>
                </button>

                <button
                  onClick={handleManualData}
                  className="p-8 bg-gray-800/50 border-2 border-dashed border-gray-600 rounded-xl hover:border-purple-500 transition-colors group"
                >
                  <svg className="w-12 h-12 text-gray-400 group-hover:text-purple-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <h4 className="text-xl font-semibold text-white mb-2">Use Sample Data</h4>
                  <p className="text-gray-400">Generate sample data for testing and demonstration</p>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </motion.div>
          )}

          {currentStep === 'preview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="text-2xl font-bold text-white mb-6">Data Preview</h3>
              
              {error && (
                <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                  <p className="text-red-400">{error}</p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-800/50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-white mb-4">📚 Students</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Students:</span>
                      <span className="text-white font-semibold">{uploadedData.students.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Departments:</span>
                      <span className="text-white font-semibold">
                        {new Set(uploadedData.students.map(s => s.department)).size}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-white mb-4">👨‍🏫 Faculty</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Faculty:</span>
                      <span className="text-white font-semibold">{uploadedData.faculty.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Departments:</span>
                      <span className="text-white font-semibold">
                        {new Set(uploadedData.faculty.map(f => f.department)).size}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-white mb-4">🏫 Classrooms</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Rooms:</span>
                      <span className="text-white font-semibold">{uploadedData.classrooms.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Capacity:</span>
                      <span className="text-white font-semibold">
                        {uploadedData.classrooms.reduce((sum, room) => sum + room.capacity, 0)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-white mb-4">📖 Subjects</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Subjects:</span>
                      <span className="text-white font-semibold">{uploadedData.subjects.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Theory/Practical:</span>
                      <span className="text-white font-semibold">
                        {uploadedData.subjects.filter(s => s.type === 'theory').length}/
                        {uploadedData.subjects.filter(s => s.type === 'practical').length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setCurrentStep('select')}
                  className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors"
                >
                  Confirm & Generate
                </button>
              </div>
            </motion.div>
          )}

          {currentStep === 'complete' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Data Uploaded Successfully!</h3>
              <p className="text-gray-400">Your institution data has been processed and is ready for AI timetable generation.</p>
            </motion.div>
          )}

          {isProcessing && (
            <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center rounded-2xl">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white font-semibold">Processing your data...</p>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DataUploadModal;
