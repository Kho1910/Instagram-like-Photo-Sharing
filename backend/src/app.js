require('dotenv').config();

const express = require('express');
const app = express();
const authRoutes = require('./routes/authRoute');

app.use(express.json());
app.use('/api/auth', authRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});