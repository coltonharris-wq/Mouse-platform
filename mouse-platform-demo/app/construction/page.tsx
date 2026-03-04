import IndustryLanding from "@/components/IndustryLanding";
export default function ConstructionPage() {
  return <IndustryLanding
    industry="Construction Companies"
    headline="Automate Bids, Scheduling & Follow-Ups"
    subheadline="AI employees that handle bid follow-ups, schedule subcontractors, manage client communications, and keep your projects on track."
    painPoints={["Bids going out and nobody following up — losing $50K+ contracts","Subcontractor scheduling chaos costing you project delays","Client update calls taking hours every week","Change orders getting lost in email chains","Spending more time in the office than on the job site","Losing bids because your response time is 2 days, not 2 hours"]}
    solutions={[{title:"Bid Manager",description:"Follows up on every bid automatically. Tracks win rates. Alerts you when a prospect is ready to sign."},{title:"Project Coordinator",description:"Schedules subs. Sends reminders. Manages material deliveries. Keeps projects on timeline."},{title:"Client Communicator",description:"Sends weekly project updates. Handles change order requests. Keeps clients happy and informed."}]}
    testimonial={{quote:"We were winning 15% of bids. Mouse's follow-up system pushed that to 32%. That's an extra $400K this year.",name:"Rick M.",business:"Ironbridge Construction"}}
    stats={{hoursSaved:"200+",costReduction:"88%",responseTime:"< 2 hrs"}}
  />;
}
