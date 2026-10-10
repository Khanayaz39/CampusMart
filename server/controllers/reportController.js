const Report = require('../models/Report');

exports.createReport = async (req, res, next) => {
  try {
    const { reportedItem, itemType, reason, description } = req.body;
    
    const report = await Report.create({
      reporter: req.user._id,
      reportedItem,
      itemType,
      reason,
      description
    });

    res.status(201).json(report);
  } catch (error) {
    next(error);
  }
};

exports.getReports = async (req, res, next) => {
  try {
    const reports = await Report.find()
      .populate('reporter', 'name email')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    next(error);
  }
};

exports.updateReport = async (req, res, next) => {
  try {
    const { status, adminNote } = req.body;
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status, adminNote },
      { new: true }
    );
    res.json(report);
  } catch (error) {
    next(error);
  }
};

exports.deleteReport = async (req, res, next) => {
  try {
    await Report.findByIdAndDelete(req.params.id);
    res.json({ message: 'Report dismissed' });
  } catch (error) {
    next(error);
  }
};

