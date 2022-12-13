"use strict";

const _ = require('lodash');
const HELPERS = require("../../helpers");
const { MESSAGES, ERROR_TYPES, NORMAL_PROJECTION, EMAIL_TYPES } = require('../../utils/constants');
const SERVICES = require('../../services');
const fs = require('fs');
const { compareHash, hashPassword, encryptJwt, createResetPasswordLink, createAccountRestoreLink, sendEmail, renderTemplate } = require(`../../utils/utils`);
const { ServiceDiscovery } = require('aws-sdk');

/***************************
 ***** User controller *****
 ***************************/
let userController = {};

/**
 * function to register a user to the system.
 */
userController.registerUser = async (payload) => {
	let isUserAlreadyExists = await SERVICES.userService.fetchUser({ $or: [{ email: payload.email }, { userName: payload.userName }] }, { password: 0, ...NORMAL_PROJECTION });
	if (isUserAlreadyExists)
		throw HELPERS.responseHelper.createErrorResponse(MESSAGES.USER_ALREADY_EXISTS, ERROR_TYPES.BAD_REQUEST);
	payload.password = hashPassword(payload.password);
	let newUser = await SERVICES.userService.createUser(payload);
	// send welcome email to the user
	await sendEmail(newUser.email, { userName: newUser.userName }, EMAIL_TYPES.ACCOUNT_REGISTERED);
	// create token
	const dataForJwt = {
		id: newUser._id,
		date: Date.now()
	};
	const token = encryptJwt(dataForJwt);
	let user = _.omit(newUser.toJSON(), ['password', ...Object.keys(NORMAL_PROJECTION)]);
	user = { ...user, ...{ token } }
	return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.USER_REGISTERED_SUCCESSFULLY), { user });
};

/**
 * function to login a user to the system.
 */
userController.loginUser = async (payload) => {
	// to make exact match and case-insensitive
	payload.emailOrUsername = `^${payload.emailOrUsername}$`;
	// check is user exists in the database with provided email or not.
	let user = await SERVICES.userService.fetchUser({
		$or: [
			{ email: { '$regex': payload.emailOrUsername, $options: 'i' } },
			{ userName: { '$regex': payload.emailOrUsername, $options: 'i' } }
		]
	}, NORMAL_PROJECTION);
	// if user exists then compare the password that user entered.
	if (!user)
		throw HELPERS.responseHelper.createErrorResponse(MESSAGES.INVALID_EMAIL_USERNAME, ERROR_TYPES.BAD_REQUEST);

	// compare user's password.
	if (!compareHash(payload.password, user.password))
		throw HELPERS.responseHelper.createErrorResponse(MESSAGES.INVALID_PASSWORD, ERROR_TYPES.BAD_REQUEST);

	const dataForJwt = {
		id: user._id,
		date: Date.now()
	};
	return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.LOGGED_IN_SUCCESSFULLY), { data: { token: encryptJwt(dataForJwt) } });
};

/**
 * Function to fetch user's profile from the system.
 */
userController.fetchUserProfile = async (payload) => {
	let user = await SERVICES.userService.fetchUser({ _id: payload.user._id }, { ...NORMAL_PROJECTION, password: 0 });
	if (user)
		return Object.assign(HELPERS.responseHelper.createSuccessResponse(MESSAGES.PROFILE_FETCHED_SUCCESSFULLY), { data: user });
	throw HELPERS.responseHelper.createErrorResponse(MESSAGES.NOT_FOUND, ERROR_TYPES.DATA_NOT_FOUND);
};

/**
 * Function to update user's profile.
 */
userController.updateUserProfile = async (payload) => {
	await SERVICES.userService.updateUser({ _id: payload.user._id }, payload);
	return HELPERS.responseHelper.createSuccessResponse(MESSAGES.PROFILE_UPDATE_SUCCESSFULLY);
};

/**
 * funciton to send a link to registered email of an user who forgots his password.
 */
userController.forgotPassword = async (payload) => {
	let requiredUser = await SERVICES.userService.fetchUser({ email: payload.email });
	if (requiredUser) {
		// create reset-password link.
		let resetPasswordLink = createResetPasswordLink(requiredUser);
		let linkParts = resetPasswordLink.split("/");
		payload.resetPasswordToken = linkParts[linkParts.length - 1].split("?token=")[1];
		await SERVICES.userService.updateUser({ _id: requiredUser._id }, payload);

		// send reset-password link to user via email.
		await sendEmail(requiredUser.email, { resetPasswordLink, userName: requiredUser.userName }, EMAIL_TYPES.FORGOT_PASSWORD);
		return HELPERS.responseHelper.createSuccessResponse(MESSAGES.CONFIRMATION_LINK_SENT_TO_YOUR_EMAIL);
	}
	throw HELPERS.responseHelper.createErrorResponse(MESSAGES.INVALID_EMAIL, ERROR_TYPES.BAD_REQUEST);
};

/**
 * Method to render reset password page
 */
userController.navigateToResetPassword = async (payload) => {
	let isTokenValid = await SERVICES.userService.fetchUser({ resetPasswordToken: payload.token });
	if (!isTokenValid) {
		throw HELPERS.responseHelper.createErrorResponse(MESSAGES.RESET_PASSWORD_TOKEN_EXPIRED, ERROR_TYPES.BAD_REQUEST)
	}
	return { statusCode: 200, filePath: 'public/templates/reset-password.html' }
}

/**
 * Function to reset user's password.
 */
userController.resetPassword = async (payload) => {
	let isTokenValid = await SERVICES.userService.fetchUser({ resetPasswordToken: payload.resetPasswordToken });
	if (!isTokenValid) {
		throw HELPERS.responseHelper.createErrorResponse(MESSAGES.RESET_PASSWORD_TOKEN_EXPIRED, ERROR_TYPES.BAD_REQUEST)
	}
	await SERVICES.userService.updateUser({ resetPasswordToken: payload.resetPasswordToken }, { resetPasswordToken: null, password: hashPassword(payload.confirmPassword) });
	return { statusCode: 200, redirectUrl: `${process.env.SERVER_URL}/v1/user/password-reset-successfully` }
};

/**
 * render successful password changed page
 */
userController.passwordResetSuccessfully = async (payload) => {
	return { statusCode: 200, filePath: 'public/templates/password-changed.html' }
}

/* export userController */
module.exports = userController;