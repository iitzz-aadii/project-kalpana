// src/components/RoleSelectionModal.tsx

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RoleSelectionModalProps {
  isOpen: boolean;
  onRoleSelect: (role: 'admin' | 'faculty' | 'student') => void;
  userEmail: string;
}

const RoleSelectionModal: React.FC<RoleSelectionModalProps> = ({ isOpen, onRoleSelect, userEmail }) => {
  const [selectedRole, setSelectedRole] = useState<'admin' | 'faculty' | 'student' | null>(null);

  const roles = [
    {
      id: 'admin' as const,
      title: 'Administrator',
      description: 'Manage the entire system, create timetables, and oversee all operations',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      color: 'from-red-500 to-pink-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-700'
    },
    {
      id: 'faculty' as const,
      title: 'Faculty Member',
      description: 'View schedules, manage your classes, and access teaching resources',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      color: 'from-blue-500 to-indigo-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700'
    },
    {
      id: 'student' as const,
      title: 'Student',
      description: 'View your class schedule, assignments, and academic information',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-700'
    }
  ];

  const handleContinue = () => {
    if (selectedRole) {
      onRoleSelect(selectedRole);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl max-h-[90vh] min-h-[500px] flex flex-col my-4"
        >
          {/* Header */}
          <div className="p-8 pb-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Role</h2>
              <p className="text-gray-600 mb-2">
                Welcome, <span className="font-semibold text-purple-600">{userEmail}</span>
              </p>
              <p className="text-gray-500 text-sm">
                Select your role to access the appropriate features and permissions
              </p>
            </div>
          </div>

          {/* Role Selection */}
          <div className="flex-1 px-8 pb-4 overflow-y-auto">
            <div className="grid gap-4">
              {roles.map((role) => (
                <motion.div
                  key={role.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative cursor-pointer rounded-2xl border-2 p-6 transition-all duration-300 ${
                    selectedRole === role.id
                      ? `${role.borderColor} ${role.bgColor} shadow-lg`
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                  onClick={() => setSelectedRole(role.id)}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${role.color} rounded-xl flex items-center justify-center text-white flex-shrink-0`}>
                      {role.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-xl font-semibold mb-2 ${selectedRole === role.id ? role.textColor : 'text-gray-900'}`}>
                        {role.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {role.description}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedRole === role.id
                          ? `${role.borderColor} ${role.bgColor}`
                          : 'border-gray-300'
                      }`}>
                        {selectedRole === role.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={`w-3 h-3 rounded-full bg-gradient-to-r ${role.color}`}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-3xl">
            <div className="flex justify-between items-center">
              <p className="text-gray-500 text-sm">
                You can change your role later in settings
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleContinue}
                disabled={!selectedRole}
                className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  selectedRole
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Continue
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RoleSelectionModal;
