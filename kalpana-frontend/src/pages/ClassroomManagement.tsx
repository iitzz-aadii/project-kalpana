// src/pages/ClassroomManagement.tsx

import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, query, onSnapshot } from "firebase/firestore";

interface Classroom {
  id: string;
  name: string;
  capacity: number;
  type: string;
  features: string[];
}

const ClassroomManagement: React.FC = () => {
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState<number | ''>('');
  const [type, setType] = useState('');
  const [features, setFeatures] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [classroomList, setClassroomList] = useState<Classroom[]>([]);

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
      await addDoc(collection(db, 'classrooms'), {
        name: name,
        capacity: Number(capacity),
        type: type,
        features: features.split(',').map(f => f.trim()),
      });
      alert(`Classroom "${name}" added successfully!`);
      setName('');
      setCapacity('');
      setType('');
      setFeatures('');
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("An error occurred while adding the classroom.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <h1>Manage Classrooms</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: '40px' }}>
        <div style={{ marginBottom: '10px' }}>
          <label>Classroom Name/Number:</label><br />
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: '8px' }}/>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Capacity:</label><br />
          <input
            type="number"
            value={capacity}
            onChange={(e) => {
              const value = e.target.value;
              setCapacity(value === '' ? '' : Number(value));
            }}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Type (e.g., Lecture Hall, Lab):</label><br />
          <input type="text" value={type} onChange={(e) => setType(e.target.value)} style={{ width: '100%', padding: '8px' }}/>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Features (comma-separated):</label><br />
          <input type="text" placeholder="e.g., projector, smartboard" value={features} onChange={(e) => setFeatures(e.target.value)} style={{ width: '100%', padding: '8px' }}/>
        </div>
        <button type="submit" disabled={isLoading} style={{ padding: '10px 15px' }}>
          {isLoading ? 'Adding...' : 'Add Classroom'}
        </button>
      </form>

      <div>
        <h2>Classroom List</h2>
        {classroomList.length === 0 ? (
          <p>No classrooms found.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {classroomList.map((room) => (
              <li key={room.id} style={{ border: '1px solid #444', padding: '10px', marginBottom: '10px', borderRadius: '5px' }}>
                <strong>{room.name}</strong> ({room.type})<br />
                <small>Capacity: {room.capacity} | Features: {room.features.join(', ')}</small>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ClassroomManagement;