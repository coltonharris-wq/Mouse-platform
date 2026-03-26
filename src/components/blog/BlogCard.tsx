'use client';

import Link from 'next/link';
import { BlogPostMeta } from '@/lib/blog';

const COLORS = {
  navy: '#1e2a3a',
  orange: '#F07020',
  muted: '#5a6a7a',
  border: '#e8e4df',
  white: '#fff',
};

export default function BlogCard({ post }: { post: BlogPostMeta }) {
  const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Link href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
      <article
        style={{
          background: COLORS.white,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 16,
          padding: '2rem',
          transition: 'transform 0.2s, box-shadow 0.2s',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', color: COLORS.muted }}>{formattedDate}</span>
          <span style={{ fontSize: '0.8rem', color: COLORS.orange, fontWeight: 600 }}>{post.reading_time}</span>
        </div>
        <h3 style={{ color: COLORS.navy, fontSize: '1.3rem', fontWeight: 700, lineHeight: 1.3, marginBottom: '0.75rem' }}>
          {post.title}
        </h3>
        <p style={{ color: COLORS.muted, fontSize: '1rem', lineHeight: 1.6, marginBottom: '1rem' }}>
          {post.meta_description}
        </p>
        <span style={{ color: COLORS.orange, fontWeight: 600, fontSize: '0.95rem' }}>
          Read more &rarr;
        </span>
      </article>
    </Link>
  );
}
