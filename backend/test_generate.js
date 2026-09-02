const mongoose = require('mongoose');
const { Mapping, Subject, Faculty } = require('./models/models');

mongoose.connect('mongodb://127.0.0.1:27017/timetable').then(async () => {
    const mappings = await Mapping.find().populate('subject_id faculty_id');
    const classMappings = {};
    for(let map of mappings) {
        let cid = map.class_id || 1;
        if(!classMappings[cid]) classMappings[cid] = [];
        classMappings[cid].push(map);
    }
    console.log('Class mapping counts:');
    for(let cid in classMappings) {
        let maps = classMappings[cid];
        let totalPeriods = 0;
        for (let m of maps) {
            let p = m.subject_id.is_lab ? Math.max(1, Math.round(m.subject_id.periods_per_week / (m.subject_id.lab_duration || 2))) * (m.subject_id.lab_duration || 2) : m.subject_id.periods_per_week;
            console.log(` - ${m.subject_id.subject_name} (${m.subject_id.is_lab ? 'Lab' : 'Theory'}): ${m.subject_id.periods_per_week} ppw, ${m.subject_id.lab_duration} dur -> needs ${p} slots`);
            totalPeriods += p;
        }
        console.log(`Class ${cid} requires ${totalPeriods} periods. Maximum available is 48.`);
    }
    process.exit(0);
});
