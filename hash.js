import bcrypt from 'bcrypt';

const password = '1234'; // la contraseña que quieras hashear
const saltRounds = 10;

const hashedPassword = await bcrypt.hash(password, saltRounds);
console.log('Hashed password:', hashedPassword);
