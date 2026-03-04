import IndustryLanding from "@/components/IndustryLanding";
export default function SalonPage() {
  return <IndustryLanding
    industry="Salons & Spas"
    headline="Fill Every Chair. Automate Every Booking."
    subheadline="AI employees that handle bookings, send reminders, fill cancellations, and re-engage clients who haven't been back — so every chair stays full."
    painPoints={["Last-minute cancellations leaving chairs empty","Clients not rebooking because nobody reminded them","Phone ringing during services — can't answer while cutting hair","Losing clients to online booking competitors","No-shows costing you $100+ per missed appointment","Spending evenings managing the schedule instead of resting"]}
    solutions={[{title:"AI Booking Agent",description:"Books appointments 24/7. Handles rescheduling. Fills cancellations from your waitlist instantly."},{title:"Client Re-Engagement",description:"Automatically reaches out to clients who haven't visited in 6+ weeks. Offers personalized rebooking."},{title:"Review Manager",description:"Sends review requests after great appointments. Manages your Google and Yelp presence."}]}
    testimonial={{quote:"Cancellations used to cost me $2K/month in empty chairs. Mouse fills them within 15 minutes from my waitlist.",name:"Maria J.",business:"Luxe Hair Studio"}}
    stats={{hoursSaved:"80+",costReduction:"78%",responseTime:"< 2 sec"}}
  />;
}
