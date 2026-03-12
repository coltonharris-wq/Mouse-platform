export function getCustomerUrl(path: string = ''): string {
  if (process.env.NEXT_PUBLIC_CUSTOMER_DOMAIN) {
    return `https://${process.env.NEXT_PUBLIC_CUSTOMER_DOMAIN}${path}`;
  }
  return `${process.env.NEXT_PUBLIC_SITE_URL || 'https://mouse-platform.vercel.app'}${path}`;
}

export function getResellerUrl(path: string = ''): string {
  if (process.env.NEXT_PUBLIC_RESELLER_DOMAIN) {
    return `https://${process.env.NEXT_PUBLIC_RESELLER_DOMAIN}${path}`;
  }
  return `${process.env.NEXT_PUBLIC_SITE_URL || 'https://mouse-platform.vercel.app'}/reseller${path}`;
}

export function getBrandedUrl(slug: string): string {
  return getCustomerUrl(`/${slug}`);
}
