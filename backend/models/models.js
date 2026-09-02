const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  subject_name: { type: String, required: true },
  subject_code: { type: String, required: true },
  semester: { type: Number, required: true },
  periods_per_week: { type: Number, default: 0 },
  is_lab: { type: Boolean, default: false },
  lab_duration: { type: Number, default: 0 }
});

const facultySchema = new mongoose.Schema({
  name: { type: String, required: true },
  max_periods_per_week: { type: Number, default: 20 },
  is_other_department: { type: Boolean, default: false },
  availability: { 
    type: [[Boolean]], 
    default: () => Array(6).fill().map(() => Array(8).fill(true)) 
  }
});

const mappingSchema = new mongoose.Schema({
  faculty_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
  subject_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  class_id: { type: Number }
});

const timetableSchema = new mongoose.Schema({
  class_id: { type: Number, required: true, default: 1 },
  day_of_week: String,
  period_number: Number,
  subject_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  faculty_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
  is_lab: { type: Boolean, default: false }
});

module.exports = {
  Subject: mongoose.model('Subject', subjectSchema),
  Faculty: mongoose.model('Faculty', facultySchema),
  Mapping: mongoose.model('Mapping', mappingSchema),
  Timetable: mongoose.model('Timetable', timetableSchema)
};
