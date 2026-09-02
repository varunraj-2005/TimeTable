# ⚙️ Smart TimeTable Engine

**A College Timetable Management System that runs like a well-oiled machine — feed it subjects, faculty, and constraints, and it manufactures a conflict-free weekly schedule.**

Think of this project as a small factory. Raw materials (subjects, teachers, availability rules) go in at one end. They pass through a processing core that fits every piece together without collisions. A finished, ready-to-use timetable comes out the other end — and can still be fine-tuned by hand afterward.

---

## 🏭 The Big Picture

Every machine has three parts: something that **feeds it**, something that **processes**, and something that **delivers the result**. This project is built the same way.

```
   ┌────────────────┐        ┌─────────────────────┐        ┌────────────────────┐
   │   INPUT DECK    │  --->  │   PROCESSING CORE    │  --->  │   OUTPUT CONVEYOR   │
   │  (React forms)  │        │  (Node/Express API)  │        │  (Timetable views)  │
   └────────────────┘        └─────────────────────┘        └────────────────────┘
          Frontend                     Backend                     Frontend
      "Load the parts"          "Assemble the schedule"        "Read the result"
```

- **Input Deck** — a website (frontend) where an administrator loads the raw materials: subjects, teachers, and which teacher teaches which subject to which class.
- **Processing Core** — a server (backend) that takes all those materials and runs them through a scheduling algorithm, like gears turning until every piece locks into place.
- **Output Conveyor** — the finished timetable, displayed back on the website for classes and faculty, and editable by hand if a manual adjustment is needed.

---

## 🔧 What the Machine Actually Does

In plain terms, this system solves a problem every college faces every semester: *"How do we arrange dozens of subjects and teachers into a weekly grid without anyone being double-booked?"*

The machine handles this by:

1. **Collecting the raw parts** — subject names, subject codes, how many periods per week each subject needs, and whether a subject is a lab (labs need longer, uninterrupted blocks of time).
2. **Registering the workers** — faculty members, how many periods each can teach per week, and (for visiting or "other department" faculty) exactly which time slots they're free.
3. **Wiring the connections** — mapping which faculty member teaches which subject to which class.
4. **Running the assembly line** — an automatic scheduling engine places every subject into a day/period slot, respecting every rule at once.
5. **Delivering the finished product** — a full weekly grid that can be viewed by class or by faculty member, and manually edited afterward if needed.

---

## 🏗️ How the Machine is Built (Architecture)

The whole system is split into two independent machines that talk to each other over a network cable (an API):

| Layer | Role in the Machine | Technology |
|---|---|---|
| **Frontend** | The control panel — where a person operates the machine | React 19 + Vite, React Router, Axios, Lucide icons |
| **Backend** | The engine room — where the real work happens | Node.js + Express 5 |
| **Database** | The storage warehouse — where all parts and finished goods are kept | MongoDB (via Mongoose) |

```
frontend/   →  the operator's control room (buttons, forms, timetable grids)
backend/    →  the engine room (routes, controllers, scheduling logic)
   ├── routes/        → the wiring that connects each button to the right gear
   ├── controllers/   → the gears themselves — the actual logic
   ├── models/        → the labeled storage bins (data structure definitions)
   └── db.js          → the pipe connecting the engine to the warehouse (MongoDB)
```

---

## ⚙️ The Engine Room — Backend Explained

The backend is an **Express.js server** exposing a set of controls (API endpoints). Each one is like a lever on a control panel:

| Lever (Endpoint) | What Pulling It Does |
|---|---|
| `POST /api/add-subject` | Feeds a new subject into the machine |
| `POST /api/add-faculty` | Registers a new faculty member as a worker |
| `POST /api/map-faculty` | Wires a faculty member to a subject and class |
| `POST /api/generate-timetable` | **Starts the main engine** — builds the full schedule |
| `GET /api/get-timetable` | Reads out the finished product for a class |
| `GET /api/get-subjects` | Lists every subject currently loaded |
| `GET /api/get-faculty` | Lists every registered faculty member |
| `GET /api/get-mappings` | Shows all current faculty-subject-class wiring |
| `DELETE /api/delete-mapping/:id` | Removes a wiring connection |
| `DELETE /api/delete-faculty/:id` | Removes a worker (and their wiring) |
| `POST /api/update-timetable-slot` | Manually nudges one gear into a different position |
| `POST /api/sync-timetable` | Saves a manually adjusted timetable back to storage |

### The Core Gear: The Scheduling Algorithm

The heart of the machine is the `generateTimetable` function. It works like a mechanical puzzle-solver, called a **backtracking algorithm**:

1. It lines up every subject that needs to be scheduled for a class.
2. It tries to slot each one into a day and period.
3. If a slot works — no clashing teacher, no double-booked room, no rule broken — it locks it in and moves to the next piece.
4. If a slot **doesn't** work, the machine reverses that single move (like a gear turning backward) and tries the next possible position.
5. This trial-and-reverse motion repeats — up to 500,000 times if needed — until every subject fits, or the machine reports that the puzzle can't be solved with the current parts.

Along the way, the engine respects several built-in safety rules:
- **No teacher can be in two places at once** (faculty time-clash check).
- **Labs get uninterrupted blocks** (e.g., 2 periods back-to-back) and never get split across the lunch break.
- **Visiting faculty availability is respected** — if a teacher from another department is only free on certain days/periods, the machine will never place them outside that window.
- **A class cannot be overloaded** — if the total periods requested exceed the 48 slots available in a week (6 days × 8 periods), the machine stops and reports the overload instead of producing a broken schedule.

---

## 🖥️ The Control Panel — Frontend Explained

The frontend is the human-facing side of the machine, built with **React** and **Vite** for a fast, responsive interface. Every screen maps to a specific job:

| Screen (Component) | Purpose |
|---|---|
| `Dashboard.jsx` | The main control panel / home screen |
| `AddSubject.jsx` | Form to feed new subjects into the machine |
| `AddFaculty.jsx` | Form to register new faculty and their availability |
| `MapFaculty.jsx` | Screen to wire faculty to subjects and classes |
| `TimetableViewer.jsx` | Reads out the finished timetable, per class |
| `FacultyTimetableViewer.jsx` | Reads out the finished timetable, per faculty member |
| `EditTimetable.jsx` | Lets an admin manually adjust a slot after generation |

All screens are connected through `react-router-dom`, so navigating the app feels like walking between rooms in the same factory — the sidebar is always visible, and the main content area swaps based on which room (route) you're in.

---

## 🧰 Parts List (Tech Stack)

**Frontend**
- React 19
- Vite (build tool)
- React Router DOM 7
- Axios (for talking to the backend)
- Lucide React (icons)

**Backend**
- Node.js + Express 5
- MongoDB + Mongoose (data storage)
- bcryptjs (password hashing, for future auth features)
- jsonwebtoken (for future authentication support)
- dotenv (environment configuration)
- cors (allows the frontend and backend to talk across origins)

---

## 🚀 Assembly Instructions (Setup)

### Prerequisites
- Node.js (v16 or higher)
- MongoDB running locally or a MongoDB Atlas connection string

### 1. Power Up the Backend (Engine Room)

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` with:

```
MONGO_URI=mongodb://127.0.0.1:27017/timetable
PORT=5000
```

Start the engine:

```bash
npm start
# or, for auto-restart during development:
npx nodemon server.js
```

### 2. Power Up the Frontend (Control Panel)

```bash
cd frontend
npm install
npm run dev
```

The control panel will open in your browser (typically `http://localhost:5173`), already wired to talk to the backend engine.

---

## 🔄 The Full Workflow — Watching the Machine Run

1. **Load subjects** → *Subjects* screen → each subject's weekly periods and lab status are recorded.
2. **Register faculty** → *Faculty* screen → each teacher's workload limit and availability are set.
3. **Wire the connections** → *Assign Classes* screen → link faculty to subjects for specific classes.
4. **Pull the main lever** → click *Generate Timetable* → the backtracking engine assembles the full schedule.
5. **Inspect the output** → *Class Timetable* / *Faculty Timetable* screens → view the finished, conflict-free grid.
6. **Fine-tune by hand** → *Edit Timetable* screen → manually override any single slot if a human judgment call is needed, then sync it back to storage.

---

## 📁 Project Structure

```
TimeTable/
├── backend/
│   ├── controllers/
│   │   └── timetableController.js   # The core scheduling engine
│   ├── models/
│   │   └── models.js                # Data blueprints (Subject, Faculty, Mapping, Timetable)
│   ├── routes/
│   │   └── api.js                   # The control panel wiring
│   ├── db.js                        # MongoDB connection pipe
│   └── server.js                    # Engine ignition
├── frontend/
│   └── src/
│       ├── components/              # Each screen/room of the control panel
│       ├── App.jsx                  # Navigation and layout
│       └── main.jsx                 # Frontend ignition
└── README.md
```

---

## 🤝 Contributing

If you'd like to add new gears to this machine — new constraints, better algorithms, authentication, or UI improvements — fork the repository, make your changes, and open a pull request. Please keep new logic well-commented, the same way the scheduling engine explains its own reasoning through clear variable names and step-by-step checks.

---

## 📄 License

No license has been specified yet for this repository. Consider adding one (e.g., MIT) if you plan to share or accept contributions.
