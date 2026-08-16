import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function EditTimetable() {
  const [selectedClass, setSelectedClass] = useState('1');
  const [timetable, setTimetable] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [editingSlot, setEditingSlot] = useState(null); // { day, period }
  const [editData, setEditData] = useState({ subject_id: '', faculty_id: '' });
  
  // Undo/Redo State
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const periods = [1, 2, 3, 4, 5, 6, 7, 8];

  useEffect(() => {
    fetchData();
  }, [selectedClass]);

  const fetchData = async () => {
    try {
      const [tableRes, subRes, facRes] = await Promise.all([
        axios.get('http://localhost:5000/api/get-timetable'),
        axios.get('http://localhost:5000/api/get-subjects'),
        axios.get('http://localhost:5000/api/get-faculty')
      ]);
      const currentTable = tableRes.data.data.filter(t => t.class_id.toString() === selectedClass.toString());
      setTimetable(currentTable);
      setSubjects(subRes.data.data);
      setFaculties(facRes.data.data);
      
      // Initialize history with current state if empty
      setHistory([currentTable]);
      setHistoryIndex(0);
    } catch (err) {
      console.error(err);
    }
  };

  const addToHistory = (newState) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = async () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      try {
        await axios.post('http://localhost:5000/api/sync-timetable', {
          class_id: selectedClass,
          timetable_data: prevState
        });
        setHistoryIndex(historyIndex - 1);
        setTimetable(prevState);
      } catch (err) {
        alert('Failed to undo');
      }
    }
  };

  const handleRedo = async () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      try {
        await axios.post('http://localhost:5000/api/sync-timetable', {
          class_id: selectedClass,
          timetable_data: nextState
        });
        setHistoryIndex(historyIndex + 1);
        setTimetable(nextState);
      } catch (err) {
        alert('Failed to redo');
      }
    }
  };

  const getSlot = (day, period) => {
    return timetable.find(t => t.day_of_week === day && t.period_number === period);
  };

  const handleCellClick = (day, period) => {
    const slot = getSlot(day, period);
    setEditData({
      subject_id: slot?.subject_id?._id || '',
      faculty_id: slot?.faculty_id?._id || ''
    });
    setEditingSlot({ day, period });
  };

  const saveEdit = async () => {
    const selectedSub = subjects.find(s => s._id === editData.subject_id);
    const selectedFac = faculties.find(f => f._id === editData.faculty_id);
    
    try {
      await axios.post('http://localhost:5000/api/update-timetable-slot', {
        class_id: selectedClass,
        day_of_week: editingSlot.day,
        period_number: editingSlot.period,
        subject_id: editData.subject_id,
        faculty_id: editData.faculty_id,
        is_lab: selectedSub?.is_lab || false
      });
      
      // Create a snapshot of the new state for history
      let newTable;
      if (!editData.subject_id) {
        newTable = timetable.filter(t => !(t.day_of_week === editingSlot.day && t.period_number === editingSlot.period));
      } else {
        const existingIdx = timetable.findIndex(t => t.day_of_week === editingSlot.day && t.period_number === editingSlot.period);
        const newEntry = {
          day_of_week: editingSlot.day,
          period_number: editingSlot.period,
          subject_id: selectedSub,
          faculty_id: selectedFac,
          is_lab: selectedSub?.is_lab || false,
          class_id: parseInt(selectedClass)
        };
        
        if (existingIdx > -1) {
          newTable = [...timetable];
          newTable[existingIdx] = newEntry;
        } else {
          newTable = [...timetable, newEntry];
        }
      }
      
      setTimetable(newTable);
      addToHistory(newTable);
      setEditingSlot(null);
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to update slot';
      alert(errorMsg);
    }
  };

  return (
    <div>
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 className="card-title" style={{ margin: 0 }}>Manual Timetable Editor</h2>
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button 
                className={`btn ${historyIndex <= 0 ? 'btn-disabled' : 'btn-secondary'}`} 
                onClick={handleUndo} 
                disabled={historyIndex <= 0}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px' }}
              >
                ↩️ Undo
              </button>
              <button 
                className={`btn ${historyIndex >= history.length - 1 ? 'btn-disabled' : 'btn-secondary'}`} 
                onClick={handleRedo} 
                disabled={historyIndex >= history.length - 1}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px' }}
              >
                ↪️ Redo
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '12px 20px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <label style={{ fontWeight: 600, color: 'var(--primary)' }}>Editing Class:</label>
            <input 
              type="number" 
              value={selectedClass} 
              onChange={(e) => setSelectedClass(e.target.value)} 
              className="form-input" 
              style={{ width: '80px', textAlign: 'center', fontSize: '1.1rem', fontWeight: 'bold' }}
            />
          </div>
        </div>
      </div>

      <div className="timetable-container" style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
        <table className="timetable-grid">
          <thead>
            <tr style={{ background: '#f1f5f9' }}>
              <th style={{ width: '120px' }}>Day / Period</th>
              {periods.map(p => <th key={p}>Period {p}</th>)}
            </tr>
          </thead>
          <tbody>
            {days.map(day => (
              <tr key={day}>
                <td style={{ fontWeight: 'bold', backgroundColor: '#f8fafc', color: 'var(--text-main)', borderRight: '2px solid var(--border-color)' }}>{day}</td>
                {periods.map(p => {
                  const slot = getSlot(day, p);
                  return (
                    <td 
                      key={p} 
                      onClick={() => handleCellClick(day, p)}
                      style={{ cursor: 'pointer', transition: 'all 0.2s', position: 'relative' }}
                      className="edit-hover-cell"
                    >
                      {slot ? (
                        <div className="cell-content">
                          <span className={`subject-badge ${slot.is_lab ? 'lab-badge' : ''}`}>
                            {slot.subject_id?.subject_name}
                          </span>
                          <span className="faculty-name">{slot.faculty_id?.name}</span>
                          <div className="edit-indicator">✏️</div>
                        </div>
                      ) : (
                        <div className="cell-content">
                          <span style={{ color: '#cbd5e1', fontSize: '0.75rem' }}>Empty Slot</span>
                          <div className="edit-indicator plus">➕</div>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingSlot && (
        <div className="modal-overlay animated-fade-in">
          <div className="modal-content card shadow-xl" style={{ border: 'none' }}>
            <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: 'var(--text-main)' }}>Manual Slot Override</h3>
              <p style={{ margin: '4px 0 0 0', color: 'var(--primary)', fontWeight: 600 }}>{editingSlot.day} — Period {editingSlot.period} (Class {selectedClass})</p>
            </div>
            
            <div className="form-group">
              <label style={{ fontWeight: 600 }}>Assigned Subject</label>
              <select 
                className="form-select" 
                value={editData.subject_id} 
                onChange={(e) => setEditData({...editData, subject_id: e.target.value})}
                style={{ padding: '12px' }}
              >
                <option value="">-- No Subject / Clear Slot --</option>
                {subjects.map(s => <option key={s._id} value={s._id}>{s.subject_name} {s.is_lab ? '(Lab)' : ''}</option>)}
              </select>
            </div>

            <div className="form-group" style={{ marginTop: '16px' }}>
              <label style={{ fontWeight: 600 }}>Assigned Faculty</label>
              <select 
                className="form-select" 
                value={editData.faculty_id} 
                onChange={(e) => setEditData({...editData, faculty_id: e.target.value})}
                style={{ padding: '12px' }}
              >
                <option value="">-- Select Faculty --</option>
                {faculties.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
              <button className="btn btn-primary" style={{ flex: 2, padding: '14px' }} onClick={saveEdit}>Confirm Assignment</button>
              <button className="btn btn-secondary" style={{ flex: 1, padding: '14px' }} onClick={() => setEditingSlot(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(8px);
        }
        .modal-content {
          width: 90%;
          max-width: 480px;
          border-radius: 20px;
          padding: 32px;
        }
        .edit-hover-cell:hover {
          background-color: rgba(79, 70, 229, 0.05);
          box-shadow: inset 0 0 0 2px var(--primary);
        }
        .edit-hover-cell:hover .edit-indicator {
          opacity: 1;
          transform: translateY(0);
        }
        .edit-indicator {
          position: absolute;
          top: 4px;
          right: 4px;
          font-size: 0.7rem;
          opacity: 0;
          transition: all 0.2s;
          transform: translateY(5px);
          background: white;
          padding: 2px;
          border-radius: 4px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .edit-indicator.plus {
          background: var(--primary);
          color: white;
          padding: 2px 4px;
        }
        .shadow-xl {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        .animated-fade-in {
          animation: modalFade 0.3s ease-out;
        }
        @keyframes modalFade {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
