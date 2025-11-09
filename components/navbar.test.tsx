import { render, screen } from '@testing-library/react';
import { Navbar } from './navbar';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  usePathname: () => '/test-path',
}));

// Mock next-auth/react
const mockUseSession = jest.fn();
jest.mock('next-auth/react', () => ({
  useSession: () => mockUseSession(),
}));

// Mock UserProfileDropdown
jest.mock('@/components/UserProfileDropdown', () => ({
  UserProfileDropdown: () => <div data-testid="user-profile-dropdown" />,
}));

describe('Navbar', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders logo and navigation links', () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' });
    render(<Navbar />);
    
    expect(screen.getByText('BlogHub')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /bloghub/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /write/i })).toBeInTheDocument();
  });

  test('renders login/signup buttons when not authenticated', () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' });
    render(<Navbar />);
    
    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
  });

  test('displays proper navigation when authenticated', () => {
    mockUseSession.mockReturnValue({ data: { user: { name: 'Test User' } }, status: 'authenticated' });
    render(<Navbar />);
    
    expect(screen.getByTestId('user-profile-dropdown')).toBeInTheDocument();
  });
});