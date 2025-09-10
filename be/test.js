const bcrypt = require('bcryptjs');

(async () => {
  const password = 'user3'; // Replace with your desired password
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log('Hashed Password:', hashedPassword);
})();