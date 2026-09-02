const { Subject, Faculty, Mapping, Timetable } = require('../models/models');

exports.addSubject = async (req, res) => {
    try {
        const { subject_name, subject_code, semester, periods_per_week, is_lab, lab_duration } = req.body;
        const newSubject = new Subject({
            subject_name,
            subject_code,
            semester,
            periods_per_week: periods_per_week || 0,
            is_lab: is_lab || false,
            lab_duration: lab_duration || 0
        });
        await newSubject.save();
        res.json({ success: true, id: newSubject._id, message: 'Subject added successfully!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addFaculty = async (req, res) => {
    try {
        const { name, max_periods_per_week, is_other_department, availability } = req.body;
        const newFaculty = new Faculty({
            name,
            max_periods_per_week: max_periods_per_week || 20,
            is_other_department: is_other_department || false,
            availability: availability || Array(6).fill().map(() => Array(8).fill(true))
        });
        await newFaculty.save();
        res.json({ success: true, id: newFaculty._id, message: 'Faculty added successfully!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find();
        res.json({ success: true, data: subjects });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getFaculty = async (req, res) => {
    try {
        const faculty = await Faculty.find();
        res.json({ success: true, data: faculty });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.mapFaculty = async (req, res) => {
    try {
        const { faculty_id, subject_id, class_id } = req.body;
        const newMapping = new Mapping({
            faculty_id,
            subject_id,
            class_id: class_id || 1
        });
        await newMapping.save();
        res.json({ success: true, id: newMapping._id, message: 'Mapped successfully!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteMapping = async (req, res) => {
    try {
        await Mapping.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Mapping deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteFaculty = async (req, res) => {
    try {
        await Faculty.findByIdAndDelete(req.params.id);
        // Also delete associated mappings
        await Mapping.deleteMany({ faculty_id: req.params.id });
        res.json({ success: true, message: 'Faculty deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getMappings = async (req, res) => {
    try {
        const mappings = await Mapping.find().populate('subject_id faculty_id');
        res.json({ success: true, data: mappings });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getTimetable = async (req, res) => {
    try {
        const timetables = await Timetable.find().populate('subject_id faculty_id');
        res.json({ success: true, data: timetables });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.generateTimetable = async (req, res) => {
    try {
        await Timetable.deleteMany({});
        const mappings = await Mapping.find().populate('subject_id faculty_id');
        
        const classMappings = {};
        for(let map of mappings) {
            let cid = map.class_id || 1;
            if(!classMappings[cid]) classMappings[cid] = [];
            classMappings[cid].push(map);
        }

        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const numPeriods = 8;
        const timetables = [];
        const facultyTime = {};

        for (let classId of Object.keys(classMappings)) {
            // Deduplicate classMaps to avoid accidental multi-clicks forcing >48 periods
            let classMapsRaw = classMappings[classId];
            let classMaps = [];
            let seenMaps = new Set();
            for(let m of classMapsRaw) {
                let sig = m.faculty_id._id.toString() + '_' + m.subject_id._id.toString();
                if(!seenMaps.has(sig)) {
                    seenMaps.add(sig);
                    classMaps.push(m);
                }
            }
            
            classMaps.sort((a,b) => (b.subject_id.is_lab ? 1 : 0) - (a.subject_id.is_lab ? 1 : 0));
            
            let grid = Array(days.length).fill(null).map(() => Array(numPeriods).fill(null));
            let classSubjDay = {};
            
            let iterations = 0;
            const MAX_ITERATIONS = 500000; // Increased search depth for complex constraints
            
            // Pre-check: Total periods should not exceed available slots (48)
            let totalPeriodsNeeded = classMaps.reduce((sum, map) => sum + (map.subject_id.periods_per_week || 0), 0);
            if (totalPeriodsNeeded > 48) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Class ${classId} has ${totalPeriodsNeeded} periods assigned, but only 48 slots are available in a week.` 
                });
            }

            function backtrack(mapIndex, subPeriod) {
                if(iterations++ > MAX_ITERATIONS) return false;
                if(mapIndex === classMaps.length) return true;
                
                let curMap = classMaps[mapIndex];
                let sub = curMap.subject_id;
                let facId = curMap.faculty_id._id.toString();
                let subId = sub._id.toString();
                
                if(!facultyTime[facId]) facultyTime[facId] = Array(days.length).fill(null).map(() => Array(numPeriods).fill(false));
                if(!classSubjDay[subId]) classSubjDay[subId] = Array(days.length).fill(0);

                let blockSize = 1;
                let periodsNeeded = sub.periods_per_week;

                if (sub.is_lab) {
                    blockSize = sub.lab_duration && sub.lab_duration > 0 ? sub.lab_duration : 2;
                    // Calculate exactly how many blocks are needed based on per-week requirement
                    periodsNeeded = Math.round(sub.periods_per_week / blockSize);
                    if (periodsNeeded < 1) periodsNeeded = 1;
                }

                if(subPeriod >= periodsNeeded) return backtrack(mapIndex + 1, 0);
                
                if (sub.is_lab) {
                    let sortedDaysLab = [0, 1, 2, 3, 4, 5];
                    sortedDaysLab.sort((d1, d2) => {
                        let count1 = grid[d1].filter(slot => slot && slot.subject_id.is_lab).length;
                        let count2 = grid[d2].filter(slot => slot && slot.subject_id.is_lab).length;
                        return count1 - count2;
                    });
                    
                    for(let d of sortedDaysLab) {
                        for(let p=0; p<=numPeriods - blockSize; p++) {
                            // Constraint: blocks cannot cross between period 4 and 5 (lunch break)
                            if (p < 4 && (p + blockSize - 1) >= 4) continue;
                            
                            let canPlace = true;
                            for(let i=0; i<blockSize; i++) {
                                // Check if slot is empty, faculty is not busy, and faculty is available (if from other dept)
                                let isAvailable = true;
                                if (curMap.faculty_id.is_other_department && curMap.faculty_id.availability) {
                                    isAvailable = curMap.faculty_id.availability[d][p+i];
                                }
                                
                                if(grid[d][p+i] !== null || facultyTime[facId][d][p+i] || !isAvailable) { 
                                    canPlace = false; 
                                    break; 
                                }
                            }
                            if(canPlace) {
                                for(let i=0; i<blockSize; i++) {
                                    grid[d][p+i] = curMap;
                                    facultyTime[facId][d][p+i] = true;
                                }
                                if(backtrack(mapIndex, subPeriod + 1)) return true;
                                for(let i=0; i<blockSize; i++) {
                                    grid[d][p+i] = null;
                                    facultyTime[facId][d][p+i] = false;
                                }
                            }
                        }
                    }
                    return false;
                } else {
                    let sortedDays = [0, 1, 2, 3, 4, 5];
                    sortedDays.sort((d1, d2) => classSubjDay[subId][d1] - classSubjDay[subId][d2]);
                    
                    for(let d of sortedDays) {
                        for(let p=0; p<numPeriods; p++) {
                            let isAvailable = true;
                            if (curMap.faculty_id.is_other_department && curMap.faculty_id.availability) {
                                isAvailable = curMap.faculty_id.availability[d][p];
                            }

                            if(grid[d][p] === null && !facultyTime[facId][d][p] && isAvailable) {
                                grid[d][p] = curMap;
                                facultyTime[facId][d][p] = true;
                                classSubjDay[subId][d]++;
                                
                                if(backtrack(mapIndex, subPeriod + 1)) return true;
                                
                                grid[d][p] = null;
                                facultyTime[facId][d][p] = false;
                                classSubjDay[subId][d]--;
                            }
                        }
                    }
                    return false;
                }
            }
            
            let success = backtrack(0, 0);
            if(success) {
                for(let d=0; d<days.length; d++) {
                    for(let p=0; p<numPeriods; p++) {
                        if(grid[d][p]) {
                            timetables.push({
                                class_id: parseInt(classId),
                                day_of_week: days[d],
                                period_number: p + 1,
                                subject_id: grid[d][p].subject_id._id,
                                faculty_id: grid[d][p].faculty_id._id,
                                is_lab: grid[d][p].subject_id.is_lab
                            });
                        }
                    }
                }
            } else {
                console.log("Failed to generate for class", classId);
                let reason = iterations > MAX_ITERATIONS ? "Too many constraints (Search depth exceeded)" : "Faculty conflicts or Lab scheduling restrictions";
                return res.status(400).json({ 
                    success: false, 
                    message: `Could not satisfy constraints for Class ${classId}. Reason: ${reason}. Please check if faculty members assigned to this class are overloaded or have restricted availability.` 
                });
            }
        }
        
        await Timetable.insertMany(timetables);
        res.json({ success: true, message: "Timetable generated successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateTimetableSlot = async (req, res) => {
    try {
        const { class_id, day_of_week, period_number, subject_id, faculty_id, is_lab } = req.body;
        
        if (!subject_id) {
            // If subject is cleared, delete the slot
            let slot = await Timetable.findOne({ class_id, day_of_week, period_number });
            if (slot) await Timetable.findByIdAndDelete(slot._id);
            return res.json({ success: true, message: 'Slot cleared' });
        }

        // Simple manual override - no constraint checks
        let slot = await Timetable.findOne({ class_id, day_of_week, period_number });

        if (slot) {
            // Update existing
            slot.subject_id = subject_id;
            slot.faculty_id = faculty_id || null;
            slot.is_lab = is_lab || false;
            await slot.save();
        } else {
            // Create new
            const newSlot = new Timetable({
                class_id,
                day_of_week,
                period_number,
                subject_id,
                faculty_id: faculty_id || null,
                is_lab: is_lab || false
            });
            await newSlot.save();
        }
        res.json({ success: true, message: 'Slot updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

exports.syncTimetable = async (req, res) => {
    try {
        const { class_id, timetable_data } = req.body;
        // Delete all existing slots for this class
        await Timetable.deleteMany({ class_id });
        
        // Prepare new slots
        const newSlots = timetable_data.map(slot => ({
            class_id: parseInt(class_id),
            day_of_week: slot.day_of_week,
            period_number: slot.period_number,
            subject_id: slot.subject_id?._id || slot.subject_id,
            faculty_id: slot.faculty_id?._id || slot.faculty_id,
            is_lab: slot.is_lab || false
        }));
        
        if (newSlots.length > 0) {
            await Timetable.insertMany(newSlots);
        }
        
        res.json({ success: true, message: 'Timetable synced successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};
