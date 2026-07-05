const mongoose = require('mongoose');

const nurseShema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    age: {
        type: Number,
        required: true,
    },
    phone: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
        length: 255,
    },
    photo: {
        type: String,
        trim: true,
    },
},
    {
        timestamps: true, // كتزيد تلقائياً createdAt و updatedAt
    }
);

module.exports = mongoose.model("Nurse", nurseShema);