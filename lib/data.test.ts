// Mock the entire module before importing
jest.mock('axios', () => {
  const mockAxiosInstance = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      response: {
        use: jest.fn(),
      },
    },
  };

  return {
    create: jest.fn(() => mockAxiosInstance),
  };
});

import { blogApi, authApi, userApi } from './data';

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('blogApi', () => {
    test('getAllBlogs makes GET request to /api/blogs', async () => {
      const mockResponse = { data: { posts: [{ id: 1, title: 'Test Blog' }] } };
      require('axios').create().get.mockResolvedValue(mockResponse);

      const result = await blogApi.getAllBlogs();

      expect(require('axios').create().get).toHaveBeenCalledWith('/blogs');
      expect(result).toEqual({ posts: [{ id: 1, title: 'Test Blog' }] });
    });

    test('createBlog makes POST request to /api/blogs', async () => {
      const blogData = { title: 'New Blog', content: 'Blog content' };
      const mockResponse = { data: { success: true, post: { id: 1, ...blogData } } };
      require('axios').create().post.mockResolvedValue(mockResponse);

      const result = await blogApi.createBlog(blogData);

      expect(require('axios').create().post).toHaveBeenCalledWith('/blogs', blogData);
      expect(result).toEqual({ success: true, post: { id: 1, title: 'New Blog', content: 'Blog content' } });
    });

    test('updateBlog makes PUT request to /api/blogs/:id', async () => {
      const id = '1';
      const blogData = { title: 'Updated Blog', content: 'Updated content' };
      const mockResponse = { data: { success: true, post: { id: 1, ...blogData }, message: 'Updated' } };
      require('axios').create().put.mockResolvedValue(mockResponse);

      const result = await blogApi.updateBlog(id, blogData);

      expect(require('axios').create().put).toHaveBeenCalledWith(`/blogs/${id}`, blogData);
      expect(result).toEqual({ success: true, post: { id: 1, title: 'Updated Blog', content: 'Updated content' }, message: 'Updated' });
    });

    test('deleteBlog makes DELETE request to /api/blogs/:id', async () => {
      const id = '1';
      const mockResponse = { data: { success: true, message: 'Deleted' } };
      require('axios').create().delete.mockResolvedValue(mockResponse);

      const result = await blogApi.deleteBlog(id);

      expect(require('axios').create().delete).toHaveBeenCalledWith(`/blogs/${id}`);
      expect(result).toEqual({ success: true, message: 'Deleted' });
    });
  });

  describe('authApi', () => {
    test('signup makes POST request to /api/auth/signup', async () => {
      const userData = { name: 'John Doe', email: 'john@example.com', password: 'password123' };
      const mockResponse = { data: { user: { id: 1, name: 'John Doe' } } };
      require('axios').create().post.mockResolvedValue(mockResponse);

      const result = await authApi.signup(userData);

      expect(require('axios').create().post).toHaveBeenCalledWith('/auth/signup', userData);
      expect(result).toEqual({ user: { id: 1, name: 'John Doe' } });
    });

    test('login makes POST request to /api/auth/login', async () => {
      const credentials = { email: 'john@example.com', password: 'password123' };
      const mockResponse = { data: { user: { id: 1, name: 'John Doe' } } };
      require('axios').create().post.mockResolvedValue(mockResponse);

      const result = await authApi.login(credentials);

      expect(require('axios').create().post).toHaveBeenCalledWith('/auth/login', credentials);
      expect(result).toEqual({ user: { id: 1, name: 'John Doe' } });
    });
  });

  describe('userApi', () => {
    test('getUserById makes GET request to /api/users/:id', async () => {
      const id = '1';
      const mockResponse = { data: { id: '1', name: 'John Doe' } };
      require('axios').create().get.mockResolvedValue(mockResponse);

      const result = await userApi.getUserById(id);

      expect(require('axios').create().get).toHaveBeenCalledWith(`/users/${id}`);
      expect(result).toEqual({ id: '1', name: 'John Doe' });
    });

    test('updateUser makes PUT request to /api/users/:id', async () => {
      const id = '1';
      const userData = { name: 'Jane Doe' };
      const mockResponse = { data: { id: '1', name: 'Jane Doe' } };
      require('axios').create().put.mockResolvedValue(mockResponse);

      const result = await userApi.updateUser(id, userData);

      expect(require('axios').create().put).toHaveBeenCalledWith(`/users/${id}`, userData);
      expect(result).toEqual({ id: '1', name: 'Jane Doe' });
    });
  });
});