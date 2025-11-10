// __tests__/app/profile/[id]/page.test.tsx
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import UserProfilePage from "@/app/profile/[id]/page";
import { userApi } from "@/lib/data";
import toast from "react-hot-toast";

// Mock dependencies
jest.mock("next-auth/react");
jest.mock("next/navigation");
jest.mock("@/lib/data");
jest.mock("react-hot-toast");
jest.mock("framer-motion", () => ({
  motion: {
    section: ({ children, ...props }: any) => (
      <section {...props}>{children}</section>
    ),
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUserApi = userApi as jest.Mocked<typeof userApi>;
const mockToast = toast as jest.Mocked<typeof toast>;

describe("UserProfilePage", () => {
  const mockPush = jest.fn();
  const mockUserId = "user-123";
  const mockCurrentUserId = "current-user-456";

  const mockUserProfile = {
    id: mockUserId,
    name: "John Doe",
    email: "john@example.com",
    image: "https://example.com/avatar.jpg",
    bio: "Software developer and tech enthusiast",
    followerCount: 10,
    followingCount: 5,
    createdAt: "2024-01-01T00:00:00.000Z",
    isFollowing: false,
    posts: [
      {
        id: "post-1",
        title: "My First Blog Post",
        slug: "my-first-blog-post",
        content: "<p>This is my first blog post content</p>",
        excerpt: "This is my first blog post excerpt",
        coverImage: "https://example.com/cover.jpg",
        status: "published",
        createdAt: "2024-01-15T00:00:00.000Z",
        author: {
          id: mockUserId,
          name: "John Doe",
          email: "john@example.com",
          image: "https://example.com/avatar.jpg",
        },
        postCategories: [
          {
            category: {
              id: "cat-1",
              name: "Technology",
              slug: "technology",
              description: null,
              createdAt: "2024-01-01T00:00:00.000Z",
            },
          },
        ],
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({ push: mockPush } as any);
    mockToast.success = jest.fn();
    mockToast.error = jest.fn();
  });

  it("should render loading state initially", async () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: "loading",
    } as any);

    mockUserApi.getUserById.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    const params = Promise.resolve({ id: mockUserId });
    render(<UserProfilePage params={params} />);

    // Check for skeleton loading state by looking for Skeleton components
    await waitFor(() => {
      const skeletons = document.querySelectorAll(".animate-pulse");
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  it("should render user profile with posts", async () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: mockCurrentUserId } },
      status: "authenticated",
    } as any);

    mockUserApi.getUserById.mockResolvedValue(mockUserProfile);

    const params = Promise.resolve({ id: mockUserId });
    render(<UserProfilePage params={params} />);

    await waitFor(() => {
      // Use getAllByText for the name since it appears multiple times
      const nameElements = screen.getAllByText("John Doe");
      expect(nameElements.length).toBeGreaterThan(0);
      expect(screen.getByText("john@example.com")).toBeInTheDocument();
      expect(
        screen.getByText("Software developer and tech enthusiast")
      ).toBeInTheDocument();
    });

    // Check follower/following counts
    expect(screen.getByText("10")).toBeInTheDocument(); // Follower count
    expect(screen.getByText("5")).toBeInTheDocument(); // Following count

    // Check for post
    expect(screen.getByText("My First Blog Post")).toBeInTheDocument();
  });

  it("should show Follow button for other users", async () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: mockCurrentUserId } },
      status: "authenticated",
    } as any);

    mockUserApi.getUserById.mockResolvedValue(mockUserProfile);

    const params = Promise.resolve({ id: mockUserId });
    render(<UserProfilePage params={params} />);

    await waitFor(() => {
      const followButton = screen.getByRole("button", { name: /Follow/i });
      expect(followButton).toBeInTheDocument();
    });
  });

  it("should show Edit Profile button for own profile", async () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: mockUserId } },
      status: "authenticated",
    } as any);

    mockUserApi.getUserById.mockResolvedValue({
      ...mockUserProfile,
      id: mockUserId,
    });

    const params = Promise.resolve({ id: mockUserId });
    render(<UserProfilePage params={params} />);

    await waitFor(() => {
      const editButton = screen.getByRole("button", { name: /Edit Profile/i });
      expect(editButton).toBeInTheDocument();
    });
  });

  it("should handle follow action successfully", async () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: mockCurrentUserId } },
      status: "authenticated",
    } as any);

    mockUserApi.getUserById.mockResolvedValue(mockUserProfile);
    mockUserApi.followUser.mockResolvedValue({
      success: true,
      isFollowing: true,
      followerCount: 11,
    });

    const params = Promise.resolve({ id: mockUserId });
    render(<UserProfilePage params={params} />);

    await waitFor(() => {
      const followButton = screen.getByRole("button", { name: /Follow/i });
      fireEvent.click(followButton);
    });

    await waitFor(() => {
      expect(mockUserApi.followUser).toHaveBeenCalledWith(mockUserId);
      expect(mockToast.success).toHaveBeenCalledWith("Now following John Doe");
    });

    // Check that follower count updated
    await waitFor(() => {
      expect(screen.getByText("11")).toBeInTheDocument();
    });
  });

  it("should handle unfollow action successfully", async () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: mockCurrentUserId } },
      status: "authenticated",
    } as any);

    mockUserApi.getUserById.mockResolvedValue({
      ...mockUserProfile,
      isFollowing: true,
    });

    mockUserApi.unfollowUser.mockResolvedValue({
      success: true,
      isFollowing: false,
      followerCount: 9,
    });

    const params = Promise.resolve({ id: mockUserId });
    render(<UserProfilePage params={params} />);

    await waitFor(() => {
      const unfollowButton = screen.getByRole("button", { name: /Following/i });
      fireEvent.click(unfollowButton);
    });

    await waitFor(() => {
      expect(mockUserApi.unfollowUser).toHaveBeenCalledWith(mockUserId);
      expect(mockToast.success).toHaveBeenCalledWith("Unfollowed John Doe");
    });
  });

  it("should show error when follow fails", async () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: mockCurrentUserId } },
      status: "authenticated",
    } as any);

    mockUserApi.getUserById.mockResolvedValue(mockUserProfile);
    mockUserApi.followUser.mockRejectedValue(
      new Error("Already following this user")
    );

    const params = Promise.resolve({ id: mockUserId });
    render(<UserProfilePage params={params} />);

    await waitFor(() => {
      const followButton = screen.getByRole("button", { name: /Follow/i });
      fireEvent.click(followButton);
    });

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith(
        "Already following this user"
      );
    });
  });

  it("should prompt sign in when unauthenticated user tries to follow", async () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: "unauthenticated",
    } as any);

    mockUserApi.getUserById.mockResolvedValue(mockUserProfile);

    const params = Promise.resolve({ id: mockUserId });
    render(<UserProfilePage params={params} />);

    await waitFor(() => {
      const followButton = screen.getByRole("button", { name: /Follow/i });
      fireEvent.click(followButton);
    });

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith(
        "Please sign in to follow users"
      );
      expect(mockUserApi.followUser).not.toHaveBeenCalled();
    });
  });

  it("should handle user not found error", async () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: mockCurrentUserId } },
      status: "authenticated",
    } as any);

    mockUserApi.getUserById.mockRejectedValue(new Error("User not found"));

    const params = Promise.resolve({ id: "nonexistent" });
    render(<UserProfilePage params={params} />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load profile/i)).toBeInTheDocument();
    });
  });

  it("should show empty state when user has no posts", async () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: mockCurrentUserId } },
      status: "authenticated",
    } as any);

    mockUserApi.getUserById.mockResolvedValue({
      ...mockUserProfile,
      posts: [],
    });

    const params = Promise.resolve({ id: mockUserId });
    render(<UserProfilePage params={params} />);

    await waitFor(() => {
      expect(
        screen.getByText(/hasn't published any posts yet/i)
      ).toBeInTheDocument();
    });
  });

  it("should navigate to edit page when Edit Profile clicked", async () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: mockUserId } },
      status: "authenticated",
    } as any);

    mockUserApi.getUserById.mockResolvedValue(mockUserProfile);

    const params = Promise.resolve({ id: mockUserId });
    render(<UserProfilePage params={params} />);

    await waitFor(() => {
      const editButton = screen.getByRole("button", { name: /Edit Profile/i });
      fireEvent.click(editButton);
    });

    expect(mockPush).toHaveBeenCalledWith(`/profile/${mockUserId}/edit`);
  });

  it("should render correct follower/following text", async () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: mockCurrentUserId } },
      status: "authenticated",
    } as any);

    mockUserApi.getUserById.mockResolvedValue({
      ...mockUserProfile,
      followerCount: 1, // Singular
      followingCount: 5, // Plural
    });

    const params = Promise.resolve({ id: mockUserId });
    render(<UserProfilePage params={params} />);

    await waitFor(() => {
      expect(screen.getByText("Follower")).toBeInTheDocument(); // Singular
      expect(screen.getByText("Following")).toBeInTheDocument(); // Always "Following"
    });
  });
});
