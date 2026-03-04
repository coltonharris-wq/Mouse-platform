import IndustryLanding from "@/components/IndustryLanding";
export default function FinancePage() {
  return <IndustryLanding
    industry="Financial Services"
    headline="Stop Drowning in Client Paperwork"
    subheadline="AI employees that handle client intake, schedule meetings, follow up on documents, and keep your pipeline organized — so you can focus on advising."
    painPoints={["Spending 40% of your day on admin instead of client-facing work","New client onboarding taking weeks instead of days","Missing follow-ups on outstanding document requests","Compliance deadlines creeping up with no automated tracking","Losing prospects because your response time is too slow","Paying $60K/year for an assistant who handles 20% of what AI can"]}
    solutions={[{title:"AI Client Coordinator",description:"Handles intake forms. Schedules meetings. Follows up on missing documents. Keeps onboarding on track."},{title:"Pipeline Manager",description:"Tracks every prospect from first contact to signed agreement. Automated follow-ups at every stage."},{title:"Compliance Assistant",description:"Tracks deadlines. Sends reminders. Ensures nothing falls through the cracks."}]}
    testimonial={{quote:"Client onboarding went from 3 weeks to 3 days. My team handles 2x the clients with the same headcount.",name:"Robert L., CPA",business:"Lakewood Financial Group"}}
    stats={{hoursSaved:"160+",costReduction:"85%",responseTime:"< 5 min"}}
  />;
}
