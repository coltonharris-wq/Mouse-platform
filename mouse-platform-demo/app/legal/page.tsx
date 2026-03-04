import IndustryLanding from "@/components/IndustryLanding";
export default function LegalPage() {
  return <IndustryLanding
    industry="Law Firms"
    headline="Stop Losing Billable Hours to Admin Work"
    subheadline="AI employees that handle intake calls, schedule consultations, draft follow-ups, and manage your pipeline — so you can focus on winning cases."
    painPoints={[
      "Losing potential clients because nobody answered the phone fast enough",
      "Paralegals spending half their day on scheduling and reminders",
      "Intake forms sitting unprocessed for days",
      "Follow-up emails that never get sent after consultations",
      "Client communications falling through the cracks",
      "Paying $50/hour for admin work that AI does for $5",
    ]}
    solutions={[
      { title: "AI Intake Specialist", description: "Answers every call. Qualifies leads. Schedules consultations. Captures case details instantly." },
      { title: "Client Manager", description: "Sends case updates. Manages deadlines. Follows up on outstanding documents. Keeps clients informed." },
      { title: "Pipeline Automation", description: "Tracks every lead from first call to signed retainer. No lead falls through the cracks." },
    ]}
    testimonial={{
      quote: "Our intake-to-consultation rate was 40%. With Mouse handling calls and follow-ups, it jumped to 78%. That's real revenue.",
      name: "James K., Esq.",
      business: "Kirkland Family Law",
    }}
    stats={{ hoursSaved: "200+", costReduction: "90%", responseTime: "< 5 sec" }}
  />;
}
