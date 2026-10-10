const { moderateListing, moderateChatMessage } = require('../services/moderationService');

/**
 * Express middleware to audit product listings (images + text) before creation
 */
const moderateProductListingMiddleware = async (req, res, next) => {
  try {
    const { title, description, tags, category } = req.body;
    const files = req.files || [];

    // Fast path: if no text or files provided (e.g. status updates like mark as sold), proceed
    if (!title && !description && !tags && (!files || files.length === 0)) {
      return next();
    }

    const audit = await moderateListing({
      title,
      description,
      tags,
      category,
      files
    });

    if (!audit.isSafe) {
      return res.status(400).json({
        message: audit.userMessage || '🛡️ Content blocked by Campus Safety Moderation.',
        violationType: audit.violationType,
        reason: audit.reason
      });
    }

    next();
  } catch (error) {
    console.error('Error in content moderation middleware:', error);
    // If moderation encounters unexpected error, proceed with caution or fail-open
    next();
  }
};

/**
 * Express middleware to audit chat messages before delivery
 */
const moderateChatMessageMiddleware = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content) return next();

    const audit = await moderateChatMessage(content);

    if (!audit.isSafe) {
      return res.status(400).json({
        message: audit.userMessage || '🛡️ Message blocked by CampusMart AI Moderation.',
        violationType: audit.violationType,
        reason: audit.reason
      });
    }

    next();
  } catch (error) {
    console.error('Error in chat moderation middleware:', error);
    next();
  }
};

module.exports = {
  moderateProductListingMiddleware,
  moderateChatMessageMiddleware
};
