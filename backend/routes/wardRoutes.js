const express = require('express');
const router = express.Router();
const {
  createOfficer, getAllOfficers, updateOfficer,
  deleteOfficer, resetPassword, getDashboardStats
} = require('../controllers/wardController');
const { protect, superAdminOnly } = require('../middleware/auth');

router.use(protect, superAdminOnly);

router.get('/stats', getDashboardStats);
router.get('/officers', getAllOfficers);
router.post('/officers', createOfficer);
router.put('/officers/:id', updateOfficer);
router.put('/officers/:id/reset-password', resetPassword);
router.delete('/officers/:id', deleteOfficer);

module.exports = router;
