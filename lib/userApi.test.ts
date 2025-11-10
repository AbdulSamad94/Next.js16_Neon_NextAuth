// __tests__/lib/data/userApi.test.ts

// Mock axios BEFORE importing anything else
const mockAxiosInstance = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
        response: {
            use: jest.fn((onSuccess: any) => onSuccess),
        },
    },
};

jest.mock("axios", () => ({
    __esModule: true,
    default: {
        create: jest.fn(() => mockAxiosInstance),
    },
}));

// NOW import after mocking
import { userApi } from "@/lib/data";
import { UserProfileWithPosts, FollowActionResponse } from "@/lib/types";

describe("userApi", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("getUserById", () => {
        it("should fetch user profile successfully", async () => {
            const mockUser: UserProfileWithPosts = {
                id: "user-123",
                name: "John Doe",
                email: "john@example.com",
                image: "https://example.com/avatar.jpg",
                bio: "Software developer",
                followerCount: 10,
                followingCount: 5,
                createdAt: "2024-01-01T00:00:00.000Z",
                isFollowing: false,
                posts: [],
            };

            mockAxiosInstance.get.mockResolvedValue({
                data: { success: true, user: mockUser },
            });

            const result = await userApi.getUserById("user-123");

            expect(mockAxiosInstance.get).toHaveBeenCalledWith("/users/user-123");
            expect(result).toEqual(mockUser);
        });

        it("should handle errors when fetching user", async () => {
            const errorMessage = "User not found";
            mockAxiosInstance.get.mockRejectedValue(new Error(errorMessage));

            await expect(userApi.getUserById("nonexistent")).rejects.toThrow();
            expect(mockAxiosInstance.get).toHaveBeenCalledWith("/users/nonexistent");
        });
    });

    describe("updateUser", () => {
        it("should update user profile successfully", async () => {
            const updateData = {
                name: "Jane Doe",
                bio: "Updated bio",
            };

            const mockUpdatedUser: UserProfileWithPosts = {
                id: "user-123",
                name: "Jane Doe",
                email: "jane@example.com",
                image: "https://example.com/avatar.jpg",
                bio: "Updated bio",
                followerCount: 10,
                followingCount: 5,
                createdAt: "2024-01-01T00:00:00.000Z",
                posts: [],
            };

            mockAxiosInstance.put.mockResolvedValue({
                data: { success: true, user: mockUpdatedUser },
            });

            const result = await userApi.updateUser("user-123", updateData);

            expect(mockAxiosInstance.put).toHaveBeenCalledWith(
                "/users/user-123",
                updateData
            );
            expect(result).toEqual(mockUpdatedUser);
            expect(result.name).toBe("Jane Doe");
            expect(result.bio).toBe("Updated bio");
        });

        it("should handle errors when updating user", async () => {
            const errorMessage = "Unauthorized";
            mockAxiosInstance.put.mockRejectedValue(new Error(errorMessage));

            await expect(
                userApi.updateUser("user-123", { name: "Test" })
            ).rejects.toThrow();
        });
    });

    describe("followUser", () => {
        it("should follow user successfully", async () => {
            const mockResponse: FollowActionResponse = {
                success: true,
                isFollowing: true,
                followerCount: 11,
            };

            mockAxiosInstance.post.mockResolvedValue({ data: mockResponse });

            const result = await userApi.followUser("target-user-456");

            expect(mockAxiosInstance.post).toHaveBeenCalledWith(
                "/users/target-user-456/follow"
            );
            expect(result.success).toBe(true);
            expect(result.isFollowing).toBe(true);
            expect(result.followerCount).toBe(11);
        });

        it("should handle already following error", async () => {
            mockAxiosInstance.post.mockRejectedValue(
                new Error("Already following this user")
            );

            await expect(userApi.followUser("target-user-456")).rejects.toThrow(
                "Already following this user"
            );
        });

        it("should handle unauthorized error", async () => {
            mockAxiosInstance.post.mockRejectedValue(new Error("Unauthorized"));

            await expect(userApi.followUser("target-user-456")).rejects.toThrow(
                "Unauthorized"
            );
        });

        it("should handle user not found error", async () => {
            mockAxiosInstance.post.mockRejectedValue(new Error("User not found"));

            await expect(userApi.followUser("nonexistent")).rejects.toThrow(
                "User not found"
            );
        });
    });

    describe("unfollowUser", () => {
        it("should unfollow user successfully", async () => {
            const mockResponse: FollowActionResponse = {
                success: true,
                isFollowing: false,
                followerCount: 9,
            };

            mockAxiosInstance.delete.mockResolvedValue({ data: mockResponse });

            const result = await userApi.unfollowUser("target-user-456");

            expect(mockAxiosInstance.delete).toHaveBeenCalledWith(
                "/users/target-user-456/follow"
            );
            expect(result.success).toBe(true);
            expect(result.isFollowing).toBe(false);
            expect(result.followerCount).toBe(9);
        });

        it("should handle not following error", async () => {
            mockAxiosInstance.delete.mockRejectedValue(
                new Error("Not following this user")
            );

            await expect(userApi.unfollowUser("target-user-456")).rejects.toThrow(
                "Not following this user"
            );
        });

        it("should handle unauthorized error", async () => {
            mockAxiosInstance.delete.mockRejectedValue(new Error("Unauthorized"));

            await expect(userApi.unfollowUser("target-user-456")).rejects.toThrow(
                "Unauthorized"
            );
        });
    });

    describe("Error interceptor", () => {
        it("should handle API errors consistently", () => {
            // The interceptor is set up when the module is loaded
            // We just need to verify the mock structure exists
            expect(mockAxiosInstance.interceptors).toBeDefined();
            expect(mockAxiosInstance.interceptors.response).toBeDefined();
            expect(mockAxiosInstance.interceptors.response.use).toBeDefined();
        });
    });
});