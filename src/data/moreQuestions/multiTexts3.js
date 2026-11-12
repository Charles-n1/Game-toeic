// More long-text questions with SEVERAL documents ("DOCUMENT 1 — ...", "DOCUMENT 2 — ...").
// Same fields as createQuestion (questions.js), without "section", "text" and "category" (added there).

export const MULTI_TEXTS_3 = [
  {
    text: `DOCUMENT 1 — Meeting room rules: Westpoint Business Center
Room A: up to 6 people — $20 per hour
Room B: up to 12 people — $35 per hour
Room C: up to 30 people — $60 per hour (projector included)
Projector rental for Rooms A and B: $15 per booking
Bookings must be made at least 24 hours in advance. Cancellations less than 24 hours before the booking are charged in full.

DOCUMENT 2 — E-mail
To: bookings@westpointcenter.com
From: Karen Mills
Subject: Room booking

Hello,

I would like to book a room for a training session on Thursday from 9 A.M. to 12 P.M. There will be ten participants plus the trainer. We will need a projector for the presentation.

Thank you,
Karen Mills`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the purpose of Ms. Mills's e-mail?",
        answers: ["To reserve a meeting room", "To cancel a booking", "To rent a projector only", "To ask for a job"], correct_index: 0,
        justification: "\"I would like to book a room.\"",
      },
      {
        difficulty: "normal",
        question: "How long will the training session last?",
        answers: ["One hour", "Three hours", "A full day", "Two hours"], correct_index: 1,
        justification: "From 9 A.M. to 12 P.M.",
      },
      {
        difficulty: "hard",
        question: "Which room is the smallest one that fits Ms. Mills's group?",
        answers: ["Room A", "Room C", "Room B", "None of them"], correct_index: 2,
        justification: "Ten participants + the trainer = 11 people: Room B holds up to 12.",
      },
      {
        difficulty: "hard",
        question: "What happens if a booking is canceled the same morning?",
        answers: ["Nothing is charged.", "Half the price is charged.", "The booking moves to another day.", "The full price is charged."], correct_index: 3,
        justification: "\"Cancellations less than 24 hours before the booking are charged in full.\"",
      },
      {
        difficulty: "extreme",
        question: "How much will Ms. Mills pay if she books Room B?",
        answers: ["$120", "$105", "$180", "$135"], correct_index: 0,
        justification: "3 hours x $35 = $105, plus the projector ($15) = $120.",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Product comparison: Clearsound Headphones
Model S1 — Battery: 20 hours — Noise canceling: No — Weight: 180 g — Price: $79
Model S2 — Battery: 30 hours — Noise canceling: Yes — Weight: 250 g — Price: $149
Model S3 — Battery: 40 hours — Noise canceling: Yes — Weight: 220 g — Price: $199

DOCUMENT 2 — E-mail
To: help@clearsound.com
From: Alex Moreno
Subject: Which headphones?

Hello,

I travel by plane almost every week for work, so I need headphones that block out engine noise. My budget is up to $160. Light headphones would be nice, but it's not essential.

Which model would you recommend?

Alex Moreno`,
    questions: [
      {
        difficulty: "normal",
        question: "Why did Mr. Moreno write?",
        answers: ["To return a product", "To ask for advice on choosing a product", "To complain about a flight", "To order spare batteries"], correct_index: 1,
        justification: "\"Which model would you recommend?\"",
      },
      {
        difficulty: "normal",
        question: "Which model is the lightest?",
        answers: ["S2", "S3", "S1", "They weigh the same."], correct_index: 2,
        justification: "S1: 180 g.",
      },
      {
        difficulty: "hard",
        question: "What feature is most important to Mr. Moreno?",
        answers: ["Light weight", "Color", "A long cable", "Noise canceling"], correct_index: 3,
        justification: "\"I need headphones that block out engine noise.\"",
      },
      {
        difficulty: "hard",
        question: "Why is Model S3 not suitable for Mr. Moreno?",
        answers: ["It costs more than his budget.", "It has no noise canceling.", "It is too heavy.", "Its battery is too short."], correct_index: 0,
        justification: "S3 costs $199; his budget is up to $160.",
      },
      {
        difficulty: "extreme",
        question: "Which model would most likely be recommended to Mr. Moreno?",
        answers: ["S1", "S2", "S3", "None of them"], correct_index: 1,
        justification: "S2 has noise canceling and costs $149 (within $160). S1 has no noise canceling; S3 is too expensive.",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Registration information: Riverside Charity Run (5 km and 10 km)
Individual entry: $25
Team entry (4 to 8 runners): $20 per runner
All runners receive a T-shirt and a medal. Registration closes on 15 May.
All money goes to the Riverside Children's Hospital.

DOCUMENT 2 — E-mail
To: run@riversidecharity.org
From: Tara Singh
Date: 10 May
Subject: Team registration

Hello,

Our company would like to enter a team of six runners. Four of us will run the 10 km and two will run the 5 km. Can runners in the same team run different distances?

We would also like our company logo on the team's T-shirts. Is that possible?

Tara Singh`,
    questions: [
      {
        difficulty: "normal",
        question: "Who will receive the money from the event?",
        answers: ["The runners", "Ms. Singh's company", "A children's hospital", "A sports club"], correct_index: 2,
        justification: "\"All money goes to the Riverside Children's Hospital.\"",
      },
      {
        difficulty: "normal",
        question: "What does each runner receive?",
        answers: ["A cash prize", "A free meal", "A pair of shoes", "A T-shirt and a medal"], correct_index: 3,
        justification: "\"All runners receive a T-shirt and a medal.\"",
      },
      {
        difficulty: "hard",
        question: "What does Ms. Singh want to know?",
        answers: ["If team members can run different distances", "When the run starts", "Where to park", "How long the 10 km takes"], correct_index: 0,
        justification: "\"Can runners in the same team run different distances?\"",
      },
      {
        difficulty: "hard",
        question: "Did Ms. Singh write before registration closed?",
        answers: ["No", "Yes", "On the last day", "The text does not say."], correct_index: 1,
        justification: "She wrote on 10 May; registration closes on 15 May.",
      },
      {
        difficulty: "extreme",
        question: "How much will the team pay to enter?",
        answers: ["$150", "$100", "$120", "$160"], correct_index: 2,
        justification: "Six runners (team of 4 to 8) x $20 = $120.",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Staff newsletter
New Cafeteria Menu
From Monday, our cafeteria will offer a new menu with more healthy choices. Every day, there will be a vegetarian main dish, a soup, and a salad bar. Prices for main dishes will stay at $7, but the salad bar will be priced by weight ($1.50 per 100 g).

DOCUMENT 2 — E-mail
To: Cafeteria Manager
From: Peter Lowe
Subject: New menu

Hello,

I really like the new menu, especially the vegetarian dishes. However, I think the salad bar has become expensive. Yesterday, my salad weighed 400 g. Before the change, a large salad was $5. Would it be possible to offer a fixed price for salads?

Peter Lowe`,
    questions: [
      {
        difficulty: "normal",
        question: "What is new in the cafeteria?",
        answers: ["Longer opening hours", "A new cafeteria manager", "Lower prices for all dishes", "A menu with healthier choices"], correct_index: 3,
        justification: "\"A new menu with more healthy choices.\"",
      },
      {
        difficulty: "normal",
        question: "What does Mr. Lowe like about the new menu?",
        answers: ["The vegetarian dishes", "The soup", "The prices", "The desserts"], correct_index: 0,
        justification: "\"Especially the vegetarian dishes.\"",
      },
      {
        difficulty: "hard",
        question: "What has NOT changed?",
        answers: ["The salad bar price", "The price of main dishes", "The vegetarian options", "The number of daily dishes"], correct_index: 1,
        justification: "\"Prices for main dishes will stay at $7.\"",
      },
      {
        difficulty: "hard",
        question: "How much did Mr. Lowe's salad cost yesterday?",
        answers: ["$5", "$4", "$6", "$7"], correct_index: 2,
        justification: "400 g x $1.50 per 100 g = $6.",
      },
      {
        difficulty: "extreme",
        question: "How much more did Mr. Lowe pay compared with the old price?",
        answers: ["$2", "$1.50", "$0.50", "$1"], correct_index: 3,
        justification: "$6 now vs. $5 before: $1 more.",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Seminar series: Finance for Non-Financial Managers
Session 1 (4 Feb): Reading a balance sheet
Session 2 (11 Feb): Budgets and forecasts
Session 3 (18 Feb): Understanding cash flow
Session 4 (25 Feb): Investment decisions
All sessions are recorded and available on the intranet within 48 hours. A certificate is given to participants who attend at least three sessions in person.

DOCUMENT 2 — E-mail
To: Training Team
From: Lucas Meyer
Subject: Seminar series

Hi,

I attended the first two sessions, but I will be at a trade fair in Milan from 16 to 20 February. I'm really interested in the topic of that week's session. Is there any way I can catch up?

Also, I should be back for the last session.

Thanks,
Lucas`,
    questions: [
      {
        difficulty: "normal",
        question: "Who is the seminar series for?",
        answers: ["Managers without a finance background", "Accountants", "Bank employees", "New interns"], correct_index: 0,
        justification: "\"Finance for Non-Financial Managers.\"",
      },
      {
        difficulty: "normal",
        question: "Why will Mr. Meyer miss a session?",
        answers: ["He is sick.", "He will be at a trade fair.", "He changed jobs.", "He has a client meeting."], correct_index: 1,
        justification: "\"I will be at a trade fair in Milan from 16 to 20 February.\"",
      },
      {
        difficulty: "hard",
        question: "Which session will Mr. Meyer miss?",
        answers: ["Reading a balance sheet", "Budgets and forecasts", "Understanding cash flow", "Investment decisions"], correct_index: 2,
        justification: "Session 3 on 18 February, during his trip.",
      },
      {
        difficulty: "hard",
        question: "How can Mr. Meyer catch up?",
        answers: ["By attending a session in Milan", "By reading a book", "By attending a session next year", "By watching a recording on the intranet"], correct_index: 3,
        justification: "\"All sessions are recorded and available on the intranet within 48 hours.\"",
      },
      {
        difficulty: "extreme",
        question: "Will Mr. Meyer most likely receive a certificate?",
        answers: ["Yes, if he attends the last session in person.", "No, because he missed one session.", "Yes, even if he misses the last session.", "No, certificates are only for finance staff."], correct_index: 0,
        justification: "He attended sessions 1 and 2; with session 4 in person, that makes three.",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Order confirmation
Homestyle Online — Order #A7731
Customer: Rosa Bianchi
Items: 1 table lamp ($45), 2 cushions ($18 each)
Delivery address: 12 Lake Road, Apt 3, Dunford
Estimated delivery: 15–17 April
Changes to the delivery address can be made online until the order is shipped.

DOCUMENT 2 — E-mail
To: support@homestyle.com
From: Rosa Bianchi
Date: 16 April
Subject: Order #A7731

Hello,

I'm moving to a new apartment this weekend. Could you please send my order to 45 River Street, Dunford, instead? I tried to change the address on your website, but it says the order can no longer be changed.

Thank you,
Rosa Bianchi`,
    questions: [
      {
        difficulty: "normal",
        question: "What did Ms. Bianchi order?",
        answers: ["A table and chairs", "A lamp and cushions", "Curtains", "A sofa"], correct_index: 1,
        justification: "\"1 table lamp ($45), 2 cushions ($18 each).\"",
      },
      {
        difficulty: "normal",
        question: "Why does Ms. Bianchi want to change the address?",
        answers: ["She will be on vacation.", "The address was wrong.", "She is moving.", "She wants to send a gift."], correct_index: 2,
        justification: "\"I'm moving to a new apartment this weekend.\"",
      },
      {
        difficulty: "hard",
        question: "What was the total cost of the items?",
        answers: ["$63", "$36", "$99", "$81"], correct_index: 3,
        justification: "$45 + 2 x $18 = $45 + $36 = $81.",
      },
      {
        difficulty: "hard",
        question: "Why couldn't Ms. Bianchi change the address online?",
        answers: ["The order has probably already been shipped.", "The website was not working.", "She forgot her password.", "Address changes are never allowed."], correct_index: 0,
        justification: "Changes can be made \"until the order is shipped\"; the website says it can no longer be changed.",
      },
      {
        difficulty: "extreme",
        question: "What problem might Ms. Bianchi have?",
        answers: ["She will receive two lamps.", "The order might arrive at her old address.", "Her order was canceled.", "She will be charged twice."], correct_index: 1,
        justification: "The order is already shipped (estimated 15–17 April) to 12 Lake Road, but she is moving.",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Bank fees: Unity Bank Current Account
Monthly account fee: $5 (free if you receive a salary of at least $1,500 each month into the account)
Cash withdrawal at Unity Bank machines: free
Cash withdrawal at other banks' machines: $2.50 each
International card payment: 2% of the amount

DOCUMENT 2 — E-mail
To: Unity Bank Customer Service
From: Omar Fayed
Subject: Fees on my statement

Hello,

My statement for March shows a $5 monthly fee, even though my salary of $2,800 is paid into this account every month. I also see three charges of $2.50 for cash withdrawals. I used the machine at my local supermarket, which I thought belonged to Unity Bank.

Could you please explain these charges?

Omar Fayed`,
    questions: [
      {
        difficulty: "normal",
        question: "Why did Mr. Fayed write?",
        answers: ["To open a new account", "To report a lost card", "To ask about charges on his statement", "To ask for a loan"], correct_index: 2,
        justification: "\"Could you please explain these charges?\"",
      },
      {
        difficulty: "normal",
        question: "How much is Mr. Fayed's monthly salary?",
        answers: ["$1,500", "$5", "$7.50", "$2,800"], correct_index: 3,
        justification: "\"My salary of $2,800.\"",
      },
      {
        difficulty: "hard",
        question: "Why should Mr. Fayed most likely NOT pay the monthly fee?",
        answers: ["His salary is paid into the account and is over $1,500.", "He is a new customer.", "He did not use his card.", "He has a savings account."], correct_index: 0,
        justification: "The fee is free with a salary of at least $1,500 paid in; his is $2,800.",
      },
      {
        difficulty: "hard",
        question: "What is suggested about the supermarket machine?",
        answers: ["It is a Unity Bank machine.", "It belongs to another bank.", "It is out of order.", "It does not accept cards."], correct_index: 1,
        justification: "He was charged $2.50 per withdrawal, the fee for other banks' machines.",
      },
      {
        difficulty: "extreme",
        question: "How much was Mr. Fayed charged in total for the withdrawals?",
        answers: ["$2.50", "$5", "$7.50", "$12.50"], correct_index: 2,
        justification: "3 x $2.50 = $7.50.",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Cinema schedule: Odeon Park (Friday)
"The Last Signal" — 5:45 P.M., 8:30 P.M.
"Summer in Lisbon" — 6:15 P.M., 9:00 P.M.
"Ocean Giants" (documentary) — 7:00 P.M.
Tickets: $12 (before 6 P.M.: $9)

DOCUMENT 2 — Text messages
Amy Chen (4:10 P.M.): Do you want to see "Summer in Lisbon" tonight?
Ryan Cole (4:12 P.M.): Sure! I finish work at 6 though.
Amy Chen (4:13 P.M.): Then the early show won't work. Let's take the late one and have dinner first.
Ryan Cole (4:14 P.M.): Perfect. I'll book a table at Luigi's for 7.`,
    questions: [
      {
        difficulty: "normal",
        question: "What are the writers planning?",
        answers: ["To work late", "To watch a documentary", "To cook dinner at home", "To see a film and have dinner"], correct_index: 3,
        justification: "They plan to see \"Summer in Lisbon\" and have dinner first.",
      },
      {
        difficulty: "normal",
        question: "When does Mr. Cole finish work?",
        answers: ["At 6 P.M.", "At 4 P.M.", "At 7 P.M.", "At 5:45 P.M."], correct_index: 0,
        justification: "\"I finish work at 6.\"",
      },
      {
        difficulty: "hard",
        question: "Why won't the early show work?",
        answers: ["It is sold out.", "Mr. Cole is still working at 6:15.", "It is too expensive.", "It is a different film."], correct_index: 1,
        justification: "The early show is at 6:15 P.M., and he finishes at 6.",
      },
      {
        difficulty: "hard",
        question: "What time will the writers' film start?",
        answers: ["6:15 P.M.", "8:30 P.M.", "9:00 P.M.", "7:00 P.M."], correct_index: 2,
        justification: "The late show of \"Summer in Lisbon\" is at 9:00 P.M.",
      },
      {
        difficulty: "extreme",
        question: "How much will the two tickets cost in total?",
        answers: ["$18", "$21", "$12", "$24"], correct_index: 3,
        justification: "The 9:00 P.M. show is after 6 P.M.: 2 x $12 = $24.",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Delivery schedule: FreshFarm Produce (to restaurants)
Monday, Wednesday, Friday: deliveries between 6 and 8 A.M.
Orders must be received by 2 P.M. the day before delivery.
Holiday notice: no deliveries on Monday, 26 May (public holiday). Monday orders will be delivered on Tuesday, 27 May, instead.

DOCUMENT 2 — E-mail
To: orders@freshfarm.com
From: Chef Antoine Roux, Le Petit Jardin
Date: Thursday, 22 May
Subject: Next week's deliveries

Hello,

We are closed on Mondays and Tuesdays, so the holiday change is no problem for us. For Wednesday, 28 May, please send our usual order plus 10 kg of extra tomatoes, as we have a large private event that evening.

Antoine Roux`,
    questions: [
      {
        difficulty: "normal",
        question: "What does FreshFarm Produce do?",
        answers: ["Delivers fresh food to restaurants", "Runs a restaurant", "Organizes private events", "Sells kitchen equipment"], correct_index: 0,
        justification: "\"Deliveries ... (to restaurants).\"",
      },
      {
        difficulty: "normal",
        question: "Why is there no delivery on 26 May?",
        answers: ["The trucks are being repaired.", "It is a public holiday.", "There are no orders.", "The farm is closed for the season."], correct_index: 1,
        justification: "\"No deliveries on Monday, 26 May (public holiday).\"",
      },
      {
        difficulty: "hard",
        question: "Why is the holiday change not a problem for Le Petit Jardin?",
        answers: ["It has enough food.", "It will pick up its order.", "The restaurant is closed on Mondays and Tuesdays.", "It orders only on Fridays."], correct_index: 2,
        justification: "\"We are closed on Mondays and Tuesdays.\"",
      },
      {
        difficulty: "hard",
        question: "Why does Chef Roux need extra tomatoes?",
        answers: ["For a new menu", "Because tomatoes are cheaper", "For the holiday", "For a large private event"], correct_index: 3,
        justification: "\"We have a large private event that evening.\"",
      },
      {
        difficulty: "extreme",
        question: "By when must Chef Roux's Wednesday order be received?",
        answers: ["By 2 P.M. on Tuesday, 27 May", "By 2 P.M. on Monday, 26 May", "By 8 A.M. on Wednesday", "By Thursday, 22 May"], correct_index: 0,
        justification: "Orders must be received by 2 P.M. the day before delivery: Tuesday 27 May.",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Phone plans: Tellwave Mobile
Basic: 5 GB data, unlimited calls — $15/month
Plus: 20 GB data, unlimited calls, 100 international minutes — $25/month
Max: unlimited data, unlimited calls, 300 international minutes — $40/month
All plans: 12-month contract. Switch to a higher plan at any time for free.

DOCUMENT 2 — E-mail
To: support@tellwave.com
From: Julia Novak
Subject: Changing my plan

Hello,

I'm on the Basic plan, but I've started working from cafés and I use about 15 GB of data each month. I also call my family in Poland for about an hour every week. Which plan would suit me best?

Julia Novak`,
    questions: [
      {
        difficulty: "normal",
        question: "Which plan does Ms. Novak have now?",
        answers: ["Plus", "Basic", "Max", "She has no plan."], correct_index: 1,
        justification: "\"I'm on the Basic plan.\"",
      },
      {
        difficulty: "normal",
        question: "Why does Ms. Novak need more data?",
        answers: ["She watches films at home.", "She travels abroad.", "She works from cafés.", "Her family uses her phone."], correct_index: 2,
        justification: "\"I've started working from cafés.\"",
      },
      {
        difficulty: "hard",
        question: "About how many international minutes does Ms. Novak use per month?",
        answers: ["About 60", "About 100", "About 15", "About 240"], correct_index: 3,
        justification: "About one hour (60 minutes) every week x 4 weeks = about 240 minutes.",
      },
      {
        difficulty: "hard",
        question: "What is true about changing to a higher plan?",
        answers: ["It is free.", "It costs $10.", "It is only possible after 12 months.", "It requires a new phone."], correct_index: 0,
        justification: "\"Switch to a higher plan at any time for free.\"",
      },
      {
        difficulty: "extreme",
        question: "Which plan would most likely suit Ms. Novak best?",
        answers: ["Plus", "Max", "Basic", "None of them"], correct_index: 1,
        justification: "Plus has enough data but only 100 international minutes; she needs about 240: Max (300 minutes).",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Travel itinerary: Mr. David Osei
Monday, 3 June — Train London to Paris, 8:01 A.M.–11:20 A.M.
Monday, 3 June — Meeting at Lumière SA, 2:00 P.M.
Tuesday, 4 June — Train Paris to Brussels, 9:25 A.M.–10:47 A.M.
Tuesday, 4 June — Meeting at Vandenberg NV, 1:30 P.M.
Hotel: Paris (Monday night only)

DOCUMENT 2 — E-mail
To: David Osei
From: Claire Dubois, Lumière SA
Date: 28 May
Subject: Our meeting

Dear Mr. Osei,

I'm afraid I must move our meeting to Tuesday, 4 June, at 9:00 A.M., as our director can only attend then. I hope this is still possible for you. We are looking forward to meeting you.

Best regards,
Claire Dubois`,
    questions: [
      {
        difficulty: "normal",
        question: "Why did Ms. Dubois write?",
        answers: ["To cancel a meeting", "To book a hotel", "To change the time of a meeting", "To send a train ticket"], correct_index: 2,
        justification: "\"I must move our meeting to Tuesday, 4 June, at 9:00 A.M.\"",
      },
      {
        difficulty: "normal",
        question: "Why was the change made?",
        answers: ["The office will be closed.", "Mr. Osei asked for it.", "The train was canceled.", "The director can only attend then."], correct_index: 3,
        justification: "\"As our director can only attend then.\"",
      },
      {
        difficulty: "hard",
        question: "Where will Mr. Osei spend Monday night?",
        answers: ["In Paris", "In London", "In Brussels", "On a train"], correct_index: 0,
        justification: "\"Hotel: Paris (Monday night only).\"",
      },
      {
        difficulty: "hard",
        question: "What problem does the new time create?",
        answers: ["It is on a public holiday.", "It conflicts with his train to Brussels.", "His hotel is in Brussels.", "It is too early for the director."], correct_index: 1,
        justification: "The meeting at 9:00 A.M. on Tuesday overlaps with his 9:25 A.M. train to Brussels.",
      },
      {
        difficulty: "extreme",
        question: "What will Mr. Osei most likely need to change?",
        answers: ["His train to Paris", "His hotel in London", "His train to Brussels", "His meeting at Vandenberg NV"], correct_index: 2,
        justification: "He needs a later train to Brussels; his meeting there is only at 1:30 P.M.",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Notice: Dunford Recycling Center
Opening hours: Tuesday–Saturday, 8 A.M.–5 P.M. Closed Sunday and Monday.
Free for residents (proof of address required).
Accepted: paper, glass, metal, garden waste, old furniture, electronics.
Not accepted: paint, chemicals, car tires (please contact the city's special waste service).

DOCUMENT 2 — E-mail
To: recycling@dunford.gov
From: Carl Jensen
Subject: Clearing my garage

Hello,

I'm clearing out my garage this weekend and have some old chairs, a broken TV, four old car tires, and several cans of paint. I live on Birch Road in Dunford. Can I bring everything to the recycling center on Sunday?

Carl Jensen`,
    questions: [
      {
        difficulty: "normal",
        question: "What is Mr. Jensen doing this weekend?",
        answers: ["Moving house", "Painting his home", "Buying a car", "Clearing his garage"], correct_index: 3,
        justification: "\"I'm clearing out my garage this weekend.\"",
      },
      {
        difficulty: "normal",
        question: "What must residents show to use the center for free?",
        answers: ["Proof of address", "A membership card", "A receipt", "A driver's license"], correct_index: 0,
        justification: "\"Free for residents (proof of address required).\"",
      },
      {
        difficulty: "hard",
        question: "Can Mr. Jensen visit the center on Sunday?",
        answers: ["Yes, from 8 A.M.", "No, it is closed on Sundays.", "Yes, but only in the morning.", "Only with an appointment."], correct_index: 1,
        justification: "\"Closed Sunday and Monday.\"",
      },
      {
        difficulty: "hard",
        question: "Which of Mr. Jensen's items will the center accept?",
        answers: ["The tires", "The paint", "The chairs and the TV", "All of them"], correct_index: 2,
        justification: "Old furniture and electronics are accepted; paint and car tires are not.",
      },
      {
        difficulty: "extreme",
        question: "What should Mr. Jensen do with the tires and the paint?",
        answers: ["Bring them on Saturday", "Leave them outside the center", "Put them in his garden waste", "Contact the city's special waste service"], correct_index: 3,
        justification: "\"Not accepted: paint, chemicals, car tires (please contact the city's special waste service).\"",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — University library rules
Students may borrow up to 10 books at a time for 3 weeks. Books can be renewed online twice, unless another student has reserved them.
Late fee: $0.50 per book per day.
Group study rooms can be booked for up to 3 hours per day.

DOCUMENT 2 — E-mail
To: library@northfield.edu
From: Mei Lin
Subject: Renewing books

Hello,

I borrowed 4 books three weeks ago for my thesis. I renewed three of them online this morning, but the system did not let me renew the fourth one, "Urban Water Systems." I still need it for at least two more weeks. What can I do?

Mei Lin`,
    questions: [
      {
        difficulty: "normal",
        question: "How long can students keep a book before renewing?",
        answers: ["3 weeks", "10 days", "2 weeks", "1 month"], correct_index: 0,
        justification: "\"For 3 weeks.\"",
      },
      {
        difficulty: "normal",
        question: "Why does Ms. Lin need the books?",
        answers: ["For a group project", "For her thesis", "For a book club", "For her job"], correct_index: 1,
        justification: "\"I borrowed 4 books three weeks ago for my thesis.\"",
      },
      {
        difficulty: "hard",
        question: "How many books did Ms. Lin renew successfully?",
        answers: ["Four", "One", "Three", "None"], correct_index: 2,
        justification: "\"I renewed three of them online this morning.\"",
      },
      {
        difficulty: "hard",
        question: "Why could Ms. Lin most likely not renew \"Urban Water Systems\"?",
        answers: ["She had already renewed it twice.", "Her card has expired.", "It is a reference book.", "Another student has reserved it."], correct_index: 3,
        justification: "This is her first renewal; books cannot be renewed if another student has reserved them.",
      },
      {
        difficulty: "extreme",
        question: "How much would Ms. Lin pay if she kept the book one week late?",
        answers: ["$3.50", "$0.50", "$7.00", "$1.50"], correct_index: 0,
        justification: "7 days x $0.50 = $3.50.",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Conference package: Lakeshore Hotel
Full-day package: $65 per person
Includes: meeting room, projector, two coffee breaks, lunch, and free Wi-Fi
Half-day package (morning or afternoon): $40 per person (one coffee break, no lunch)
Minimum group size: 15 people. Groups of 30 or more receive a free dinner for the organizer.

DOCUMENT 2 — E-mail
To: events@lakeshorehotel.com
From: Hannah Weiss
Subject: Conference booking

Hello,

I would like to book your full-day package for 32 people on 14 October for our annual sales meeting. Several participants are vegetarian; I will send you the exact number next week.

Is there parking at the hotel?

Hannah Weiss`,
    questions: [
      {
        difficulty: "normal",
        question: "What is included in the full-day package?",
        answers: ["Dinner for everyone", "Lunch and two coffee breaks", "Hotel rooms", "Transportation"], correct_index: 1,
        justification: "\"Two coffee breaks, lunch, and free Wi-Fi.\"",
      },
      {
        difficulty: "normal",
        question: "What event is Ms. Weiss organizing?",
        answers: ["A wedding", "A training course", "An annual sales meeting", "A product launch"], correct_index: 2,
        justification: "\"For our annual sales meeting.\"",
      },
      {
        difficulty: "hard",
        question: "What will Ms. Weiss send next week?",
        answers: ["Payment", "The list of speakers", "The meeting agenda", "The number of vegetarian participants"], correct_index: 3,
        justification: "\"I will send you the exact number next week\" (of vegetarians).",
      },
      {
        difficulty: "hard",
        question: "How much will the package cost for Ms. Weiss's group?",
        answers: ["$2,080", "$1,280", "$1,950", "$2,145"], correct_index: 0,
        justification: "32 people x $65 = $2,080.",
      },
      {
        difficulty: "extreme",
        question: "What extra will Ms. Weiss most likely receive?",
        answers: ["A free room", "A free dinner", "A third coffee break", "Free parking"], correct_index: 1,
        justification: "Her group has 32 people: \"Groups of 30 or more receive a free dinner for the organizer.\"",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Price list: Core Fitness Personal Training
Single session (60 min): $60
Pack of 5 sessions: $270
Pack of 10 sessions: $500
Sessions must be used within 3 months of purchase. Cancellations with less than 12 hours' notice count as a used session.

DOCUMENT 2 — E-mail
To: training@corefitness.com
From: Leo Martins
Subject: Personal training

Hello,

I'd like to start personal training to prepare for a half marathon in four months. I'm thinking of having one session per week until the race. Which option would be best for me?

Leo Martins`,
    questions: [
      {
        difficulty: "normal",
        question: "Why does Mr. Martins want personal training?",
        answers: ["To lose weight", "To recover from an injury", "To prepare for a race", "To become a trainer"], correct_index: 2,
        justification: "\"To prepare for a half marathon.\"",
      },
      {
        difficulty: "normal",
        question: "How long is a training session?",
        answers: ["30 minutes", "90 minutes", "45 minutes", "60 minutes"], correct_index: 3,
        justification: "\"Single session (60 min).\"",
      },
      {
        difficulty: "hard",
        question: "How much does one session cost in the pack of 10?",
        answers: ["$50", "$54", "$60", "$45"], correct_index: 0,
        justification: "$500 / 10 = $50 per session.",
      },
      {
        difficulty: "hard",
        question: "About how many sessions will Mr. Martins have before the race?",
        answers: ["About 4", "About 16", "About 10", "About 5"], correct_index: 1,
        justification: "One session per week for four months: about 16 sessions.",
      },
      {
        difficulty: "extreme",
        question: "What problem could there be with buying 16 sessions at once?",
        answers: ["Packs cannot be combined.", "He must cancel 12 hours before.", "Sessions must be used within 3 months.", "The trainer is not available."], correct_index: 2,
        justification: "His plan lasts four months, but sessions must be used within 3 months of purchase.",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Volunteer form: City Book Festival (14–15 September)
Name: Grace Holm
Available: Saturday all day; Sunday morning only
Preferred tasks: 1. Information desk  2. Helping authors at signing tables
Languages spoken: English, Swedish, German

DOCUMENT 2 — E-mail
To: Grace Holm
From: Volunteer Coordinator
Subject: Your volunteer schedule

Dear Grace,

Thank you for volunteering! Because of your languages, we have placed you at the information desk on Saturday, where we expect many foreign visitors. On Sunday, you will help at the author signing tables from 9 A.M. to 1 P.M.

Please collect your volunteer badge at the main tent 30 minutes before your first shift, which starts at 8:30 A.M.`,
    questions: [
      {
        difficulty: "normal",
        question: "What event will Ms. Holm help at?",
        answers: ["A music festival", "A language course", "A sports event", "A book festival"], correct_index: 3,
        justification: "\"City Book Festival.\"",
      },
      {
        difficulty: "normal",
        question: "When is Ms. Holm available on Sunday?",
        answers: ["In the morning", "All day", "In the afternoon", "She is not available."], correct_index: 0,
        justification: "\"Sunday morning only.\"",
      },
      {
        difficulty: "hard",
        question: "Why was Ms. Holm placed at the information desk?",
        answers: ["She asked for the signing tables.", "She speaks several languages.", "She knows the authors.", "She works at a library."], correct_index: 1,
        justification: "\"Because of your languages ... we expect many foreign visitors.\"",
      },
      {
        difficulty: "hard",
        question: "Does Ms. Holm's Sunday shift fit her availability?",
        answers: ["No, it is in the afternoon.", "No, she is not available on Sunday.", "Yes, it is in the morning.", "No, it is all day."], correct_index: 2,
        justification: "Her Sunday shift is from 9 A.M. to 1 P.M.",
      },
      {
        difficulty: "extreme",
        question: "When should Ms. Holm collect her badge?",
        answers: ["At 8:30 A.M. on Saturday", "At 9 A.M. on Sunday", "At 8:30 A.M. on Sunday", "At 8 A.M. on Saturday"], correct_index: 3,
        justification: "30 minutes before her first shift (Saturday, 8:30 A.M.): 8:00 A.M.",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Loyalty program: Bella Beauty Stores
Silver level: spend up to $300 per year — 1 point per $1
Gold level: spend $300–$799 per year — 2 points per $1, free gift on your birthday
Platinum level: spend $800 or more per year — 3 points per $1, free birthday gift, free delivery
100 points = $5 discount

DOCUMENT 2 — E-mail
To: loyalty@bellabeauty.com
From: Nora Ahmed
Subject: My membership level

Hello,

I've spent $650 at your stores this year, and I was expecting a gift for my birthday last week, but I didn't receive anything. My account still shows that I am a Silver member. Could you check this?

Nora Ahmed`,
    questions: [
      {
        difficulty: "normal",
        question: "Why did Ms. Ahmed write?",
        answers: ["She did not receive a birthday gift.", "She lost her card.", "She wants to cancel her membership.", "She wants free delivery."], correct_index: 0,
        justification: "\"I was expecting a gift for my birthday ... but I didn't receive anything.\"",
      },
      {
        difficulty: "normal",
        question: "How much is 100 points worth?",
        answers: ["$1", "$5", "$10", "$100"], correct_index: 1,
        justification: "\"100 points = $5 discount.\"",
      },
      {
        difficulty: "hard",
        question: "Which level should Ms. Ahmed most likely be at?",
        answers: ["Silver", "Platinum", "Gold", "None"], correct_index: 2,
        justification: "She has spent $650: between $300 and $799 = Gold.",
      },
      {
        difficulty: "hard",
        question: "What does Ms. Ahmed's account show?",
        answers: ["That she is a Platinum member", "That she has no points", "That her birthday is wrong", "That she is a Silver member"], correct_index: 3,
        justification: "\"My account still shows that I am a Silver member.\"",
      },
      {
        difficulty: "extreme",
        question: "At the Gold level, how many points would $650 of purchases give?",
        answers: ["1,300", "650", "1,950", "325"], correct_index: 0,
        justification: "Gold: 2 points per $1. 650 x 2 = 1,300 points.",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — City council notice
Bridge Street will be closed to all traffic from 7 to 25 April for water pipe repairs. Pedestrian access to shops will be maintained at all times. Deliveries to businesses on Bridge Street may be made before 7 A.M. using the side entrance from Mill Lane.

DOCUMENT 2 — E-mail
To: City Council — Roads Department
From: Emma Ross, Owner, Ross Flowers (24 Bridge Street)
Subject: Road closure

Hello,

My shop receives fresh flowers every morning at 9 A.M. from a supplier who cannot deliver earlier. Easter weekend, our busiest time of the year, falls during the closure. Is there any other way my deliveries can reach the shop?

Emma Ross`,
    questions: [
      {
        difficulty: "normal",
        question: "Why will Bridge Street be closed?",
        answers: ["For a festival", "For water pipe repairs", "For new street lights", "For a marathon"], correct_index: 1,
        justification: "\"For water pipe repairs.\"",
      },
      {
        difficulty: "normal",
        question: "What kind of business does Ms. Ross own?",
        answers: ["A bakery", "A delivery company", "A flower shop", "A restaurant"], correct_index: 2,
        justification: "\"Owner, Ross Flowers.\"",
      },
      {
        difficulty: "hard",
        question: "What will still be possible during the closure?",
        answers: ["Driving on Bridge Street", "Parking on Bridge Street", "Delivering at any time", "Walking to the shops"], correct_index: 3,
        justification: "\"Pedestrian access to shops will be maintained at all times.\"",
      },
      {
        difficulty: "hard",
        question: "Why is the closure a problem for Ms. Ross?",
        answers: ["Her supplier delivers after 7 A.M.", "Her shop will be closed.", "She lives on Bridge Street.", "Her customers drive to the shop."], correct_index: 0,
        justification: "Deliveries must be before 7 A.M.; her supplier delivers at 9 A.M. and \"cannot deliver earlier\".",
      },
      {
        difficulty: "extreme",
        question: "Why is the timing of the closure especially bad for Ms. Ross?",
        answers: ["It lasts all summer.", "It includes her busiest weekend of the year.", "It starts on her birthday.", "It is during her vacation."], correct_index: 1,
        justification: "\"Easter weekend, our busiest time of the year, falls during the closure.\"",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Weekly rota: Café Aroma (week of 10 June)
Monday: Ana (7–3), Ben (11–7)
Tuesday: Ben (7–3), Carla (11–7)
Wednesday: Carla (7–3), Ana (11–7)
Thursday: Ana (7–3), Ben (11–7)
Friday: Ben (7–3), Carla (11–7)
Saturday: Ana, Ben, Carla (8–4)

DOCUMENT 2 — E-mail
To: Manager, Café Aroma
From: Carla Dias
Subject: Shift change

Hi,

I have a dentist appointment on Tuesday at 4 P.M. Ana has agreed to swap shifts with me: she will work my Tuesday shift, and I will work her Thursday afternoon shift in exchange. Is that OK?

Carla`,
    questions: [
      {
        difficulty: "normal",
        question: "Why does Carla want to change her shift?",
        answers: ["She is on vacation.", "She is sick.", "She has a dentist appointment.", "She has a class."], correct_index: 2,
        justification: "\"I have a dentist appointment on Tuesday at 4 P.M.\"",
      },
      {
        difficulty: "normal",
        question: "Who works on Saturday?",
        answers: ["Only Ana", "Ben and Carla", "Nobody", "All three employees"], correct_index: 3,
        justification: "\"Saturday: Ana, Ben, Carla (8–4).\"",
      },
      {
        difficulty: "hard",
        question: "What are Carla's working hours on Tuesday in the original rota?",
        answers: ["11 A.M. to 7 P.M.", "7 A.M. to 3 P.M.", "8 A.M. to 4 P.M.", "She does not work on Tuesday."], correct_index: 0,
        justification: "\"Tuesday: Ben (7–3), Carla (11–7).\"",
      },
      {
        difficulty: "hard",
        question: "What problem is there with Carla's offer?",
        answers: ["Ana is not working that week.", "Ana works the morning on Thursday, not the afternoon.", "Carla already works on Thursday.", "The café is closed on Thursday."], correct_index: 1,
        justification: "On Thursday, Ana works 7–3 (morning); Ben works the afternoon (11–7).",
      },
      {
        difficulty: "extreme",
        question: "If the swap happens as planned, who will work with Ben on Tuesday?",
        answers: ["Carla", "Nobody", "Ana", "The manager"], correct_index: 2,
        justification: "Ana takes Carla's Tuesday shift (11–7), so she works with Ben (7–3).",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Fees: Global English Academy
Group course (10 hours per week): $180 per week
Intensive course (20 hours per week): $320 per week
Private lessons: $45 per hour
Registration fee (one time): $60
Students who book 8 weeks or more receive a 10% discount on course fees.

DOCUMENT 2 — E-mail
To: info@globalenglish.edu
From: Kenji Sato
Subject: Course booking

Hello,

I would like to join the intensive course for 8 weeks starting on 3 March to prepare for the TOEIC test. I have never studied at your school before. Could you tell me the total cost?

Kenji Sato`,
    questions: [
      {
        difficulty: "normal",
        question: "Why does Mr. Sato want to take a course?",
        answers: ["To become a teacher", "To travel to England", "To learn Japanese", "To prepare for an English test"], correct_index: 3,
        justification: "\"To prepare for the TOEIC test.\"",
      },
      {
        difficulty: "normal",
        question: "How many hours per week is the intensive course?",
        answers: ["20", "10", "45", "8"], correct_index: 0,
        justification: "\"Intensive course (20 hours per week).\"",
      },
      {
        difficulty: "hard",
        question: "Why will Mr. Sato pay a registration fee?",
        answers: ["He is taking private lessons.", "He is a new student.", "He is booking late.", "He wants a certificate."], correct_index: 1,
        justification: "It is a one-time fee, and \"I have never studied at your school before.\"",
      },
      {
        difficulty: "hard",
        question: "How much is the course fee for 8 weeks before the discount?",
        answers: ["$1,440", "$2,304", "$2,560", "$320"], correct_index: 2,
        justification: "8 weeks x $320 = $2,560.",
      },
      {
        difficulty: "extreme",
        question: "What will Mr. Sato's total cost most likely be?",
        answers: ["$2,620", "$2,304", "$2,560", "$2,364"], correct_index: 3,
        justification: "$2,560 - 10% ($256) = $2,304, plus the $60 registration fee = $2,364.",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Company policy: Working from Home
Employees may work from home up to two days per week, with their manager's approval.
Home working days cannot be Mondays, when all team meetings take place.
Employees must be available by phone and e-mail between 9:30 A.M. and 4:30 P.M.
New employees may work from home only after completing three months with the company.

DOCUMENT 2 — E-mail
To: Paula Grant (Manager)
From: Ivan Petrov
Date: 2 April
Subject: Working from home

Hi Paula,

I started on the team on 15 January, and I'd like to start working from home on Mondays and Fridays. My commute takes over an hour each way, so this would save me a lot of time. I would of course be available online during working hours.

Thanks,
Ivan`,
    questions: [
      {
        difficulty: "normal",
        question: "What does Mr. Petrov want to do?",
        answers: ["Work from home two days a week", "Change his working hours", "Move to another team", "Take a vacation"], correct_index: 0,
        justification: "\"I'd like to start working from home on Mondays and Fridays.\"",
      },
      {
        difficulty: "normal",
        question: "Why does Mr. Petrov make this request?",
        answers: ["He is often sick.", "His commute is long.", "He has young children.", "His office is noisy."], correct_index: 1,
        justification: "\"My commute takes over an hour each way.\"",
      },
      {
        difficulty: "hard",
        question: "Which day in Mr. Petrov's request is NOT allowed?",
        answers: ["Friday", "Both days", "Monday", "Neither day"], correct_index: 2,
        justification: "\"Home working days cannot be Mondays.\"",
      },
      {
        difficulty: "hard",
        question: "When must employees be available when working from home?",
        answers: ["All day", "Only in the morning", "Only for team meetings", "Between 9:30 A.M. and 4:30 P.M."], correct_index: 3,
        justification: "\"Between 9:30 A.M. and 4:30 P.M.\"",
      },
      {
        difficulty: "extreme",
        question: "From when could Mr. Petrov start working from home, according to the policy?",
        answers: ["From mid-April", "Immediately", "From 15 January", "From next year"], correct_index: 0,
        justification: "He started on 15 January; after three months = from 15 April. He wrote on 2 April.",
      },
    ],
  },
];
