const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const categoryRoutes = require('./routes/category.routes');
const searchRoutes = require('./routes/search.routes');
const chatRoutes = require('./routes/chat.routes');
const reportRoutes = require('./routes/report.routes');
const adminRoutes = require('./routes/admin.routes');
const db = require('../models');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Socket.IO 연결 처리
io.on('connection', (socket) => {
  console.log('New client connected');

  // 채팅방 입장
  socket.on('join-chat', (chatId) => {
    socket.join(`chat-${chatId}`);
  });

  // 채팅방 퇴장
  socket.on('leave-chat', (chatId) => {
    socket.leave(`chat-${chatId}`);
  });

  // 메시지 전송
  socket.on('send-message', (data) => {
    io.to(`chat-${data.chatId}`).emit('new-message', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 데이터베이스 연결
db.sequelize.authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

// 기본 라우트
app.get('/', (req, res) => {
    res.send('중고 거래 플랫폼 API 서버');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);

// 404 처리
app.use((req, res, next) => {
    res.status(404).json({ message: 'Not Found' });
});

// 에러 핸들러
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;