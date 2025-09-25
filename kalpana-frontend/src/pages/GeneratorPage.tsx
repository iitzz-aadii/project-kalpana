// src/pages/GeneratorPage.tsx

import React, { useState } from 'react';

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
    // Main container with padding, max-width, and centered
    <div className="p-4 md:p-8 max-w-7xl mx-auto text-white">
      <h1 className="text-4xl font-bold mb-2">Timetable Generator</h1>
      <p className="text-gray-400 mb-6">Click the button to run the AI and generate an optimized timetable.</p>
      
      {/* Styled button with hover effect and transition */}
      <button 
        onClick={handleGenerate} 
        disabled={isLoading} 
        className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75 transition-colors duration-200 mb-8 disabled:bg-gray-500"
      >
        {isLoading ? 'Generating...' : '✨ Generate Timetable'}
      </button>

      {error && <p className="text-red-500 bg-red-100 p-3 rounded-lg">{error}</p>}

      {timetable.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Generated Timetable</h2>
          {/* Table with a container for overflow on small screens */}
          <div className="overflow-x-auto rounded-lg shadow-lg">
            <table className="w-full text-left">
              <thead className="bg-gray-700">
                <tr>
                  <th className="p-4 font-semibold">Day</th>
                  <th className="p-4 font-semibold">Time</th>
                  <th className="p-4 font-semibold">Subject</th>
                  <th className="p-4 font-semibold">Faculty</th>
                  <th className="p-4 font-semibold">Classroom</th>
                </tr>
              </thead>
              <tbody>
                {timetable.map((entry, index) => (
                  <tr key={index} className="border-t border-gray-700 bg-gray-800 hover:bg-gray-700">
                    <td className="p-4">{entry.day}</td>
                    <td className="p-4">{entry.time}</td>
                    <td className="p-4">{entry.subject}</td>
                    <td className="p-4">{entry.faculty}</td>
                    <td className="p-4">{entry.classroom}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneratorPage;