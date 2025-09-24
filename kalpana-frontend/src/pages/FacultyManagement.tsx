// src/pages/FacultyManagement.tsx

import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, query, onSnapshot } from "firebase/firestore";

// Define a type for our faculty data for better code quality
interface Faculty {
  id: string;
  name: string;
  department: string;
  subjectCodes: string[];
}

const FacultyManagement: React.FC = () => {
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [subjectCodes, setSubjectCodes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // NEW: State to hold the list of faculty members
  const [facultyList, setFacultyList] = useState<Faculty[]>([]);

  // NEW: useEffect to fetch data in real-time
  useEffect(() => {
    const q = query(collection(db, "faculty"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const facultyData: Faculty[] = [];
      querySnapshot.forEach((doc) => {
        facultyData.push({ ...doc.data(), id: doc.id } as Faculty);
      });
      setFacultyList(facultyData);
    });

    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, []); // Empty dependency array means this runs once on mount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !department) {
      alert('Please fill in at least Name and Department.');
      return;
    }
    setIsLoading(true);

    try {
      const facultyCollectionRef = collection(db, 'faculty');
      await addDoc(facultyCollectionRef, {
        name: name,
        department: department,
        subjectCodes: subjectCodes.split(',').map(code => code.trim()),
      });
      alert(`Faculty member "${name}" added successfully!`);
      setName('');
      setDepartment('');
      setSubjectCodes('');
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("An error occurred while adding the faculty member.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <h1>Manage Faculty</h1>
      {/* --- FORM (No changes here) --- */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '40px' }}>
        {/* ... form fields ... */}
        <div style={{ marginBottom: '10px' }}>
          <label>Full Name:</label><br />
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: '8px' }}/>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Department:</label><br />
          <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} style={{ width: '100%', padding: '8px' }}/>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Subject Codes (comma-separated):</label><br />
          <input type="text" placeholder="e.g., CS101, PH203, MA101" value={subjectCodes} onChange={(e) => setSubjectCodes(e.target.value)} style={{ width: '100%', padding: '8px' }}/>
        </div>
        <button type="submit" disabled={isLoading} style={{ padding: '10px 15px' }}>
          {isLoading ? 'Adding...' : 'Add Faculty'}
        </button>
      </form>

      {/* --- NEW: FACULTY LIST --- */}
      <div>
        <h2>Faculty List</h2>
        {facultyList.length === 0 ? (
          <p>No faculty members found. Add one using the form above.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {facultyList.map((faculty) => (
              <li key={faculty.id} style={{ border: '1px solid #444', padding: '10px', marginBottom: '10px', borderRadius: '5px' }}>
                <strong>{faculty.name}</strong> ({faculty.department})<br />
                <small>Subjects: {faculty.subjectCodes.join(', ')}</small>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default FacultyManagement;