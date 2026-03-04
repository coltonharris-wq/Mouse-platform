import IndustryLanding from "@/components/IndustryLanding";
export default function AutoShopPage() {
  return <IndustryLanding
    industry="Auto Repair Shops"
    headline="Stop Losing Customers to Missed Appointments"
    subheadline="AI employees that book appointments, send service reminders, follow up on estimates, and keep your bays full."
    painPoints={["Customers calling and getting voicemail — they just call the next shop","Service advisors too busy to follow up on outstanding estimates","Oil change and maintenance reminders never getting sent","Bays sitting empty because the schedule has gaps","Spending hours on the phone instead of turning wrenches","No way to track which customers haven't been back in 6 months"]}
    solutions={[{title:"AI Service Advisor",description:"Answers every call. Books appointments. Gives estimates. Never puts a customer on hold."},{title:"Maintenance Reminders",description:"Oil changes, tire rotations, inspections — all automated. Keeps customers coming back."},{title:"Bay Optimizer",description:"Fills schedule gaps. Follows up on declined services. Maximizes revenue per bay."}]}
    testimonial={{quote:"We had 30% empty bay time. Mouse fills gaps by following up on declined services. Revenue up $12K/month.",name:"Chris H.",business:"Precision Auto Care"}}
    stats={{hoursSaved:"120+",costReduction:"84%",responseTime:"< 5 sec"}}
  />;
}
