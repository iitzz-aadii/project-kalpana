// src/pages/AssignmentManagement.tsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, query, onSnapshot, doc, updateDoc, deleteDoc, orderBy, where } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
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
  submissions?: Submission[];
  totalSubmissions?: number;
}

interface Submission {
  id: string;
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

const AssignmentManagement: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [type, setType] = useState<'assignment' | 'test' | 'project'>('assignment');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);

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
    const q = query(collection(db, "assignments"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
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
    return () => unsubscribe();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        alert('Please upload only PDF or Word documents (.pdf, .doc, .docx)');
        return;
      }

      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }

      setSelectedFile(file);
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    const fileName = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `assignments/${fileName}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !subject || !dueDate) {
      alert('Please fill in all required fields.');
      return;
    }

    setIsLoading(true);
    setUploadingFile(true);

    try {
      let fileUrl = '';
      let fileName = '';
      let fileSize = 0;

      if (selectedFile) {
        fileUrl = await uploadFile(selectedFile);
        fileName = selectedFile.name;
        fileSize = selectedFile.size;
      }

      const assignmentData = {
        title,
        description,
        subject,
        dueDate,
        type,
        fileUrl,
        fileName,
        fileSize,
        createdBy: 'current-user-id', // This should come from auth context
        createdByName: 'Current User', // This should come from auth context
        createdAt: new Date(),
        totalSubmissions: 0
      };

      if (editingAssignment) {
        await updateDoc(doc(db, 'assignments', editingAssignment.id), assignmentData);
        alert(`Assignment "${title}" updated successfully!`);
      } else {
        await addDoc(collection(db, 'assignments'), assignmentData);
        alert(`Assignment "${title}" created successfully!`);
      }
      
      resetForm();
    } catch (error) {
      console.error("Error saving assignment: ", error);
      alert("An error occurred while saving the assignment.");
    } finally {
      setIsLoading(false);
      setUploadingFile(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSubject('');
    setDueDate('');
    setType('assignment');
    setSelectedFile(null);
    setEditingAssignment(null);
    setShowAddForm(false);
  };

  const handleEdit = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setTitle(assignment.title);
    setDescription(assignment.description);
    setSubject(assignment.subject);
    setDueDate(assignment.dueDate);
    setType(assignment.type);
    setShowAddForm(true);
  };

  const handleDelete = async (assignmentId: string, assignmentTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${assignmentTitle}"?`)) {
      try {
        // Delete file from storage if exists
        const assignment = assignments.find(a => a.id === assignmentId);
        if (assignment?.fileUrl) {
          const fileRef = ref(storage, assignment.fileUrl);
          await deleteObject(fileRef);
        }
        
        await deleteDoc(doc(db, 'assignments', assignmentId));
        alert(`${assignmentTitle} deleted successfully!`);
      } catch (error) {
        console.error("Error deleting assignment: ", error);
        alert("An error occurred while deleting the assignment.");
      }
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
                <h1 className="text-2xl font-bold">NIT Srinagar - Assignment Management</h1>
                <p className="text-indigo-300 text-sm">Manage &gt; Assignments & Tests</p>
              </div>
            </Link>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-75 transition-all duration-200"
          >
            <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Assignment
          </button>
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
              {filteredAssignments.map((assignment, index) => (
                <motion.div
                  key={assignment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-purple-500/50 transition-all duration-300 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${getTypeColor(assignment.type)} rounded-xl flex items-center justify-center text-2xl`}>
                      {getTypeIcon(assignment.type)}
                    </div>
                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => handleEdit(assignment)}
                        className="p-2 bg-blue-600/20 hover:bg-blue-600/40 rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(assignment.id, assignment.title)}
                        className="p-2 bg-red-600/20 hover:bg-red-600/40 rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
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
                      {isOverdue(assignment.dueDate) && (
                        <span className="ml-2 px-2 py-1 bg-red-600/20 text-red-400 text-xs rounded-full">
                          Overdue
                        </span>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-gray-300">
                      <svg className="w-4 h-4 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {assignment.totalSubmissions || 0} submissions
                    </div>
                  </div>
                  
                  {assignment.fileName && (
                    <div className="mt-4 p-3 bg-gray-700/50 rounded-lg">
                      <div className="flex items-center text-sm text-gray-300">
                        <svg className="w-4 h-4 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="truncate">{assignment.fileName}</span>
                        <span className="ml-2 text-xs text-gray-400">
                          ({assignment.fileSize ? formatFileSize(assignment.fileSize) : 'Unknown size'})
                        </span>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
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
                  ? "Start by creating your first assignment or test"
                  : "Try adjusting your search or filter criteria"
                }
              </p>
              {assignments.length === 0 && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors"
                >
                  Create First Assignment
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
              <h3 className="font-bold text-lg mb-4">📊 ASSIGNMENT STATS</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Total Assignments</span>
                  <span className="font-semibold">{assignments.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Tests/Quizzes</span>
                  <span className="font-semibold">{assignments.filter(a => a.type === 'test').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Projects</span>
                  <span className="font-semibold">{assignments.filter(a => a.type === 'project').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Overdue</span>
                  <span className="font-semibold text-red-400">{assignments.filter(a => isOverdue(a.dueDate)).length}</span>
                </div>
              </div>
            </div>

            {/* Type Breakdown */}
            <div className="bg-gray-700/50 rounded-lg p-4">
              <h3 className="font-bold text-lg mb-4">TYPE BREAKDOWN</h3>
              <div className="space-y-2">
                {assignmentTypes.map(type => {
                  const count = assignments.filter(a => a.type === type.value).length;
                  if (count === 0) return null;
                  return (
                    <div key={type.value} className="flex items-center justify-between">
                      <span className="text-sm text-gray-300 flex items-center">
                        <span className="mr-2">{type.icon}</span>
                        {type.label}
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-600 rounded-full h-2">
                          <div 
                            className={`bg-gradient-to-r ${getTypeColor(type.value)} h-2 rounded-full`}
                            style={{ width: `${Math.min((count / Math.max(...assignmentTypes.map(t => assignments.filter(a => a.type === t.value).length))) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-semibold">{count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-700/50 rounded-lg p-4">
              <h3 className="font-bold text-lg mb-4">RECENT ACTIVITY</h3>
              <div className="space-y-2">
                {assignments.slice(0, 3).map(assignment => (
                  <div key={assignment.id} className="text-sm">
                    <p className="text-white font-medium truncate">{assignment.title}</p>
                    <p className="text-gray-400 text-xs">
                      {new Date(assignment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Assignment Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => resetForm()}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Assignment 1: Data Structures"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Describe the assignment requirements, instructions, and evaluation criteria..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Subject *</label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Subject</option>
                      {subjects.map(subj => (
                        <option key={subj} value={subj}>{subj}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Type *</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as 'assignment' | 'test' | 'project')}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    >
                      {assignmentTypes.map(typeOption => (
                        <option key={typeOption.value} value={typeOption.value}>
                          {typeOption.icon} {typeOption.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Due Date *</label>
                  <input
                    type="datetime-local"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Assignment File</label>
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-purple-500 transition-colors">
                    <input
                      type="file"
                      onChange={handleFileSelect}
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      {selectedFile ? (
                        <div className="text-green-400">
                          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="font-semibold">{selectedFile.name}</p>
                          <p className="text-sm text-gray-400">{formatFileSize(selectedFile.size)}</p>
                        </div>
                      ) : (
                        <div className="text-gray-400">
                          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="font-semibold">Click to upload file</p>
                          <p className="text-sm">PDF, DOC, DOCX (Max 10MB)</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || uploadingFile}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploadingFile ? 'Uploading...' : isLoading ? 'Saving...' : editingAssignment ? 'Update Assignment' : 'Create Assignment'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AssignmentManagement;
