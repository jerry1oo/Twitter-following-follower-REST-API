const mongoose = require('mongoose');
const Joi = require('joi');

//User Schema (Only display_name and userhandle required)
const User = mongoose.model('User', new mongoose.Schema({
  display_name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50
  },
  userhandle: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50
  },

  Address: {
    Street: {
    type: String,
    minlength: 3,
    maxlength: 50
    },
    City: {
      type: String,
      minlength: 3,
      maxlength: 50
    },
    Zip: {
      type: String,
      minlength: 5,
      maxlength: 5
    }
  },
  TwoFactorAuthEnabled:{
    type: Boolean,
    default: false
  },
  followers: [ String ],
  following: [ String ]
}));

//Joi validator for user inputted data
function validateUser(user) {  
  const schemaAddress = Joi.object({
    Street: Joi.string().min(3).max(50),
    City: Joi.string().min(3).max(50),
    Zip: Joi.string().min(5).max(5).regex(/^\d+$/)
  });

  const schemaUser = Joi.object({
    display_name: Joi.string().min(3).max(50).required(),
    userhandle: Joi.string().min(3).max(50).required(),
    Address: schemaAddress,    
    TwoFactorAuthEnabled: Joi.boolean()    
  });

  return Joi.validate(user, schemaUser);
}


exports.User = User;
exports.validate = validateUser;