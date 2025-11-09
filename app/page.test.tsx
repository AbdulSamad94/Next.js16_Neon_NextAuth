import { render, screen, waitFor, act } from '@testing-library/react';
import Home from './page';
import { blogApi } from '@/lib/data';

// Mock the API call
jest.mock('@/lib/data', () => ({
  blogApi: {
    getAllBlogs: jest.fn(),
  },
}));

// Mock components
jest.mock('@/components/navbar', () => ({
  Navbar: () => <nav>Navbar</nav>,
}));
jest.mock('@/components/footer', () => ({
  Footer: () => <footer>Footer</footer>,
}));
jest.mock('@/components/blog/featured-blog', () => ({
  FeaturedBlog: (props: any) => <div data-testid="featured-blog">{props.title}</div>,
}));
jest.mock('@/components/blog/blog-card', () => ({
  BlogCard: (props: any) => <div data-testid="blog-card">{props.title}</div>,
}));
jest.mock('@/components/shared/error-state', () => ({
  ErrorState: (props: any) => <div data-testid="error-state">{props.message}</div>,
}));
jest.mock('@/components/blog/featured-blog-skeleton', () => ({
  FeaturedBlogSkeleton: () => <div data-testid="featured-skeleton">Featured Skeleton</div>,
}));
jest.mock('@/components/blog/blog-card-skeleton', () => ({
  BlogCardSkeleton: () => <div data-testid="blog-skeleton">Blog Skeleton</div>,
}));

describe('Home Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading skeletons initially', async () => {
    const mockPromise = Promise.resolve({ posts: [] });
    (blogApi.getAllBlogs as jest.Mock).mockReturnValue(mockPromise);

    render(<Home />);

    // The skeletons should be visible while loading
    expect(screen.getByTestId('featured-skeleton')).toBeInTheDocument();
    expect(screen.getAllByTestId('blog-skeleton').length).toBeGreaterThan(0);
    
    // Wait for the promise to resolve and components to update
    await act(async () => {
      await mockPromise;
    });
  });

  test('renders featured blog and other blogs when data is loaded', async () => {
    const mockBlogs = [
      {
        id: '1',
        slug: 'first-blog',
        title: 'First Blog',
        content: '<p>This is the first blog post</p>',
        excerpt: 'First blog excerpt',
        author: { name: 'John Doe' },
        createdAt: new Date().toISOString(),
        status: 'published',
        postCategories: [],
      },
      {
        id: '2',
        slug: 'second-blog',
        title: 'Second Blog',
        content: '<p>This is the second blog post</p>',
        excerpt: 'Second blog excerpt',
        author: { name: 'Jane Doe' },
        createdAt: new Date().toISOString(),
        status: 'published',
        postCategories: [],
      },
    ];

    (blogApi.getAllBlogs as jest.Mock).mockResolvedValue({ posts: mockBlogs });

    await act(async () => {
      render(<Home />);
    });

    // Wait for the data to load
    await waitFor(() => {
      expect(screen.getByText('First Blog')).toBeInTheDocument();
    });

    // Featured blog should be rendered
    expect(screen.getByTestId('featured-blog')).toHaveTextContent('First Blog');

    // Other blogs should be rendered
    expect(screen.getByTestId('blog-card')).toBeInTheDocument();
  });

  test('renders error state when API call fails', async () => {
    (blogApi.getAllBlogs as jest.Mock).mockRejectedValue(new Error('API Error'));

    await act(async () => {
      render(<Home />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('error-state')).toBeInTheDocument();
    });

    expect(screen.getByTestId('error-state')).toHaveTextContent('Failed to load blogs');
  });

  test('renders hero section with correct content', async () => {
    (blogApi.getAllBlogs as jest.Mock).mockResolvedValue({ posts: [] });

    await act(async () => {
      render(<Home />);
    });

    expect(screen.getByText('Discover Stories Worth Reading')).toBeInTheDocument();
    expect(screen.getByText('Explore insightful articles on web development, design, and technology from our community of writers.')).toBeInTheDocument();
  });
});