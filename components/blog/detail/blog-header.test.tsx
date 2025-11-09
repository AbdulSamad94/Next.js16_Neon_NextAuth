import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { BlogHeader } from "./blog-header";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { blogApi } from "@/lib/data";
import * as nextNavigation from "next/navigation";
import toast from "react-hot-toast";

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
    deleteBlog: jest.fn(),
  },
}));

// Mock components
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, variant, onClick, disabled, className, size }: any) => (
    <button
      data-testid="button"
      data-variant={variant}
      data-size={size}
      className={`${variant} ${className || ""} ${size}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/avatar", () => ({
  Avatar: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AvatarImage: ({ src }: { src: string }) => <img src={src} alt="avatar" />,
  AvatarFallback: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

jest.mock("@/components/ui/alert-dialog", () => ({
  AlertDialog: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogTrigger: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alert-dialog">{children}</div>
  ),
  AlertDialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogTitle: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogDescription: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogFooter: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogAction: ({ children, onClick, disabled }: any) => (
    <button
      data-testid="alert-dialog-action"
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  ),
  AlertDialogCancel: ({ children }: { children: React.ReactNode }) => (
    <button>{children}</button>
  ),
}));

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  Heart: () => <span data-testid="heart-icon" />,
  Share2: () => <span data-testid="share-icon" />,
  Edit: () => <span data-testid="edit-icon" />,
  Trash2: () => <span data-testid="trash-icon" />,
}));

// Mock react-hot-toast - CORRECTED
jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
  },
}));

// Mock next/link
jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

describe("BlogHeader Component", () => {
  const mockPush = jest.fn();
  const mockUseSession = jest.fn();
  const mockDeleteBlog = jest.fn();

  const mockBlog = {
    id: "blog1",
    title: "Test Blog",
    content: "<p>Test content</p>",
    excerpt: "Test excerpt",
    createdAt: new Date().toISOString(),
    author: {
      id: "user1",
      name: "Test Author",
      email: "test@example.com",
      image: "/test-image.jpg",
    },
    postCategories: [],
    slug: "test-blog",
    status: "published",
    coverImage: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (nextNavigation.useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    (useSession as jest.Mock).mockImplementation(mockUseSession);
    (blogApi.deleteBlog as jest.Mock).mockImplementation(mockDeleteBlog);

    mockUseSession.mockReturnValue({
      data: { user: { id: "user1", name: "Test User" } },
      status: "authenticated",
    });
    mockDeleteBlog.mockResolvedValue({
      success: true,
      message: "Deleted successfully",
    });
  });

  test("renders blog header with author info", async () => {
    await act(async () => {
      render(<BlogHeader blog={mockBlog} blogId="blog1" />);
    });

    expect(screen.getByText("Test Author")).toBeInTheDocument();
  });

  test("shows edit and delete buttons for author", async () => {
    await act(async () => {
      render(<BlogHeader blog={mockBlog} blogId="blog1" />);
    });

    expect(screen.getByText("Edit")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  test("does not show edit and delete buttons for non-author", async () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: "different-user", name: "Different User" } },
      status: "authenticated",
    });

    await act(async () => {
      render(<BlogHeader blog={mockBlog} blogId="blog1" />);
    });

    expect(screen.queryByText("Edit")).not.toBeInTheDocument();
    expect(screen.queryByText("Delete")).not.toBeInTheDocument();
  });

  test("deletes blog successfully", async () => {
    await act(async () => {
      render(<BlogHeader blog={mockBlog} blogId="blog1" />);
    });

    // Click the delete button to open the dialog
    const deleteButton = screen.getByText("Delete");
    await act(async () => {
      fireEvent.click(deleteButton);
    });

    // Click the confirm button in the dialog
    const confirmButton = screen.getByTestId("alert-dialog-action");
    await act(async () => {
      fireEvent.click(confirmButton);
    });

    await waitFor(() => {
      expect(mockDeleteBlog).toHaveBeenCalledWith("blog1");
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Blog deleted successfully!");
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  test("handles deletion error", async () => {
    mockDeleteBlog.mockRejectedValue(new Error("Deletion failed"));

    // Suppress console.error for this test
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await act(async () => {
      render(<BlogHeader blog={mockBlog} blogId="blog1" />);
    });

    // Click the delete button to open the dialog
    const deleteButton = screen.getByText("Delete");
    await act(async () => {
      fireEvent.click(deleteButton);
    });

    // Click the confirm button in the dialog
    const confirmButton = screen.getByTestId("alert-dialog-action");
    await act(async () => {
      fireEvent.click(confirmButton);
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Deletion failed");
    });

    consoleErrorSpy.mockRestore();
  });

  test("shows loading state during deletion", async () => {
    let resolveDelete: any;
    mockDeleteBlog.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveDelete = resolve;
        })
    );

    await act(async () => {
      render(<BlogHeader blog={mockBlog} blogId="blog1" />);
    });

    // Click the delete button to open the dialog
    const deleteButton = screen.getByText("Delete");
    await act(async () => {
      fireEvent.click(deleteButton);
    });

    // Click the confirm button in the dialog
    const confirmButton = screen.getByTestId("alert-dialog-action");
    await act(async () => {
      fireEvent.click(confirmButton);
    });

    // Check that both buttons show "Deleting..." state by using queryAllByText
    await waitFor(() => {
      const deletingTexts = screen.queryAllByText("Deleting...");
      expect(deletingTexts).toHaveLength(2); // Both buttons should show "Deleting..."
    });

    // Check that the dialog confirm button is disabled
    const dialogConfirmButton = screen.getByTestId("alert-dialog-action");
    expect(dialogConfirmButton).toBeDisabled();

    // Check that the main delete button is also disabled
    const mainDeleteButton = screen.getAllByTestId("button").find(button => 
      button.getAttribute('data-variant') === 'outline' && 
      button.querySelector('[data-testid="trash-icon"]')
    );
    expect(mainDeleteButton).toBeDisabled();

    // Resolve the promise to complete the test
    await act(async () => {
      resolveDelete({ success: true, message: "Deleted successfully" });
    });
  });
});
