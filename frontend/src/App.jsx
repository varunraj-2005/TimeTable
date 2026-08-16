import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Calendar, Users, BookOpen, Settings, Edit3 } from 'lucide-react';
import Dashboard from './components/Dashboard';
import AddSubject from './components/AddSubject';
import AddFaculty from './components/AddFaculty';
import MapFaculty from './components/MapFaculty';
import TimetableViewer from './components/TimetableViewer';
import EditTimetable from './components/EditTimetable';
import FacultyTimetableViewer from './components/FacultyTimetableViewer';
import './index.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-brand">
            <img src="Interlocking red and blue L logo.png" alt="L Logo" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
            <h2>Smart Timetable</h2>
          </div>
          <nav className="sidebar-nav">
            <Link to="/" className="nav-link"><Settings size={20} /> Dashboard</Link>
            <Link to="/timetable" className="nav-link"><Calendar size={20} /> Class Timetable</Link>
            <Link to="/faculty-timetable" className="nav-link"><Calendar size={20} /> Faculty Timetable</Link>
            <Link to="/edit-timetable" className="nav-link"><Edit3 size={20} /> Edit Timetable</Link>
            <Link to="/add-subject" className="nav-link"><BookOpen size={20} /> Subjects</Link>
            <Link to="/add-faculty" className="nav-link"><Users size={20} /> Faculty</Link>
            <Link to="/map-faculty" className="nav-link"><Settings size={20} /> Assign Classes</Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <header className="top-header">
            <h1>College Timetable Management System</h1>
            <div className="user-profile">Admin</div>
          </header>
          
          <div className="page-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/timetable" element={<TimetableViewer />} />
              <Route path="/faculty-timetable" element={<FacultyTimetableViewer />} />
              <Route path="/edit-timetable" element={<EditTimetable />} />
              <Route path="/add-subject" element={<AddSubject />} />
              <Route path="/add-faculty" element={<AddFaculty />} />
              <Route path="/map-faculty" element={<MapFaculty />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
