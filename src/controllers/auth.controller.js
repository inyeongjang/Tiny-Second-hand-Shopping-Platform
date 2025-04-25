const authService = require('../services/auth.service');
const { User } = require('../../models');
const bcrypt = require('bcrypt');
const { generateToken } = require('../utils/jwt');

const authController = {
  async register(req, res) {
    try {
      const userData = req.body;
      
      // 필수 필드 검증
      if (!userData.email || !userData.password || !userData.nickname) {
        return res.status(400).json({ error: '이메일, 비밀번호, 닉네임은 필수 입력 사항입니다.' });
      }
      
      // 이메일 형식 검증
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        return res.status(400).json({ error: '유효한 이메일 형식이 아닙니다.' });
      }
      
      // 비밀번호 강도 검증 (최소 8자 이상)
      if (userData.password.length < 8) {
        return res.status(400).json({ error: '비밀번호는 최소 8자 이상이어야 합니다.' });
      }
      
      const user = await authService.register(userData);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: '이메일과 비밀번호는 필수 입력 사항입니다.' });
      }
      
      const user = await authService.login(email, password);
      res.json(user);
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  },

  async getProfile(req, res) {
    try {
      const userId = req.user.id;
      const profile = await authService.getProfile(userId);
      res.json(profile);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },

  async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const updateData = req.body;
      const updatedProfile = await authService.updateProfile(userId, updateData);
      res.json(updatedProfile);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async checkEmail(req, res) {
    try {
      const { email } = req.query;
      
      if (!email) {
        return res.status(400).json({ error: '이메일을 입력해주세요.' });
      }
      
      // 이메일 형식 검증
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: '유효한 이메일 형식이 아닙니다.' });
      }
      
      const result = await authService.checkEmail(email);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async checkNickname(req, res) {
    try {
      const { nickname } = req.query;
      
      console.log('닉네임 중복 체크 요청:', nickname);
      
      if (!nickname) {
        return res.status(400).json({ error: '닉네임을 입력해주세요.', available: false });
      }
      
      const result = await authService.checkNickname(nickname);
      console.log('닉네임 중복 체크 결과:', result);
      res.json(result);
    } catch (error) {
      console.error('닉네임 중복 체크 오류:', error);
      res.status(400).json({ error: error.message, available: false });
    }
  },

  async changePassword(req, res) {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: '현재 비밀번호와 새 비밀번호를 모두 입력해주세요.' });
      }
      
      // 새 비밀번호 강도 검증
      if (newPassword.length < 8) {
        return res.status(400).json({ error: '새 비밀번호는 최소 8자 이상이어야 합니다.' });
      }
      
      const result = await authService.changePassword(userId, currentPassword, newPassword);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
};

module.exports = authController; 