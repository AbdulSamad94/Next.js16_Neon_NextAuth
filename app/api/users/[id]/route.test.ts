// __tests__/app/api/users/[id]/route.test.ts

// Mock next/server FIRST
jest.mock("next/server", () => ({
    NextResponse: {
        json: (data: any, init?: ResponseInit) => {
            return {
                json: async () => data,
                status: init?.status || 200,
            };
        },
    },
    NextRequest: class MockNextRequest {
        url: string;
        method: string;
        headers: Headers;
        _body: string | null;

        constructor(url: string, init?: RequestInit) {
            this.url = url;
            this.method = init?.method || "GET";
            this.headers = new Headers(init?.headers);
            this._body = init?.body as string || null;
        }

        async json() {
            return this._body ? JSON.parse(this._body) : {};
        }
    },
}));

// Mock all other dependencies BEFORE any imports
jest.mock("next-auth", () => ({
    getServerSession: jest.fn(),
}));

jest.mock("@/lib/auth/auth", () => ({
    authOptions: {},
}));

jest.mock("@/lib/db", () => ({
    db: {
        query: {
            users: {
                findFirst: jest.fn(),
            },
            posts: {
                findMany: jest.fn(),
            },
            follows: {
                findFirst: jest.fn(),
            },
        },
        update: jest.fn(),
    },
}));

jest.mock("@/lib/db/schema/schema", () => ({
    users: {
        id: "id",
        name: "name",
        email: "email",
        image: "image",
        bio: "bio",
        followerCount: "follower_count",
        followingCount: "following_count",
        createdAt: "created_at",
    },
    posts: {
        id: "id",
        authorId: "author_id",
        status: "status",
        createdAt: "created_at",
    },
    follows: {
        followerId: "follower_id",
        followingId: "following_id",
    },
}));

// NOW import after all mocks are set up
import { GET, PUT } from "@/app/api/users/[id]/route";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { NextRequest } from "next/server";

const mockGetServerSession = getServerSession as jest.MockedFunction<
    typeof getServerSession
>;

describe("GET /api/users/[id]", () => {
    const mockUserId = "user-123";
    const mockCurrentUserId = "current-user-123";

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return user profile with posts for authenticated user", async () => {
        const mockUser = {
            id: mockUserId,
            name: "John Doe",
            email: "john@example.com",
            image: "https://example.com/avatar.jpg",
            bio: "Software developer",
            followerCount: 10,
            followingCount: 5,
            createdAt: new Date("2024-01-01"),
        };

        const mockPosts = [
            {
                id: "post-1",
                title: "Test Post",
                slug: "test-post",
                content: "Test content",
                excerpt: "Test excerpt",
                coverImage: null,
                status: "published",
                authorId: mockUserId,
                createdAt: new Date("2024-01-15"),
                author: {
                    id: mockUserId,
                    name: "John Doe",
                    email: "john@example.com",
                    image: "https://example.com/avatar.jpg",
                },
                postCategories: [],
            },
        ];

        mockGetServerSession.mockResolvedValue({
            user: { id: mockCurrentUserId },
        } as any);

        (db.query.users.findFirst as jest.Mock).mockResolvedValue(mockUser);
        (db.query.follows.findFirst as jest.Mock).mockResolvedValue(null);
        (db.query.posts.findMany as jest.Mock).mockResolvedValue(mockPosts);

        const req = new NextRequest("http://localhost:3000/api/users/user-123");
        const params = Promise.resolve({ id: mockUserId });

        const response = await GET(req, { params });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.user.id).toBe(mockUserId);
        expect(data.user.isFollowing).toBe(false);
        expect(data.user.isOwnProfile).toBe(false);
        expect(data.user.posts).toHaveLength(1);
    });

    it("should return own profile with draft posts", async () => {
        const mockUser = {
            id: mockUserId,
            name: "John Doe",
            email: "john@example.com",
            image: "https://example.com/avatar.jpg",
            bio: "Software developer",
            followerCount: 10,
            followingCount: 5,
            createdAt: new Date("2024-01-01"),
        };

        const mockPosts = [
            {
                id: "post-1",
                title: "Draft Post",
                slug: "draft-post",
                content: "Draft content",
                excerpt: "Draft excerpt",
                coverImage: null,
                status: "draft",
                authorId: mockUserId,
                createdAt: new Date("2024-01-15"),
                author: {
                    id: mockUserId,
                    name: "John Doe",
                    email: "john@example.com",
                    image: "https://example.com/avatar.jpg",
                },
                postCategories: [],
            },
        ];

        mockGetServerSession.mockResolvedValue({
            user: { id: mockUserId },
        } as any);

        (db.query.users.findFirst as jest.Mock).mockResolvedValue(mockUser);
        (db.query.posts.findMany as jest.Mock).mockResolvedValue(mockPosts);

        const req = new NextRequest("http://localhost:3000/api/users/user-123");
        const params = Promise.resolve({ id: mockUserId });

        const response = await GET(req, { params });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.user.isOwnProfile).toBe(true);
        expect(data.user.posts).toHaveLength(1);
        expect(data.user.posts[0].status).toBe("draft");
    });

    it("should return 404 if user not found", async () => {
        mockGetServerSession.mockResolvedValue({
            user: { id: mockCurrentUserId },
        } as any);

        (db.query.users.findFirst as jest.Mock).mockResolvedValue(null);

        const req = new NextRequest("http://localhost:3000/api/users/nonexistent");
        const params = Promise.resolve({ id: "nonexistent" });

        const response = await GET(req, { params });
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.error).toBe("User not found");
    });

    it("should handle unauthenticated requests", async () => {
        const mockUser = {
            id: mockUserId,
            name: "John Doe",
            email: "john@example.com",
            image: "https://example.com/avatar.jpg",
            bio: "Software developer",
            followerCount: 10,
            followingCount: 5,
            createdAt: new Date("2024-01-01"),
        };

        mockGetServerSession.mockResolvedValue(null);

        (db.query.users.findFirst as jest.Mock).mockResolvedValue(mockUser);
        (db.query.posts.findMany as jest.Mock).mockResolvedValue([]);

        const req = new NextRequest("http://localhost:3000/api/users/user-123");
        const params = Promise.resolve({ id: mockUserId });

        const response = await GET(req, { params });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.user.isFollowing).toBe(false);
        expect(data.user.isOwnProfile).toBe(false);
    });
});

describe("PUT /api/users/[id]", () => {
    const mockUserId = "user-123";

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should update user profile successfully", async () => {
        const updateData = {
            name: "Jane Doe",
            bio: "Updated bio",
        };

        const mockUpdatedUser = {
            id: mockUserId,
            name: "Jane Doe",
            email: "jane@example.com",
            image: "https://example.com/avatar.jpg",
            bio: "Updated bio",
            followerCount: 10,
            followingCount: 5,
            createdAt: new Date("2024-01-01"),
        };

        mockGetServerSession.mockResolvedValue({
            user: { id: mockUserId },
        } as any);

        (db.update as jest.Mock).mockReturnValue({
            set: jest.fn().mockReturnValue({
                where: jest.fn().mockReturnValue({
                    returning: jest.fn().mockResolvedValue([mockUpdatedUser]),
                }),
            }),
        });

        (db.query.posts.findMany as jest.Mock).mockResolvedValue([]);

        const req = new NextRequest("http://localhost:3000/api/users/user-123", {
            method: "PUT",
            body: JSON.stringify(updateData),
        });
        const params = Promise.resolve({ id: mockUserId });

        const response = await PUT(req, { params });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.user.name).toBe("Jane Doe");
        expect(data.user.bio).toBe("Updated bio");
    });

    it("should return 401 if not authenticated", async () => {
        mockGetServerSession.mockResolvedValue(null);

        const req = new NextRequest("http://localhost:3000/api/users/user-123", {
            method: "PUT",
            body: JSON.stringify({ name: "Test" }),
        });
        const params = Promise.resolve({ id: mockUserId });

        const response = await PUT(req, { params });
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error).toBe("Unauthorized");
    });

    it("should return 403 if trying to update another user's profile", async () => {
        mockGetServerSession.mockResolvedValue({
            user: { id: "different-user" },
        } as any);

        const req = new NextRequest("http://localhost:3000/api/users/user-123", {
            method: "PUT",
            body: JSON.stringify({ name: "Test" }),
        });
        const params = Promise.resolve({ id: mockUserId });

        const response = await PUT(req, { params });
        const data = await response.json();

        expect(response.status).toBe(403);
        expect(data.error).toBe("Forbidden");
    });

    it("should validate name input", async () => {
        mockGetServerSession.mockResolvedValue({
            user: { id: mockUserId },
        } as any);

        const req = new NextRequest("http://localhost:3000/api/users/user-123", {
            method: "PUT",
            body: JSON.stringify({ name: "" }),
        });
        const params = Promise.resolve({ id: mockUserId });

        const response = await PUT(req, { params });
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe("Name must be a non-empty string");
    });

    it("should validate bio input", async () => {
        mockGetServerSession.mockResolvedValue({
            user: { id: mockUserId },
        } as any);

        const req = new NextRequest("http://localhost:3000/api/users/user-123", {
            method: "PUT",
            body: JSON.stringify({ bio: 123 }),
        });
        const params = Promise.resolve({ id: mockUserId });

        const response = await PUT(req, { params });
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe("Bio must be a string");
    });
});