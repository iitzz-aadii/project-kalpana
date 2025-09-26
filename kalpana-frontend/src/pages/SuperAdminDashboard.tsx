// Super Admin Dashboard for managing all colleges nationwide
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

interface College {
  id: string;
  name: string;
  domain: string;
  contactEmail: string;
  isActive: boolean;
  subscriptionTier: 'free' | 'premium' | 'enterprise';
  maxUsers: number;
  maxFaculty: number;
  maxStudents: number;
  createdAt: string;
  stats: {
    totalUsers: number;
    totalFaculty: number;
    totalStudents: number;
    activeTimetables: number;
  };
}

interface DashboardStats {
  totalColleges: number;
  activeColleges: number;
  totalUsers: number;
  totalFaculty: number;
  totalStudents: number;
  totalTimetables: number;
  revenue: number;
}

const SuperAdminDashboard: React.FC = () => {
  const { userRole } = useAuth();
  const [colleges, setColleges] = useState<College[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
  const [showCollegeModal, setShowCollegeModal] = useState(false);

  useEffect(() => {
    if (userRole !== 'super_admin') {
      return;
    }
    loadDashboardData();
  }, [userRole]);

  const loadDashboardData = async () => {
    try {
      // Mock data - replace with actual API calls
      const mockColleges: College[] = [
        {
          id: 'nit-srinagar-001',
          name: 'NIT Srinagar',
          domain: 'nit-srinagar.ac.in',
          contactEmail: 'admin@nit-srinagar.ac.in',
          isActive: true,
          subscriptionTier: 'premium',
          maxUsers: 1000,
          maxFaculty: 100,
          maxStudents: 2000,
          createdAt: '2024-01-15',
          stats: {
            totalUsers: 150,
            totalFaculty: 25,
            totalStudents: 120,
            activeTimetables: 3
          }
        },
        {
          id: 'iit-delhi-002',
          name: 'IIT Delhi',
          domain: 'iitd.ac.in',
          contactEmail: 'admin@iitd.ac.in',
          isActive: true,
          subscriptionTier: 'enterprise',
          maxUsers: 5000,
          maxFaculty: 500,
          maxStudents: 10000,
          createdAt: '2024-02-01',
          stats: {
            totalUsers: 800,
            totalFaculty: 150,
            totalStudents: 650,
            activeTimetables: 8
          }
        },
        {
          id: 'du-delhi-003',
          name: 'Delhi University',
          domain: 'du.ac.in',
          contactEmail: 'admin@du.ac.in',
          isActive: false,
          subscriptionTier: 'free',
          maxUsers: 100,
          maxFaculty: 20,
          maxStudents: 500,
          createdAt: '2024-03-10',
          stats: {
            totalUsers: 45,
            totalFaculty: 8,
            totalStudents: 35,
            activeTimetables: 1
          }
        }
      ];

      const mockStats: DashboardStats = {
        totalColleges: mockColleges.length,
        activeColleges: mockColleges.filter(c => c.isActive).length,
        totalUsers: mockColleges.reduce((sum, c) => sum + c.stats.totalUsers, 0),
        totalFaculty: mockColleges.reduce((sum, c) => sum + c.stats.totalFaculty, 0),
        totalStudents: mockColleges.reduce((sum, c) => sum + c.stats.totalStudents, 0),
        totalTimetables: mockColleges.reduce((sum, c) => sum + c.stats.activeTimetables, 0),
        revenue: 125000
      };

      setColleges(mockColleges);
      setStats(mockStats);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCollegeClick = (college: College) => {
    setSelectedCollege(college);
    setShowCollegeModal(true);
  };

  const handleToggleCollegeStatus = async (collegeId: string) => {
    try {
      // TODO: API call to toggle college status
      setColleges(prev => prev.map(college => 
        college.id === collegeId 
          ? { ...college, isActive: !college.isActive }
          : college
      ));
    } catch (error) {
      console.error('Failed to toggle college status:', error);
    }
  };

  const handleUpgradeSubscription = async (collegeId: string, newTier: string) => {
    try {
      // TODO: API call to upgrade subscription
      setColleges(prev => prev.map(college => 
        college.id === collegeId 
          ? { ...college, subscriptionTier: newTier as any }
          : college
      ));
    } catch (error) {
      console.error('Failed to upgrade subscription:', error);
    }
  };

  if (userRole !== 'super_admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
              <p className="text-gray-600">Manage all colleges nationwide</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Add New College
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Export Data
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Colleges</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalColleges}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Colleges</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.activeColleges}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Revenue</p>
                  <p className="text-2xl font-semibold text-gray-900">₹{stats.revenue.toLocaleString()}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Colleges Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Colleges</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    College
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Domain
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subscription
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Users
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {colleges.map((college, index) => (
                  <motion.tr
                    key={college.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleCollegeClick(college)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {college.name.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{college.name}</div>
                          <div className="text-sm text-gray-500">{college.contactEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {college.domain}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        college.subscriptionTier === 'enterprise' ? 'bg-purple-100 text-purple-800' :
                        college.subscriptionTier === 'premium' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {college.subscriptionTier}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {college.stats.totalUsers} / {college.maxUsers}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        college.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {college.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleCollegeStatus(college.id);
                          }}
                          className={`px-3 py-1 rounded text-xs ${
                            college.isActive 
                              ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {college.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpgradeSubscription(college.id, 'premium');
                          }}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
                        >
                          Upgrade
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* College Details Modal */}
      {showCollegeModal && selectedCollege && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">{selectedCollege.name}</h3>
                <button
                  onClick={() => setShowCollegeModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Domain</label>
                  <p className="text-sm text-gray-900">{selectedCollege.domain}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Email</label>
                  <p className="text-sm text-gray-900">{selectedCollege.contactEmail}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Subscription Tier</label>
                  <p className="text-sm text-gray-900 capitalize">{selectedCollege.subscriptionTier}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Created</label>
                  <p className="text-sm text-gray-900">{new Date(selectedCollege.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Users</label>
                  <p className="text-sm text-gray-900">{selectedCollege.stats.totalUsers} / {selectedCollege.maxUsers}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Faculty</label>
                  <p className="text-sm text-gray-900">{selectedCollege.stats.totalFaculty} / {selectedCollege.maxFaculty}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Students</label>
                  <p className="text-sm text-gray-900">{selectedCollege.stats.totalStudents} / {selectedCollege.maxStudents}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Active Timetables</label>
                  <p className="text-sm text-gray-900">{selectedCollege.stats.activeTimetables}</p>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowCollegeModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Close
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  Edit College
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
