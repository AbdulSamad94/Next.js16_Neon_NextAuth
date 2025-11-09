import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import Signup from "./page";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { authApi } from "@/lib/data";
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

// Mock authApi
jest.mock("@/lib/data", () => ({
  authApi: {
    signup: jest.fn(),
  },
}));

// Mock framer-motion
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
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
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="protected-route">{children}</div>
  ),
}));

// Mock shadcn/ui components
jest.mock("@/components/ui/button", () => ({
  __esModule: true,
  Button: ({ children, onClick, disabled, className, type, variant }: any) => (
    <button
      data-testid="button"
      onClick={onClick}
      disabled={disabled}
      className={className}
      type={type}
    >
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/input", () => ({
  __esModule: true,
  Input: ({
    value,
    onChange,
    placeholder,
    type,
    className,
    id,
    required,
  }: any) => (
    <input
      data-testid={`input-${type || "text"}`}
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      type={type}
      className={className}
      required={required}
    />
  ),
}));

// Mock next/link
jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  Mail: () => <span data-testid="mail-icon">Mail</span>,
  Lock: () => <span data-testid="lock-icon">Lock</span>,
  User: () => <span data-testid="user-icon">User</span>,
}));

describe("Signup Page", () => {
  const mockPush = jest.fn();
  const mockSignIn = jest.fn();
  const mockUseSession = useSession as jest.Mock;
  const mockSignup = authApi.signup as jest.Mock;

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
    mockSignup.mockResolvedValue({ user: { id: "1", name: "Test User" } });
    mockSignIn.mockResolvedValue({ ok: true });
  });

  test("renders signup form elements", async () => {
    await act(async () => {
      render(<Signup />);
    });

    expect(
      screen.getByRole("heading", { name: "Create Account" })
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("John Doe")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();

    const passwordInputs = screen.getAllByPlaceholderText("••••••••");
    expect(passwordInputs).toHaveLength(2);

    expect(
      screen.getByRole("button", { name: "Create Account" })
    ).toBeInTheDocument();
  });

  test("redirects to home if already authenticated", async () => {
    mockUseSession.mockReturnValue({
      data: { user: { name: "Test User" } },
      status: "authenticated",
    });

    await act(async () => {
      render(<Signup />);
    });

    expect(screen.queryByText("Create Account")).not.toBeInTheDocument();
  });

  test("handles form submission with valid credentials", async () => {
    await act(async () => {
      render(<Signup />);
    });

    const nameInput = screen.getByPlaceholderText("John Doe");
    const emailInput = screen.getByPlaceholderText("you@example.com");
    const passwordInputs = screen.getAllByTestId("input-password");
    const passwordInput = passwordInputs[0];
    const confirmPasswordInput = passwordInputs[1];
    const checkbox = screen.getByRole("checkbox");
    const submitButton = screen.getByRole("button", { name: "Create Account" });

    await act(async () => {
      fireEvent.change(nameInput, { target: { value: "Test User" } });
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: "password123" },
      });
      fireEvent.click(checkbox);
    });

    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });
    });

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith("credentials", {
        email: "test@example.com",
        password: "password123",
        redirect: false,
      });
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  test("shows error for empty form submission", async () => {
    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});

    await act(async () => {
      render(<Signup />);
    });

    const form = screen
      .getByRole("button", { name: "Create Account" })
      .closest("form");

    await act(async () => {
      // Simulate form submission programmatically
      fireEvent.submit(form!);
    });

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("Please fill all fields.");
    });

    alertSpy.mockRestore();
  });

  test("shows error for mismatched passwords", async () => {
    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});

    await act(async () => {
      render(<Signup />);
    });

    const nameInput = screen.getByPlaceholderText("John Doe");
    const emailInput = screen.getByPlaceholderText("you@example.com");
    const passwordInputs = screen.getAllByTestId("input-password");
    const passwordInput = passwordInputs[0];
    const confirmPasswordInput = passwordInputs[1];
    const checkbox = screen.getByRole("checkbox");
    const form = screen
      .getByRole("button", { name: "Create Account" })
      .closest("form");

    await act(async () => {
      fireEvent.change(nameInput, { target: { value: "Test User" } });
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: "differentpassword" },
      });
      fireEvent.click(checkbox);
    });

    await act(async () => {
      fireEvent.submit(form!);
    });

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("Passwords do not match!");
    });

    alertSpy.mockRestore();
  });

  test("shows error for short password", async () => {
    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});

    await act(async () => {
      render(<Signup />);
    });

    const nameInput = screen.getByPlaceholderText("John Doe");
    const emailInput = screen.getByPlaceholderText("you@example.com");
    const passwordInputs = screen.getAllByTestId("input-password");
    const passwordInput = passwordInputs[0];
    const confirmPasswordInput = passwordInputs[1];
    const checkbox = screen.getByRole("checkbox");
    const form = screen
      .getByRole("button", { name: "Create Account" })
      .closest("form");

    await act(async () => {
      fireEvent.change(nameInput, { target: { value: "Test User" } });
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "pass" } });
      fireEvent.change(confirmPasswordInput, { target: { value: "pass" } });
      fireEvent.click(checkbox);
    });

    await act(async () => {
      fireEvent.submit(form!);
    });

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        "Password must be at least 8 characters long"
      );
    });

    alertSpy.mockRestore();
  });

  test("handles signup error", async () => {
    mockSignup.mockRejectedValue(new Error("Signup failed"));
    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});

    await act(async () => {
      render(<Signup />);
    });

    const nameInput = screen.getByPlaceholderText("John Doe");
    const emailInput = screen.getByPlaceholderText("you@example.com");
    const passwordInputs = screen.getAllByTestId("input-password");
    const passwordInput = passwordInputs[0];
    const confirmPasswordInput = passwordInputs[1];
    const checkbox = screen.getByRole("checkbox");
    const form = screen
      .getByRole("button", { name: "Create Account" })
      .closest("form");

    await act(async () => {
      fireEvent.change(nameInput, { target: { value: "Test User" } });
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: "password123" },
      });
      fireEvent.click(checkbox);
    });

    await act(async () => {
      fireEvent.submit(form!);
    });

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        "Something went wrong. Please try again later."
      );
    });

    alertSpy.mockRestore();
  });

  test("handles social sign up", async () => {
    await act(async () => {
      render(<Signup />);
    });

    const buttons = screen.getAllByRole("button");
    const githubButton = buttons.find((btn) => btn.textContent === "GitHub");

    expect(githubButton).toBeDefined();

    await act(async () => {
      fireEvent.click(githubButton!);
    });

    expect(signIn).toHaveBeenCalledWith("github", { callbackUrl: "/" });
  });
});
