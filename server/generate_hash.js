const bcrypt = require('bcryptjs');

const password = 'password123';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, function(err, hash) {
  if (err) {
      console.error(err);
  } else {
      console.log("---------------------------------------------------");
      console.log("Use this hash in your init.sql:");
      console.log(hash);
      console.log("---------------------------------------------------");
  }
});