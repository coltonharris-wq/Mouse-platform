import IndustryLanding from "@/components/IndustryLanding";
export default function RestaurantPage() {
  return <IndustryLanding
    industry="Restaurants & Catering"
    headline="Never Miss a Reservation or Catering Lead Again"
    subheadline="AI employees that handle reservations, answer menu questions, manage catering inquiries, and follow up with every event lead."
    painPoints={["Phone ringing during dinner rush — nobody can answer","Catering inquiries sitting in email for days","Large party reservations getting lost in the shuffle","No follow-up on catering quotes — losing $5K+ events","Yelp and Google questions going unanswered","Staff spending hours on the phone instead of serving guests"]}
    solutions={[{title:"AI Host",description:"Answers every call and online inquiry. Takes reservations. Answers menu and hours questions instantly."},{title:"Catering Manager",description:"Responds to catering inquiries immediately. Sends proposals. Follows up until the deal closes."},{title:"Guest Follow-Up",description:"Sends thank-you messages. Collects feedback. Invites guests back for special events."}]}
    testimonial={{quote:"We were missing catering leads during service. Mouse responds in 2 minutes. We booked $28K in catering last month.",name:"Tony R.",business:"Rossi's Italian Kitchen"}}
    stats={{hoursSaved:"100+",costReduction:"80%",responseTime:"< 2 min"}}
  />;
}
