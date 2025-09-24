// src/App.tsx

import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import FacultyManagement from './pages/FacultyManagement';
import ClassroomManagement from './pages/ClassroomManagement';
import GeneratorPage from './pages/GeneratorPage.tsx'; // <-- ADD THIS IMPORT

const NotFound = () => <h1 style={{padding: '20px'}}>Page Not Found</h1>;

function App() {
  const navStyle = {
    background: '#222',
    padding: '1rem',
    display: 'flex',
    gap: '1.5rem',
  };
  const linkStyle = {
    color: 'white',
    textDecoration: 'none',
    fontSize: '1.1em',
  };

  return (
    <BrowserRouter>
      <div>
        <nav style={navStyle}>
          {/* ADD THE NEW LINK HERE */}
          <Link to="/generator" style={linkStyle}>Generate Timetable</Link>
          <Link to="/faculty" style={linkStyle}>Manage Faculty</Link>
          <Link to="/classrooms" style={linkStyle}>Manage Classrooms</Link>
        </nav>

        <Routes>
          <Route path="/" element={<Navigate to="/generator" />} />
          {/* ADD THE NEW ROUTE HERE */}
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