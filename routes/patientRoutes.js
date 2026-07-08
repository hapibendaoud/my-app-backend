const express = require('express');
const router = express.Router();
// كنجيبو الملف كامل وكنسميوه authController
const { registerPatient,
        loginPatient, 
        createAppointment, 
        addNurse,
        getAppointments,
        statusUpdate,
        getDoctorOrPatient,
        registerDoctor,
        getNurses,
        getPatientAppointments
    } = require('../controllers/patientController'); 

router.post('/register', registerPatient);

router.post('/register/doctor', registerDoctor);

router.post('/login', loginPatient);

router.post('/appointment', createAppointment);

router.get('/appointments', getAppointments);

router.get('/myappointments', getPatientAppointments);

router.get('/doctorOrPatient', getDoctorOrPatient);

router.patch('/appointments/:id/status-update', statusUpdate);

router.post('/add-nurse', addNurse);

router.get('/nurses', getNurses)

module.exports = router;