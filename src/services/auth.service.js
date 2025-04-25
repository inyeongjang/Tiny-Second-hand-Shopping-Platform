const bcrypt = require('bcryptjs');
const { User } = require('../../models');
const { generateToken } = require('../utils/jwt');

const authService = {
  async register(userData) {
    try {
      // 이메일 중복 확인
      const existingUser = await User.findOne({ where: { email: userData.email } });
      if (existingUser) {
        throw new Error('이미 사용 중인 이메일 주소입니다.');
      }

      // 닉네임 중복 확인 (닉네임이 있는 경우)
      if (userData.nickname) {
        const existingNickname = await User.findOne({ where: { nickname: userData.nickname } });
        if (existingNickname) {
          throw new Error('이미 사용 중인 닉네임입니다.');
        }
      }

      // 비밀번호 해싱
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // 사용자 생성
      const user = await User.create({
        ...userData,
        password: hashedPassword
      });
      
      // 토큰 생성
      const token = generateToken(user.id);
      
      return {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        token
      };
    } catch (error) {
      throw new Error('회원가입 실패: ' + error.message);
    }
  },

  async login(email, password) {
    try {
      // 사용자 확인
      const user = await User.findOne({ where: { email } });
      if (!user) {
        throw new Error('사용자를 찾을 수 없습니다.');
      }
      
      // 계정 활성화 여부 확인
      if (!user.isActive) {
        throw new Error('비활성화된 계정입니다.');
      }
      
      // 비밀번호 검증
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error('잘못된 비밀번호입니다.');
      }
      
      // 토큰 생성
      const token = generateToken(user.id);
      
      return {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        token
      };
    } catch (error) {
      throw new Error('로그인 실패: ' + error.message);
    }
  },

  async getProfile(userId) {
    try {
      const user = await User.findByPk(userId, {
        attributes: { exclude: ['password'] }
      });
      
      if (!user) {
        throw new Error('사용자를 찾을 수 없습니다.');
      }
      
      return user;
    } catch (error) {
      throw new Error('프로필 조회 실패: ' + error.message);
    }
  },

  async updateProfile(userId, updateData) {
    try {
      const user = await User.findByPk(userId);
      
      if (!user) {
        throw new Error('사용자를 찾을 수 없습니다.');
      }
      
      // 닉네임이 변경되었고, 이미 다른 사용자가 사용 중인 경우
      if (updateData.nickname && updateData.nickname !== user.nickname) {
        const existingNickname = await User.findOne({ 
          where: { 
            nickname: updateData.nickname,
            id: { [Op.ne]: userId } // 현재 사용자 제외
          } 
        });
        
        if (existingNickname) {
          throw new Error('이미 사용 중인 닉네임입니다.');
        }
      }
      
      // 비밀번호가 포함된 경우 해싱
      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
      }
      
      await user.update(updateData);
      
      // 업데이트된 사용자 정보 반환 (비밀번호 제외)
      const updatedUser = await User.findByPk(userId, {
        attributes: { exclude: ['password'] }
      });
      
      return updatedUser;
    } catch (error) {
      throw new Error('프로필 업데이트 실패: ' + error.message);
    }
  },

  async checkEmail(email) {
    try {
      const existingUser = await User.findOne({ where: { email } });
      return {
        available: !existingUser,
        message: existingUser ? '이미 사용 중인 이메일 주소입니다.' : '사용 가능한 이메일 주소입니다.'
      };
    } catch (error) {
      throw new Error('이메일 확인 실패: ' + error.message);
    }
  },
  
  async checkNickname(nickname) {
    try {
      console.log('서비스에서 닉네임 확인:', nickname);
      
      // 데이터베이스 연결 문제 디버깅을 위한 로직
      const existingUser = await User.findOne({ where: { nickname } });
      console.log('기존 사용자 닉네임 조회 결과:', existingUser);
      
      // 모든, 닉네임을 사용 가능하도록 임시 설정 (테스트용)
      return {
        available: true,
        message: '사용 가능한 닉네임입니다.'
      };
    } catch (error) {
      console.error('서비스 계층 닉네임 확인 실패:', error);
      throw new Error('닉네임 확인 실패: ' + error.message);
    }
  },

  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await User.findByPk(userId);
      
      if (!user) {
        throw new Error('사용자를 찾을 수 없습니다.');
      }
      
      // 현재 비밀번호 검증
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        throw new Error('현재 비밀번호가 일치하지 않습니다.');
      }
      
      // 새 비밀번호 해싱 및 업데이트
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await user.update({ password: hashedPassword });
      
      return { message: '비밀번호가 성공적으로 변경되었습니다.' };
    } catch (error) {
      throw new Error('비밀번호 변경 실패: ' + error.message);
    }
  }
};

module.exports = authService; 