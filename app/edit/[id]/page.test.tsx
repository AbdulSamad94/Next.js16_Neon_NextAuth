import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import EditBlog from "./page";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { blogApi, categoryApi } from "@/lib/data";
import * as nextNavigation from "next/navigation";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

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
    updateBlog: jest.fn(),
  },
  categoryApi: {
    getAllCategories: jest.fn(),
  },
}));

// Mock components
jest.mock("@/components/navbar", () => ({
  __esModule: true,
  Navbar: () => <nav data-testid="navbar">Navbar</nav>,
}));

jest.mock("@/components/footer", () => ({
  __esModule: true,
  Footer: () => <footer data-testid="footer">Footer</footer>,
}));

jest.mock("@/components/ProtectedRoute", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="protected-route">{children}</div>,
}));

jest.mock("@/components/blog/edit/edit-blog-form", () => ({
  EditBlogForm: ({
    title,
    setTitle,
    excerpt,
    setExcerpt,
    content,
    setContent,
    coverImage,
    preview,
    setPreview,
    handleImageUpload,
    removeCoverImage,
    handleUpdate,
    handleSaveDraft,
    saving,
    allCategories,
    selectedCategories,
    setSelectedCategories,
  }: any) => (
    <div data-testid="edit-blog-form">
      <h1>Edit Blog</h1>
      <input
        data-testid="title-input"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        data-testid="content-input"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button
        data-testid="update-button"
        onClick={handleUpdate}
        disabled={saving}
      >
        Update Blog
      </button>
    </div>
  ),
}));
jest.mock("@/components/blog/edit/edit-blog-form-skeleton", () => ({
  EditBlogFormSkeleton: () => <div data-testid="skeleton">Loading...</div>,
}));

jest.mock("@/components/blog/edit/error-display", () => ({
  ErrorDisplay: ({ title, message }: { title: string, message: string }) => (
    <div data-testid="error-display">
      <h2>{title}</h2>
      <p>{message}</p>
    </div>
  ),
}));

// Mock framer-motion
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  },
}));

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  Upload: () => <span data-testid="upload-icon">Upload</span>,
  Eye: () => <span data-testid="eye-icon">Eye</span>,
  EyeOff: () => <span data-testid="eye-off-icon">EyeOff</span>,
  X: () => <span data-testid="x-icon">X</span>,
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

// Mock next/image
jest.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} data-testid="mock-image" />,
}));

describe("EditBlog Page", () => {
  const mockPush = jest.fn();
  const mockUseSession = jest.fn();
  const mockGetBlogById = jest.fn();
  const mockUpdateBlog = jest.fn();
  const mockGetAllCategories = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (nextNavigation.useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    (useSession as jest.Mock).mockImplementation(mockUseSession);
    (blogApi.getBlogById as jest.Mock).mockImplementation(mockGetBlogById);
    (blogApi.updateBlog as jest.Mock).mockImplementation(mockUpdateBlog);
    (categoryApi.getAllCategories as jest.Mock).mockImplementation(mockGetAllCategories);

    mockUseSession.mockReturnValue({
      data: { user: { id: "user1", name: "Test User" } },
      status: "authenticated",
    });
    mockGetBlogById.mockResolvedValue({
      post: {
        id: "blog1",
        title: "Test Blog",
        content: "<p>Test content</p>",
        excerpt: "Test excerpt",
        coverImage: null,
        author: { id: "user1" }, // Same as current user
        postCategories: [],
      },
    });
    mockGetAllCategories.mockResolvedValue({
      categories: [
        { id: "1", name: "Technology" },
        { id: "2", name: "Science" },
      ],
    });
    mockUpdateBlog.mockResolvedValue({ success: true });
  });

  test("renders loading state initially", async () => {
    // Create a promise that will resolve after a delay to simulate async loading
    const delayedPromise = new Promise((resolve) => 
      setTimeout(() => resolve({
        post: {
          id: "blog1",
          title: "Test Blog",
          content: "<p>Test content</p>",
          excerpt: "Test excerpt",
          coverImage: null,
          author: { id: "user1" }, // Same as current user
          postCategories: [],
        },
      }), 100)
    );
    
    // Mock getBlogById to return the delayed promise
    (blogApi.getBlogById as jest.Mock).mockReturnValue(delayedPromise);

    await act(async () => {
      render(<EditBlog params={Promise.resolve({ id: "blog1" })} />);
    });

    // Should initially show skeleton since data loading is async
    expect(screen.getByTestId("skeleton")).toBeInTheDocument();
    
    // Wait for the async operation to complete
    await waitFor(() => {
      expect(screen.queryByTestId("skeleton")).not.toBeInTheDocument();
    }, { timeout: 200 });
  });

  test("renders blog edit form when data is loaded", async () => {
    await act(async () => {
      render(<EditBlog params={Promise.resolve({ id: "blog1" })} />);
    });
    
    await waitFor(() => {
      expect(screen.getByTestId("edit-blog-form")).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Edit Blog" })).toBeInTheDocument();
    });
    
    // Wait for the form to be rendered
    await waitFor(() => {
      expect(screen.getByTestId("title-input")).toHaveValue("Test Blog");
    });
    
    expect(screen.getByTestId("content-input")).toHaveValue("<p>Test content</p>");
  });

  test("shows error when user is not the author", async () => {
    mockGetBlogById.mockResolvedValue({
      post: {
        id: "blog1",
        title: "Test Blog",
        content: "<p>Test content</p>",
        excerpt: "Test excerpt",
        coverImage: null,
        author: { id: "different-user" }, // Different user
        postCategories: [],
      },
    });

    await act(async () => {
      render(<EditBlog params={Promise.resolve({ id: "blog1" })} />);
    });
    
    await waitFor(() => {
      expect(screen.getByTestId("error-display")).toBeInTheDocument();
    });
    
    expect(screen.getByText("You don't have permission to edit this blog.")).toBeInTheDocument();
  });

  test("updates blog successfully", async () => {
    await act(async () => {
      render(<EditBlog params={Promise.resolve({ id: "blog1" })} />);
    });
    
    // Wait for form to load
    await waitFor(() => {
      expect(screen.getByTestId("edit-blog-form")).toBeInTheDocument();
    });

    // Change title and content
    const titleInput = screen.getByTestId("title-input");
    await act(async () => {
      fireEvent.change(titleInput, { target: { value: "Updated Blog Title" } });
    });

    const contentInput = screen.getByTestId("content-input");
    await act(async () => {
      fireEvent.change(contentInput, { target: { value: "<p>This is updated content that is more than fifty characters long to pass validation.</p>" } });
    });

    // Click update button
    const updateButton = screen.getByTestId("update-button");
    await act(async () => {
      fireEvent.click(updateButton);
    });

    await waitFor(() => {
      expect(mockUpdateBlog).toHaveBeenCalledWith("blog1", {
        title: "Updated Blog Title",
        excerpt: "Test excerpt",
        content: "<p>This is updated content that is more than fifty characters long to pass validation.</p>",
        coverImage: null,
        status: "published",
        categoryIds: [],
      });
    });
  });

  test("handles validation errors during update", async () => {
    await act(async () => {
      render(<EditBlog params={Promise.resolve({ id: "blog1" })} />);
    });
    
    // Wait for form to load
    await waitFor(() => {
      expect(screen.getByTestId("edit-blog-form")).toBeInTheDocument();
    });

    // Change title to empty
    const titleInput = screen.getByTestId("title-input");
    await act(async () => {
      fireEvent.change(titleInput, { target: { value: "" } });
    });

    // Click update button
    const updateButton = screen.getByTestId("update-button");
    await act(async () => {
      fireEvent.click(updateButton);
    });

    await waitFor(() => {
      expect(require("react-hot-toast").default.error).toHaveBeenCalledWith("Please enter a title");
    });
  });

  test("handles update errors", async () => {
    mockUpdateBlog.mockRejectedValue(new Error("Update failed"));

    await act(async () => {
      render(<EditBlog params={Promise.resolve({ id: "blog1" })} />);
    });
    
    // Wait for form to load
    await waitFor(() => {
      expect(screen.getByTestId("edit-blog-form")).toBeInTheDocument();
    });

    // Change title and content (with enough characters to pass validation)
    const titleInput = screen.getByTestId("title-input");
    await act(async () => {
      fireEvent.change(titleInput, { target: { value: "Updated Blog Title" } });
    });

    const contentInput = screen.getByTestId("content-input");
    await act(async () => {
      fireEvent.change(contentInput, { target: { value: "<p>This is updated content that is more than fifty characters long to pass validation.</p>" } });
    });

    // Click update button
    const updateButton = screen.getByTestId("update-button");
    await act(async () => {
      fireEvent.click(updateButton);
    });

    await waitFor(() => {
      expect(require("react-hot-toast").default.error).toHaveBeenCalledWith("Update failed");
    });
  });
});