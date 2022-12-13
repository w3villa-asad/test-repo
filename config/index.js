const path = require('path');
const lodash = require('lodash');

var development = require('./env/development');
var production = require('./env/production');
var staging = require('./env/staging');


var PLATFORM = process.env.PLATFORM || 'bigheart';
var mongoUri = 'mongodb+srv://admin:admin@cluster0.awxqs.mongodb.net/bigheart?retryWrites=true&w=majority';
// var mongoUri = 'mongodb://localhost:27017/bigheart';



var defaults = {
    PLATFORM: PLATFORM,
    root: path.normalize(__dirname + '/../app'),
    theme: PLATFORM + '/us',
    mongoUri: mongoUri,
    adminEmail: 'admin@admin.com',
    host: '',
    SENDGRID_API_KEY: 'CHANGEME',
    environment: process.env.NODE_ENV || 'production',
    show: function () {
        console.log('environment: ' + this.environment);
    },
    SENDINBLUE: {
        API_KEY: 'dummy',
        SENDER_EMAIL: 'contact@demo.in'
    },
    SMTP: {
        TRANSPORT: {
            host: process.env.NODEMAILER_HOST || `node-mailer-host-name`,
            service: process.env.NODEMAILER_SERVICE || `node-mailer-service`,
            auth: {
                user: process.env.NODEMAILER_USER || `node-mailer-user`,
                pass: process.env.NODEMAILER_PASSWORD || `node-mailer-password`
            },
            secure: false,
            tls: { rejectUnauthorized: false },
        },
        SENDER: 'Big Heart <bigheart@yopmail.com>',
    },
    FCM: {
        API_KEY: 'FCM_API_KEY'
    },
    AWS:{
        AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || `aws_access_key`,
        AWS_SECRET_ACESS_KEY: process.env.AWS_SECRET_ACESS_KEY|| 'aws_secret_key',
        AWS_REGION: process.env.AWS_REGION || 'ohio',
        SMS_SENDER: process.env.SMS_SENDER || 'Big Heart' 
    },
    ENV_STAGING: "staging",
    ENV_DEVELOPMENT: "development",
    ENV_PRODUCTION: "production",
    environment: process.env.NODE_ENV || 'development',
    mongoDB: {
        PROTOCOL: process.env.DB_PROTOCOL || 'mongodb+srv',//'mongodb',
        HOST: process.env.DB_HOST || 'admin:admin@cluster0.awxqs.mongodb.net',//'127.0.0.1',
        PORT: process.env.DB_PORT || 27017,
        NAME: process.env.DB_NAME || 'bigheart',
        USER: '',
        PASSWORD: '',
        get URL() { return process.env.dbUrl || `${this.PROTOCOL}://${this.HOST}/${this.NAME}` }
    },
    domain: {
        PROTOCOL: process.env.DOMAIN_PROTOCOL || 'http',
        HOST: process.env.DOMAIN_HOST || '127.0.0.1',
        PORT: process.env.DOMAIN_PORT ? process.env.DOMAIN_PORT : '3000',
        get URL() { return `${this.PROTOCOL}://${this.HOST}${!!this.PORT ? ':' + this.PORT : ''}` }
    },
    server: {
        PROTOCOL: process.env.SERVER_PROTOCOL || 'http',
        HOST: process.env.SERVER_HOST || '0.0.0.0',
        PORT: process.env.SERVER_PORT || '3000',
        get URL() { return `${this.PROTOCOL}://${this.HOST}:${this.PORT}` }
    },
    PATH_FOR_LOCAL: process.env.PATH_FOR_LOCAL || '/uploads/',
    SERVER_URL: process.env.SERVER_URL || 'http://localhost:3000',
    swagger: require('./swagger'),
    s3Bucket: {
        accessKeyId: process.env.ACCESS_KEY_ID || 'access-key-id',
        secretAccessKey: process.env.SECRET_ACCESS_KEY || 'secret-access-key',
        zipBucketName: process.env.S3_BUCKET_NAME || 'bucket-name'
    },
    SERVER_URL: process.env.SERVER_URL || 'http://localhost:3000',
    PATH_TO_UPLOAD_FILES_ON_LOCAL: process.env.PATH_TO_UPLOAD_FILES_ON_LOCAL || '/uploads/files',
};

let currentEnvironment = process.env.NODE_ENV || 'production';

function myConfig(myConfig) {
    let mergedConfig = lodash.extend(lodash.clone(defaults), myConfig);
    return mergedConfig;
};

module.exports = {
    development: myConfig(development),
    production: myConfig(production),
    staging: myConfig(staging)
}[currentEnvironment];


