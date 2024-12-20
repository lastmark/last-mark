const bcrypt = require('bcryptjs');

const password = '123456789';

bcrypt.hash(password, 10, (err, hash) => {
  if (err) throw err;
  console.log(`Hashed Password: ${hash}`);
});
