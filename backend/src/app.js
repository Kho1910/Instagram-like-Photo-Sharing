require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');
const authRoutes = require('./routes/authRoute');
const userRoutes = require('./routes/userRoute');
const mediaRoutes = require('./routes/mediaRoute');
const interactionRoute = require('./routes/interactionRoute');

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/medias', mediaRoutes);
app.use('/api', interactionRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
