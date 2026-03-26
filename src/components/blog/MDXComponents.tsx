const COLORS = {
  navy: '#1e2a3a',
  orange: '#F07020',
  cream: '#FAF8F4',
  muted: '#5a6a7a',
  border: '#e8e4df',
  white: '#fff',
};

const SERIF = "var(--font-instrument), 'Instrument Serif', serif";

export const mdxComponents = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 style={{ color: COLORS.navy, fontSize: '2.25rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '1rem', marginTop: '2rem' }} {...props} />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 style={{ color: COLORS.navy, fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.3, marginBottom: '0.75rem', marginTop: '2.5rem' }} {...props} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 style={{ color: COLORS.navy, fontSize: '1.35rem', fontWeight: 600, lineHeight: 1.4, marginBottom: '0.5rem', marginTop: '2rem' }} {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p style={{ color: COLORS.muted, fontSize: '1.1rem', lineHeight: 1.75, marginBottom: '1.25rem', maxWidth: 720 }} {...props} />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a style={{ color: COLORS.orange, textDecoration: 'underline', textUnderlineOffset: 3 }} {...props} />
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong style={{ color: COLORS.navy, fontWeight: 600 }} {...props} />
  ),
  em: (props: React.HTMLAttributes<HTMLElement>) => (
    <em style={{ fontFamily: SERIF, fontStyle: 'italic' }} {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul style={{ color: COLORS.muted, fontSize: '1.1rem', lineHeight: 1.75, marginBottom: '1.25rem', paddingLeft: '1.5rem', listStyleType: 'disc' }} {...props} />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol style={{ color: COLORS.muted, fontSize: '1.1rem', lineHeight: 1.75, marginBottom: '1.25rem', paddingLeft: '1.5rem', listStyleType: 'decimal' }} {...props} />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li style={{ marginBottom: '0.5rem' }} {...props} />
  ),
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote style={{ borderLeft: `4px solid ${COLORS.orange}`, backgroundColor: COLORS.cream, padding: '1rem 1.5rem', margin: '1.5rem 0', borderRadius: 8 }} {...props} />
  ),
  table: (props: React.TableHTMLAttributes<HTMLTableElement>) => (
    <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '1rem' }} {...props} />
    </div>
  ),
  th: (props: React.ThHTMLAttributes<HTMLTableCellElement>) => (
    <th style={{ backgroundColor: COLORS.navy, color: COLORS.white, padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, fontSize: '0.95rem' }} {...props} />
  ),
  td: (props: React.TdHTMLAttributes<HTMLTableCellElement>) => (
    <td style={{ padding: '0.75rem 1rem', borderBottom: `1px solid ${COLORS.border}`, color: COLORS.muted, fontSize: '0.95rem' }} {...props} />
  ),
  hr: () => (
    <hr style={{ border: 'none', borderTop: `1px solid ${COLORS.border}`, margin: '2rem 0' }} />
  ),
};
