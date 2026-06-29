const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
{
    // المريض اللي حجز الموعد
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    // الدكتور اللي غادي يستقبل المريض
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    // تاريخ الموعد (اليوم/الشهر/السنة)
    appointmentDate: {
        type: Date,
        required: true,
    },
    // ساعة الموعد (مثال: "10:30", "14:15")
    appointmentTime: {
        type: String,
        required: true,
    },
    // نوع الزيارة
    visitType: {
        type: String,
        required: true,
        enum: ["Consultation", "Follow-up", "Urgent"],
        default: "Consultation",
    },
    // سبب الزيارة
    reason: {
        type: String,
        required: true,
        trim: true,
    },
    // حالة الموعد
    status: {
        type: String,
        enum: ["pending", "confirmed", "cancelled", "completed"],
        default: "pending",
    },
    // ملاحظات إضافية (خليتها بالكومنت كيف بغيتي)
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