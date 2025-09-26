// src/pages/ClassroomManagement.tsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, query, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";

interface Classroom {
  id: string;
  name: string;
  capacity: number;
  type: 'lecture' | 'lab' | 'seminar' | 'computer';
  features: string[];
  location?: string;
  equipment?: string[];
}

const ClassroomManagement: React.FC = () => {
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState<number | ''>('');
  const [type, setType] = useState<'lecture' | 'lab' | 'seminar' | 'computer'>('lecture');
  const [features, setFeatures] = useState('');
  const [location, setLocation] = useState('');
  const [equipment, setEquipment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [classroomList, setClassroomList] = useState<Classroom[]>([]);
  const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');

  const classroomTypes = [
    { value: 'lecture', label: 'Lecture Hall', icon: '🎓' },
    { value: 'lab', label: 'Laboratory', icon: '🔬' },
    { value: 'computer', label: 'Computer Lab', icon: '💻' },
    { value: 'seminar', label: 'Seminar Room', icon: '👥' }
  ];

  const locations = [
    'Main Building',
    'Engineering Block',
    'Science Block',
    'Computer Center',
    'Workshop Block',
    'Library Building',
    'Administrative Block'
  ];

  useEffect(() => {
    const q = query(collection(db, "classrooms"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const classroomData: Classroom[] = [];
      querySnapshot.forEach((doc) => {
        classroomData.push({ ...doc.data(), id: doc.id } as Classroom);
      });
      setClassroomList(classroomData);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !capacity || !type) {
      alert('Please fill out all required fields.');
      return;
    }
    setIsLoading(true);

    try {
      const classroomData = {
        name: name,
        capacity: Number(capacity),
        type: type,
        features: features.split(',').map(f => f.trim()).filter(f => f),
        location: location || '',
        equipment: equipment.split(',').map(e => e.trim()).filter(e => e)
      };

      if (editingClassroom) {
        await updateDoc(doc(db, 'classrooms', editingClassroom.id), classroomData);
        alert(`Classroom "${name}" updated successfully!`);
      } else {
        await addDoc(collection(db, 'classrooms'), classroomData);
      alert(`Classroom "${name}" added successfully!`);
      }
      
      resetForm();
    } catch (error) {
      console.error("Error saving document: ", error);
      alert("An error occurred while saving the classroom.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setCapacity('');
    setType('lecture');
    setFeatures('');
    setLocation('');
    setEquipment('');
    setEditingClassroom(null);
    setShowAddForm(false);
  };

  const handleEdit = (classroom: Classroom) => {
    setEditingClassroom(classroom);
    setName(classroom.name);
    setCapacity(classroom.capacity);
    setType(classroom.type);
    setFeatures(classroom.features.join(', '));
    setLocation(classroom.location || '');
    setEquipment(classroom.equipment?.join(', ') || '');
    setShowAddForm(true);
  };

  const handleDelete = async (classroomId: string, classroomName: string) => {
    if (window.confirm(`Are you sure you want to delete ${classroomName}?`)) {
      try {
        await deleteDoc(doc(db, 'classrooms', classroomId));
        alert(`${classroomName} deleted successfully!`);
      } catch (error) {
        console.error("Error deleting document: ", error);
        alert("An error occurred while deleting the classroom.");
      }
    }
  };

  const filteredClassrooms = classroomList.filter(classroom => {
    const matchesSearch = classroom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         classroom.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || classroom.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getTypeIcon = (type: string) => {
    const typeInfo = classroomTypes.find(t => t.value === type);
    return typeInfo?.icon || '🏫';
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'lecture': return 'from-blue-500 to-blue-600';
      case 'lab': return 'from-green-500 to-green-600';
      case 'computer': return 'from-purple-500 to-purple-600';
      case 'seminar': return 'from-orange-500 to-orange-600';
      default: return 'from-gray-500 to-gray-600';
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
                <h1 className="text-2xl font-bold">NIT Srinagar - Classroom Management</h1>
                <p className="text-indigo-300 text-sm">Manage &gt; Classrooms</p>
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
            Add Classroom
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
                placeholder="Search classrooms by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="md:w-64">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                {classroomTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.icon} {type.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Classroom Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredClassrooms.map((classroom, index) => (
                <motion.div
                  key={classroom.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-purple-500/50 transition-all duration-300 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${getTypeColor(classroom.type)} rounded-xl flex items-center justify-center text-2xl`}>
                      {getTypeIcon(classroom.type)}
                    </div>
                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => handleEdit(classroom)}
                        className="p-2 bg-blue-600/20 hover:bg-blue-600/40 rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(classroom.id, classroom.name)}
                        className="p-2 bg-red-600/20 hover:bg-red-600/40 rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-white mb-2">{classroom.name}</h3>
                  <p className="text-purple-300 text-sm mb-3">
                    {classroomTypes.find(t => t.value === classroom.type)?.label}
                  </p>
                  
                  {classroom.location && (
                    <p className="text-gray-400 text-sm mb-3 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {classroom.location}
                    </p>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-300">
                      <svg className="w-4 h-4 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Capacity: {classroom.capacity} students
                    </div>
                    <div className="flex items-center text-sm text-gray-300">
                      <svg className="w-4 h-4 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {classroom.features.length} Features
                    </div>
                  </div>
                  
                  {classroom.features.length > 0 && (
                    <div className="mt-4">
                      <div className="flex flex-wrap gap-1">
                        {classroom.features.slice(0, 3).map((feature, idx) => (
                          <span key={idx} className="px-2 py-1 bg-purple-600/20 text-purple-300 text-xs rounded-full">
                            {feature}
                          </span>
                        ))}
                        {classroom.features.length > 3 && (
                          <span className="px-2 py-1 bg-gray-600/20 text-gray-400 text-xs rounded-full">
                            +{classroom.features.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredClassrooms.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">No Classrooms Found</h3>
              <p className="text-gray-400 mb-6">
                {classroomList.length === 0 
                  ? "Start by adding your first classroom to the system"
                  : "Try adjusting your search or filter criteria"
                }
              </p>
              {classroomList.length === 0 && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors"
                >
                  Add First Classroom
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
              <h3 className="font-bold text-lg mb-4">🏫 CLASSROOM STATS</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Total Classrooms</span>
                  <span className="font-semibold">{classroomList.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Total Capacity</span>
                  <span className="font-semibold">{classroomList.reduce((sum, room) => sum + room.capacity, 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Locations</span>
                  <span className="font-semibold">{new Set(classroomList.map(r => r.location).filter(Boolean)).size}</span>
                </div>
              </div>
            </div>

            {/* Type Breakdown */}
            <div className="bg-gray-700/50 rounded-lg p-4">
              <h3 className="font-bold text-lg mb-4">TYPE BREAKDOWN</h3>
              <div className="space-y-2">
                {classroomTypes.map(type => {
                  const count = classroomList.filter(r => r.type === type.value).length;
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
                            style={{ width: `${Math.min((count / Math.max(...classroomTypes.map(t => classroomList.filter(r => r.type === t.value).length))) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-semibold">{count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Capacity Distribution */}
            <div className="bg-gray-700/50 rounded-lg p-4">
              <h3 className="font-bold text-lg mb-4">CAPACITY DISTRIBUTION</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Small (&lt;30)</span>
                  <span className="font-semibold">{classroomList.filter(r => r.capacity < 30).length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Medium (30-60)</span>
                  <span className="font-semibold">{classroomList.filter(r => r.capacity >= 30 && r.capacity <= 60).length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Large (&gt;60)</span>
                  <span className="font-semibold">{classroomList.filter(r => r.capacity > 60).length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>

      {/* Add/Edit Classroom Modal */}
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
                  {editingClassroom ? 'Edit Classroom' : 'Add New Classroom'}
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
                    <label className="block text-sm font-medium text-gray-300 mb-2">Classroom Name *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="LH-101"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Capacity *</label>
                    <input
                      type="number"
                      value={capacity}
                      onChange={(e) => setCapacity(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="50"
                      min="1"
                      max="500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Type *</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as 'lecture' | 'lab' | 'seminar' | 'computer')}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    >
                      {classroomTypes.map(typeOption => (
                        <option key={typeOption.value} value={typeOption.value}>
                          {typeOption.icon} {typeOption.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                    <select
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select Location</option>
                      {locations.map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Features</label>
                  <input
                    type="text"
                    value={features}
                    onChange={(e) => setFeatures(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="projector, smartboard, air conditioning (comma-separated)"
                  />
                </div>

      <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Equipment</label>
                  <input
                    type="text"
                    value={equipment}
                    onChange={(e) => setEquipment(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="computers, lab equipment, whiteboard (comma-separated)"
                  />
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
                    {isLoading ? 'Saving...' : editingClassroom ? 'Update Classroom' : 'Add Classroom'}
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

export default ClassroomManagement;