const express = require('express');
const Anomaly = require('../models/Anomaly');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all anomalies for current user
router.get('/', auth, async (req, res) => {
  try {
    const { status, type, severity } = req.query;
    const filter = { user: req.userId };

    if (status) filter.status = status;
    if (type) filter.type = type;
    if (severity) filter.severity = severity;

    const anomalies = await Anomaly.find(filter)
      .sort({ createdAt: -1 })
      .populate('transaction');

    res.json({
      success: true,
      data: anomalies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get single anomaly
router.get('/:id', auth, async (req, res) => {
  try {
    const anomaly = await Anomaly.findOne({
      _id: req.params.id,
      user: req.userId
    }).populate('transaction');

    if (!anomaly) {
      return res.status(404).json({
        success: false,
        message: 'Anomaly not found'
      });
    }

    res.json({
      success: true,
      data: anomaly
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update anomaly status
router.put('/:id', auth, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['new', 'reviewed', 'resolved', 'ignored'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const anomaly = await Anomaly.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { status },
      { new: true }
    );

    if (!anomaly) {
      return res.status(404).json({
        success: false,
        message: 'Anomaly not found'
      });
    }

    res.json({
      success: true,
      data: anomaly
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Delete anomaly
router.delete('/:id', auth, async (req, res) => {
  try {
    const anomaly = await Anomaly.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });

    if (!anomaly) {
      return res.status(404).json({
        success: false,
        message: 'Anomaly not found'
      });
    }

    res.json({
      success: true,
      message: 'Anomaly deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
