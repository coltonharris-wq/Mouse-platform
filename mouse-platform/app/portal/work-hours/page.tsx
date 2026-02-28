import WorkHoursSystem from "@/components/WorkHoursSystem";

export default function WorkHoursPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-mouse-charcoal">Work Hours</h1>
        <p className="text-mouse-slate text-sm mt-1">
          Configure when your AI employees are active and processing tasks
        </p>
      </div>

      <WorkHoursSystem />
    </div>
  );
}
