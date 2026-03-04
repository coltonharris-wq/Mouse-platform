import IndustryLanding from "@/components/IndustryLanding";
export default function DentalPage() {
  return <IndustryLanding
    industry="Dental Practices"
    headline="Never Miss a Patient Call Again"
    subheadline="AI employees that answer every call, confirm appointments, follow up on no-shows, and handle insurance questions — while your team focuses on patients."
    painPoints={[
      "Missing calls during lunch breaks and after hours — every missed call is a lost patient",
      "No-shows costing you $200-500 per empty chair",
      "Front desk overwhelmed with insurance verification calls",
      "New patient inquiries going to voicemail and never calling back",
      "Spending hours on appointment reminders and confirmations",
      "Losing patients to the practice that picks up first",
    ]}
    solutions={[
      { title: "AI Receptionist", description: "Answers every call instantly. Books appointments. Confirms insurance. Never takes a lunch break." },
      { title: "Appointment Manager", description: "Sends reminders. Handles reschedules. Fills cancelled slots from your waitlist automatically." },
      { title: "Patient Follow-Up", description: "Recalls overdue patients. Follows up after procedures. Sends review requests to happy patients." },
    ]}
    testimonial={{
      quote: "We were sending 30% of calls to voicemail. Now every call gets answered. Our new patient bookings jumped 45% in the first month.",
      name: "Dr. Sarah M.",
      business: "Bright Smile Dental",
    }}
    stats={{ hoursSaved: "120+", costReduction: "82%", responseTime: "< 3 sec" }}
  />;
}
