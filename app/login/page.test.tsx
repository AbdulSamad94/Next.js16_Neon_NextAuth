import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import Login from "./page";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { blogApi } from "@/lib/data";
import * as nextNavigation from "next/navigation";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock next-auth
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(() => ({
    data: null,
    status: "unauthenticated",
  })),
  signIn: jest.fn(),
}));

// Mock blogApi
jest.mock("@/lib/data", () => ({
  blogApi: {
    getAllBlogs: jest.fn(),
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

// Mock shadcn/ui components that Login page might use
jest.mock("@/components/ui/button", () => ({
  __esModule: true,
  Button: ({ children, variant, onClick, disabled, className, size }: any) => (
    <button
      data-testid="button"
      data-variant={variant}
      data-size={size}
      className={`${variant} ${className || ''} ${size}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/input", () => ({
  __esModule: true,
  Input: ({ value, onChange, placeholder, type, className, id, "aria-label": ariaLabel }: any) => (
    <input
      data-testid="input"
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      type={type}
      className={className}
      aria-label={ariaLabel}
    />
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
  Mail: () => <span data-testid="mail-icon">Mail</span>,
  Lock: () => <span data-testid="lock-icon">Lock</span>,
}));

describe("Login Page", () => {
  const mockPush = jest.fn();
  const mockSignIn = jest.fn();
  const mockUseSession = useSession as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    (nextNavigation.useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    (signIn as jest.Mock).mockImplementation(mockSignIn);
    mockUseSession.mockReturnValue({
      data: null,
      status: "unauthenticated",
    });
    mockSignIn.mockResolvedValue({ ok: true });
  });

  test("renders login form elements", async () => {
    await act(async () => {
      render(<Login />);
    });
    
    expect(screen.getByText("Welcome Back")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
    expect(screen.getByText("Forgot password?")).toBeInTheDocument();
  });

  test("redirects to home if already authenticated", async () => {
    mockUseSession.mockReturnValue({
      data: { user: { name: "Test User" } },
      status: "authenticated",
    });

    await act(async () => {
      render(<Login />);
    });
    
    // When authenticated, the component returns null, so we shouldn't see form elements
    expect(screen.queryByText("Welcome Back")).not.toBeInTheDocument();
  });

  test("handles form submission with valid credentials", async () => {
    await act(async () => {
      render(<Login />);
    });

    const emailInput = screen.getByPlaceholderText("you@example.com");
    const passwordInput = screen.getByPlaceholderText("••••••••");
    const submitButton = screen.getByRole("button", { name: "Sign In" });

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith("credentials", {
        email: "test@example.com",
        password: "password123",
        redirect: false,
      });
    });
  });

  test("shows error alert for empty form submission", async () => {
    // Mock alert
    window.alert = jest.fn();

    await act(async () => {
      render(<Login />);
    });

    await act(async () => {
      const submitButton = screen.getByRole("button", { name: "Sign In" });
      fireEvent.click(submitButton);
    });

    expect(window.alert).toHaveBeenCalledWith("Please fill in all fields");
  });

  test("shows error for invalid credentials", async () => {
    (signIn as jest.Mock).mockResolvedValue({ error: "Invalid email or password. Please try again." });
    // Mock alert
    window.alert = jest.fn();

    await act(async () => {
      render(<Login />);
    });

    const emailInput = screen.getByPlaceholderText("you@example.com");
    const passwordInput = screen.getByPlaceholderText("••••••••");
    const submitButton = screen.getByRole("button", { name: "Sign In" });

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: "wrong@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "wrongpassword" } });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Invalid email or password. Please try again.");
    });
  });

  test("handles social login", async () => {
    await act(async () => {
      render(<Login />);
    });

    const githubButton = screen.getByRole("button", { name: "GitHub" });
    await act(async () => {
      fireEvent.click(githubButton);
    });

    expect(signIn).toHaveBeenCalledWith("github", { callbackUrl: "/" });
  });
});