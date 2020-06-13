const {User,validate} = require('../DB/User')// User Model and validator
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

//////////////////GET Requests//////////////////

// Respond with all current users in database
router.get('/', async (req, res) => {
  const users = await User.find();
  res.send(users)
});

// Respond with all attributes of the user
router.get('/:userhandle', async (req, res) => {
  const user = await User.findOne({userhandle: req.params.userhandle});
  if(user.length == 0){
    res.send("User " + req.params.userhandle + " does not exist!");
  }
  else{
    res.send(user);
  }
});

// Respond with a array of all userhandles that follow a particular user
router.get('/:userhandle/followers', async (req, res) => {
  const user = await User.findOne({userhandle: req.params.userhandle});
  if(user.length == 0){
    res.send("User " + req.params.userhandle + " does not exist!");
  }
  else{
    res.send(user.followers);
  }
});

// Respond with a array of all userhandles a user follows
router.get('/:userhandle/following', async (req, res) => {
  const user = await User.findOne({userhandle: req.params.userhandle});
  if(user.length == 0){
    res.send("User " + req.params.userhandle + " does not exist!");
  }
  else{
    res.send(user.following);
  }
});

// Respond with a unique array of all followers a user is connected to
router.get('/:userhandle/connections', async (req, res) => {
  const user = await User.findOne({userhandle: req.params.userhandle});
  if(user.length == 0){
    res.send("User " + req.params.userhandle + " does not exist!");
  }
  else{
    // Create a array of requested user's followers along with that user    
    user.following.push(req.params.userhandle);
    let connections = user.following;
    // Aggrigate all followers array into 1 array with no duplicates 
    const result = await User.aggregate([
      {
        //Only aggrigate from connections array created above
        "$match" : {
          "userhandle": { $in: connections}
        }
      },
      {
        // Push all the userhandels following arrays into one array 
        "$group": {
            "_id": 0,
            "following": { "$push": "$following" }
        }
      },
      {
        // Apply $setUnion to all arrays and create a single array with no duplicates
        "$project": {
            "_id": 0,
            "following": {
                "$reduce": {
                    "input": "$following",
                    "initialValue": [],
                    "in": { "$setUnion": ["$$value", "$$this"] }
                }
            }
        }
      }
    ]);

    res.send(result[0]["following"]);
  }
});

//////////////////Post Requests//////////////////

// Add a new user to Database
 
// Format:
// {
// 	"display_name": "Jeremiah",
// 	"userhandle": "Jeremiah",
// 	"Address": {
// 		"Street": "tempstreet",
// 		"City": "tempcity",
// 		"Zip": "90302"
// 	},
// 	"TwoFactorAuthEnabled": true
// }

router.post('/addUser', async (req, res) => {
  // Validate User Input
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  // Create and add new User to Database 
  let user = new User({ 
    display_name: req.body.display_name,
    userhandle: "@" + req.body.userhandle, 
    Address: req.body.Address,
    TwoFactorAuthEnabled: req.body.TwoFactorAuthEnabled
  });
  user = await user.save();
  
  res.send(user);
});

// userhandle Follow userhandle1 if not already following
router.post('/:userhandle/follow/:userhandle1', async (req, res) => {
  //Get both users and check if they exist
  const user1 = await User.findOne({userhandle: req.params.userhandle});
  const user2 = await User.findOne({userhandle: req.params.userhandle1});
  if(user1 == null || user2 == null){
    res.send("A User does not exist!");
  }
  else{
    // If NOT already following then start following
    if(!user1.following.includes(req.params.userhandle1)){
      user1.following.push(req.params.userhandle1); 
      user2.followers.push(req.params.userhandle);
      res.send(req.params.userhandle + " is following " + req.params.userhandle1);
      const result1 = await user1.save();
      const result2 = await user2.save();      
    }
    else{
      res.send(req.params.userhandle + " already follows " + req.params.userhandle1);
    }   
  } 
});


module.exports = router;