import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function MapFaculty() {
  const [formData, setFormData] = useState({
    faculty_id: '',
    subject_id: '',
    class_id: '1'
  });

  const [faculties, setFaculties] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [mappings, setMappings] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [facRes, subRes, mapRes] = await Promise.all([
        axios.get('http://localhost:5000/api/get-faculty'),
        axios.get('http://localhost:5000/api/get-subjects'),
        axios.get('http://localhost:5000/api/get-mappings')
      ]);
      setFaculties(facRes.data.data);
      setSubjects(subRes.data.data);
      setMappings(mapRes.data.data);
      
      // Removed auto-select reset to avoid jumping selections
    } catch (err) {
      console.error('Failed to fetch data', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!formData.faculty_id || !formData.subject_id) {
       alert('Please select a faculty and a subject');
       return;
    }
    try {
      await axios.post('http://localhost:5000/api/map-faculty', formData);
      alert('Mapped successfully!');
      // Clear subject and faculty to allow new selection
      setFormData(prev => ({
        ...prev,
        subject_id: ''
      }));
      fetchData(); // refresh list
    } catch (err) {
      console.error(err);
      alert('Failed to map');
    }
  };

  const handleDeleteMapping = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/delete-mapping/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to delete assignment');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="card">
        <h2 className="card-title">Assign Subject to Faculty</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Faculty</label>
            <select name="faculty_id" className="form-select" value={formData.faculty_id} onChange={handleChange} required>
              <option value="">-- Select Faculty --</option>
              {faculties.map(fac => (
                <option key={fac._id?.toString()} value={fac._id?.toString()}>{fac.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Subject</label>
            <select name="subject_id" className="form-select" value={formData.subject_id} onChange={handleChange} required>
              <option value="">-- Select Subject --</option>
              {subjects
                .filter(sub => {
                  // Filter out subjects already assigned to this class
                  const isAlreadyAssigned = mappings.some(m => 
                    m.class_id?.toString() === formData.class_id?.toString() && 
                    m.subject_id?._id?.toString() === sub._id?.toString()
                  );
                  return !isAlreadyAssigned;
                })
                .map(sub => (
                  <option key={sub._id?.toString()} value={sub._id?.toString()}>
                    [{sub.subject_code}] {sub.subject_name} {sub.is_lab ? '(Lab)' : ''} (Sem: {sub.semester})
                  </option>
                ))
              }
            </select>
          </div>
          <div className="form-group">
            <label>Class ID</label>
            <input type="number" name="class_id" className="form-input" value={formData.class_id} onChange={handleChange} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }}>Save Assignment</button>
        </form>
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <h2 className="card-title">Current Assignments</h2>
        <div className="timetable-container" style={{ padding: '0' }}>
          <table className="timetable-grid">
            <thead>
              <tr>
                <th>Faculty Name</th>
                <th>Subject Name</th>
                <th>Code</th>
                <th>Sem</th>
                <th>Class ID</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {mappings.map(map => (
                <tr key={map._id}>
                  <td>{map.faculty_id?.name || 'Unknown'}</td>
                  <td>{map.subject_id?.subject_name || 'Unknown'}</td>
                  <td>{map.subject_id?.subject_code || 'N/A'}</td>
                  <td>{map.subject_id?.semester || 'N/A'}</td>
                  <td>Class {map.class_id}</td>
                  <td>
                    <button 
                      onClick={() => handleDeleteMapping(map._id)} 
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '1.2rem' }}
                      title="Delete Assignment"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
