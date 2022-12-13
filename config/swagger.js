module.exports = {
  "swagger": "2.0",
  "info": {
    "version": "2.0.0",
    "title": "BigHeart Foundation Application",
    "description": "Project",
    "termsOfService": "http://swagger.io/terms/",
    "contact": {
      "name": "Chicmic Team"
    },
    "license": {
      "name": "MIT"
    }
  },
  "paths": {},
  "definitions": {},
  "schemes": [
    "http",
    "https"
  ],
  "consumes": [
    "application/json"
  ],
  "produces": [
    "application/json"
  ],
  "securityDefinitions": { // security definitions can be multiple
    "adminTokenHeader": {
      "type": "apiKey",
      "name": "authorization",
      "in": "header"
    },
    "userTokenHeader": {
      "type": "apiKey",
      "name": "authorization",
      "in": "header"
    }
  }
};