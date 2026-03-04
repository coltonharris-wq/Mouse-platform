import IndustryLanding from "@/components/IndustryLanding";
export default function RealEstatePage() {
  return <IndustryLanding
    industry="Real Estate"
    headline="Never Lose a Lead to a Slow Follow-Up Again"
    subheadline="AI employees that respond to every lead in seconds, qualify buyers, schedule showings, and nurture your pipeline 24/7."
    painPoints={["Leads from Zillow and Realtor.com going cold because you replied 3 hours later","Spending all weekend on showings with unqualified buyers","Open house leads sitting in a spreadsheet with no follow-up","Missing the 5-minute response window that converts leads","Juggling 50+ active leads with no system to track them","Losing listings because you couldn't respond fast enough"]}
    solutions={[{title:"Lead Responder",description:"Replies to every lead in under 60 seconds. Qualifies buyers on budget, timeline, and preferences."},{title:"Showing Scheduler",description:"Books showings with qualified buyers. Sends confirmations. Handles reschedules automatically."},{title:"Pipeline Nurture",description:"Keeps every lead warm with personalized follow-ups. Alerts you when someone is ready to buy."}]}
    testimonial={{quote:"I was losing leads to agents who replied faster. Now Mouse responds in 30 seconds. I closed 4 extra deals in Q1.",name:"Lisa W.",business:"Pinnacle Realty Group"}}
    stats={{hoursSaved:"180+",costReduction:"88%",responseTime:"< 30 sec"}}
  />;
}
