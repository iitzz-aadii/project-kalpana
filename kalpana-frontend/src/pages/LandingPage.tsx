// src/pages/LandingPage.tsx

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from '../components/AuthModal';
import RoleSelectionModal from '../components/RoleSelectionModal';

// Animated Background Component
const AnimatedBackground = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -100]);
  const y3 = useTransform(scrollY, [0, 300], [0, -150]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Floating geometric shapes */}
      <motion.div
        style={{ y: y1 }}
        className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-full blur-xl"
        animate={{
          y: [0, -20, 0],
          x: [0, 10, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        style={{ y: y2 }}
        className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl"
        animate={{
          y: [0, 30, 0],
          x: [0, -15, 0],
          scale: [1, 0.9, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        style={{ y: y3 }}
        className="absolute bottom-40 left-1/4 w-16 h-16 bg-gradient-to-r from-indigo-500/20 to-pink-500/20 rounded-full blur-xl"
        animate={{
          y: [0, -25, 0],
          x: [0, 20, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
    </div>
  );
};

// Floating particles component
const FloatingParticles = () => {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    delay: Math.random() * 5,
  }));

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-1 h-1 bg-white/30 rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 8,
            delay: particle.delay,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
};

// 3D Card Component
const FeatureCard = ({ icon, title, description, delay = 0 }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
}) => {
  const { ref, inView } = useInView({
    threshold: 0.2,
    triggerOnce: false
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, rotateX: -15 }}
      animate={inView ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 50, rotateX: -15 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ 
        y: -10, 
        rotateX: 5,
        scale: 1.02,
        transition: { duration: 0.3 }
      }}
      className="group relative z-10"
    >
        <div className="relative bg-white/5 backdrop-blur-sm rounded-3xl p-10 border border-white/10 overflow-hidden">
          {/* Hover effect overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100"
            transition={{ duration: 0.3 }}
          />
          
          {/* Content */}
          <div className="relative z-10">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="w-20 h-20 bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 rounded-3xl flex items-center justify-center mb-8 shadow-xl"
            >
              {icon}
            </motion.div>
            <h3 className="text-2xl font-semibold text-white mb-6 tracking-tight">{title}</h3>
            <p className="text-gray-300 leading-relaxed text-base font-normal">{description}</p>
          </div>
        </div>
    </motion.div>
  );
};

// Stats Counter Component
const StatCounter = ({ value, label, delay = 0 }: {
  value: string;
  label: string;
  delay?: number;
}) => {
  const { ref, inView } = useInView({
    threshold: 0.2,
    triggerOnce: false
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
      transition={{ duration: 0.6, delay }}
      className="text-center z-10"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={inView ? { scale: 1 } : {}}
        transition={{ duration: 0.8, delay: delay + 0.2, type: "spring", stiffness: 200 }}
        className="text-5xl font-bold text-white mb-4 tracking-tight"
      >
        {value}
      </motion.div>
      <div className="text-gray-300 text-lg font-semibold uppercase tracking-wider">{label}</div>
    </motion.div>
  );
};

const LandingPage: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const { currentUser, userRole, logout, setUserRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Show role selection modal when user is logged in but doesn't have a role
  useEffect(() => {
    if (currentUser && !userRole && !authModalOpen) {
      setRoleModalOpen(true);
    }
  }, [currentUser, userRole, authModalOpen]);


  const handleRoleSelect = (role: 'admin' | 'faculty' | 'student') => {
    setUserRole(role);
    setRoleModalOpen(false);
    
    // Automatically redirect based on role
    switch (role) {
      case 'admin':
        navigate('/generator');
        break;
      case 'faculty':
        navigate('/schedule');
        break;
      case 'student':
        navigate('/schedule');
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-950 relative overflow-hidden">
      <AnimatedBackground />
      <FloatingParticles />
      
      {/* Mouse follower */}
      <motion.div
        className="fixed w-6 h-6 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full blur-sm pointer-events-none z-50"
        style={{
          left: mousePosition.x - 12,
          top: mousePosition.y - 12,
          transform: 'translate3d(0, 0, 0)',
        }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 30,
          mass: 0.8
        }}
      />

      {/* Navigation */}
      <nav className="relative z-10 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight font-display">TIMEWISE</h1>
                <p className="text-xs text-purple-300 font-medium tracking-widest uppercase">AI TIMETABLE SYSTEM</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-10">
              {userRole && (userRole === 'admin' ? [
                { name: 'Generate', path: '/generator' },
                { name: 'Faculty', path: '/faculty' },
                { name: 'Classrooms', path: '/classrooms' }
              ] : userRole === 'faculty' ? [
                { name: 'My Schedule', path: '/schedule' },
                { name: 'Classes', path: '/classes' }
              ] : userRole === 'student' ? [
                { name: 'My Schedule', path: '/schedule' },
                { name: 'Assignments', path: '/assignments' }
              ] : []).map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="text-gray-200 hover:text-white font-medium text-lg transition-colors duration-300 relative group"
                >
                  {item.name}
                  <div className="absolute -bottom-2 left-0 w-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500 group-hover:w-full transition-all duration-300" />
                </Link>
              ))}
              {currentUser ? (
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <span className="text-white font-medium block">Welcome, {currentUser.email}</span>
                    {userRole && (
                      <span className="text-purple-300 text-sm capitalize">
                        {userRole} Account
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => logout()}
                    className="px-6 py-3 bg-red-600 text-white font-semibold text-sm rounded-xl hover:bg-red-700 transition-all duration-300"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setAuthMode('signup');
                    setAuthModalOpen(true);
                  }}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white font-semibold text-lg rounded-2xl hover:from-purple-700 hover:via-indigo-700 hover:to-blue-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
                >
                  GET STARTED
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 py-24">
        <div className="text-center mb-24">
          <div className="mb-8">
            <h1 className="text-7xl font-bold text-white mb-6 leading-none tracking-tight">
              <span className="block font-display">AI-POWERED</span>
              <span className="block bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent font-display">
                TIMETABLE
              </span>
              <span className="block text-5xl font-semibold text-gray-200 font-display">MANAGEMENT</span>
            </h1>
            <div className="w-32 h-1 bg-gradient-to-r from-purple-500 to-indigo-500 mx-auto rounded-full"></div>
          </div>
          
          <p className="text-xl text-gray-200 mb-16 max-w-5xl mx-auto leading-relaxed font-normal">
            <span className="font-semibold text-white">Revolutionize</span> your educational institution's scheduling with our 
            <span className="font-semibold text-purple-300"> intelligent timetable generator</span>. 
            Create optimal schedules that minimize conflicts and maximize efficiency using 
            <span className="font-semibold text-indigo-300"> cutting-edge AI algorithms</span>.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
            {currentUser && userRole ? (
              <Link 
                to={userRole === 'admin' ? '/generator' : '/schedule'} 
                className="group inline-flex items-center px-12 py-6 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white font-semibold text-xl rounded-3xl shadow-2xl hover:from-purple-700 hover:via-indigo-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 hover:shadow-3xl"
              >
                <svg className="w-7 h-7 mr-4 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {userRole === 'admin' ? 'GENERATE TIMETABLE' : 
                 userRole === 'faculty' ? 'VIEW MY SCHEDULE' : 
                 'VIEW MY SCHEDULE'}
              </Link>
            ) : (
              <button
                onClick={() => {
                  setAuthMode('login');
                  setAuthModalOpen(true);
                }}
                className="group inline-flex items-center px-12 py-6 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white font-semibold text-xl rounded-3xl shadow-2xl hover:from-purple-700 hover:via-indigo-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 hover:shadow-3xl"
              >
                <svg className="w-7 h-7 mr-4 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                SIGN IN TO START
              </button>
            )}
            <button className="group px-12 py-6 border-3 border-white/30 text-white font-semibold text-xl rounded-3xl hover:bg-white/10 transition-all duration-300 backdrop-blur-sm hover:border-white/50">
              <svg className="w-7 h-7 mr-4 inline group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h8a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2z" />
              </svg>
              WATCH DEMO
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: false, margin: "-100px" }}
          className="grid md:grid-cols-3 gap-8 mb-24 relative z-10"
        >
          <FeatureCard
            icon={
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
            title="AI-Powered Generation"
            description="Advanced genetic algorithms automatically generate conflict-free timetables in seconds, optimizing for faculty preferences and resource availability."
            delay={0}
          />
          <FeatureCard
            icon={
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
            title="Real-time Analytics"
            description="Comprehensive dashboard with faculty workload distribution, classroom utilization, and schedule optimization metrics."
            delay={0.2}
          />
          <FeatureCard
            icon={
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
            }
            title="Easy Management"
            description="Intuitive interface for managing faculty, classrooms, and subjects. Drag-and-drop functionality for quick adjustments."
            delay={0.4}
          />
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: false, margin: "-100px" }}
          className="bg-white/5 backdrop-blur-sm rounded-3xl p-16 border border-white/10 mb-24 relative z-10"
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-8 tracking-tight">TRUSTED BY EDUCATIONAL INSTITUTIONS</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-indigo-500 mx-auto rounded-full mb-6"></div>
            <p className="text-xl text-gray-300 font-medium">Join thousands of schools and universities worldwide</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            <StatCounter value="500+" label="Institutions" delay={0} />
            <StatCounter value="50K+" label="Schedules Generated" delay={0.2} />
            <StatCounter value="99.9%" label="Uptime" delay={0.4} />
            <StatCounter value="24/7" label="Support" delay={0.6} />
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: false, margin: "-100px" }}
          className="text-center relative z-10"
        >
          <h2 className="text-5xl font-bold text-white mb-8 tracking-tight">READY TO TRANSFORM YOUR SCHEDULING?</h2>
          <div className="w-32 h-1 bg-gradient-to-r from-purple-500 to-indigo-500 mx-auto rounded-full mb-12"></div>
          <p className="text-xl text-gray-300 mb-16 max-w-4xl mx-auto font-medium">
            Start generating <span className="font-semibold text-purple-300">optimized timetables</span> in minutes. 
            <span className="font-semibold text-indigo-300"> No complex setup required</span>.
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            {currentUser && userRole ? (
              <Link 
                to={userRole === 'admin' ? '/generator' : '/schedule'} 
                className="group inline-flex items-center px-16 py-8 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white font-semibold text-2xl rounded-3xl shadow-2xl hover:from-purple-700 hover:via-indigo-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 hover:shadow-3xl"
              >
                <svg className="w-8 h-8 mr-4 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {userRole === 'admin' ? 'START GENERATING NOW' : 
                 userRole === 'faculty' ? 'VIEW MY SCHEDULE' : 
                 'VIEW MY SCHEDULE'}
              </Link>
            ) : (
              <button
                onClick={() => {
                  setAuthMode('signup');
                  setAuthModalOpen(true);
                }}
                className="group inline-flex items-center px-16 py-8 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white font-semibold text-2xl rounded-3xl shadow-2xl hover:from-purple-700 hover:via-indigo-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 hover:shadow-3xl"
              >
                <svg className="w-8 h-8 mr-4 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                GET STARTED NOW
              </button>
            )}
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="relative z-10 border-t border-white/10 py-12"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-3 mb-6 md:mb-0"
            >
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </motion.div>
              <span className="text-xl font-bold text-white">TimeWise</span>
            </motion.div>
            <div className="text-gray-400 text-lg">
              © 2024 TimeWise. All rights reserved.
            </div>
          </div>
        </div>
      </motion.footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />

      {/* Role Selection Modal */}
      <RoleSelectionModal
        isOpen={roleModalOpen}
        onRoleSelect={handleRoleSelect}
        userEmail={currentUser?.email || ''}
      />
    </div>
  );
};

export default LandingPage;