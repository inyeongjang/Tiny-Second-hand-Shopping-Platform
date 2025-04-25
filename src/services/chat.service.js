const { Chat, ChatParticipant, Message, User, Product } = require('../../models');
const { Op } = require('sequelize');

class ChatService {
  // 채팅방 생성 또는 조회
  async getOrCreateChat(productId, userId) {
    try {
      let productInfo = null;
      let sellerId = null;
      
      // productId가 있는 경우에만 상품 정보 조회
      if (productId) {
        // 상품 정보 확인
        const product = await Product.findByPk(productId);
        if (product) {
          productInfo = product;
          sellerId = product.sellerId || product.userId;
        }
      }
      
      // sellerId가 없는 경우 채팅을 생성할 수 없음
      if (!sellerId) {
        throw new Error('판매자 정보를 찾을 수 없습니다.');
      }
      
      // 이미 존재하는 채팅방 검색
      const existingChat = await Chat.findOne({
        where: {
          [Op.or]: [
            { senderId: userId, receiverId: sellerId },
            { senderId: sellerId, receiverId: userId }
          ]
        }
      });
      
      let chat;
      
      // 채팅방이 없으면 생성
      if (!existingChat) {
        chat = await Chat.create({
          senderId: userId,
          receiverId: sellerId,
          message: '새로운 대화가 시작되었습니다.'
        });
        
        // 제품 정보 추가 (가상 필드, DB에 저장되지 않음)
        if (productInfo) {
          chat.dataValues.productInfo = productInfo;
          chat.dataValues.lastMessage = `${productInfo.title}에 대한 문의입니다.`;
        } else {
          chat.dataValues.lastMessage = '새로운 대화가 시작되었습니다.';
        }
      } else {
        chat = existingChat;
        // 제품 정보 추가 (가상 필드)
        if (productInfo) {
          chat.dataValues.productInfo = productInfo;
        }
      }

      return chat;
    } catch (error) {
      throw new Error('Failed to get or create chat: ' + error.message);
    }
  }

  // 새로운 채팅방 생성
  async createChat(productId, senderId, receiverId) {
    try {
      let productInfo = null;
      
      // productId가 있는 경우에만 상품 정보 조회
      if (productId) {
        // 상품 정보 확인
        const product = await Product.findByPk(productId);
        if (product) {
          productInfo = product;
        }
      }
      
      // 이미 존재하는 채팅방 검색
      const existingChat = await Chat.findOne({
        where: {
          [Op.or]: [
            { senderId, receiverId },
            { senderId: receiverId, receiverId: senderId }
          ]
        }
      });
      
      // 채팅방이 이미 존재하면 반환
      if (existingChat) {
        if (productInfo) {
          existingChat.dataValues.productInfo = productInfo;
        }
        return existingChat;
      }
      
      // 채팅방 생성 - productId는 포함하지 않음
      const chat = await Chat.create({
        senderId,
        receiverId,
        message: '새로운 대화가 시작되었습니다.'
      });
      
      // 제품 정보 추가 (가상 필드)
      if (productInfo) {
        chat.dataValues.productInfo = productInfo;
        chat.dataValues.lastMessage = `${productInfo.title}에 대한 문의입니다.`;
      } else {
        chat.dataValues.lastMessage = '새로운 대화가 시작되었습니다.';
      }
      
      return chat;
    } catch (error) {
      throw new Error('Failed to create chat: ' + error.message);
    }
  }

  // 채팅방 목록 조회
  async getChats(userId) {
    try {
      // Sequelize ORM으로 조회
      const chats = await Chat.findAll({
        where: {
          [Op.or]: [
            { senderId: userId },
            { receiverId: userId }
          ]
        },
        order: [['updatedAt', 'DESC']]
      });

      if (!chats || !Array.isArray(chats)) {
        return [];
      }

      // 관련 메시지와 사용자 정보 가져오기
      const populatedChats = await Promise.all(chats.map(async (chat) => {
        // 대화 상대 ID 결정
        const otherUserId = chat.senderId === userId ? chat.receiverId : chat.senderId;
        
        // 대화 상대 정보 가져오기
        const otherUser = await User.findByPk(otherUserId, {
          attributes: ['id', 'nickname', 'email']
        });
        
        // 최근 메시지 가져오기
        const recentMessages = await Message.findAll({
          where: { 
            chatId: chat.id
          },
          order: [['createdAt', 'DESC']],
          limit: 1
        });
        
        // 채팅 JSON 객체 생성
        const chatJSON = chat.toJSON();
        
        // 참여자 정보 추가
        chatJSON.participants = [
          { userId: userId },
          { userId: otherUserId, user: otherUser }
        ];
        
        // 가상의 Product 객체 추가 (실제 DB에 productId가 없기 때문)
        chatJSON.Product = {
          title: '상품 정보',
          price: 0
        };
        
        // 마지막 메시지 정보 추가 (가상 필드)
        if (recentMessages && recentMessages.length > 0) {
          chatJSON.lastMessage = recentMessages[0].content || recentMessages[0].message || '메시지 없음';
        } else {
          chatJSON.lastMessage = '새로운 대화가 시작되었습니다.';
        }
        
        return chatJSON;
      }));

      return populatedChats;
    } catch (error) {
      throw new Error('Failed to get chats: ' + error.message);
    }
  }

  // 채팅방 상세 정보 조회
  async getChatById(chatId, userId) {
    try {
      console.log(`getChatById 호출: chatId=${chatId}, userId=${userId}`);
      
      // 채팅방 존재 확인
      const chat = await Chat.findByPk(chatId);
      
      if (!chat) {
        console.error(`채팅방을 찾을 수 없음: chatId=${chatId}`);
        throw new Error('Chat not found');
      }

      console.log(`채팅방 정보: senderId=${chat.senderId}, receiverId=${chat.receiverId}`);

      // 사용자가 채팅 참여자인지 확인
      if (chat.senderId !== userId && chat.receiverId !== userId) {
        console.error(`사용자가 채팅 참여자가 아님: userId=${userId}, senderId=${chat.senderId}, receiverId=${chat.receiverId}`);
        throw new Error('Not a participant of this chat');
      }

      // 가상의 상품 정보 추가
      const product = {
        title: '상품 정보',
        price: 0
      };

      // 대화 상대 정보 가져오기
      const otherUserId = chat.senderId === userId ? chat.receiverId : chat.senderId;
      const otherUser = await User.findByPk(otherUserId, {
        attributes: ['id', 'nickname', 'email', 'createdAt']
      });

      if (!otherUser) {
        console.error(`대화 상대를 찾을 수 없음: otherUserId=${otherUserId}`);
      }

      // 최근 메시지 가져오기
      const recentMessages = await Message.findAll({
        where: { chatId },
        order: [['createdAt', 'DESC']],
        limit: 1
      });

      // 응답 객체 구성
      const chatData = chat.toJSON();
      chatData.Product = product;
      chatData.otherUser = otherUser;
      
      // 마지막 메시지 추가 (가상 필드)
      if (recentMessages && recentMessages.length > 0) {
        chatData.lastMessage = recentMessages[0].content || recentMessages[0].message || '메시지 없음';
      } else {
        chatData.lastMessage = '새로운 대화가 시작되었습니다.';
      }

      console.log('채팅방 데이터 반환 성공');
      return chatData;
    } catch (error) {
      console.error(`채팅방 조회 오류: ${error.message}`);
      throw new Error('Failed to get chat: ' + error.message);
    }
  }

  // 메시지 전송
  async sendMessage(chatId, senderId, content) {
    try {
      // 채팅방 존재 확인
      const chat = await Chat.findByPk(chatId);
      
      if (!chat) {
        throw new Error('Chat not found');
      }

      // 사용자가 채팅 참여자인지 확인
      if (chat.senderId !== senderId && chat.receiverId !== senderId) {
        throw new Error('Not a participant of this chat');
      }

      // 메시지 생성
      const message = await Message.create({
        chatId,
        senderId,
        content: content,
        receiverId: senderId === chat.senderId ? chat.receiverId : chat.senderId
      });

      // 채팅방의 마지막 업데이트 시간 갱신
      await chat.update({ updatedAt: new Date() });

      return message;
    } catch (error) {
      throw new Error('Failed to send message: ' + error.message);
    }
  }

  // 메시지 목록 조회
  async getMessages(chatId, userId, page = 1, limit = 50) {
    try {
      // 채팅방 존재 확인
      const chat = await Chat.findByPk(chatId);
      if (!chat) {
        throw new Error('Chat not found');
      }

      // 사용자가 채팅 참여자인지 확인
      if (chat.senderId !== userId && chat.receiverId !== userId) {
        throw new Error('Not a participant of this chat');
      }

      const offset = (page - 1) * limit;

      // 메시지 조회
      const messages = await Message.findAll({
        where: { chatId },
        include: [{
          model: User,
          as: 'sender',
          attributes: ['id', 'nickname', 'email']
        }],
        order: [['createdAt', 'DESC']],
        limit,
        offset
      });

      return messages;
    } catch (error) {
      throw new Error('Failed to get messages: ' + error.message);
    }
  }
}

module.exports = new ChatService(); 