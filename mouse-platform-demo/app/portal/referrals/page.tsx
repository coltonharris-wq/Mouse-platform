import ReferralProgram from "@/components/ReferralProgram";

export default function ReferralsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-mouse-charcoal">Refer & Earn</h1>
        <p className="text-mouse-slate text-sm mt-1">
          Earn $500 for every friend you refer who subscribes
        </p>
      </div>

      <ReferralProgram />
    </div>
  );
}
