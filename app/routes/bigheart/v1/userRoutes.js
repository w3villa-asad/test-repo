'use strict';

const { Joi } = require('../../../utils/joiUtils');
const {
	registerUser,
	loginUser,
	fetchUserProfile,
	updateUserProfile,
	forgotPassword,
	resetPassword,
	navigateToResetPassword,
	passwordResetSuccessfully
} = require(`../../../controllers/bigheart/userController`);
const { AVAILABLE_AUTHS } = require('../../../utils/constants');

let routes = [
	{
		method: 'POST',
		path: '/v1/user/register',
		joiSchemaForSwagger: {
			body: {
				email: Joi.string().email().description('User\'s email.'),
				userName: Joi.string().description('User\'s username.'),
				firstName: Joi.string().description('User\'s firstName.'),
				lastName: Joi.string().description('User\'s lastName.'),
				gender: Joi.number().description('User\'s gender.'),
				profilePicture: Joi.string().description('User\'s profile picture.'),
				password: Joi.string().required().description('User\'s phone.')
			},
			group: 'User',
			description: 'Route to register.',
			model: 'Register'
		},
		handler: registerUser
	},
	{
		method: 'POST',
		path: '/v1/user/login',
		joiSchemaForSwagger: {
			body: {
				emailOrUsername: Joi.string().description('User\'s username/email.'),
				password: Joi.string().required().description('User\'s password.'),
			},
			group: 'User',
			description: 'Route to login.',
			model: 'Login'
		},
		handler: loginUser
	},
	{
		method: 'POST',
		path: '/v1/user/forgot-password',
		joiSchemaForSwagger: {
			body: {
				email: Joi.string().email().description('User\'s email.')
			},
			group: 'User',
			description: 'Route to get reset password link.',
			model: 'Forgot_password'
		},
		handler: forgotPassword
	},
	{
		method: 'GET',
		path: '/v1/user/reset-password',
		joiSchemaForSwagger: {
			query: {
				token: Joi.string().description('User\'s reset password token.')
			},
			group: 'User',
			description: 'Route to navigate to reset password link.',
			model: 'Reset_password_link_navigation'
		},
		handler: navigateToResetPassword
	},
	{
		method: 'POST',
		path: '/v1/user/reset-password',
		joiSchemaForSwagger: {
			body: {
				resetPasswordToken: Joi.string().description('User\'s reset token.'),
				newPassword: Joi.string().description('User\'s new password.'),
				confirmPassword: Joi.string().description('User\'s confirm password.')
			},
			group: 'User',
			description: 'Route to reset password.',
			model: 'Reset_password'
		},
		handler: resetPassword
	},
	{
		method: 'GET',
		path: '/v1/user/password-reset-successfully',
		joiSchemaForSwagger: {
			group: 'User',
			description: 'Route to render successful page.',
			model: 'Reset_password_successfully'
		},
		handler: passwordResetSuccessfully
	},
	{
		method: 'GET',
		path: '/v1/user/get-profile',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description('User auth token')
			},
			group: 'User',
			description: 'Route to fetch profile.',
			model: 'Fetch_profile'
		},
		auth: AVAILABLE_AUTHS.USER,
		handler: fetchUserProfile
	},
	{
		method: 'PUT',
		path: '/v1/user/update-profile',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description('User auth token')
			},
			body: {
				email: Joi.string().email().description('User\'s email.'),
				userName: Joi.string().description('User\'s username.'),
				firstName: Joi.string().description('User\'s firstName.'),
				lastName: Joi.string().description('User\'s lastName.'),
				gender: Joi.number().description('User\'s gender.'),
				profilePicture: Joi.number().description('User\'s profile picture.'),
				noOfHearts: Joi.number().description('No of hearts available.'),
				gameState: Joi.object().description('Game state')
			},
			group: 'User',
			description: 'Route to update a user profile.',
			model: 'Update_User_Profile'
		},
		auth: AVAILABLE_AUTHS.USER,
		handler: updateUserProfile
	}
];

module.exports = routes;
