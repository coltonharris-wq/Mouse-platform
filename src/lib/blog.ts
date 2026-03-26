import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';

const BLOG_DIR = path.join(process.cwd(), 'src/content/blog');

export interface BlogPostMeta {
  title: string;
  meta_description: string;
  target_keyword: string;
  secondary_keywords: string[];
  date: string;
  author: string;
  slug: string;
  featured_image?: string;
  reading_time: string;
}

export interface BlogPost extends BlogPostMeta {
  content: string;
}

export function getAllPosts(): BlogPostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.mdx'));

  const posts = files.map((filename) => {
    const filePath = path.join(BLOG_DIR, filename);
    const raw = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(raw);
    const stats = readingTime(content);

    return {
      title: data.title,
      meta_description: data.meta_description,
      target_keyword: data.target_keyword,
      secondary_keywords: data.secondary_keywords || [],
      date: data.date,
      author: data.author,
      slug: data.slug,
      featured_image: data.featured_image,
      reading_time: stats.text,
    } as BlogPostMeta;
  });

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): BlogPost | null {
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.mdx'));

  for (const filename of files) {
    const filePath = path.join(BLOG_DIR, filename);
    const raw = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(raw);

    if (data.slug === slug) {
      const stats = readingTime(content);
      return {
        title: data.title,
        meta_description: data.meta_description,
        target_keyword: data.target_keyword,
        secondary_keywords: data.secondary_keywords || [],
        date: data.date,
        author: data.author,
        slug: data.slug,
        featured_image: data.featured_image,
        reading_time: stats.text,
        content,
      };
    }
  }

  return null;
}

export function getAllSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.mdx'));

  return files.map((filename) => {
    const raw = fs.readFileSync(path.join(BLOG_DIR, filename), 'utf-8');
    const { data } = matter(raw);
    return data.slug;
  });
}
