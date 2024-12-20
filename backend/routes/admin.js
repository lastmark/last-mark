const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const auth = require('../middleware/auth');

router.post('/create-user',auth, async (req, res) => {
  const { username, admin } = req.body;
console.log(req);

  try {
    let user = await User.findOne({ username });
    if (user) return res.status(400).json({ message: 'User already exists' });

    user = new User({
      username,
      password: await bcrypt.hash('123456789', 10),
      admin
    });

    await user.save();
    res.json({ message: 'User created successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
