const CONFIG = require('../../../config');
const sessionModel = require(`../../models/bigheart/sessionModel`);

let sessionService = {};

/**
 * function to update user's session in the database.
 */
sessionService.updateSession = async (criteria, dataToUpdate) => {
    return await sessionModel.findOneAndUpdate(criteria, dataToUpdate, { new: true, upsert: true }).lean();
};

/**
 * function to verify a user's session.
 */
sessionService.verifySession = async (userId, userToken) => {
    let userSession = await sessionModel.findOne({ userId, userToken }).lean();
    if (userSession) {
        return true;
    }
    return false;
};

/**
 * function to fetch user's session.
 */
sessionService.getSession = async (criteria) => {
    return await sessionModel.findOne(criteria).populate('userId').lean();
};

/**
 * function to remove session of a user when user is deleted from system.
 */
sessionService.removeSession = async (userId) => {
    return await sessionModel.findOneAndRemove({ userId });
};

module.exports = sessionService;