import React, { useState } from 'react';
import { Calendar, Users, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function Dashboard() {
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await axios.post('http://localhost:5000/api/generate-timetable');
      alert(res.data.message);
    } catch(err) {
      alert(err.response?.data?.message || 'Error generating timetable');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '16px', backgroundColor: 'rgba(79, 70, 229, 0.1)', borderRadius: '12px', color: 'var(--primary)' }}>
            <Calendar size={32} />
          </div>
          <div>
            <h3>Generate</h3>
            <p style={{ color: 'var(--text-muted)' }}>Create new timetable</p>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '16px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: 'var(--secondary)' }}>
            <Users size={32} />
          </div>
          <div>
            <h3>Faculty</h3>
            <p style={{ color: 'var(--text-muted)' }}>Manage teachers</p>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '16px', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px', color: '#f59e0b' }}>
            <BookOpen size={32} />
          </div>
          <div>
            <h3>Subjects</h3>
            <p style={{ color: 'var(--text-muted)' }}>Manage courses</p>
          </div>
        </div>
      </div>
      
      <div className="card">
        <h2 className="card-title">Quick Actions</h2>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Link to="/add-subject" className="btn btn-primary" style={{ textDecoration: 'none' }}>Add Subject</Link>
          <Link to="/add-faculty" className="btn btn-primary" style={{ textDecoration: 'none', backgroundColor: '#3b82f6' }}>Add Faculty</Link>
          <Link to="/edit-timetable" className="btn btn-secondary" style={{ textDecoration: 'none' }}>Edit Timetable</Link>
          <button className="btn btn-success" onClick={handleGenerate} disabled={generating}>
            {generating ? 'Generating...' : 'Generate Timetable'}
          </button>
        </div>
      </div>
    </div>
  );
}
