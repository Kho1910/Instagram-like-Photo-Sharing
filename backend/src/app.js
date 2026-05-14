require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');
const authRoutes = require('./routes/authRoute');
const userRoutes = require('./routes/userRoute');
const mediaRoutes = require('./routes/mediaRoute');
const postRoutes = require('./routes/postRoute');
const feedRoutes = require('./routes/feedRoute');
const exploreRoutes = require('./routes/exploreRoute')
const notificationRoutes = require('./routes/notificationRoute');

const notificationWorker = require('./workers/notificationWorker');

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/medias', mediaRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/explore', exploreRoutes);
app.use('/api/notifications', notificationRoutes);

module.exports = app
