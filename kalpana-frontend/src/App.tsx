// src/App.tsx

import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import FacultyManagement from './pages/FacultyManagement';
import ClassroomManagement from './pages/ClassroomManagement';
import GeneratorPage from './pages/GeneratorPage';
import AssignmentManagement from './pages/AssignmentManagement';
import StudentAssignments from './pages/StudentAssignments';
import EmbedPage from './pages/EmbedPage';
import ProtectedRoute from './components/ProtectedRoute';

const NotFound = () => <h1 className="p-8 text-2xl font-bold">Page Not Found</h1>;

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div>
          {/* Navigation Bar styled with Tailwind CSS */}
          <nav className="bg-gray-800 p-4 flex items-center gap-6 shadow-md">
            <Link to="/generator" className="text-white font-semibold hover:text-indigo-400 transition-colors">
              Generate Timetable
            </Link>
            <Link to="/faculty" className="text-white font-semibold hover:text-indigo-400 transition-colors">
              Manage Faculty
            </Link>
            <Link to="/classrooms" className="text-white font-semibold hover:text-indigo-400 transition-colors">
              Manage Classrooms
            </Link>
            <Link to="/assignments" className="text-white font-semibold hover:text-indigo-400 transition-colors">
              Assignments
            </Link>
            <Link to="/my-assignments" className="text-white font-semibold hover:text-indigo-400 transition-colors">
              My Assignments
            </Link>
          </nav>

          {/* Page Content */}
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/embed/:collegeId" element={<EmbedPage />} />
            <Route path="/embed/:collegeId/faculty/:facultyId" element={<EmbedPage />} />
            <Route path="/embed/:collegeId/student/:studentId" element={<EmbedPage />} />
            <Route path="/embed/:collegeId/login" element={<EmbedPage />} />
            <Route path="/generator" element={
              <ProtectedRoute>
                <GeneratorPage />
              </ProtectedRoute>
            } />
            <Route path="/faculty" element={
              <ProtectedRoute>
                <FacultyManagement />
              </ProtectedRoute>
            } />
            <Route path="/classrooms" element={
              <ProtectedRoute>
                <ClassroomManagement />
              </ProtectedRoute>
            } />
            <Route path="/assignments" element={
              <ProtectedRoute>
                <AssignmentManagement />
              </ProtectedRoute>
            } />
            <Route path="/my-assignments" element={
              <ProtectedRoute>
                <StudentAssignments />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;