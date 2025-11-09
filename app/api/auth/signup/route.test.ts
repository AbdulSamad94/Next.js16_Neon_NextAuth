import { POST } from './route';
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

// Mock the database
jest.mock('@/lib/db', () => ({
  db: {
    query: {
      users: {
        findFirst: jest.fn(),
      },
    },
    insert: jest.fn(() => ({
      values: jest.fn().mockResolvedValue(undefined),
    })),
  },
}));

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('Signup API Route', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('creates a new user successfully', async () => {
    (db.query.users.findFirst as jest.Mock).mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');

    const request = {
      json: jest.fn().mockResolvedValue({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'securepassword123',
      }),
    } as unknown as NextRequest;

    const response = await POST(request);

    expect(response.status).toBe(200);
    const responseJson = await response.json();
    expect(responseJson.success).toBe(true);
    expect(db.insert).toHaveBeenCalled();
  });

  test('returns 400 if user already exists', async () => {
    (db.query.users.findFirst as jest.Mock).mockResolvedValue({ id: '1' } as any);

    const request = {
      json: jest.fn().mockResolvedValue({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'securepassword123',
      }),
    } as unknown as NextRequest;

    const response = await POST(request);
    const responseJson = await response.json();

    expect(response.status).toBe(400);
    expect(responseJson.error).toBe('User already exists');
  });

  test('returns 400 for invalid request data', async () => {
    const request = {
      json: jest.fn().mockResolvedValue({
        name: '', // Invalid - empty name
        email: 'invalid-email',
        password: '123',
      }),
    } as unknown as NextRequest;

    const response = await POST(request);
    const responseJson = await response.json();

    expect(response.status).toBe(400);
    expect(responseJson.error).toBe('Missing fields');
  });

  test('handles server error during user creation', async () => {
    (db.query.users.findFirst as jest.Mock).mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
    (db.insert as jest.Mock).mockImplementation(() => {
      throw new Error('Database error');
    });

    const request = {
      json: jest.fn().mockResolvedValue({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'securepassword123',
      }),
    } as unknown as NextRequest;

    const response = await POST(request);
    const responseJson = await response.json();

    expect(response.status).toBe(500);
    expect(responseJson.error).toBe('Internal Server Error');
  });
});