import Link from "next/link";
import Footer from "../_components/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | TechPickHub - Insights, Tips & Stories for Freelance Developers",
  description: "Read the latest insights, tips, and stories from TechPickHub. Learn about freelance development, project management, client communication, and industry trends.",
  keywords: "freelance blog, developer tips, project management, tech industry, remote work, freelancing advice, developer portfolio",
  openGraph: {
    title: "TechPickHub Blog - Freelance Development Insights",
    description: "Insights, tips, and stories from the world of freelance development and project collaboration.",
    type: "website",
    url: "https://techpickhub.com/blog",
  },
  twitter: {
    card: "summary_large_image",
    title: "TechPickHub Blog",
    description: "Latest insights and tips for freelance developers, clients, and agencies.",
  },
};

export default function BlogPage() {
  const blogPosts = [
    {
      id: 1,
      title: "How to Choose the Right Developer for Your Project",
      excerpt: "Learn the key factors to consider when selecting a developer for your next project, from technical skills to communication style.",
      category: "For Clients",
      date: "November 20, 2024",
      readTime: "5 min read",
      image: "🎯",
    },
    {
      id: 2,
      title: "Building a Winning Developer Portfolio",
      excerpt: "Discover the essential elements of a portfolio that attracts clients and showcases your best work effectively.",
      category: "For Developers",
      date: "November 18, 2024",
      readTime: "7 min read",
      image: "💼",
    },
    {
      id: 3,
      title: "The Future of Remote Work in Tech",
      excerpt: "Explore how remote work is reshaping the tech industry and what it means for developers and clients alike.",
      category: "Industry Insights",
      date: "November 15, 2024",
      readTime: "6 min read",
      image: "🌐",
    },
    {
      id: 4,
      title: "Effective Project Management for Freelancers",
      excerpt: "Master the art of managing multiple projects, meeting deadlines, and keeping clients happy as a freelance developer.",
      category: "For Developers",
      date: "November 12, 2024",
      readTime: "8 min read",
      image: "📊",
    },
    {
      id: 5,
      title: "Understanding Platform Fees and Pricing",
      excerpt: "A transparent breakdown of how platform fees work and tips for maximizing your earnings or budget.",
      category: "Platform Updates",
      date: "November 10, 2024",
      readTime: "4 min read",
      image: "💰",
    },
    {
      id: 6,
      title: "Best Practices for Client-Developer Communication",
      excerpt: "Learn how to establish clear communication channels and set expectations for successful project collaboration.",
      category: "For Clients",
      date: "November 8, 2024",
      readTime: "6 min read",
      image: "💬",
    },
    {
      id: 7,
      title: "Scaling Your Agency with TechPickHub",
      excerpt: "Discover strategies for growing your agency by leveraging our platform to find clients and hire top developers.",
      category: "For Agencies",
      date: "November 5, 2024",
      readTime: "7 min read",
      image: "🚀",
    },
    {
      id: 8,
      title: "Security Best Practices for Freelance Projects",
      excerpt: "Essential security measures every developer should implement to protect client data and maintain trust.",
      category: "For Developers",
      date: "November 3, 2024",
      readTime: "9 min read",
      image: "🔒",
    },
    {
      id: 9,
      title: "How to Write Compelling Project Descriptions",
      excerpt: "Tips for clients on crafting project descriptions that attract the right developers and set clear expectations.",
      category: "For Clients",
      date: "November 1, 2024",
      readTime: "5 min read",
      image: "✍️",
    },
  ];

  const categories = ["All", "For Clients", "For Developers", "For Agencies", "Industry Insights", "Platform Updates"];

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.08]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="honeycomb" x="0" y="0" width="56" height="100" patternUnits="userSpaceOnUse">
                <polygon points="28,0 56,17 56,50 28,67 0,50 0,17" fill="none" stroke="#3B82F6" strokeWidth="1"/>
                <polygon points="28,33 56,50 56,83 28,100 0,83 0,50" fill="none" stroke="#3B82F6" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#honeycomb)" />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              TechPickHub <span className="text-blue-600">Blog</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              Insights, tips, and stories from the world of freelance development and project collaboration
            </p>
          </div>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  category === "All"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 md:p-12 shadow-lg">
            <div className="flex items-start gap-2 mb-4">
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                Featured
              </span>
              <span className="bg-white text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">
                For Developers
              </span>
            </div>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                  Building a Winning Developer Portfolio
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  Discover the essential elements of a portfolio that attracts clients and showcases your best work effectively. Learn from successful developers who have built thriving freelance careers.
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
                  <span>November 18, 2024</span>
                  <span>•</span>
                  <span>7 min read</span>
                </div>
                <Link
                  href="#"
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
                >
                  Read Article
                </Link>
              </div>
              <div className="flex items-center justify-center">
                <div className="text-9xl">💼</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group"
              >
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-12 flex items-center justify-center group-hover:from-blue-100 group-hover:to-indigo-100 transition-all duration-300">
                  <div className="text-6xl">{post.image}</div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                      {post.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>{post.date}</span>
                    <span>{post.readTime}</span>
                  </div>
                  <Link
                    href="#"
                    className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold group"
                  >
                    Read More
                    <svg
                      className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* Load More Button */}
          <div className="text-center mt-12">
            <button className="bg-white hover:bg-gray-50 text-gray-900 font-semibold py-3 px-8 rounded-lg transition duration-200 border-2 border-gray-300 hover:border-gray-400">
              Load More Articles
            </button>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Stay Updated
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Subscribe to our newsletter for the latest insights, tips, and platform updates
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="bg-white hover:bg-gray-100 text-blue-600 font-semibold py-4 px-8 rounded-full transition duration-200 shadow-lg hover:shadow-xl whitespace-nowrap">
              Subscribe
            </button>
          </div>
          <p className="text-sm text-blue-100 mt-4">
            No spam, unsubscribe anytime. We respect your privacy.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
