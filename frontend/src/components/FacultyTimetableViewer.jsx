import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function FacultyTimetableViewer() {
  const [timetableData, setTimetableData] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [faculties, setFaculties] = useState([]);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const periods = [1, 2, 3, 4, 5, 6, 7, 8];

  useEffect(() => {
    fetchTimetableAndFaculty();
  }, []);

  const fetchTimetableAndFaculty = async () => {
    try {
      const [ttRes, facRes] = await Promise.all([
        axios.get('http://localhost:5000/api/get-timetable'),
        axios.get('http://localhost:5000/api/get-faculty')
      ]);
      setTimetableData(ttRes.data.data);
      setFaculties(facRes.data.data);
      if(facRes.data.data.length > 0 && !selectedFaculty) {
        setSelectedFaculty(facRes.data.data[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getCellContent = (day, period) => {
    const entry = timetableData.find(t => 
      t.faculty_id?._id === selectedFaculty && 
      t.day_of_week === day && 
      t.period_number === period
    );
    if (!entry) return null;

    return (
      <div className={`cell-content ${entry.is_lab ? 'lab-badge' : 'subject-badge'}`}>
        <div style={{fontWeight: 'bold'}}>
          {entry.subject_id?.subject_name || entry.subject_id}
          {entry.subject_id?.subject_code && <span className="subject-code-tag"> ({entry.subject_id.subject_code})</span>}
        </div>
        <div className="faculty-name">Class {entry.class_id}</div>
      </div>
    );
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 className="card-title" style={{ margin: 0 }}>Faculty Timetable Viewer</h2>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {faculties.length > 0 && (
            <select 
              className="form-select" 
              value={selectedFaculty} 
              onChange={e => setSelectedFaculty(e.target.value)}
              style={{ width: 'auto', minWidth: '200px' }}
            >
              {faculties.map(fac => <option key={fac._id} value={fac._id}>{fac.name}</option>)}
            </select>
          )}
          <button onClick={fetchTimetableAndFaculty} className="btn btn-secondary">Refresh</button>
          <button onClick={handlePrint} className="btn btn-success">Download PDF</button>
        </div>
      </div>
      
      {faculties.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
          No faculties available or timetable not generated yet.
        </div>
      ) : (
        <div className="timetable-container" id="printable-timetable">
          <div className="print-header" style={{ display: 'none', textAlign: 'center', marginBottom: '20px' }}>
            <h2>Faculty Timetable - {faculties.find(f => f._id === selectedFaculty)?.name || 'Unknown'}</h2>
          </div>
          <table className="timetable-grid">
            <thead>
              <tr>
                <th>Day / Period</th>
                {periods.map(p => <th key={p}>Period {p}</th>)}
              </tr>
            </thead>
            <tbody>
              {days.map(day => (
                <tr key={day}>
                  <td style={{ fontWeight: 600, backgroundColor: '#f8fafc' }}>{day}</td>
                  {periods.map(period => (
                    <td key={`${day}-${period}`}>
                      {getCellContent(day, period)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
