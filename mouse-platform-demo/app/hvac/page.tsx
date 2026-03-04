import IndustryLanding from "@/components/IndustryLanding";
export default function HVACPage() {
  return <IndustryLanding
    industry="HVAC Companies"
    headline="Never Run Out of Parts Again"
    subheadline="AI employees that track your inventory, schedule your techs, and follow up with every lead — so you never lose a job to a slow callback."
    painPoints={[
      "Running out of parts mid-job because nobody tracked inventory",
      "Losing customers to competitors who call back faster",
      "Spending hours on scheduling that could be automated",
      "Missing follow-ups on quotes — money left on the table",
      "Drowning in paperwork instead of running your business",
      "Seasonal demand spikes overwhelming your office staff",
    ]}
    solutions={[
      { title: "AI Receptionist", description: "Answers every call in seconds. Books appointments. Never puts anyone on hold." },
      { title: "Parts Manager", description: "Tracks stock levels. Auto-reorders at thresholds. Alerts you when deliveries arrive." },
      { title: "Sales Follow-Up", description: "Every quote gets a follow-up. Every lead gets a response. Nobody falls through the cracks." },
    ]}
    testimonial={{
      quote: "We were losing 3-4 jobs a week to slow callbacks. Mouse's AI receptionist picks up in 2 rings. Our close rate went up 40%.",
      name: "Tom R.",
      business: "Carolina Comfort HVAC",
    }}
    stats={{ hoursSaved: "160+", costReduction: "86%", responseTime: "< 5 sec" }}
  />;
}
