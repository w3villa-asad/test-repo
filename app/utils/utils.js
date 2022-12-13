let CONSTANTS = require('./constants');
const MONGOOSE = require('mongoose');
const BCRYPT = require("bcrypt");
const JWT = require("jsonwebtoken");
const fs = require("fs");
const CONFIG = require('../../config');
const handlebars = require('handlebars');
const nodemailer = require('nodemailer');
const awsSms = require('aws-sns-sms');

const awsConfig = {
	accessKeyId: CONFIG.AWS.AWS_ACCESS_KEY_ID,
	secretAccessKey: CONFIG.AWS.AWS_SECRET_ACESS_KEY,
	region: CONFIG.AWS.AWS_REGION,
};

/**
 * nodemailer transport
 */
const transporter = nodemailer.createTransport(CONFIG.SMTP.TRANSPORT);

let commonFunctions = {};

/**
 * incrypt password in case user login implementation
 * @param {*} payloadString 
 */
commonFunctions.hashPassword = (payloadString) => {
	return BCRYPT.hashSync(payloadString, CONSTANTS.SECURITY.BCRYPT_SALT);
};

/**
 * @param {string} plainText 
 * @param {string} hash 
 */
commonFunctions.compareHash = (payloadPassword, userPassword) => {
	return BCRYPT.compareSync(payloadPassword, userPassword);
};

/**
 * function to get array of key-values by using key name of the object.
 */
commonFunctions.getEnumArray = (obj) => {
	return Object.keys(obj).map(key => obj[key]);
};

/** used for converting string id to mongoose object id */
commonFunctions.convertIdToMongooseId = (stringId) => {
	return MONGOOSE.Types.ObjectId(stringId);
};

/** create jsonwebtoken **/
commonFunctions.encryptJwt = (payload) => {
	let token = JWT.sign(payload, CONSTANTS.SECURITY.JWT_SIGN_KEY, { algorithm: 'HS256' });
	return token;
};

commonFunctions.decryptJwt = (token) => {
	return JWT.verify(token, CONSTANTS.SECURITY.JWT_SIGN_KEY, { algorithm: 'HS256' })
}

/**
 * function to convert an error into a readable form.
 * @param {} error 
 */
commonFunctions.convertErrorIntoReadableForm = (error) => {
	let errorMessage = '';
	if (error.message.indexOf("[") > -1) {
		errorMessage = error.message.substr(error.message.indexOf("["));
	} else {
		errorMessage = error.message;
	}
	errorMessage = errorMessage.replace(/"/g, '');
	errorMessage = errorMessage.replace('[', '');
	errorMessage = errorMessage.replace(']', '');
	error.message = errorMessage;
	return error;
};

/***************************************
 **** Logger for error and success *****
 ***************************************/
commonFunctions.messageLogs = (error, success) => {
	if (error)
		console.log(`\x1b[31m` + error);
	else
		console.log(`\x1b[32m` + success);
};

/**
 * function to get pagination condition for aggregate query.
 * @param {*} sort 
 * @param {*} skip 
 * @param {*} limit 
 */
commonFunctions.getPaginationConditionForAggregate = (sort, skip, limit) => {
	let condition = [
		...(!!sort ? [{ $sort: sort }] : []),
		{ $skip: skip },
		{ $limit: limit }
	];
	return condition;
};

/**
 * function to remove undefined keys from the payload.
 * @param {*} payload 
 */
commonFunctions.removeUndefinedKeysFromPayload = (payload = {}) => {
	for (let key in payload) {
		if (!payload[key]) {
			delete payload[key];
		}
	}
};

/**
 * Send an email to perticular user mail 
 */
commonFunctions.sendEmail = async (to, data, type) => {
	const email = commonFunctions.emailTypes(type, data);
	email.template = fs.readFileSync(email.template, 'utf-8');
	const message = await commonFunctions.renderTemplate(email.template, email.data);

	let emailToSend = {
		from: CONFIG.SMTP.SENDER,
		to,
		subject: email.subject,
		html: message
	}

	return new Promise(async (resolve, reject) => {
		try {
			let info = await transporter.sendMail(emailToSend);
			resolve(info);
		} catch (err) {
			reject(err)
		}
	})
};

/**
 * choosing the template according to the type of the email
 */
commonFunctions.emailTypes = (type, payload) => {
	let EmailData = {
		subject: '',
		data: {},
		template: ''
	};
	switch (type) {
		case CONSTANTS.EMAIL_TYPES.ACCOUNT_REGISTERED:
			EmailData['subject'] = CONSTANTS.EMAIL_SUBJECTS.ACCOUNT_REGISTERED;
			EmailData.template = CONSTANTS.EMAIL_CONTENTS.ACCOUNT_REGISTERED;
			EmailData.data['userName'] = payload.userName;
			break;

		case CONSTANTS.EMAIL_TYPES.FORGOT_PASSWORD:
			EmailData['subject'] = CONSTANTS.EMAIL_SUBJECTS.FORGOT_PASSWORD;
			EmailData.template = CONSTANTS.EMAIL_CONTENTS.FORGOT_PASSWORD;
			EmailData.data['resetPasswordLink'] = payload.resetPasswordLink;
			EmailData.data['userName'] = payload.userName;
			// EmailData.data['forgotPasswordImage'] = `${CONFIG.SERVER_URL}/public/images/forgot-password.png`;
			break;

		default:
			EmailData['Subject'] = 'Welcome Email!';
			break;
	}
	return EmailData;
};

/**
 * rendering template method
 */
commonFunctions.renderTemplate = (template, data) => {
	return handlebars.compile(template)(data);
};

/**
 * function to create reset password link.
 */
commonFunctions.createResetPasswordLink = (userData) => {
	let dataForJWT = { _id: userData._id, Date: Date.now, email: userData.email };
	let resetPasswordLink = CONFIG.SERVER_URL + '/v1/user/reset-password?token=' + commonFunctions.encryptJwt(dataForJWT);
	return resetPasswordLink;
};

/**
 * function to create reset password link.
 */
commonFunctions.createAccountRestoreLink = (userData) => {
	let dataForJWT = { previousAccountId: userData._id, Date: Date.now, email: userData.email, newAccountId: userData.newAccountId };
	let accountRestoreLink = CONFIG.SERVER_URL + '/v1/user/restore/' + commonFunctions.encryptJwt(dataForJWT);
	return accountRestoreLink;
};

/**
 * function to generate random alphanumeric string
 */
commonFunctions.generateAlphanumericString = (length) => {
	let chracters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	var randomString = '';
	for (var i = length; i > 0; --i) randomString += chracters[Math.floor(Math.random() * chracters.length)];
	return randomString;
};

/**
 * function to generate random otp string
 * @param {otplength, } phoneNumber
 * @param {sampleSpace} String
 * @returns {randomString}
 */
commonFunctions.generateRandomString = (otplength = 4, sampleSpace = '0123456789') => {
	let randomString = '', range = sampleSpace.length;
	for (let index = 0; index < otplength; index++) {
		randomString += sampleSpace[Math.floor(Math.random() * (range - 1))];
	}
	return randomString;
}

/**
 * function to sent sms via AWS-SNS
 * @param {receiver} phoneNumber
 * @param {content} SMS 
 */
commonFunctions.sendSms = async (receiver, content) => {
	let msg = {
		"message": content,
		"sender": CONFIG.AWS.SMS_SENDER,
		"phoneNumber": receiver
	};
	let smsResponse = await awsSms(awsConfig, msg);
	return smsResponse
}

module.exports = commonFunctions;

