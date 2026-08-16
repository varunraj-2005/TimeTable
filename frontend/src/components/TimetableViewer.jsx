import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function TimetableViewer() {
  const [timetableData, setTimetableData] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [classIds, setClassIds] = useState([]);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const periods = [1, 2, 3, 4, 5, 6, 7, 8];

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/get-timetable');
      setTimetableData(res.data.data);
      const classes = [...new Set(res.data.data.map(item => item.class_id))].sort();
      setClassIds(classes);
      if(classes.length > 0 && !selectedClass) setSelectedClass(classes[0]);
    } catch (err) {
      console.error(err);
    }
  };

  const getCellContent = (day, period) => {
    const entry = timetableData.find(t => 
      t.class_id === parseInt(selectedClass) && 
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
        <div className="faculty-name">{entry.faculty_id?.name || entry.faculty_id}</div>
      </div>
    );
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 className="card-title" style={{ margin: 0 }}>Class Timetable Viewer</h2>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {classIds.length > 0 && (
            <select 
              className="form-select" 
              value={selectedClass} 
              onChange={e => setSelectedClass(e.target.value)}
              style={{ width: 'auto', minWidth: '150px' }}
            >
              {classIds.map(cid => <option key={cid} value={cid}>Class {cid}</option>)}
            </select>
          )}
          <button onClick={fetchTimetable} className="btn btn-secondary">Refresh</button>
          <button onClick={handlePrint} className="btn btn-success">Download PDF</button>
        </div>
      </div>
      
      {classIds.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
          No timetables generated yet. Go to Dashboard and click Generate.
        </div>
      ) : (
        <div className="timetable-container" id="printable-timetable">
          <div className="print-header" style={{ display: 'none', textAlign: 'center', marginBottom: '20px' }}>
            <h2>Class {selectedClass} Timetable</h2>
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
