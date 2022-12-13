"use strict";
/************* Modules ***********/
const MONGOOSE = require('mongoose');
const { GENDER } = require('../../utils/constants');
const Schema = MONGOOSE.Schema;

/**************************************************
 ************* User Model or collection ***********
 **************************************************/
const userSchema = new Schema({
	userName: { type: String, required: true, unique: true },
	email: { type: String, required: true },
	firstName: { type: String },
	lastName: { type: String },
	gender: { type: Number, enum: [GENDER.OTHER, GENDER.MALE, GENDER.FEMALE] },
	profilePicture: { type: String, default: null },
	password: { type: String, required: true },
	noOfHearts: { type: Number, default: 0 },
	gameState: { type: Object, default: {} },
	resetPasswordToken: { type: String },
	isDeleted: { type: Boolean, default: false }
});

userSchema.set('timestamps', true);

module.exports = MONGOOSE.model('users', userSchema);
