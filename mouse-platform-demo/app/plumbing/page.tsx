import IndustryLanding from "@/components/IndustryLanding";
export default function PlumbingPage() {
  return <IndustryLanding
    industry="Plumbing Companies"
    headline="Stop Losing Jobs to Slow Callbacks"
    subheadline="AI employees that answer emergency calls instantly, dispatch your techs, and follow up on every estimate — 24/7."
    painPoints={[
      "Emergency calls going to voicemail at 2 AM — customer calls the next plumber",
      "Losing jobs because you took 4 hours to return a call",
      "Scheduling chaos when multiple jobs come in at once",
      "Outstanding estimates that nobody follows up on",
      "Spending evenings doing paperwork instead of being with family",
      "Paying an answering service $500/mo that sounds robotic",
    ]}
    solutions={[
      { title: "24/7 AI Dispatcher", description: "Answers every call day and night. Triages emergencies. Dispatches your closest available tech." },
      { title: "Estimate Follow-Up", description: "Every quote gets a personalized follow-up. Tracks acceptance rates. Closes more jobs." },
      { title: "AI Office Manager", description: "Handles scheduling, invoicing reminders, and customer follow-ups so you can focus on the work." },
    ]}
    testimonial={{
      quote: "I was losing 5-6 emergency calls a week to voicemail. Mouse picks up every call. My revenue went up $8K in month one.",
      name: "Mike D.",
      business: "Raleigh Pro Plumbing",
    }}
    stats={{ hoursSaved: "140+", costReduction: "85%", responseTime: "< 3 sec" }}
  />;
}
