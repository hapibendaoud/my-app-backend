const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
    {
        // المريض اللي دار التعليق
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "patient",
            required: true,
        },
        // الدكتور اللي غادي يشوف التعليق
        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "doctor",
            required: true,
        },
        // نص التعليق
        commentText: {
            type: String,
            required: true,
            trim: true,
        },
        // تقييم التعليق (1-5)
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
    },
    {
        timestamps: true, // كتزيد تلقائياً createdAt و updatedAt
    }
);

// تصدير الموديل بنظام CommonJS الصحيح
module.exports = mongoose.model("Comment", commentSchema);