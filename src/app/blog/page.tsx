import { Metadata } from 'next';
import { getAllPosts } from '@/lib/blog';
import BlogCard from '@/components/blog/BlogCard';
import Link from 'next/link';

export const dynamic = 'force-static';

const COLORS = {
  navy: '#1e2a3a',
  orange: '#F07020',
  cream: '#FAF8F4',
  muted: '#5a6a7a',
  border: '#e8e4df',
  white: '#fff',
};

const SERIF = "var(--font-instrument), 'Instrument Serif', serif";

export const metadata: Metadata = {
  title: 'Blog — Mouse | AI Employee Insights for Small Business',
  description: 'Learn how AI employees are transforming small businesses. Tips, comparisons, and guides on automating your operations.',
  alternates: { canonical: 'https://mouse.is/blog' },
  openGraph: {
    title: 'Blog — Mouse | AI Employee Insights for Small Business',
    description: 'Learn how AI employees are transforming small businesses.',
    url: 'https://mouse.is/blog',
    siteName: 'Mouse',
    type: 'website',
  },
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div style={{ minHeight: '100vh', background: COLORS.cream }}>
      {/* Nav */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 2rem', maxWidth: 1200, margin: '0 auto' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontWeight: 800, fontSize: '1.5rem', color: COLORS.navy }}>
            Mouse<span style={{ color: COLORS.orange }}>.</span>
          </span>
        </Link>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <Link href="/" style={{ color: COLORS.muted, textDecoration: 'none', fontSize: '0.95rem', fontWeight: 500 }}>Home</Link>
          <Link href="/blog" style={{ color: COLORS.navy, textDecoration: 'none', fontSize: '0.95rem', fontWeight: 600 }}>Blog</Link>
          <a href="/#book" style={{ background: COLORS.orange, color: COLORS.white, padding: '10px 20px', borderRadius: 10, textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem' }}>
            Book Audit
          </a>
        </div>
      </nav>

      {/* Hero */}
      <header style={{ textAlign: 'center', padding: '4rem 2rem 3rem', maxWidth: 800, margin: '0 auto' }}>
        <h1 style={{ color: COLORS.navy, fontSize: '2.75rem', fontWeight: 800, lineHeight: 1.15, marginBottom: '1rem' }}>
          The Mouse{' '}
          <span style={{ fontFamily: SERIF, fontStyle: 'italic', color: COLORS.orange }}>Blog</span>
        </h1>
        <p style={{ color: COLORS.muted, fontSize: '1.2rem', lineHeight: 1.6, maxWidth: 560, margin: '0 auto' }}>
          Insights on AI employees, small business automation, and putting technology to work for you.
        </p>
      </header>

      {/* Posts Grid */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '0 2rem 4rem' }}>
        {posts.length === 0 ? (
          <p style={{ textAlign: 'center', color: COLORS.muted, fontSize: '1.1rem' }}>Coming soon.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380, 1fr))', gap: '1.5rem' }}>
            {posts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${COLORS.border}`, padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: COLORS.muted, fontSize: '0.9rem' }}>
          &copy; {new Date().getFullYear()} Mouse. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
