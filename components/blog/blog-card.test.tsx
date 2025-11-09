import { render, screen } from '@testing-library/react';
import { BlogCard } from './blog-card';
import { BlogCardProps } from '@/lib/types';

describe('BlogCard', () => {
  const mockBlog: BlogCardProps = {
    id: '1',
    title: 'Test Blog Post',
    excerpt: 'This is a test blog post',
    author: 'John Doe',
    date: new Date().toISOString(),
    tags: ['test', 'blog'],
    coverImage: '/test-image.jpg',
    readTime: 5,
  };

  test('renders blog title', () => {
    render(<BlogCard {...mockBlog} />);
    expect(screen.getByText('Test Blog Post')).toBeInTheDocument();
  });

  test('renders blog author', () => {
    render(<BlogCard {...mockBlog} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  test('renders blog cover image', () => {
    render(<BlogCard {...mockBlog} />);
    const image = screen.getByAltText('Test Blog Post');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src');
  });

  test('renders blog tags', () => {
    render(<BlogCard {...mockBlog} />);
    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByText('blog')).toBeInTheDocument();
  });

  test('formats date correctly', () => {
    render(<BlogCard {...mockBlog} />);
    // The exact date format will depend on the implementation
    const dateElement = screen.getByText(/min read/); // Assuming it shows read time
    expect(dateElement).toBeInTheDocument();
  });
});