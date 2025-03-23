const express = require('express');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');

const JWT_SECRET = "YUGAL is claim";


//R1 -- Create user using POST "/api/auth/createuser".With No login 
router.post('/createuser', [
    body('name').isLength({ min: 3 }),
    body('email').isEmail().withMessage('Not a valid e-mail address'),
    body('password', "password must be 5 characters").isLength({ min: 5 }),
] ,  
async (req, res) => {
  let success = false ;
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success, errors: errors.array() });
  }

  try {
     // Check if user already exists
     const existingUser = await User.findOne({ email: req.body.email });
     if (existingUser) {
       return res.status(400).json({ success, error: "Sorry, this email already exists." });
     }

     const salt = await bcrypt.genSalt(10);
     const secPass = await bcrypt.hash(req.body.password, salt);
     // Create a new user 
     const user = new User({
       name: req.body.name,
       password: secPass,
       email: req.body.email,
      });
      const data ={
        user:{
          id: user.id
        }
      }
      const authToken = jwt.sign(data, JWT_SECRET);

      await user.save(); 
      success = true ; // Save user in the database
      res.json({success, authToken});

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'enter a unique email' });
  }

});


// R2 -- Authenticate the user using POST "/api/auth/login".
router.post('/login', [
  body('email').isEmail().withMessage('Not a valid e-mail address'),
  body('password', "password can't be blank").exists(),
], async (req, res) => {
  let success = false;

  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success, errors: errors.array() });
  }

  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success, error: "Please try to login with correct credentials." });
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      return res.status(400).json({ success, error: "Please try to login with correct credentials." });
    }

    const data = {
      user: {
        id: user.id
      }
    };
    const authToken = jwt.sign(data, JWT_SECRET);
    success = true;

    // The `user` object in the response
    res.json({
      success,
      authToken,
      user: { name: user.name, email: user.email }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success, error: 'Internal server error' });
  }
});


// R3 -- Get login user details using POST "/api/auth/getuser". login required
router.post('/getuser', fetchuser, async (req, res) => {
  try {
    userId = req.user.id ;
    const user = await User.findById(userId).select("-password");
    res.send(user);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error'});    
  }

})
  

module.exports = router ;