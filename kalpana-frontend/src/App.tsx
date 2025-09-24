// src/App.tsx

import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import FacultyManagement from './pages/FacultyManagement';
import ClassroomManagement from './pages/ClassroomManagement';

// A simple component for a 404 Not Found page
const NotFound = () => <h1>Page Not Found</h1>;

function App() {
  const navStyle = {
    background: '#222',
    padding: '1rem',
    display: 'flex',
    gap: '1rem',
  };
  const linkStyle = {
    color: 'white',
    textDecoration: 'none',
  };

  return (
    <BrowserRouter>
      <div>
        {/* Navigation Bar */}
        <nav style={navStyle}>
          <Link to="/faculty" style={linkStyle}>Manage Faculty</Link>
          <Link to="/classrooms" style={linkStyle}>Manage Classrooms</Link>
        </nav>

        {/* Page Content */}
        <Routes>
          {/* Redirect home to /faculty without adding a history entry */}
          <Route path="/" element={<Navigate to="/faculty" replace />} />
          
          <Route path="/faculty" element={<FacultyManagement />} />
          <Route path="/classrooms" element={<ClassroomManagement />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;