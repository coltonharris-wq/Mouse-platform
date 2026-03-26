import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Link from 'next/link';
import { getAllSlugs, getPostBySlug } from '@/lib/blog';
import { mdxComponents } from '@/components/blog/MDXComponents';
import BlogCTA from '@/components/blog/BlogCTA';

const COLORS = {
  navy: '#1e2a3a',
  orange: '#F07020',
  cream: '#FAF8F4',
  muted: '#5a6a7a',
  border: '#e8e4df',
  white: '#fff',
};

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: 'Post Not Found' };

  return {
    title: `${post.title} — Mouse Blog`,
    description: post.meta_description,
    alternates: { canonical: `https://mouse.is/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.meta_description,
      url: `https://mouse.is/blog/${post.slug}`,
      siteName: 'Mouse',
      type: 'article',
      publishedTime: post.date,
    },
    keywords: [post.target_keyword, ...post.secondary_keywords],
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.meta_description,
    datePublished: post.date,
    author: { '@type': 'Organization', name: 'Mouse', url: 'https://mouse.is' },
    publisher: { '@type': 'Organization', name: 'Mouse', url: 'https://mouse.is' },
    mainEntityOfPage: `https://mouse.is/blog/${post.slug}`,
  };

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

      {/* Article JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />

      {/* Article */}
      <article style={{ maxWidth: 760, margin: '0 auto', padding: '3rem 2rem 4rem' }}>
        {/* Header */}
        <header style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <span style={{ background: COLORS.orange, color: COLORS.white, padding: '4px 12px', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600 }}>
              {post.target_keyword}
            </span>
            <span style={{ color: COLORS.muted, fontSize: '0.9rem' }}>{formattedDate}</span>
            <span style={{ color: COLORS.muted, fontSize: '0.9rem' }}>{post.reading_time}</span>
          </div>
          <h1 style={{ color: COLORS.navy, fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.15, marginBottom: '1rem' }}>
            {post.title}
          </h1>
          <p style={{ color: COLORS.muted, fontSize: '1.15rem', lineHeight: 1.6 }}>
            {post.meta_description}
          </p>
        </header>

        {/* Body */}
        <div>
          <MDXRemote source={post.content} components={mdxComponents} />
        </div>

        {/* CTA */}
        <BlogCTA />
      </article>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${COLORS.border}`, padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: COLORS.muted, fontSize: '0.9rem' }}>
          &copy; {new Date().getFullYear()} Mouse. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
