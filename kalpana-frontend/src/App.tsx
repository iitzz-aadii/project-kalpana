// src/App.tsx

import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import FacultyManagement from './pages/FacultyManagement';
import ClassroomManagement from './pages/ClassroomManagement';
import GeneratorPage from './pages/GeneratorPage';

const NotFound = () => <h1 className="p-8 text-2xl font-bold">Page Not Found</h1>;

function App() {
  // We no longer need the navStyle and linkStyle variables

  return (
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
        </nav>

        {/* Page Content */}
        <Routes>
          <Route path="/" element={<Navigate to="/generator" />} />
          <Route path="/generator" element={<GeneratorPage />} />
          <Route path="/faculty" element={<FacultyManagement />} />
          <Route path="/classrooms" element={<ClassroomManagement />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;