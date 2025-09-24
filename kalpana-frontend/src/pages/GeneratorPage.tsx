// src/pages/GeneratorPage.tsx

import React, { useState } from 'react';

// Define a type for a single row in our timetable
interface TimetableEntry {
  day: string;
  time: string;
  subject: string;
  faculty: string;
  classroom: string;
}

const GeneratorPage: React.FC = () => {
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setTimetable([]);

    try {
      // This is the API call to our backend
      const response = await fetch('http://localhost:3001/generate');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data: TimetableEntry[] = await response.json();
      setTimetable(data);
    } catch (err) {
      setError('Failed to generate timetable. Please ensure the backend server is running.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: 'auto' }}>
      <h1>Timetable Generator</h1>
      <p>Click the button to run the AI and generate an optimized timetable based on the pre-set data.</p>
      
      <button onClick={handleGenerate} disabled={isLoading} style={{ padding: '10px 20px', fontSize: '1.2em', marginBottom: '20px', cursor: 'pointer' }}>
        {isLoading ? 'Generating...' : '✨ Generate Timetable'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {timetable.length > 0 && (
        <div>
          <h2>Generated Timetable</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#333' }}>
                <th style={{ border: '1px solid #555', padding: '10px' }}>Day</th>
                <th style={{ border: '1px solid #555', padding: '10px' }}>Time</th>
                <th style={{ border: '1px solid #555', padding: '10px' }}>Subject</th>
                <th style={{ border: '1px solid #555', padding: '10px' }}>Faculty</th>
                <th style={{ border: '1px solid #555', padding: '10px' }}>Classroom</th>
              </tr>
            </thead>
            <tbody>
              {timetable.map((entry, index) => (
                <tr key={index} style={{ background: index % 2 === 0 ? '#222' : '#282828' }}>
                  <td style={{ border: '1px solid #555', padding: '10px' }}>{entry.day}</td>
                  <td style={{ border: '1px solid #555', padding: '10px' }}>{entry.time}</td>
                  <td style={{ border: '1px solid #555', padding: '10px' }}>{entry.subject}</td>
                  <td style={{ border: '1px solid #555', padding: '10px' }}>{entry.faculty}</td>
                  <td style={{ border: '1px solid #555', padding: '10px' }}>{entry.classroom}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GeneratorPage;