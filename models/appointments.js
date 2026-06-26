const mongoose = require('mongoose');


const appointmentSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' }
});

module.exports = mongoose.model('Appointment', appointmentSchema);


















