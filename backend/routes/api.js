const express = require('express');
const router = express.Router();
const timetableController = require('../controllers/timetableController');

router.post('/add-subject', timetableController.addSubject);
router.post('/add-faculty', timetableController.addFaculty);
router.post('/map-faculty', timetableController.mapFaculty);
router.post('/generate-timetable', timetableController.generateTimetable);
router.get('/get-timetable', timetableController.getTimetable);
router.get('/get-subjects', timetableController.getSubjects);
router.get('/get-faculty', timetableController.getFaculty);
router.get('/get-mappings', timetableController.getMappings);
router.delete('/delete-mapping/:id', timetableController.deleteMapping);
router.delete('/delete-faculty/:id', timetableController.deleteFaculty);
router.post('/update-timetable-slot', timetableController.updateTimetableSlot);
router.post('/sync-timetable', timetableController.syncTimetable);

module.exports = router;
