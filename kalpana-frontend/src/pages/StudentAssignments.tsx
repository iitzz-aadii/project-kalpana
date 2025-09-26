// src/pages/StudentAssignments.tsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, query, onSnapshot, where, orderBy } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

interface Assignment {
  id: string;
  title: string;
  description: string;
  subject: string;
  dueDate: string;
  type: 'assignment' | 'test' | 'project';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  createdBy: string;
  createdByName: string;
  createdAt: Date;
}

interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  submittedAt: Date;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  status: 'submitted' | 'late' | 'graded';
  grade?: number;
  feedback?: string;
}

const StudentAssignments: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  const subjects = [
    'Computer Science & Engineering',
    'Electronics & Communication Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electrical Engineering',
    'Chemical Engineering',
    'Information Technology',
    'Mathematics',
    'Physics',
    'Chemistry'
  ];

  const assignmentTypes = [
    { value: 'assignment', label: 'Assignment', icon: '📝' },
    { value: 'test', label: 'Test/Quiz', icon: '📋' },
    { value: 'project', label: 'Project', icon: '🚀' }
  ];

  useEffect(() => {
    // Fetch assignments
    const assignmentsQuery = query(collection(db, "assignments"));
    const unsubscribeAssignments = onSnapshot(assignmentsQuery, (querySnapshot) => {
      const assignmentData: Assignment[] = [];
      querySnapshot.forEach((doc) => {
        assignmentData.push({ ...doc.data(), id: doc.id } as Assignment);
      });
      // Sort by createdAt in JavaScript instead of Firestore
      assignmentData.sort((a, b) => {
        const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
        const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });
      setAssignments(assignmentData);
    });

    // Fetch submissions for current student
    const submissionsQuery = query(collection(db, "submissions"));
    const unsubscribeSubmissions = onSnapshot(submissionsQuery, (querySnapshot) => {
      const submissionData: Submission[] = [];
      querySnapshot.forEach((doc) => {
        const submission = { ...doc.data(), id: doc.id } as Submission;
        // Filter by studentId in JavaScript instead of Firestore
        if (submission.studentId === "current-student-id") { // This should come from auth context
          submissionData.push(submission);
        }
      });
      // Sort by submittedAt in JavaScript instead of Firestore
      submissionData.sort((a, b) => {
        const dateA = a.submittedAt instanceof Date ? a.submittedAt : new Date(a.submittedAt);
        const dateB = b.submittedAt instanceof Date ? b.submittedAt : new Date(b.submittedAt);
        return dateB.getTime() - dateA.getTime();
      });
      setSubmissions(submissionData);
    });

    return () => {
      unsubscribeAssignments();
      unsubscribeSubmissions();
    };
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type (only PDF allowed for submissions)
      if (file.type !== 'application/pdf') {
        alert('Please upload only PDF files for submissions');
        return;
      }

      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }

      setSubmissionFile(file);
    }
  };

  const uploadSubmissionFile = async (file: File): Promise<string> => {
    const fileName = `submission_${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `submissions/${fileName}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  };

  const handleSubmitAssignment = async () => {
    if (!selectedAssignment || !submissionFile) {
      alert('Please select a file to submit');
      return;
    }

    setIsSubmitting(true);
    setUploadingFile(true);

    try {
      const fileUrl = await uploadSubmissionFile(submissionFile);
      const isLate = new Date() > new Date(selectedAssignment.dueDate);

      const submissionData = {
        assignmentId: selectedAssignment.id,
        studentId: 'current-student-id', // This should come from auth context
        studentName: 'Current Student', // This should come from auth context
        submittedAt: new Date(),
        fileUrl,
        fileName: submissionFile.name,
        fileSize: submissionFile.size,
        status: isLate ? 'late' : 'submitted'
      };

      await addDoc(collection(db, 'submissions'), submissionData);
      alert('Assignment submitted successfully!');
      
      setShowSubmissionModal(false);
      setSelectedAssignment(null);
      setSubmissionFile(null);
    } catch (error) {
      console.error("Error submitting assignment: ", error);
      alert("An error occurred while submitting the assignment.");
    } finally {
      setIsSubmitting(false);
      setUploadingFile(false);
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || assignment.type === selectedType;
    const matchesSubject = !selectedSubject || assignment.subject === selectedSubject;
    return matchesSearch && matchesType && matchesSubject;
  });

  const getTypeIcon = (type: string) => {
    const typeInfo = assignmentTypes.find(t => t.value === type);
    return typeInfo?.icon || '📝';
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'assignment': return 'from-blue-500 to-blue-600';
      case 'test': return 'from-green-500 to-green-600';
      case 'project': return 'from-purple-500 to-purple-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const isSubmitted = (assignmentId: string) => {
    return submissions.some(submission => submission.assignmentId === assignmentId);
  };

  const getSubmissionStatus = (assignmentId: string) => {
    const submission = submissions.find(sub => sub.assignmentId === assignmentId);
    if (!submission) return null;
    return submission;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'text-green-400';
      case 'late': return 'text-red-400';
      case 'graded': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted': return '✅';
      case 'late': return '⚠️';
      case 'graded': return '📊';
      default: return '📝';
    }
  };

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
                <h1 className="text-2xl font-bold">NIT Srinagar - My Assignments</h1>
                <p className="text-indigo-300 text-sm">Student &gt; Assignments & Tests</p>
              </div>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-300">Total Assignments</p>
              <p className="text-2xl font-bold text-purple-400">{assignments.length}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-300">Submitted</p>
              <p className="text-2xl font-bold text-green-400">{submissions.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Search and Filter */}
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search assignments by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="md:w-48">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                {assignmentTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.icon} {type.label}</option>
                ))}
              </select>
            </div>
            <div className="md:w-64">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">All Subjects</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Assignments Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredAssignments.map((assignment, index) => {
                const submission = getSubmissionStatus(assignment.id);
                const submitted = isSubmitted(assignment.id);
                const overdue = isOverdue(assignment.dueDate);
                
                return (
                  <motion.div
                    key={assignment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={`bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border transition-all duration-300 group ${
                      submitted 
                        ? 'border-green-500/50 hover:border-green-400/70' 
                        : overdue 
                          ? 'border-red-500/50 hover:border-red-400/70'
                          : 'border-gray-700 hover:border-purple-500/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${getTypeColor(assignment.type)} rounded-xl flex items-center justify-center text-2xl`}>
                        {getTypeIcon(assignment.type)}
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        {submitted && (
                          <div className={`flex items-center space-x-1 text-sm ${getStatusColor(submission?.status || 'submitted')}`}>
                            <span>{getStatusIcon(submission?.status || 'submitted')}</span>
                            <span className="capitalize">{submission?.status || 'submitted'}</span>
                          </div>
                        )}
                        {overdue && !submitted && (
                          <div className="flex items-center space-x-1 text-sm text-red-400">
                            <span>⚠️</span>
                            <span>Overdue</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-white mb-2">{assignment.title}</h3>
                    <p className="text-purple-300 text-sm mb-3">{assignment.subject}</p>
                    
                    {assignment.description && (
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">{assignment.description}</p>
                    )}
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-300">
                        <svg className="w-4 h-4 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Due: {new Date(assignment.dueDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-sm text-gray-300">
                        <svg className="w-4 h-4 mr-2 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        By: {assignment.createdByName}
                      </div>
                    </div>
                    
                    {assignment.fileName && (
                      <div className="mt-4 p-3 bg-gray-700/50 rounded-lg mb-4">
                        <div className="flex items-center text-sm text-gray-300">
                          <svg className="w-4 h-4 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="truncate">{assignment.fileName}</span>
                          <span className="ml-2 text-xs text-gray-400">
                            ({assignment.fileSize ? formatFileSize(assignment.fileSize) : 'Unknown size'})
                          </span>
                        </div>
                        {assignment.fileUrl && (
                          <a
                            href={assignment.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex items-center text-sm text-purple-400 hover:text-purple-300 transition-colors"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            Download Assignment
                          </a>
                        )}
                      </div>
                    )}

                    <div className="flex space-x-2">
                      {!submitted && (
                        <button
                          onClick={() => {
                            setSelectedAssignment(assignment);
                            setShowSubmissionModal(true);
                          }}
                          className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                            overdue
                              ? 'bg-red-600 hover:bg-red-700 text-white'
                              : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white'
                          }`}
                        >
                          {overdue ? 'Submit Late' : 'Submit Assignment'}
                        </button>
                      )}
                      {submitted && submission?.grade && (
                        <div className="flex-1 px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg text-center">
                          Grade: {submission.grade}
                        </div>
                      )}
                    </div>

                    {submitted && submission?.feedback && (
                      <div className="mt-3 p-3 bg-gray-700/30 rounded-lg">
                        <p className="text-sm text-gray-300">
                          <span className="font-semibold">Feedback:</span> {submission.feedback}
                        </p>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {filteredAssignments.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">No Assignments Found</h3>
              <p className="text-gray-400 mb-6">
                {assignments.length === 0 
                  ? "No assignments have been posted yet"
                  : "Try adjusting your search or filter criteria"
                }
              </p>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="w-80 bg-gray-800/30 border-l border-gray-700 p-6">
          <div className="space-y-6">
            {/* Stats Section */}
            <div className="bg-gray-700/50 rounded-lg p-4">
              <h3 className="font-bold text-lg mb-4">📊 MY PROGRESS</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Total Assignments</span>
                  <span className="font-semibold">{assignments.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Submitted</span>
                  <span className="font-semibold text-green-400">{submissions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Pending</span>
                  <span className="font-semibold text-yellow-400">{assignments.length - submissions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Overdue</span>
                  <span className="font-semibold text-red-400">{assignments.filter(a => isOverdue(a.dueDate) && !isSubmitted(a.id)).length}</span>
                </div>
              </div>
            </div>

            {/* Recent Submissions */}
            <div className="bg-gray-700/50 rounded-lg p-4">
              <h3 className="font-bold text-lg mb-4">RECENT SUBMISSIONS</h3>
              <div className="space-y-3">
                {submissions.slice(0, 3).map(submission => {
                  const assignment = assignments.find(a => a.id === submission.assignmentId);
                  return (
                    <div key={submission.id} className="text-sm">
                      <p className="text-white font-medium truncate">{assignment?.title || 'Unknown Assignment'}</p>
                      <p className="text-gray-400 text-xs">
                        {new Date(submission.submittedAt).toLocaleDateString()}
                      </p>
                      <div className={`text-xs ${getStatusColor(submission.status)}`}>
                        {getStatusIcon(submission.status)} {submission.status}
                      </div>
                    </div>
                  );
                })}
                {submissions.length === 0 && (
                  <p className="text-gray-400 text-sm">No submissions yet</p>
                )}
              </div>
            </div>

            {/* Upcoming Deadlines */}
            <div className="bg-gray-700/50 rounded-lg p-4">
              <h3 className="font-bold text-lg mb-4">UPCOMING DEADLINES</h3>
              <div className="space-y-2">
                {assignments
                  .filter(a => !isOverdue(a.dueDate) && !isSubmitted(a.id))
                  .slice(0, 3)
                  .map(assignment => (
                    <div key={assignment.id} className="text-sm">
                      <p className="text-white font-medium truncate">{assignment.title}</p>
                      <p className="text-gray-400 text-xs">
                        Due: {new Date(assignment.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                {assignments.filter(a => !isOverdue(a.dueDate) && !isSubmitted(a.id)).length === 0 && (
                  <p className="text-gray-400 text-sm">No upcoming deadlines</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submission Modal */}
      <AnimatePresence>
        {showSubmissionModal && selectedAssignment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowSubmissionModal(false);
              setSelectedAssignment(null);
              setSubmissionFile(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl p-8 max-w-lg w-full border border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Submit Assignment</h2>
                <button
                  onClick={() => {
                    setShowSubmissionModal(false);
                    setSelectedAssignment(null);
                    setSubmissionFile(null);
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">{selectedAssignment.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{selectedAssignment.subject}</p>
                <div className="flex items-center text-sm text-gray-300">
                  <svg className="w-4 h-4 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Due: {new Date(selectedAssignment.dueDate).toLocaleDateString()}
                  {isOverdue(selectedAssignment.dueDate) && (
                    <span className="ml-2 px-2 py-1 bg-red-600/20 text-red-400 text-xs rounded-full">
                      Overdue
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Upload Your Submission (PDF only)</label>
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-purple-500 transition-colors">
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    accept=".pdf"
                    className="hidden"
                    id="submission-upload"
                  />
                  <label htmlFor="submission-upload" className="cursor-pointer">
                    {submissionFile ? (
                      <div className="text-green-400">
                        <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="font-semibold">{submissionFile.name}</p>
                        <p className="text-sm text-gray-400">{formatFileSize(submissionFile.size)}</p>
                      </div>
                    ) : (
                      <div className="text-gray-400">
                        <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="font-semibold">Click to upload PDF</p>
                        <p className="text-sm">Only PDF files allowed (Max 10MB)</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setShowSubmissionModal(false);
                    setSelectedAssignment(null);
                    setSubmissionFile(null);
                  }}
                  className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitAssignment}
                  disabled={!submissionFile || isSubmitting || uploadingFile}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadingFile ? 'Uploading...' : isSubmitting ? 'Submitting...' : 'Submit Assignment'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentAssignments;
