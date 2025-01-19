const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Register a new user
exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Validate input
    if (!name || !email || !password) {
      console.log("All field are required")
      return res.status(400).json({ success: false, message: 'All fields are required',body :req.query });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Create a new user
    const newUser = new User({ name, email, password });
    await newUser.save();

    // Generate a JWT token
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ success: true, token });
  } catch (error) {
    console.error('Error registering user:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Login user
exports.loginUser = async (req, res) => {

    const { email, password } = req.body.email ? req.body : req.query;
  
    console.log('Login attempt with email:', email); // Add this log
    console.log('Password entered:', password); // Add this log
  
    try {
      // Validate input
      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required', body: req.body, query: req.query });
      }
  
      // Check if the user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ success: false, message: 'Invalid email' });
      }
  
      // Compare the password
      const isMatch = await bcrypt.compare(password.trim(), user.password);

      console.log('Password comparison result:', isMatch); // Add this log
      console.log("password:",password);
      console.log("user.password:",user.password);

  
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Invalid password' });
      }
  
      // Generate a JWT token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
      res.status(200).json({ success: true, token });
    } catch (error) {
      console.error('Error logging in user:', error.message);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  };
  