import Link from "next/link";
import Footer from "../_components/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | TechPickHub - Revolutionizing Freelance Collaboration",
  description: "Learn about TechPickHub's mission to connect clients, developers, and agencies. We're building a three-way marketplace where quality matters and meaningful connections lead to successful projects.",
  keywords: "about techpickhub, our mission, company story, freelance platform, tech marketplace, our team, our values",
  openGraph: {
    title: "About TechPickHub - Our Mission & Story",
    description: "Revolutionizing how clients, developers, and agencies connect and collaborate on projects. Join our growing community.",
    type: "website",
    url: "https://techpickhub.com/about",
  },
  twitter: {
    card: "summary_large_image",
    title: "About TechPickHub",
    description: "Learn about our mission to revolutionize freelance collaboration and project delivery.",
  },
};

export default function AboutPage() {
  const teamMembers = [
    {
      name: "Marven Paray",
      role: "CEO & CTO",
      image: "👩‍💼",
      bio: "Former Fullstack Developer and IT Instructor with 3+ years of experience in building scalable platforms.",
    },
    {
      name: "Emily Rodriguez",
      role: "Head of Product Co-Founder",
      image: "👩‍🎨",
      bio: "Product strategist focused on connecting the right people for successful projects.",
    },
    {
      name: "David Kim",
      role: "Head of Engineering",
      image: "👨‍🔧",
      bio: "Software architect dedicated to building robust and secure platforms.",
    },
  ];

  const values = [
    {
      icon: "🎯",
      title: "Transparency",
      description: "We believe in clear communication, honest pricing, and open processes. No hidden fees, no surprises.",
    },
    {
      icon: "🤝",
      title: "Trust",
      description: "Building trust between clients, developers, and agencies is at the heart of everything we do.",
    },
    {
      icon: "⚡",
      title: "Innovation",
      description: "We continuously improve our platform with cutting-edge features that make collaboration easier.",
    },
    {
      icon: "🌟",
      title: "Quality",
      description: "We maintain high standards through verification processes and quality assurance frameworks.",
    },
    {
      icon: "💪",
      title: "Empowerment",
      description: "We empower developers to choose their projects and clients to find the perfect talent.",
    },
    {
      icon: "🌍",
      title: "Community",
      description: "We're building a global community of professionals who support and learn from each other.",
    },
  ];

  const stats = [
    { number: "10,000+", label: "Active Users" },
    { number: "5,000+", label: "Projects Completed" },
    { number: "50+", label: "Countries" },
    { number: "98%", label: "Satisfaction Rate" },
  ];

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
              About <span className="text-blue-600">TechPickHub</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              We&apos;re on a mission to revolutionize how clients, developers, and agencies connect and collaborate on projects
            </p>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              Our Story
            </h2>
          </div>
          <div className="prose prose-lg max-w-none text-gray-600">
            <p className="text-lg leading-relaxed mb-6">
              TechPickHub was born from a simple observation: the traditional freelance marketplace model wasn&apos;t working for everyone. Developers were overwhelmed with proposals, clients struggled to find the right talent, and agencies needed better ways to scale their operations.
            </p>
            <p className="text-lg leading-relaxed mb-6">
              We asked ourselves: what if developers could choose the projects they&apos;re passionate about? What if clients could post projects and let talent come to them? What if agencies could seamlessly browse projects and hire developers?
            </p>
            <p className="text-lg leading-relaxed mb-6">
              That&apos;s how TechPickHub was created—a three-way marketplace that puts power in the hands of developers while giving clients and agencies the tools they need to succeed. We&apos;ve built a platform where quality matters more than quantity, and where meaningful connections lead to successful projects.
            </p>
            <p className="text-lg leading-relaxed">
              Today, we&apos;re proud to serve thousands of professionals across the globe, facilitating successful collaborations and helping build amazing projects every day.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl sm:text-5xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-blue-100 text-sm sm:text-base">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              These core values guide everything we do and shape the platform we&apos;re building
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="text-5xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Passionate professionals dedicated to building the future of freelance collaboration
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="text-center group"
              >
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 mb-4 group-hover:from-blue-100 group-hover:to-indigo-100 transition-all duration-300">
                  <div className="text-7xl">{member.image}</div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {member.name}
                </h3>
                <p className="text-blue-600 font-semibold mb-3">
                  {member.role}
                </p>
                <p className="text-gray-600 text-sm">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            Our Mission
          </h2>
          <p className="text-xl text-gray-700 leading-relaxed mb-8">
            To create a world where talented developers have the freedom to choose meaningful work, where clients can easily find the perfect talent, and where agencies can scale their operations efficiently—all while maintaining the highest standards of quality and trust.
          </p>
          <div className="inline-block bg-blue-600 text-white px-8 py-3 rounded-full font-semibold">
            Building the Future Together
          </div>
        </div>
      </section>

      {/* Join Us Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            Join Our Growing Community
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Whether you&apos;re a client looking for talent, a developer seeking projects, or an agency ready to scale, TechPickHub is here to help you succeed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/join"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-full transition duration-200 shadow-lg hover:shadow-xl text-lg"
            >
              Get Started Today
            </Link>
            <Link
              href="/how-it-works"
              className="bg-white hover:bg-gray-50 text-gray-900 font-semibold py-4 px-8 rounded-full transition duration-200 border-2 border-gray-300 hover:border-gray-400 text-lg"
            >
              Learn How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Get in Touch
            </h2>
            <p className="text-lg text-gray-600">
              Have questions? We&apos;d love to hear from you.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
              <div className="text-4xl mb-4">📧</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Us</h3>
              <p className="text-gray-600 text-sm mb-3">For general inquiries</p>
              <a href="mailto:hello@techpickhub.com" className="text-blue-600 hover:text-blue-700 font-medium">
                hello@techpickhub.com
              </a>
            </div>

            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Support</h3>
              <p className="text-gray-600 text-sm mb-3">Need help? We&apos;re here 24/7</p>
              <a href="mailto:support@techpickhub.com" className="text-blue-600 hover:text-blue-700 font-medium">
                support@techpickhub.com
              </a>
            </div>

            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
              <div className="text-4xl mb-4">🏢</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Partnerships</h3>
              <p className="text-gray-600 text-sm mb-3">Interested in partnering?</p>
              <a href="mailto:partners@techpickhub.com" className="text-blue-600 hover:text-blue-700 font-medium">
                partners@techpickhub.com
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
