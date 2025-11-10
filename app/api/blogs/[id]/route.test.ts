import { GET, DELETE, PUT } from "./route";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { db } from "@/lib/db";
import { uploadImageToCloudinary } from "@/lib/cloudinary";

// Mock next-auth
jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));

// Mock database
jest.mock("@/lib/db", () => ({
  db: {
    query: {
      posts: {
        findFirst: jest.fn(),
      },
    },
    delete: jest.fn(),
    update: jest.fn(() => ({
      set: jest.fn(() => ({
        where: jest.fn(() => ({
          returning: jest.fn(),
        })),
      })),
    })),
    insert: jest.fn(() => ({
      values: jest.fn(),
    })),
  },
}));

// Mock cloudinary
jest.mock("@/lib/cloudinary", () => ({
  uploadImageToCloudinary: jest.fn(),
}));

describe("Blog Detail API Routes", () => {
  const mockGetServerSession = getServerSession as jest.Mock;
  const mockFindFirst = db.query.posts.findFirst as jest.Mock;
  const mockDelete = db.delete as jest.Mock;
  const mockUpdate = db.update as jest.Mock;
  const mockInsert = db.insert as jest.Mock;
  const mockUploadImage = uploadImageToCloudinary as jest.Mock;

  const mockPost = {
    id: "post1",
    slug: "test-blog",
    title: "Test Blog",
    content: "<p>Test content</p>",
    excerpt: "Test excerpt",
    coverImage: "/test.jpg",
    status: "published",
    authorId: "user1",
    createdAt: new Date(),
    updatedAt: new Date(),
    author: {
      id: "user1",
      name: "Test Author",
      email: "test@example.com",
      image: "/avatar.jpg",
    },
    postCategories: [],
    comments: [],
    likes: [],
  };

  const mockSession = {
    user: {
      id: "user1",
      name: "Test User",
      email: "test@example.com",
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetServerSession.mockResolvedValue(mockSession);
    mockFindFirst.mockResolvedValue(mockPost);
  });

  describe("GET /api/blogs/[id]", () => {
    test("successfully fetches blog by slug", async () => {
      const response = await GET(
        {} as NextRequest,
        { params: Promise.resolve({ id: "test-blog" }) }
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.post.title).toBe("Test Blog");
    });

    test("returns 404 for non-existent blog", async () => {
      mockFindFirst.mockResolvedValue(null);

      const response = await GET(
        {} as NextRequest,
        { params: Promise.resolve({ id: "non-existent" }) }
      );

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toBe("Blog post not found");
    });

    test("returns 400 when ID is missing", async () => {
      const response = await GET(
        {} as NextRequest,
        { params: Promise.resolve({ id: "" }) }
      );

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe("ID is required");
    });

    test("returns draft post for author only", async () => {
      mockFindFirst.mockResolvedValue({
        ...mockPost,
        status: "draft",
      });

      const response = await GET(
        {} as NextRequest,
        { params: Promise.resolve({ id: "test-blog" }) }
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.post.status).toBe("draft");
    });

    test("returns 404 for draft post when not author", async () => {
      mockFindFirst.mockResolvedValue({
        ...mockPost,
        status: "draft",
        authorId: "different-user",
      });

      const response = await GET(
        {} as NextRequest,
        { params: Promise.resolve({ id: "test-blog" }) }
      );

      expect(response.status).toBe(404);
    });

    test("handles server error", async () => {
      mockFindFirst.mockRejectedValue(new Error("Database error"));

      // Suppress console.error
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => { });

      const response = await GET(
        {} as NextRequest,
        { params: Promise.resolve({ id: "test-blog" }) }
      );

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe("Failed to fetch blog post");

      consoleErrorSpy.mockRestore();
    });
  });

  describe("DELETE /api/blogs/[id]", () => {
    beforeEach(() => {
      mockDelete.mockReturnValue({
        where: jest.fn().mockResolvedValue(undefined),
      });
    });

    test("successfully deletes blog as author", async () => {
      const response = await DELETE(
        {} as NextRequest,
        { params: Promise.resolve({ id: "test-blog" }) }
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toBe("Blog post deleted successfully");
    });

    test("returns 401 when not authenticated", async () => {
      mockGetServerSession.mockResolvedValue(null);

      const response = await DELETE(
        {} as NextRequest,
        { params: Promise.resolve({ id: "test-blog" }) }
      );

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe("Unauthorized");
    });

    test("returns 403 when trying to delete another user's blog", async () => {
      mockFindFirst.mockResolvedValue({
        ...mockPost,
        authorId: "different-user",
      });

      const response = await DELETE(
        {} as NextRequest,
        { params: Promise.resolve({ id: "test-blog" }) }
      );

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toBe("Forbidden: You can only delete your own blog posts");
    });

    test("returns 404 when blog not found", async () => {
      mockFindFirst.mockResolvedValue(null);

      const response = await DELETE(
        {} as NextRequest,
        { params: Promise.resolve({ id: "non-existent" }) }
      );

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toBe("Blog post not found");
    });

    test("handles deletion error", async () => {
      mockDelete.mockImplementation(() => {
        throw new Error("Database error");
      });

      // Suppress console.error
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => { });

      const response = await DELETE(
        {} as NextRequest,
        { params: Promise.resolve({ id: "test-blog" }) }
      );

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe("Failed to delete blog post");

      consoleErrorSpy.mockRestore();
    });
  });

  describe("PUT /api/blogs/[id]", () => {
    const validUpdateData = {
      title: "Updated Title",
      content: "<p>Updated content</p>",
      excerpt: "Updated excerpt",
      status: "published",
      categoryIds: ["cat1"],
    };

    beforeEach(() => {
      mockUpdate.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([
              { ...mockPost, title: "Updated Title" },
            ]),
          }),
        }),
      });

      mockInsert.mockReturnValue({
        values: jest.fn().mockResolvedValue(undefined),
      });

      mockDelete.mockReturnValue({
        where: jest.fn().mockResolvedValue(undefined),
      });

      mockFindFirst.mockResolvedValueOnce(mockPost).mockResolvedValueOnce({
        ...mockPost,
        title: "Updated Title",
      });
    });

    test("successfully updates blog as author", async () => {
      const request = {
        json: jest.fn().mockResolvedValue(validUpdateData),
      } as unknown as NextRequest;

      const response = await PUT(request, {
        params: Promise.resolve({ id: "test-blog" }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toBe("Blog post updated successfully");
    });

    test("returns 401 when not authenticated", async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = {
        json: jest.fn().mockResolvedValue(validUpdateData),
      } as unknown as NextRequest;

      const response = await PUT(request, {
        params: Promise.resolve({ id: "test-blog" }),
      });

      expect(response.status).toBe(401);
    });

    test("returns 400 when title is missing", async () => {
      const request = {
        json: jest.fn().mockResolvedValue({ ...validUpdateData, title: "" }),
      } as unknown as NextRequest;

      const response = await PUT(request, {
        params: Promise.resolve({ id: "test-blog" }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe("Title is required");
    });

    test("returns 400 when title is too short", async () => {
      const request = {
        json: jest.fn().mockResolvedValue({ ...validUpdateData, title: "Hi" }),
      } as unknown as NextRequest;

      const response = await PUT(request, {
        params: Promise.resolve({ id: "test-blog" }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe("Title must be at least 5 characters");
    });

    test("returns 403 when trying to update another user's blog", async () => {
      // Reset findFirst mock for this specific test
      mockFindFirst.mockReset();
      mockFindFirst.mockResolvedValue({
        ...mockPost,
        authorId: "different-user",
        author: {
          ...mockPost.author,
          id: "different-user",
        },
      });

      const request = {
        json: jest.fn().mockResolvedValue(validUpdateData),
      } as unknown as NextRequest;

      const response = await PUT(request, {
        params: Promise.resolve({ id: "test-blog" }),
      });

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toBe("Forbidden: You can only edit your own blog posts");
    });

    test("handles image upload", async () => {
      mockUploadImage.mockResolvedValue("https://cloudinary.com/image.jpg");

      const request = {
        json: jest.fn().mockResolvedValue({
          ...validUpdateData,
          coverImageBase64: "base64data",
          coverImageType: "image/jpeg",
        }),
      } as unknown as NextRequest;

      const response = await PUT(request, {
        params: Promise.resolve({ id: "test-blog" }),
      });

      expect(response.status).toBe(200);
      expect(mockUploadImage).toHaveBeenCalledWith("base64data", "image/jpeg");
    });

    test("handles image upload error", async () => {
      mockUploadImage.mockRejectedValue(new Error("Upload failed"));

      const request = {
        json: jest.fn().mockResolvedValue({
          ...validUpdateData,
          coverImageBase64: "base64data",
          coverImageType: "image/jpeg",
        }),
      } as unknown as NextRequest;

      const response = await PUT(request, {
        params: Promise.resolve({ id: "test-blog" }),
      });

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe("Upload failed");
    });

    test("updates categories", async () => {
      const request = {
        json: jest.fn().mockResolvedValue({
          ...validUpdateData,
          categoryIds: ["cat1", "cat2"],
        }),
      } as unknown as NextRequest;

      const response = await PUT(request, {
        params: Promise.resolve({ id: "test-blog" }),
      });

      expect(response.status).toBe(200);
      expect(mockDelete).toHaveBeenCalled(); // Deletes old categories
      expect(mockInsert).toHaveBeenCalled(); // Inserts new categories
    });

    test("handles server error", async () => {
      mockUpdate.mockImplementation(() => {
        throw new Error("Database error");
      });

      // Suppress console.error
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => { });

      const request = {
        json: jest.fn().mockResolvedValue(validUpdateData),
      } as unknown as NextRequest;

      const response = await PUT(request, {
        params: Promise.resolve({ id: "test-blog" }),
      });

      expect(response.status).toBe(500);

      consoleErrorSpy.mockRestore();
    });
  });
});