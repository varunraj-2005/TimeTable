import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AddSubject() {
  const [formData, setFormData] = useState({
    subject_name: '',
    subject_code: '',
    semester: '',
    periods_per_week: '',
    is_lab: false,
    lab_duration: ''
  });
  
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/get-subjects');
      setSubjects(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/add-subject', formData);
      alert('Subject added successfully!');
      setFormData({ subject_name: '', subject_code: '', semester: '', periods_per_week: '', is_lab: false, lab_duration: '' });
      fetchSubjects();
    } catch (err) {
      console.error(err);
      alert('Failed to add subject');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="card">
        <h2 className="card-title">Add New Subject</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Subject Name</label>
            <input type="text" name="subject_name" className="form-input" value={formData.subject_name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Subject Code</label>
            <input type="text" name="subject_code" className="form-input" value={formData.subject_code} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Semester</label>
            <input type="number" name="semester" className="form-input" value={formData.semester} onChange={handleChange} required min="1" max="8" />
          </div>
          <div className="form-group">
            <label>Periods Per Week</label>
            <input type="number" name="periods_per_week" className="form-input" value={formData.periods_per_week} onChange={handleChange} required />
          </div>
          <div className="form-group checkbox-group">
            <input type="checkbox" name="is_lab" id="is_lab" checked={formData.is_lab} onChange={handleChange} />
            <label htmlFor="is_lab" style={{ margin: 0 }}>Is this a Lab session?</label>
          </div>
          {formData.is_lab && (
            <div className="form-group">
              <label>Lab Duration (contiguous periods)</label>
              <input type="number" name="lab_duration" className="form-input" value={formData.lab_duration} onChange={handleChange} />
            </div>
          )}
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }}>Save Subject</button>
        </form>
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <h2 className="card-title">Added Subjects</h2>
        <div className="timetable-container" style={{ padding: '0' }}>
          <table className="timetable-grid">
            <thead>
              <tr>
                <th>Subject Name</th>
                <th>Subject Code</th>
                <th>Semester</th>
                <th>Periods / Week</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map(sub => (
                <tr key={sub._id}>
                  <td>{sub.subject_name}</td>
                  <td>{sub.subject_code}</td>
                  <td>{sub.semester}</td>
                  <td>{sub.periods_per_week}</td>
                  <td>{sub.is_lab ? <span className="lab-badge">Lab ({sub.lab_duration} slots)</span> : <span className="subject-badge">Theory</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
