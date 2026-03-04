import IndustryLanding from "@/components/IndustryLanding";
export default function VeterinaryPage() {
  return <IndustryLanding
    industry="Veterinary Clinics"
    headline="Never Miss a Pet Parent's Call Again"
    subheadline="AI employees that answer every call, book appointments, send vaccination reminders, and follow up after visits — while your team focuses on animal care."
    painPoints={["Pet parents calling during surgery — nobody at the front desk to answer","Vaccination and wellness reminders going unsent","New client inquiries lost to voicemail during busy hours","Staff spending hours on phone tag for appointment confirmations","No-shows costing you $150+ per empty slot","Losing clients to the clinic down the street that picks up"]}
    solutions={[{title:"AI Receptionist",description:"Answers every call with warmth. Books appointments. Answers common questions about hours, services, and pricing."},{title:"Wellness Reminders",description:"Automated vaccination, dental, and checkup reminders. Reduces no-shows by 60%."},{title:"Client Follow-Up",description:"Post-visit check-ins. Medication reminders. Review requests. Builds loyalty."}]}
    testimonial={{quote:"Our no-show rate dropped from 18% to 6% and new client bookings went up 35%. Mouse pays for itself 10x over.",name:"Dr. Karen P.",business:"Paws & Claws Veterinary"}}
    stats={{hoursSaved:"90+",costReduction:"80%",responseTime:"< 3 sec"}}
  />;
}
