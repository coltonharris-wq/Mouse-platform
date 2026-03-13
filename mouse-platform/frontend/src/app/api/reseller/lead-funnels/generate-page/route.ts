import { NextRequest, NextResponse } from 'next/server';

const HERO_IMAGES: Record<string, string> = {
  plumber: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=1200&h=600&fit=crop',
  dentist: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1200&h=600&fit=crop',
  roofer: 'https://images.unsplash.com/photo-1632759145351-1d592919f522?w=1200&h=600&fit=crop',
  salon: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&h=600&fit=crop',
  restaurant: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=600&fit=crop',
  auto: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=1200&h=600&fit=crop',
  attorney: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&h=600&fit=crop',
  contractor: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&h=600&fit=crop',
  gym: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&h=600&fit=crop',
  cleaning: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&h=600&fit=crop',
  vet: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=1200&h=600&fit=crop',
  default: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=600&fit=crop',
};

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function generateLandingPageHtml(data: {
  headline: string;
  subheadline: string;
  cta_text: string;
  business_name: string;
  services: string[];
  testimonial: string;
  capture_fields: string[];
  brand_color: string;
  industry_template: string;
  funnel_id?: string;
}): string {
  const heroImg = HERO_IMAGES[data.industry_template] || HERO_IMAGES.default;
  const submitUrl = data.funnel_id
    ? `/api/reseller/lead-funnels/${data.funnel_id}/submit`
    : '#';

  const fieldInputs = data.capture_fields.map((f) => {
    const label = f.charAt(0).toUpperCase() + f.slice(1);
    const type = f === 'email' ? 'email' : f === 'phone' ? 'tel' : 'text';
    const required = f === 'name' || f === 'phone' ? 'required' : '';
    return `<div style="margin-bottom:12px">
      <input type="${type}" name="${escapeHtml(f)}" placeholder="${escapeHtml(label)}" ${required}
        style="width:100%;padding:14px 16px;border:1px solid #d1d5db;border-radius:8px;font-size:16px;outline:none;box-sizing:border-box" />
    </div>`;
  }).join('\n');

  const servicesList = data.services.length > 0
    ? `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:24px 0">
        ${data.services.map((s) => `<div style="display:flex;align-items:center;gap:8px;font-size:15px;color:#374151">
          <span style="color:${escapeHtml(data.brand_color)};font-weight:bold">&#10003;</span> ${escapeHtml(s)}
        </div>`).join('\n')}
      </div>`
    : '';

  const testimonialHtml = data.testimonial
    ? `<div style="background:#f9fafb;border-radius:12px;padding:24px;margin:32px 0;border-left:4px solid ${escapeHtml(data.brand_color)}">
        <p style="font-style:italic;color:#4b5563;font-size:16px;line-height:1.6;margin:0">&ldquo;${escapeHtml(data.testimonial)}&rdquo;</p>
      </div>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(data.headline)} | ${escapeHtml(data.business_name)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #111827; }
    @media (max-width: 640px) {
      .hero-content { padding: 40px 20px !important; }
      .form-section { padding: 32px 20px !important; }
    }
  </style>
</head>
<body>
  <!-- Hero -->
  <div style="position:relative;min-height:400px;background:linear-gradient(rgba(0,0,0,0.55),rgba(0,0,0,0.55)),url('${escapeHtml(heroImg)}') center/cover no-repeat;display:flex;align-items:center;justify-content:center">
    <div class="hero-content" style="text-align:center;padding:60px 24px;max-width:700px">
      <h1 style="font-size:42px;font-weight:800;color:white;line-height:1.2;margin-bottom:16px">${escapeHtml(data.headline)}</h1>
      ${data.subheadline ? `<p style="font-size:20px;color:rgba(255,255,255,0.9);line-height:1.5">${escapeHtml(data.subheadline)}</p>` : ''}
    </div>
  </div>

  <!-- Main Content -->
  <div style="max-width:900px;margin:0 auto;padding:48px 24px;display:grid;grid-template-columns:1fr 1fr;gap:48px">
    <!-- Left: Services -->
    <div>
      <h2 style="font-size:24px;font-weight:700;margin-bottom:8px">Why Choose ${escapeHtml(data.business_name)}?</h2>
      ${servicesList}
      ${testimonialHtml}
    </div>

    <!-- Right: Form -->
    <div class="form-section">
      <div style="background:white;border:1px solid #e5e7eb;border-radius:16px;padding:32px;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
        <h3 style="font-size:20px;font-weight:700;margin-bottom:4px;text-align:center">${escapeHtml(data.cta_text)}</h3>
        <p style="font-size:14px;color:#6b7280;text-align:center;margin-bottom:24px">Fill out the form below and we'll get back to you fast.</p>
        <form id="leadForm" onsubmit="handleSubmit(event)">
          ${fieldInputs}
          <button type="submit" style="width:100%;padding:16px;background:${escapeHtml(data.brand_color)};color:white;border:none;border-radius:8px;font-size:18px;font-weight:700;cursor:pointer">
            ${escapeHtml(data.cta_text)}
          </button>
        </form>
        <div id="formSuccess" style="display:none;text-align:center;padding:24px">
          <p style="font-size:20px;font-weight:700;color:#059669;margin-bottom:8px">Thank you!</p>
          <p style="color:#6b7280">We'll be in touch shortly.</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div style="text-align:center;padding:32px 24px;background:#f9fafb;color:#9ca3af;font-size:13px">
    &copy; ${new Date().getFullYear()} ${escapeHtml(data.business_name)}. All rights reserved.
  </div>

  <script>
    async function handleSubmit(e) {
      e.preventDefault();
      const form = e.target;
      const data = Object.fromEntries(new FormData(form));
      try {
        await fetch('${submitUrl}', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      } catch (err) {}
      form.style.display = 'none';
      document.getElementById('formSuccess').style.display = 'block';
    }
  </script>
</body>
</html>`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      headline, subheadline, cta_text, business_name,
      services, testimonial, capture_fields, brand_color,
      industry_template, funnel_id,
    } = body;

    if (!headline || !business_name) {
      return NextResponse.json({ error: 'headline and business_name are required' }, { status: 400 });
    }

    const html = generateLandingPageHtml({
      headline: headline || '',
      subheadline: subheadline || '',
      cta_text: cta_text || 'Get Your Free Quote',
      business_name: business_name || '',
      services: services || [],
      testimonial: testimonial || '',
      capture_fields: capture_fields || ['name', 'phone', 'email'],
      brand_color: brand_color || '#0D9488',
      industry_template: industry_template || 'default',
      funnel_id,
    });

    return NextResponse.json({ html });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
