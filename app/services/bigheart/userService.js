'use strict';

const { userModel } = require(`../../models`);
const userService = {};

/**
 * register a user
 */
userService.createUser = async (dataToSave) => {
	return await userModel.create(dataToSave);
}

/**
 * fetch user
 */
userService.fetchUser = async (criteria, projection) => {
	return await userModel.findOne(criteria, projection);
}

/**
 * update user
 */
userService.updateUser = async (criteria, dataToUpdate) => {
	return await userModel.updateOne(criteria, { $set: dataToUpdate });
}

module.exports = userService;