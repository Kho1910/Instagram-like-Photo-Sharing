export const mockPosts = [
  {
    id: 1,
    imageUrl: 'https://picsum.photos/600/600?random=1',
    caption: 'Học tập tại UIT thật tuyệt! 💻',
    user: { username: 'dangkhoa_it', avatar: 'https://i.pravatar.cc/150?u=1' },
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    imageUrl: 'https://picsum.photos/600/600?random=2',
    caption: 'Vũng Tàu thẳng tiến! 🌊',
    user: { username: 'dangkhoa_it', avatar: 'https://i.pravatar.cc/150?u=1' },
    createdAt: new Date().toISOString()
  }
];

export const mockUser = {
  id: 'user_01',
  username: 'dangkhoa_it',
  fullName: 'Huỳnh Đăng Khoa',
  avatar: 'https://i.pravatar.cc/150?u=1',
  bio: 'Sinh viên An toàn thông tin | UIT'
};