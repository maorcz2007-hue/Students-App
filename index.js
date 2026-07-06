const express = require('express');
const cors = require('cors');
const authRoutes = require('./authRoutes');
require('dotenv').config();

const app = express();

// הגדרת משתנים
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // מאפשר לקרוא בקשות מסוג JSON

// Routes
app.use('/api/auth', authRoutes);

// בדיקת תקינות בסיסית
app.get('/', (req, res) => {
  res.send('Student Hub API is running perfectly...');
});

// הפעלת השרת
app.listen(PORT, () => {
  console.log(`Server successfully deployed and running on port ${PORT}`);
});
