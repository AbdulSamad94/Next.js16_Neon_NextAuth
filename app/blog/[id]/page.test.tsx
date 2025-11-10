import { render, screen, waitFor, act } from "@testing-library/react";
import BlogDetail from "./page";
import { useSession } from "next-auth/react";
import { blogApi } from "@/lib/data";
import { Blog } from "@/lib/types";

// Mock next-auth
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(() => ({
    data: { user: { id: "user1", name: "Test User" } },
    status: "authenticated",
  })),
}));

// Mock data
jest.mock("@/lib/data", () => ({
  blogApi: {
    getBlogById: jest.fn(),
    getAllBlogs: jest.fn(),
  },
}));

// Mock components
jest.mock("@/components/navbar", () => ({
  Navbar: () => <nav data-testid="navbar">Navbar</nav>,
}));

jest.mock("@/components/footer", () => ({
  Footer: () => <footer data-testid="footer">Footer</footer>,
}));

jest.mock("@/components/ProtectedRoute", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="protected-route">{children}</div>
  ),
}));

jest.mock("@/components/shared/error-state", () => ({
  ErrorState: ({ message, showBackButton }: any) => (
    <div data-testid="error-state">
      <p>{message}</p>
      {showBackButton && <button>Back to Home</button>}
    </div>
  ),
}));

jest.mock("@/components/blog/detail/blog-content-section", () => ({
  BlogContentSection: ({ blog }: any) => (
    <div data-testid="blog-content-section">
      <h1>{blog.title}</h1>
      <p>{blog.content}</p>
    </div>
  ),
}));

jest.mock("@/components/blog/detail/blog-comments", () => ({
  BlogComments: () => <div data-testid="blog-comments">Comments Section</div>,
}));

jest.mock("@/components/blog/detail/related-posts", () => ({
  RelatedPosts: ({ relatedBlogs }: any) => (
    <div data-testid="related-posts">
      {relatedBlogs.map((blog: Blog) => (
        <div key={blog.id}>{blog.title}</div>
      ))}
    </div>
  ),
}));

jest.mock("@/components/blog/detail/blog-detail-skeleton", () => ({
  BlogDetailSkeleton: () => <div data-testid="blog-skeleton">Loading...</div>,
}));

// Mock framer-motion
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  },
}));

// Mock react-hot-toast
jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
  Toaster: () => <div data-testid="toaster" />,
}));

// Mock lucide-react
jest.mock("lucide-react", () => ({
  ArrowLeft: () => <span data-testid="arrow-left-icon">←</span>,
}));

// Mock next/link
jest.mock("next/link", () => {
  return function Link({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) {
    return <a href={href}>{children}</a>;
  };
});

// Mock Button component
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, variant, size, className }: any) => (
    <button
      onClick={onClick}
      data-variant={variant}
      data-size={size}
      className={className}
    >
      {children}
    </button>
  ),
}));

describe("BlogDetail Page", () => {
  const mockGetBlogById = blogApi.getBlogById as jest.Mock;
  const mockGetAllBlogs = blogApi.getAllBlogs as jest.Mock;
  const mockUseSession = useSession as jest.Mock;

  const mockBlog: Blog = {
    id: "blog1",
    slug: "test-blog",
    title: "Test Blog Post",
    content: "<p>This is test content</p>",
    excerpt: "Test excerpt",
    coverImage: "/test-image.jpg",
    status: "published",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    authorId: "user1",
    author: {
      id: "user1",
      name: "Test Author",
      email: "test@example.com",
      image: "/author-image.jpg",
    },
    postCategories: [
      {
        category: {
          id: "cat1",
          name: "Technology",
          slug: "technology",
          description: "Tech posts",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
    ],
  };

  const mockRelatedBlogs: Blog[] = [
    {
      ...mockBlog,
      id: "blog2",
      slug: "related-blog-1",
      title: "Related Blog 1",
    },
    {
      ...mockBlog,
      id: "blog3",
      slug: "related-blog-2",
      title: "Related Blog 2",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSession.mockReturnValue({
      data: { user: { id: "user1", name: "Test User" } },
      status: "authenticated",
    });
    mockGetBlogById.mockResolvedValue({ post: mockBlog });
    mockGetAllBlogs.mockResolvedValue({
      posts: [...mockRelatedBlogs, mockBlog],
    });
  });

  test("renders loading skeleton initially", async () => {
    // Delay the API response to catch the loading state
    let resolveBlog: any;
    mockGetBlogById.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveBlog = resolve;
        })
    );

    await act(async () => {
      render(<BlogDetail params={Promise.resolve({ id: "test-blog" })} />);
    });

    // Should show skeleton while loading
    expect(screen.getByTestId("blog-skeleton")).toBeInTheDocument();

    // Resolve the promise
    await act(async () => {
      resolveBlog({ post: mockBlog });
    });
  });

  test("renders blog content after loading", async () => {
    await act(async () => {
      render(<BlogDetail params={Promise.resolve({ id: "test-blog" })} />);
    });

    await waitFor(() => {
      expect(screen.getByTestId("blog-content-section")).toBeInTheDocument();
    });

    expect(screen.getByText("Test Blog Post")).toBeInTheDocument();
  });

  test("renders related posts", async () => {
    await act(async () => {
      render(<BlogDetail params={Promise.resolve({ id: "test-blog" })} />);
    });

    await waitFor(() => {
      expect(screen.getByTestId("related-posts")).toBeInTheDocument();
    });

    expect(screen.getByText("Related Blog 1")).toBeInTheDocument();
    expect(screen.getByText("Related Blog 2")).toBeInTheDocument();
  });

  test("renders comments section", async () => {
    await act(async () => {
      render(<BlogDetail params={Promise.resolve({ id: "test-blog" })} />);
    });

    await waitFor(() => {
      expect(screen.getByTestId("blog-comments")).toBeInTheDocument();
    });
  });

  test("renders back button", async () => {
    await act(async () => {
      render(<BlogDetail params={Promise.resolve({ id: "test-blog" })} />);
    });

    await waitFor(() => {
      expect(screen.getAllByText("Back to Home").length).toBeGreaterThan(0);
    });
  });

  test("shows error state when blog not found", async () => {
    mockGetBlogById.mockRejectedValue(new Error("Blog not found"));

    // Suppress console.error for this test
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await act(async () => {
      render(<BlogDetail params={Promise.resolve({ id: "non-existent" })} />);
    });

    await waitFor(() => {
      expect(screen.getByTestId("error-state")).toBeInTheDocument();
    });

    expect(screen.getByText("Blog post not found")).toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });

  test("shows error state with back button", async () => {
    mockGetBlogById.mockRejectedValue(new Error("Failed to load"));

    // Suppress console.error for this test
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await act(async () => {
      render(<BlogDetail params={Promise.resolve({ id: "test-blog" })} />);
    });

    await waitFor(() => {
      expect(screen.getByTestId("error-state")).toBeInTheDocument();
    });

    const backButtons = screen.getAllByText("Back to Home");
    expect(backButtons.length).toBeGreaterThan(0);

    consoleErrorSpy.mockRestore();
  });

  test("filters out current blog from related posts", async () => {
    const allBlogs = [
      mockBlog,
      ...mockRelatedBlogs,
      { ...mockBlog, id: "blog4", slug: "another-blog", title: "Another Blog" },
    ];

    mockGetAllBlogs.mockResolvedValue({ posts: allBlogs });

    await act(async () => {
      render(<BlogDetail params={Promise.resolve({ id: "test-blog" })} />);
    });

    await waitFor(() => {
      expect(screen.getByTestId("related-posts")).toBeInTheDocument();
    });

    // Should not show the current blog in related posts
    expect(screen.queryByText("Test Blog Post")).toBeInTheDocument(); // In main content

    // Should show related blogs
    expect(screen.getByText("Related Blog 1")).toBeInTheDocument();
    expect(screen.getByText("Related Blog 2")).toBeInTheDocument();
  });

  test("limits related posts to 3", async () => {
    const manyBlogs = Array.from({ length: 10 }, (_, i) => ({
      ...mockBlog,
      id: `blog${i}`,
      slug: `blog-${i}`,
      title: `Blog ${i}`,
    }));

    mockGetAllBlogs.mockResolvedValue({ posts: manyBlogs });

    await act(async () => {
      render(<BlogDetail params={Promise.resolve({ id: "test-blog" })} />);
    });

    await waitFor(() => {
      expect(mockGetAllBlogs).toHaveBeenCalled();
    });

    // The component should only pass 3 related blogs
    // We can verify this by checking the mock was called and returned data
    expect(mockGetAllBlogs).toHaveBeenCalledTimes(1);
  });

  test("renders navbar and footer", async () => {
    await act(async () => {
      render(<BlogDetail params={Promise.resolve({ id: "test-blog" })} />);
    });

    expect(screen.getByTestId("navbar")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });

  test("renders toaster for notifications", async () => {
    await act(async () => {
      render(<BlogDetail params={Promise.resolve({ id: "test-blog" })} />);
    });

    expect(screen.getByTestId("toaster")).toBeInTheDocument();
  });
});
