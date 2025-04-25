const chatService = require('../services/chat.service');

class ChatController {
  // 채팅방 생성 또는 조회
  async getOrCreateChat(req, res) {
    try {
      const { productId } = req.params;
      const userId = req.user.id;

      const chat = await chatService.getOrCreateChat(productId, userId);
      res.json(chat);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // 채팅방 생성
  async createChat(req, res) {
    try {
      const { productId, receiverId } = req.body;
      const senderId = req.user.id;

      if (!receiverId) {
        return res.status(400).json({ error: '수신자 ID가 필요합니다.' });
      }
      
      // productId가 없어도 채팅방은 생성할 수 있도록 함
      // productId는 관련 상품 정보를 가져오는 데만 사용되고 실제 DB에는 저장되지 않음
      const chat = await chatService.createChat(productId || null, senderId, receiverId);
      res.status(201).json(chat);
    } catch (error) {
      console.error('채팅방 생성 오류:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // 채팅방 목록 조회
  async getChats(req, res) {
    try {
      const userId = req.user.id;
      const chats = await chatService.getChats(userId);
      res.json(chats);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // 채팅방 상세 정보 조회
  async getChatById(req, res) {
    try {
      const { chatId } = req.params;
      const userId = req.user.id;
      
      console.log(`채팅방 상세 조회 요청: chatId=${chatId}, userId=${userId}`);
      
      const chat = await chatService.getChatById(chatId, userId);
      res.json(chat);
    } catch (error) {
      console.error(`채팅방 상세 조회 오류: ${error.message}`);
      res.status(400).json({ error: error.message });
    }
  }

  // 메시지 전송
  async sendMessage(req, res) {
    try {
      const { chatId } = req.params;
      const { content } = req.body;
      const senderId = req.user.id;

      if (!content || content.trim() === '') {
        return res.status(400).json({ error: '메시지 내용이 필요합니다.' });
      }

      const message = await chatService.sendMessage(chatId, senderId, content);
      res.json(message);
    } catch (error) {
      console.error('메시지 전송 오류:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // 메시지 목록 조회
  async getMessages(req, res) {
    try {
      const { chatId } = req.params;
      const userId = req.user.id;
      const { page, limit } = req.query;

      const messages = await chatService.getMessages(chatId, userId, page, limit);
      res.json(messages);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new ChatController(); 