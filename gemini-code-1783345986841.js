const db = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_change_me';

// הרשמת משתמש חדש
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // בדיקה אם המשתמש כבר קיים
    const userExists = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // הצפנת הסיסמה
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // שמירה במסד הנתונים
    const newUser = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, hashedPassword, role || 'student']
    );

    // הנפקת טוקן (JWT)
    const token = jwt.sign({ id: newUser.rows[0].id, role: newUser.rows[0].role }, JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({
      token,
      user: newUser.rows[0]
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// התחברות משתמש קיים
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // בדיקה אם המשתמש קיים
    const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = userResult.rows[0];

    // אימות סיסמה
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // הנפקת טוקן (JWT)
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};