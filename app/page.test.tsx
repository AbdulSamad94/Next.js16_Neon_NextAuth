// Mock server-only (prevents Jest from crashing)
jest.mock("server-only", () => ({}));

import { render, screen, act } from "@testing-library/react";
import Home from "./page";
import { getPublishedBlogs } from "@/lib/data-server";
import { BlogCardProps, FeaturedBlogProps } from "@/lib/types";

// Mock server-side data function
jest.mock("@/lib/data-server", () => ({
  getPublishedBlogs: jest.fn(),
}));

// Mock components
jest.mock("@/components/navbar", () => ({
  Navbar: () => <nav>Navbar</nav>,
}));
jest.mock("@/components/footer", () => ({
  Footer: () => <footer>Footer</footer>,
}));
jest.mock("@/components/blog/featured-blog", () => ({
  FeaturedBlog: (props: FeaturedBlogProps) => (
    <div data-testid="featured-blog">{props.title}</div>
  ),
}));
jest.mock("@/components/home/blog-grid", () => ({
  BlogGrid: (props: { blogs: BlogCardProps[] }) => (
    <div data-testid="blog-grid">
      {props.blogs.map((blog) => (
        <div key={blog.id}>{blog.title}</div>
      ))}
    </div>
  ),
}));
jest.mock("@/components/home/hero-section", () => ({
  HeroSection: () => (
    <section data-testid="hero-section">
      <h1>Discover Stories Worth Reading</h1>
      <p>
        Explore insightful articles on web development, design, and technology
        from our community of writers.
      </p>
    </section>
  ),
}));

describe("Home Page (Server Side)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders hero section correctly", async () => {
    (getPublishedBlogs as jest.Mock).mockResolvedValue([]);

    // Since Home is async, we must await its render
    await act(async () => {
      render(await Home());
    });

    expect(
      screen.getByText("Discover Stories Worth Reading")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Explore insightful articles on web development, design, and technology from our community of writers."
      )
    ).toBeInTheDocument();
  });

  test("renders featured blog and other blogs when data is available", async () => {
    const mockBlogs = [
      {
        id: "1",
        slug: "first-blog",
        title: "First Blog",
        content: "<p>This is the first blog post</p>",
        excerpt: "First blog excerpt",
        author: { id: "a1", name: "John Doe" },
        createdAt: new Date().toISOString(),
        postCategories: [],
      },
      {
        id: "2",
        slug: "second-blog",
        title: "Second Blog",
        content: "<p>This is the second blog post</p>",
        excerpt: "Second blog excerpt",
        author: { id: "a2", name: "Jane Doe" },
        createdAt: new Date().toISOString(),
        postCategories: [],
      },
    ];

    (getPublishedBlogs as jest.Mock).mockResolvedValue(mockBlogs);

    await act(async () => {
      render(await Home());
    });

    // Featured blog should appear
    expect(screen.getByTestId("featured-blog")).toHaveTextContent("First Blog");

    // Other blogs should appear in blog grid
    expect(screen.getByTestId("blog-grid")).toHaveTextContent("Second Blog");
  });

  test("renders only hero and footer when no blogs are returned", async () => {
    (getPublishedBlogs as jest.Mock).mockResolvedValue([]);

    await act(async () => {
      render(await Home());
    });

    expect(screen.getByTestId("hero-section")).toBeInTheDocument();
    expect(screen.queryByTestId("featured-blog")).toBeNull();
    expect(screen.queryByTestId("blog-grid")).toBeNull();
    expect(screen.getByText("Navbar")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });
});
