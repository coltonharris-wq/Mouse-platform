import SecurityDashboard from "@/components/SecurityDashboard";

export default function SecurityPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-mouse-charcoal">Security Center</h1>
        <p className="text-mouse-slate text-sm mt-1">
          Monitor and manage your account security settings
        </p>
      </div>

      <SecurityDashboard />
    </div>
  );
}
