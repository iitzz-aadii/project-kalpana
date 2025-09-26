// src/pages/FacultyManagement.tsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, query, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";

// Define a type for our faculty data for better code quality
interface Faculty {
  id: string;
  name: string;
  email?: string;
  department: string;
  subjectCodes: string[];
  maxHoursPerWeek?: number;
  preferredTimeSlots?: string[];
  unavailableTimeSlots?: string[];
}

const FacultyManagement: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [subjectCodes, setSubjectCodes] = useState('');
  const [maxHoursPerWeek, setMaxHoursPerWeek] = useState<number | ''>('');
  const [preferredTimeSlots, setPreferredTimeSlots] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  const departments = [
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

  useEffect(() => {
    const q = query(collection(db, "faculty"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const facultyData: Faculty[] = [];
      querySnapshot.forEach((doc) => {
        facultyData.push({ ...doc.data(), id: doc.id } as Faculty);
      });
      setFacultyList(facultyData);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !department) {
      alert('Please fill in at least Name and Department.');
      return;
    }
    setIsLoading(true);

    try {
      const facultyData = {
        name: name,
        email: email || '',
        department: department,
        subjectCodes: subjectCodes.split(',').map(code => code.trim()).filter(code => code),
        maxHoursPerWeek: maxHoursPerWeek ? Number(maxHoursPerWeek) : 20,
        preferredTimeSlots: preferredTimeSlots.split(',').map(slot => slot.trim()).filter(slot => slot),
        unavailableTimeSlots: []
      };

      if (editingFaculty) {
        await updateDoc(doc(db, 'faculty', editingFaculty.id), facultyData);
        alert(`Faculty member "${name}" updated successfully!`);
      } else {
        await addDoc(collection(db, 'faculty'), facultyData);
        alert(`Faculty member "${name}" added successfully!`);
      }
      
      resetForm();
    } catch (error) {
      console.error("Error saving document: ", error);
      alert("An error occurred while saving the faculty member.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setDepartment('');
    setSubjectCodes('');
    setMaxHoursPerWeek('');
    setPreferredTimeSlots('');
    setEditingFaculty(null);
    setShowAddForm(false);
  };

  const handleEdit = (faculty: Faculty) => {
    setEditingFaculty(faculty);
    setName(faculty.name);
    setEmail(faculty.email || '');
    setDepartment(faculty.department);
    setSubjectCodes(faculty.subjectCodes.join(', '));
    setMaxHoursPerWeek(faculty.maxHoursPerWeek || '');
    setPreferredTimeSlots(faculty.preferredTimeSlots?.join(', ') || '');
    setShowAddForm(true);
  };

  const handleDelete = async (facultyId: string, facultyName: string) => {
    if (window.confirm(`Are you sure you want to delete ${facultyName}?`)) {
      try {
        await deleteDoc(doc(db, 'faculty', facultyId));
        alert(`${facultyName} deleted successfully!`);
      } catch (error) {
        console.error("Error deleting document: ", error);
        alert("An error occurred while deleting the faculty member.");
      }
    }
  };

  const filteredFaculty = facultyList.filter(faculty => {
    const matchesSearch = faculty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faculty.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !selectedDepartment || faculty.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

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
                <h1 className="text-2xl font-bold">NIT Srinagar - Faculty Management</h1>
                <p className="text-indigo-300 text-sm">Manage &gt; Faculty Members</p>
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
            Add Faculty
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
                placeholder="Search faculty by name or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="md:w-64">
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Faculty Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredFaculty.map((faculty, index) => (
                <motion.div
                  key={faculty.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-purple-500/50 transition-all duration-300 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => handleEdit(faculty)}
                        className="p-2 bg-blue-600/20 hover:bg-blue-600/40 rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(faculty.id, faculty.name)}
                        className="p-2 bg-red-600/20 hover:bg-red-600/40 rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-white mb-2">{faculty.name}</h3>
                  <p className="text-purple-300 text-sm mb-3">{faculty.department}</p>
                  
                  {faculty.email && (
                    <p className="text-gray-400 text-sm mb-3">{faculty.email}</p>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-300">
                      <svg className="w-4 h-4 mr-2 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      {faculty.subjectCodes.length} Subjects
                    </div>
                    <div className="flex items-center text-sm text-gray-300">
                      <svg className="w-4 h-4 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Max {faculty.maxHoursPerWeek || 20} hrs/week
                    </div>
                  </div>
                  
                  {faculty.subjectCodes.length > 0 && (
                    <div className="mt-4">
                      <div className="flex flex-wrap gap-1">
                        {faculty.subjectCodes.slice(0, 3).map((code, idx) => (
                          <span key={idx} className="px-2 py-1 bg-purple-600/20 text-purple-300 text-xs rounded-full">
                            {code}
                          </span>
                        ))}
                        {faculty.subjectCodes.length > 3 && (
                          <span className="px-2 py-1 bg-gray-600/20 text-gray-400 text-xs rounded-full">
                            +{faculty.subjectCodes.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredFaculty.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">No Faculty Found</h3>
              <p className="text-gray-400 mb-6">
                {facultyList.length === 0 
                  ? "Start by adding your first faculty member to the system"
                  : "Try adjusting your search or filter criteria"
                }
              </p>
              {facultyList.length === 0 && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors"
                >
                  Add First Faculty Member
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
              <h3 className="font-bold text-lg mb-4">👨‍🏫 FACULTY STATS</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Total Faculty</span>
                  <span className="font-semibold">{facultyList.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Departments</span>
                  <span className="font-semibold">{new Set(facultyList.map(f => f.department)).size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Total Subjects</span>
                  <span className="font-semibold">{new Set(facultyList.flatMap(f => f.subjectCodes)).size}</span>
                </div>
              </div>
            </div>

            {/* Department Breakdown */}
            <div className="bg-gray-700/50 rounded-lg p-4">
              <h3 className="font-bold text-lg mb-4">DEPARTMENT BREAKDOWN</h3>
              <div className="space-y-2">
                {departments.map(dept => {
                  const count = facultyList.filter(f => f.department === dept).length;
                  if (count === 0) return null;
                  return (
                    <div key={dept} className="flex items-center justify-between">
                      <span className="text-sm text-gray-300 truncate">{dept}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-600 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full" 
                            style={{ width: `${Math.min((count / Math.max(...departments.map(d => facultyList.filter(f => f.department === d).length))) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-semibold">{count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Faculty Modal */}
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
                  {editingFaculty ? 'Edit Faculty Member' : 'Add New Faculty Member'}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Full Name *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Dr. John Smith"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="john.smith@nitsri.ac.in"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Department *</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Subject Codes</label>
                  <input
                    type="text"
                    value={subjectCodes}
                    onChange={(e) => setSubjectCodes(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="CS101, CS102, CS201 (comma-separated)"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Max Hours Per Week</label>
                    <input
                      type="number"
                      value={maxHoursPerWeek}
                      onChange={(e) => setMaxHoursPerWeek(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="20"
                      min="1"
                      max="40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Preferred Time Slots</label>
                    <input
                      type="text"
                      value={preferredTimeSlots}
                      onChange={(e) => setPreferredTimeSlots(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="09:00-10:00, 10:00-11:00 (comma-separated)"
                    />
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
                    disabled={isLoading}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Saving...' : editingFaculty ? 'Update Faculty' : 'Add Faculty'}
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

export default FacultyManagement;