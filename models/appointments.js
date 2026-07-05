const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
{
    // المريض اللي حجز الموعد
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
    },
    appointmentDate: {
        type: Date,
        required: true,
    },
    appointmentTime: {
        type: String,
        required: true,
    },
    visitType: {
        type: String,
        required: true,
        enum: ["Consultation", "Follow-up", "Urgent", "Check-up"],
        default: "Consultation",
    },
    reason: {
        type: String,
        required: true,
        trim: true,
    },
    status: {
        type: String,
        enum: ["pending", "confirmed", "cancelled", "completed"],
        default: "pending",
    },
    // notes: {
    //   type: String,
    //   trim: true,
    // }
},
{
    timestamps: true, // كتزيد تلقائياً createdAt و updatedAt
}
);

// تصدير الموديل بنظام CommonJS الصحيح
module.exports = mongoose.model("Appointment", appointmentSchema);