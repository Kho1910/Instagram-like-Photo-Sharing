import { defineStore } from 'pinia'
import { mockUser } from '@/api/mockData'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : mockUser,
    token: localStorage.getItem('token') || null,
  }),

  getters: {
    // Trả về true nếu có token, dùng cho Navigation Guard
    isAuthenticated: (state) => !!state.token,
  },

  actions: {
    async register(userInfo) {
      await new Promise(resolve => setTimeout(resolve, 800));
      const allUsers = JSON.parse(localStorage.getItem('all_users_test') || '[]');

      if (allUsers.find(u => u.username === userInfo.username)) {
        throw new Error('Tên người dùng đã tồn tại!');
      }

      const newUser = {
        username: userInfo.username,
        email: userInfo.email, // Lưu thêm email để dữ liệu đầy đủ
        password: userInfo.password,
        avatar: `https://i.pravatar.cc/150?u=${userInfo.username}`,
        bio: 'Sinh viên UIT test flow'
      };

      allUsers.push(newUser);
      localStorage.setItem('all_users_test', JSON.stringify(allUsers));
      return true; // Đăng ký xong KHÔNG gán token để ép quay về Login
    },

    async login(credentials) {
      await new Promise(resolve => setTimeout(resolve, 800));
      const allUsers = JSON.parse(localStorage.getItem('all_users_test') || '[]');

      // Identifier ở đây có thể là username HOẶC email mà người dùng nhập vào
      const identifier = credentials.username;

      const userFound = allUsers.find(u =>
        // KIỂM TRA: (Khớp username HOẶC khớp email) VÀ phải khớp password
        (u.username === identifier || u.email === identifier) &&
        u.password === credentials.password
      );

      if (userFound) {
        this.token = 'fake_token_2026';
        this.user = userFound;
        localStorage.setItem('token', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));
        return true;
      }
      throw new Error('Sai tài khoản hoặc mật khẩu');
    },

    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
});