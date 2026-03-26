const COLORS = {
  navy: '#1e2a3a',
  orange: '#F07020',
  white: '#fff',
};

const SERIF = "var(--font-instrument), 'Instrument Serif', serif";

export default function BlogCTA() {
  return (
    <section
      style={{
        background: COLORS.navy,
        borderRadius: 20,
        padding: '3rem 2rem',
        textAlign: 'center',
        marginTop: '3rem',
      }}
    >
      <h2 style={{ color: COLORS.white, fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.75rem' }}>
        Ready to put AI to work in{' '}
        <span style={{ fontFamily: SERIF, fontStyle: 'italic', color: COLORS.orange }}>your</span>{' '}
        business?
      </h2>
      <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', marginBottom: '1.5rem', maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}>
        Get a free AI Business Audit. We&apos;ll map your operations, identify automation opportunities, and deliver a custom roadmap within 24 hours.
      </p>
      <a
        href="/#book"
        style={{
          display: 'inline-block',
          background: COLORS.orange,
          color: COLORS.white,
          padding: '14px 32px',
          borderRadius: 12,
          fontWeight: 700,
          fontSize: '1.05rem',
          textDecoration: 'none',
          transition: 'opacity 0.2s',
        }}
      >
        Book Your Free Audit
      </a>
    </section>
  );
}
