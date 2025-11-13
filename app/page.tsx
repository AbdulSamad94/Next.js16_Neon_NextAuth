import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { FeaturedBlog } from "@/components/blog/featured-blog";
import { calculateReadTime, formatDate } from "@/lib/utils";
import { getPublishedBlogs } from "@/lib/data-server";
import { HeroSection } from "@/components/home/hero-section";
import { BlogGrid } from "@/components/home/blog-grid";

export default async function Home() {
  const blogs = await getPublishedBlogs();

  const featuredBlog = blogs[0] || null;
  const otherBlogs = blogs.slice(1);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section - Static content, always fast */}
        <HeroSection />

        {/* Featured Blog Section */}
        {featuredBlog && (
          <section className="mb-20">
            <FeaturedBlog
              id={featuredBlog.slug}
              title={featuredBlog.title}
              excerpt={
                featuredBlog.excerpt ||
                featuredBlog.content.replace(/<[^>]*>/g, "").substring(0, 200) +
                  "..."
              }
              author={featuredBlog.author.name || "Anonymous"}
              authorId={featuredBlog.author.id}
              date={formatDate(featuredBlog.createdAt)}
              tags={
                featuredBlog.postCategories?.map((pc) => pc.category.name) || []
              }
              coverImage={
                featuredBlog.coverImage ||
                "/placeholder.svg?height=400&width=800"
              }
              readTime={calculateReadTime(featuredBlog.content)}
            />
          </section>
        )}

        {/* Other Blogs Grid - Wrapped in client component for animations */}
        {otherBlogs.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-8">Latest Articles</h2>
            <BlogGrid blogs={otherBlogs} />
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
