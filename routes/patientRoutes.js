const express = require('express');
const router = express.Router();
// كنجيبو الملف كامل وكنسميوه authController
const { registerPatient,
        loginPatient, 
        createAppointment, 
        addNurse
    } = require('../controllers/patientController'); 

router.post('/register', registerPatient);

router.post('/login', loginPatient);

router.post('/appointment', createAppointment);

router.post('/add-nurse', addNurse);



module.exports = router;