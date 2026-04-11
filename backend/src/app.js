require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');
const authRoutes = require('./routes/authRoute');
const interactionRoute = require('./routes/interactionRoute');

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api', interactionRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
