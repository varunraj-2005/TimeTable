import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AddFaculty() {
  const [formData, setFormData] = useState({
    name: '',
    max_periods_per_week: 20,
    is_other_department: false,
    availability: Array(6).fill().map(() => Array(8).fill(true))
  });
  
  const [faculties, setFaculties] = useState([]);
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const periods = [1, 2, 3, 4, 5, 6, 7, 8];

  useEffect(() => {
    fetchFaculties();
  }, []);

  const fetchFaculties = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/get-faculty');
      setFaculties(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const toggleAvailability = (dayIdx, periodIdx) => {
    const newAvailability = [...formData.availability];
    newAvailability[dayIdx][periodIdx] = !newAvailability[dayIdx][periodIdx];
    setFormData({ ...formData, availability: newAvailability });
  };

  const markAllFree = () => {
    setFormData({ 
      ...formData, 
      availability: Array(6).fill().map(() => Array(8).fill(true)) 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/add-faculty', formData);
      alert('Faculty added successfully!');
      setFormData({ 
        name: '', 
        max_periods_per_week: 20, 
        is_other_department: false, 
        availability: Array(6).fill().map(() => Array(8).fill(true)) 
      });
      fetchFaculties();
    } catch (err) {
      console.error(err);
      alert('Failed to add faculty');
    }
  };

  const handleDeleteFaculty = async (id) => {
    if (!window.confirm('Are you sure you want to delete this faculty? All associated assignments will also be deleted!')) return;
    try {
      await axios.delete(`http://localhost:5000/api/delete-faculty/${id}`);
      fetchFaculties();
    } catch (err) {
      console.error(err);
      alert('Failed to delete faculty');
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="card">
        <h2 className="card-title">Add Faculty Profile</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label>Faculty Name</label>
              <input type="text" name="name" className="form-input" value={formData.name} onChange={handleChange} required placeholder="Enter full name" />
            </div>
            <div>
              <label>Max Periods Per Week</label>
              <input type="number" name="max_periods_per_week" className="form-input" value={formData.max_periods_per_week} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '8px' }}>
            <div className="checkbox-group" style={{ padding: '8px', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <input 
                type="checkbox" 
                id="is_other_department" 
                name="is_other_department" 
                checked={formData.is_other_department} 
                onChange={handleChange}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="is_other_department" style={{ margin: 0, cursor: 'pointer', fontWeight: 600 }}>
                Faculty from another department?
              </label>
            </div>
          </div>

          {formData.is_other_department && (
            <div className="form-group animated-fade-in" style={{ marginTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <label style={{ margin: 0, color: 'var(--primary)', fontWeight: 700 }}>Select Free Periods on the Week</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" onChange={(e) => e.target.checked && markAllFree()} id="mark_all_free" />
                  <label htmlFor="mark_all_free" style={{ margin: 0, fontSize: '0.8rem', cursor: 'pointer' }}>Mark All as Free</label>
                </div>
              </div>
              
              <div style={{ overflowX: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '80px repeat(8, 1fr)', gap: '4px', minWidth: '600px' }}>
                  <div className="availability-header"></div>
                  {periods.map(p => (
                    <div key={p} className="availability-header" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>P{p}</div>
                  ))}
                  
                  {days.map((day, dIdx) => (
                    <React.Fragment key={day}>
                      <div className="availability-header" style={{ fontSize: '0.85rem', fontWeight: 600, justifyContent: 'flex-start' }}>{day}</div>
                      {periods.map((p, pIdx) => (
                        <div 
                          key={`${dIdx}-${pIdx}`}
                          className={`availability-cell ${formData.availability[dIdx][pIdx] ? 'free' : 'busy'}`}
                          onClick={() => toggleAvailability(dIdx, pIdx)}
                        >
                          {formData.availability[dIdx][pIdx] ? 'Free' : 'Busy'}
                        </div>
                      ))}
                    </React.Fragment>
                  ))}
                </div>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                * Classes will only be assigned during "Free" slots for other department faculty.
              </p>
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '24px', padding: '14px', fontSize: '1rem' }}>
            Save Faculty Profile
          </button>
        </form>
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <h2 className="card-title">Registered Faculty</h2>
        <div className="timetable-container" style={{ padding: '0' }}>
          <table className="timetable-grid">
            <thead style={{ background: '#f1f5f9' }}>
              <tr>
                <th style={{ textAlign: 'left', paddingLeft: '24px' }}>Faculty Name</th>
                <th>Type</th>
                <th>Max Load</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {faculties.map(fac => (
                <tr key={fac._id}>
                  <td style={{ textAlign: 'left', paddingLeft: '24px', fontWeight: 500 }}>{fac.name}</td>
                  <td>
                    <span style={{ 
                      padding: '4px 10px', 
                      borderRadius: '999px', 
                      fontSize: '0.75rem', 
                      fontWeight: 600,
                      background: fac.is_other_department ? 'rgba(79, 70, 229, 0.1)' : 'rgba(100, 116, 139, 0.1)',
                      color: fac.is_other_department ? 'var(--primary)' : '#475569'
                    }}>
                      {fac.is_other_department ? 'Other Dept' : 'Core Dept'}
                    </span>
                  </td>
                  <td>{fac.max_periods_per_week} periods/wk</td>
                  <td>
                    <button 
                      onClick={() => handleDeleteFaculty(fac._id)} 
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '1.2rem', padding: '4px' }}
                      title="Delete Faculty"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
              {faculties.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ padding: '40px', color: 'var(--text-muted)' }}>No faculty registered yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <style>{`
        .availability-cell {
          height: 36px;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: 600;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid transparent;
        }
        .availability-cell.free {
          background-color: #dcfce7;
          color: #166534;
        }
        .availability-cell.free:hover {
          background-color: #bbf7d0;
          transform: scale(1.05);
        }
        .availability-cell.busy {
          background-color: #fee2e2;
          color: #991b1b;
        }
        .availability-cell.busy:hover {
          background-color: #fecaca;
          transform: scale(1.05);
        }
        .availability-header {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .animated-fade-in {
          animation: fadeIn 0.4s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
