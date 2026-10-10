const express = require('express');
const router = express.Router();
const { createReport, getReports, updateReport, deleteReport } = require('../controllers/reportController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', protect, createReport);
router.get('/', protect, adminOnly, getReports);
router.put('/:id', protect, adminOnly, updateReport);
router.delete('/:id', protect, adminOnly, deleteReport);

module.exports = router;
