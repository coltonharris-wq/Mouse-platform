import IndustryLanding from "@/components/IndustryLanding";
export default function RoofingPage() {
  return <IndustryLanding
    industry="Roofing Companies"
    headline="Stop Losing Jobs to the First Contractor Who Calls Back"
    subheadline="AI employees that respond to every lead instantly, schedule inspections, follow up on estimates, and close more jobs — rain or shine."
    painPoints={["Homeowners calling 3 roofers — the first callback wins the job","Storm season overwhelming your phone lines","Estimates sitting unsigned because nobody followed up","Losing insurance restoration jobs to faster competitors","Spending hours driving to inspections that turn out to be tire-kickers","No system to track leads from call to signed contract"]}
    solutions={[{title:"AI Lead Responder",description:"Responds to every call and form in under 60 seconds. Qualifies leads. Schedules inspections."},{title:"Estimate Follow-Up",description:"Every estimate gets a personalized follow-up sequence. Converts more quotes to signed contracts."},{title:"Storm Response",description:"Handles surge volume during storm season. No call goes unanswered. Prioritizes emergency repairs."}]}
    testimonial={{quote:"After the last hailstorm, we got 200 calls in 2 days. Mouse handled every one. We closed 68 jobs instead of the usual 30.",name:"Kevin B.",business:"Summit Roofing & Restoration"}}
    stats={{hoursSaved:"150+",costReduction:"86%",responseTime:"< 45 sec"}}
  />;
}
