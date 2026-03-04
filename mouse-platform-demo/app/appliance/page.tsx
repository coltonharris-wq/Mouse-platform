import IndustryLanding from "@/components/IndustryLanding";
export default function AppliancePage() {
  return <IndustryLanding
    industry="Appliance Sales & Repair"
    headline="Auto-Track Parts. Auto-Reorder. Never Run Out."
    subheadline="AI employees that manage your parts inventory, schedule repairs, and follow up with every customer — so you never lose a job to a missing part."
    painPoints={["Running out of common parts and losing same-day repair revenue","Customers calling for status updates — your team has no time to answer","Missed follow-ups on quotes for new appliance sales","Technicians showing up without the right parts","Manual inventory counts that are always wrong","Losing repeat customers because nobody followed up after the repair"]}
    solutions={[{title:"Parts Manager",description:"Tracks every part in real-time. Auto-reorders at thresholds. Alerts you when deliveries arrive."},{title:"AI Scheduler",description:"Books repair appointments. Dispatches techs with the right parts. Sends customer ETAs."},{title:"Sales Follow-Up",description:"Every quote gets a follow-up. Every repair customer gets a satisfaction check. Drives repeat business."}]}
    testimonial={{quote:"We were losing $3K/month on emergency parts orders. Mouse's inventory tracking cut that to zero.",name:"Dave S.",business:"Triangle Appliance Repair"}}
    stats={{hoursSaved:"100+",costReduction:"75%",responseTime:"< 5 sec"}}
  />;
}
