const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// 채팅방 생성 또는 조회
router.get('/product/:productId', authMiddleware, chatController.getOrCreateChat);

// 채팅방 생성 (POST 엔드포인트 추가)
router.post('/', authMiddleware, chatController.createChat);

// 채팅방 목록 조회
router.get('/', authMiddleware, chatController.getChats);

// 채팅방 상세 정보 조회
router.get('/:chatId', authMiddleware, chatController.getChatById);

// 메시지 전송
router.post('/:chatId/messages', authMiddleware, chatController.sendMessage);

// 메시지 목록 조회
router.get('/:chatId/messages', authMiddleware, chatController.getMessages);

module.exports = router; 