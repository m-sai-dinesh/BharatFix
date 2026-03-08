const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage, uploadToCloudinary } = require('../config/cloudinary');
const {
  createReport, getMyReports, getByTicket, getOfficerReports,
  updateReport, getAllReports, deleteReport, getPublicReports
} = require('../controllers/reportController');
const { protect, authorize, superAdminOnly } = require('../middleware/auth');
const { validateLocation } = require('../middleware/locationValidator');

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    cb(null, allowed.test(file.originalname.toLowerCase().split('.').pop()));
  }
});

router.get('/public', getPublicReports);
router.get('/ticket/:ticketNumber', getByTicket);
router.get('/my', protect, authorize('citizen'), getMyReports);
router.get('/officer', protect, authorize('officer'), getOfficerReports);
router.get('/all', protect, authorize('super_admin'), getAllReports);

router.post('/', protect, authorize('citizen'), validateLocation, upload.array('photos', 5), createReport);
router.put('/:state/:id', protect, authorize('officer', 'super_admin'), upload.array('fixedPhotos', 3), updateReport);
router.delete('/:state/:id', protect, authorize('super_admin'), deleteReport);

module.exports = router;
