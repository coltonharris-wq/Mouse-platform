import ResellerShell from '@/components/reseller/ResellerShell';

export default function ResellerLayout({ children }: { children: React.ReactNode }) {
  return <ResellerShell>{children}</ResellerShell>;
}
