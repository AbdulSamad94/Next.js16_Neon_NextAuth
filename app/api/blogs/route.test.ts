// Mock external modules before importing
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('@/lib/db', () => ({
  db: {
    query: {
      users: {
        findFirst: jest.fn(),
      },
      posts: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
      },
    },
    insert: jest.fn(() => ({
      values: jest.fn(() => ({
        returning: jest.fn(),
      })),
    })),
    update: jest.fn(() => ({
      set: jest.fn(() => ({
        where: jest.fn(() => ({
          returning: jest.fn(),
        })),
      })),
    })),
    delete: jest.fn(() => ({
      where: jest.fn(() => ({
        return: jest.fn(),
      })),
    })),
  },
}));

// Mock other dependencies
jest.mock('@/lib/validations/blog', () => ({
  createBlogSchema: {
    parse: jest.fn(),
    safeParse: jest.fn(),
  },
}));

jest.mock('@/lib/cloudinary', () => ({
  uploadImageToCloudinary: jest.fn(),
}));

import { POST, GET } from './route';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { posts } from '@/lib/db/schema/schema';
import { createBlogSchema } from '@/lib/validations/blog';
import { uploadImageToCloudinary } from '@/lib/cloudinary';

// Mock slugify
jest.mock('slugify', () => ({
  __esModule: true,
  default: jest.fn((str) => str.toLowerCase().replace(/\s+/g, '-')),
}));

describe('Blogs API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/blogs', () => {
    test('returns 401 if user is not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const request = {
        json: jest.fn().mockResolvedValue({
          title: 'Test Blog',
          content: '<p>Test content</p>',
        }),
      } as unknown as NextRequest;

      const response = await POST(request);
      const responseJson = await response.json();

      expect(response.status).toBe(401);
      expect(responseJson.error).toBe('Unauthorized');
    });

    test('creates a new blog post successfully', async () => {
      // Mock session
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { email: 'test@example.com' },
      });

      // Mock user lookup
      (db.query.users.findFirst as jest.Mock).mockResolvedValue({
        id: '1',
        email: 'test@example.com',
      });

      // Mock slug generation and final query - first call returns null (slug check), subsequent call returns post data
      (db.query.posts.findFirst as jest.Mock)
        .mockResolvedValueOnce(null)  // First call (in generateUniqueSlug) - return null to break the loop
        .mockResolvedValue({
          id: '1',
          title: 'Test Blog',
          slug: 'test-blog',
          content: '<p>Test content</p>',
          author: { id: '1', name: 'Test User' },
        });  // Subsequent calls (after creation) - return the created post

      // Mock post creation
      (db.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([{ id: '1', slug: 'test-blog' }])
        })
      });

      // Mock schema validation
      (createBlogSchema.parse as jest.Mock).mockImplementation((data) => data);

      const request = {
        json: jest.fn().mockResolvedValue({
          title: 'Test Blog',
          content: '<p>Test content</p>',
        }),
      } as unknown as NextRequest;

      const response = await POST(request);
      const responseJson = await response.json();

      expect(response.status).toBe(200);
      expect(responseJson.success).toBe(true);
      expect(responseJson.post.title).toBe('Test Blog');
    });

    test('handles image upload if coverImageBase64 is provided', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { email: 'test@example.com' },
      });

      (db.query.users.findFirst as jest.Mock).mockResolvedValue({
        id: '1',
        email: 'test@example.com',
      });

      (db.query.posts.findFirst as jest.Mock)
        .mockResolvedValueOnce(null)  // First call (in generateUniqueSlug) - return null to break the loop
        .mockResolvedValue({
          id: '1',
          title: 'Test Blog',
          slug: 'test-blog',
          content: '<p>Test content</p>',
          coverImage: 'https://cloudinary.com/test-image.jpg',
          author: { id: '1', name: 'Test User' },
        });  // Subsequent calls (after creation) - return the created post

      (db.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([{ id: '1', slug: 'test-blog' }])
        })
      });

      (createBlogSchema.parse as jest.Mock).mockImplementation((data) => data);

      // Mock image upload
      (uploadImageToCloudinary as jest.Mock).mockResolvedValue('https://cloudinary.com/test-image.jpg');

      const request = {
        json: jest.fn().mockResolvedValue({
          title: 'Test Blog',
          content: '<p>Test content</p>',
          coverImageBase64: 'data:image/jpeg;base64,testdata',
        }),
      } as unknown as NextRequest;

      const response = await POST(request);
      const responseJson = await response.json();

      expect(uploadImageToCloudinary).toHaveBeenCalledWith('data:image/jpeg;base64,testdata', 'image/jpeg');
      expect(response.status).toBe(200);
      expect(responseJson.post.coverImage).toBe('https://cloudinary.com/test-image.jpg');
    });

    test('returns 400 if validation fails', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { email: 'test@example.com' },
      });

      (db.query.users.findFirst as jest.Mock).mockResolvedValue({
        id: '1',
        email: 'test@example.com',
      });

      // Mock validation to throw error
      (createBlogSchema.parse as jest.Mock).mockImplementation(() => {
        const error = new Error('Validation failed');
        error.name = 'ZodError';
        throw error;
      });

      const request = {
        json: jest.fn().mockResolvedValue({
          title: '', // Invalid - empty title
          content: '<p>Test content</p>',
        }),
      } as unknown as NextRequest;

      const response = await POST(request);
      const responseJson = await response.json();

      expect(response.status).toBe(400);
      expect(responseJson.error).toBe('Validation failed');
    });
  });

  describe('GET /api/blogs', () => {
    test('returns all published blog posts by default', async () => {
      const mockPosts = [
        {
          id: '1',
          title: 'Test Blog',
          slug: 'test-blog',
          content: '<p>Test content</p>',
          author: { id: '1', name: 'Test User' },
        }
      ];

      (db.query.posts.findMany as jest.Mock).mockResolvedValue(mockPosts);

      const request = {
        url: 'http://localhost:3000/api/blogs',
      } as unknown as NextRequest;

      const response = await GET(request);
      const responseJson = await response.json();

      expect(response.status).toBe(200);
      expect(responseJson.success).toBe(true);
      expect(responseJson.posts).toEqual(mockPosts);
    });

    test('filters by authorId if provided', async () => {
      const mockPosts = [
        {
          id: '1',
          title: 'Test Blog',
          slug: 'test-blog',
          content: '<p>Test content</p>',
          author: { id: '1', name: 'Test User' },
        }
      ];

      (db.query.posts.findMany as jest.Mock).mockResolvedValue(mockPosts);

      const request = {
        url: 'http://localhost:3000/api/blogs?authorId=1',
      } as unknown as NextRequest;

      const response = await GET(request);
      const responseJson = await response.json();

      expect(response.status).toBe(200);
      expect(responseJson.success).toBe(true);
      expect(responseJson.posts).toEqual(mockPosts);
    });

    test('filters by status if provided', async () => {
      const mockPosts = [
        {
          id: '1',
          title: 'Test Blog',
          slug: 'test-blog',
          content: '<p>Test content</p>',
          author: { id: '1', name: 'Test User' },
          status: 'published',
        }
      ];

      (db.query.posts.findMany as jest.Mock).mockResolvedValue(mockPosts);

      const request = {
        url: 'http://localhost:3000/api/blogs?status=published',
      } as unknown as NextRequest;

      const response = await GET(request);
      const responseJson = await response.json();

      expect(response.status).toBe(200);
      expect(responseJson.success).toBe(true);
      expect(responseJson.posts).toEqual(mockPosts);
    });

    test('handles server error', async () => {
      (db.query.posts.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      const request = {
        url: 'http://localhost:3000/api/blogs',
      } as unknown as NextRequest;

      const response = await GET(request);
      const responseJson = await response.json();

      expect(response.status).toBe(500);
      expect(responseJson.error).toBe('Failed to fetch blog posts');
    });
  });
});