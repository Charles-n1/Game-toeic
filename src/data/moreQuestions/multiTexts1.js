// More long-text questions with SEVERAL documents ("DOCUMENT 1 — ...", "DOCUMENT 2 — ...").
// Same fields as createQuestion (questions.js), without "section", "text" and "category" (added there).

export const MULTI_TEXTS_1 = [
  {
    text: `DOCUMENT 1 — Advertisement
Future of Retail Conference — 12–13 October, Lyon Convention Center

Join 800 retail professionals for two days of talks and workshops.
Early registration (until 31 August): €350
Standard registration (from 1 September): €420
Group discount: 10% off for companies registering five or more people.
Registration includes lunch on both days and access to all workshops.

DOCUMENT 2 — E-mail
To: registration@futureretail.com
From: Chloé Martin
Date: 4 September
Subject: Group registration

Hello,

I would like to register six employees from Maison Verte for the conference. Could you send me an invoice for the group? Also, one of our employees, Mr. Dubois, is vegetarian. Can this be noted for the lunches?

Best regards,
Chloé Martin`,
    questions: [
      {
        difficulty: "normal",
        question: "What is included in the registration?",
        answers: ["Lunch and workshops", "A hotel room", "Transportation to Lyon", "A dinner on the first night"], correct_index: 0,
        justification: "\"Registration includes lunch on both days and access to all workshops.\"",
      },
      {
        difficulty: "normal",
        question: "Why did Ms. Martin write the e-mail?",
        answers: ["To ask for a refund", "To register several colleagues", "To offer to speak at the conference", "To book a hotel"], correct_index: 1,
        justification: "\"I would like to register six employees from Maison Verte.\"",
      },
      {
        difficulty: "hard",
        question: "What price per person will Maison Verte most likely pay before the group discount?",
        answers: ["€350", "€315", "€420", "€378"], correct_index: 2,
        justification: "She writes on 4 September: early registration ended on 31 August, so the standard price applies.",
      },
      {
        difficulty: "hard",
        question: "What does Ms. Martin ask about Mr. Dubois?",
        answers: ["A different workshop", "A discount", "A hotel room", "A special meal"], correct_index: 3,
        justification: "\"Mr. Dubois is vegetarian. Can this be noted for the lunches?\"",
      },
      {
        difficulty: "extreme",
        question: "What will Maison Verte most likely pay per person?",
        answers: ["€378", "€420", "€315", "€350"], correct_index: 0,
        justification: "Standard price €420, and six people (five or more) get 10% off: €420 - €42 = €378.",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Job advertisement
Brightline Logistics — Warehouse Supervisor (Night Shift)

We are looking for a supervisor to lead a team of twelve at our Dartford warehouse, Monday to Friday, 10 P.M. to 6 A.M.
Requirements: at least three years of warehouse experience, including one year as a team leader; a valid forklift license.
Night shift allowance: 20% above the standard salary.
Apply by 15 March with a CV and cover letter.

DOCUMENT 2 — E-mail
To: careers@brightline.com
From: Darren Cole
Date: 10 March
Subject: Warehouse Supervisor application

Dear Hiring Team,

I am applying for the Warehouse Supervisor position. I have worked at Fastway Distribution for four years, and for the last eighteen months I have led a team of eight on the day shift. I have held a forklift license since 2019.

I live ten minutes from your Dartford site, and I am happy to work nights. My CV and cover letter are attached.

Kind regards,
Darren Cole`,
    questions: [
      {
        difficulty: "normal",
        question: "When will the supervisor work?",
        answers: ["On weekends", "At night on weekdays", "During the day", "Only on Mondays"], correct_index: 1,
        justification: "\"Monday to Friday, 10 P.M. to 6 A.M.\"",
      },
      {
        difficulty: "normal",
        question: "What is mentioned about the pay?",
        answers: ["It is paid weekly.", "It includes a car.", "Night work is paid more.", "It is the same for all shifts."], correct_index: 2,
        justification: "\"Night shift allowance: 20% above the standard salary.\"",
      },
      {
        difficulty: "hard",
        question: "How many people does Mr. Cole lead now?",
        answers: ["Twelve", "Four", "Eighteen", "Eight"], correct_index: 3,
        justification: "\"I have led a team of eight on the day shift.\"",
      },
      {
        difficulty: "hard",
        question: "What is suggested about Mr. Cole?",
        answers: ["He lives close to the warehouse.", "He has never worked at night.", "He does not have a forklift license.", "He works for Brightline now."], correct_index: 0,
        justification: "\"I live ten minutes from your Dartford site.\"",
      },
      {
        difficulty: "extreme",
        question: "Does Mr. Cole meet the requirements in the advertisement?",
        answers: ["No, he has too little warehouse experience.", "Yes, he meets all of them.", "No, he has never led a team.", "No, he applied after the deadline."], correct_index: 1,
        justification: "4 years of experience (3 needed), 18 months as team leader (1 year needed), forklift license, and he applied on 10 March (before 15 March).",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Web page: Seaside Hotel, Room Rates
Standard room (garden view): $140 per night
Superior room (sea view): $175 per night
Family suite (two bedrooms, sea view): $260 per night
All rates include breakfast. Parking: $15 per night. Stays of five nights or more receive a free dinner for two.

DOCUMENT 2 — E-mail
To: bookings@seasidehotel.com
From: Anna Kowalski
Subject: Booking request

Hello,

I would like to book a room for my husband and me from 2 to 7 August (five nights). We would like to see the sea from our room. We will be arriving by car.

Could you also tell me if the hotel has a swimming pool?

Thank you,
Anna Kowalski`,
    questions: [
      {
        difficulty: "normal",
        question: "What is included in all room rates?",
        answers: ["Parking", "Dinner", "Breakfast", "A sea view"], correct_index: 2,
        justification: "\"All rates include breakfast.\"",
      },
      {
        difficulty: "normal",
        question: "What does Ms. Kowalski want to know?",
        answers: ["If dinner is included", "If parking is free", "If children are welcome", "If there is a pool"], correct_index: 3,
        justification: "\"Could you also tell me if the hotel has a swimming pool?\"",
      },
      {
        difficulty: "hard",
        question: "Which type of room will Ms. Kowalski most likely book?",
        answers: ["A superior room", "A standard room", "A family suite", "A garden room"], correct_index: 0,
        justification: "Two people who want to see the sea: the superior room (sea view). The family suite has two bedrooms.",
      },
      {
        difficulty: "hard",
        question: "What will the Kowalskis receive because of the length of their stay?",
        answers: ["Free parking", "A free dinner for two", "A free night", "A room upgrade"], correct_index: 1,
        justification: "Five nights: \"Stays of five nights or more receive a free dinner for two.\"",
      },
      {
        difficulty: "extreme",
        question: "How much will the Kowalskis most likely pay in total for the room and parking?",
        answers: ["$875", "$775", "$950", "$1,375"], correct_index: 2,
        justification: "Superior room: 5 x $175 = $875, plus parking 5 x $15 = $75. Total: $950.",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Catalog page: Officeline Supplies
Item 210 — Ergonomic desk chair, black: $189
Item 211 — Ergonomic desk chair, gray: $189
Item 305 — Standing desk, 120 cm: $420
Item 306 — Standing desk, 160 cm: $480
Free delivery on orders over $500. Assembly service: $40 per item.

DOCUMENT 2 — E-mail
To: orders@officeline.com
From: Ravi Menon
Subject: Order #6612

Hello,

We received our order today: two standing desks (120 cm) and two black chairs. Unfortunately, one of the chairs is gray. We did not ask for assembly, but the desks were delivered already assembled, which we appreciated.

Could you please arrange to exchange the gray chair for a black one?

Thanks,
Ravi Menon`,
    questions: [
      {
        difficulty: "normal",
        question: "What problem does Mr. Menon report?",
        answers: ["A desk was damaged.", "The order arrived late.", "He was charged for assembly.", "He received a chair in the wrong color."], correct_index: 3,
        justification: "\"One of the chairs is gray\" (he ordered black chairs).",
      },
      {
        difficulty: "normal",
        question: "What does Mr. Menon ask the company to do?",
        answers: ["Replace one chair", "Give a refund", "Send an assembly team", "Cancel the order"], correct_index: 0,
        justification: "\"Exchange the gray chair for a black one.\"",
      },
      {
        difficulty: "hard",
        question: "What is the item number of the chairs Mr. Menon ordered?",
        answers: ["211", "210", "305", "306"], correct_index: 1,
        justification: "He ordered black chairs: item 210 is the black chair.",
      },
      {
        difficulty: "hard",
        question: "How much did the items in Mr. Menon's order cost in total?",
        answers: ["$1,338", "$918", "$1,218", "$1,258"], correct_index: 2,
        justification: "2 x $420 (desks, 120 cm) + 2 x $189 (chairs) = $840 + $378 = $1,218.",
      },
      {
        difficulty: "extreme",
        question: "What is suggested about Mr. Menon's order?",
        answers: ["He paid $80 for assembly.", "He paid for delivery.", "It included a 160 cm desk.", "He did not pay for delivery or assembly."], correct_index: 3,
        justification: "The order was over $500 (free delivery), and he \"did not ask for assembly\", yet the desks came assembled.",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Notice
Customer Service Training — Spring Sessions
All new customer service staff must attend one of the following one-day sessions:
Session A: Tuesday, 8 April — Room 2
Session B: Thursday, 17 April — Room 5
Session C: Wednesday, 30 April — Room 2
Each session runs from 9 A.M. to 4 P.M. Please register with Karen Hall by 1 April.

DOCUMENT 2 — E-mail
To: Karen Hall
From: Sam Ortiz
Date: 31 March
Subject: Training session

Hi Karen,

I started in customer service last month and need to register for the spring training. I'll be on vacation from 7 to 21 April, so the first two sessions are not possible for me.

Could you please put me in the last one?

Thanks,
Sam`,
    questions: [
      {
        difficulty: "normal",
        question: "Who must attend the training?",
        answers: ["New customer service employees", "All managers", "Every employee", "Customers"], correct_index: 0,
        justification: "\"All new customer service staff must attend.\"",
      },
      {
        difficulty: "normal",
        question: "How long is each session?",
        answers: ["Half a day", "One day", "Two days", "One week"], correct_index: 1,
        justification: "\"One-day sessions ... from 9 A.M. to 4 P.M.\"",
      },
      {
        difficulty: "hard",
        question: "Why can't Mr. Ortiz attend Sessions A or B?",
        answers: ["He works on those days.", "The rooms are full.", "He will be on vacation.", "He registered too late."], correct_index: 2,
        justification: "\"I'll be on vacation from 7 to 21 April.\"",
      },
      {
        difficulty: "hard",
        question: "Is Mr. Ortiz's e-mail sent in time to register?",
        answers: ["No, it is one day late.", "No, it is one week late.", "There is no deadline.", "Yes, it is before the deadline."], correct_index: 3,
        justification: "He writes on 31 March; the deadline is 1 April.",
      },
      {
        difficulty: "extreme",
        question: "Where will Mr. Ortiz most likely be on 30 April?",
        answers: ["In Room 2", "In Room 5", "On vacation", "In a customer meeting"], correct_index: 0,
        justification: "He asks for the last session, Session C: Wednesday 30 April in Room 2.",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Menu: Lantern Bistro (Lunch)
Soup of the day — $7
Chicken salad — $13
Grilled salmon with rice — $18
Vegetable curry — $14
Lunch special (Monday–Friday): any main dish + soup + coffee for $20

DOCUMENT 2 — Online review
★★★★☆ by Mike T.
I had lunch at Lantern Bistro on Wednesday with a colleague. I ordered the lunch special with the salmon, and my colleague had the vegetable curry with nothing else. The fish was excellent, though the soup was a little salty. The service was quick, which is important when you only have an hour for lunch. I'll definitely come back.`,
    questions: [
      {
        difficulty: "normal",
        question: "What did Mike think of the salmon?",
        answers: ["It was too salty.", "It was excellent.", "It was cold.", "It was too expensive."], correct_index: 1,
        justification: "\"The fish was excellent.\"",
      },
      {
        difficulty: "normal",
        question: "What did Mike like about the service?",
        answers: ["It was friendly.", "It was cheap.", "It was fast.", "It was quiet."], correct_index: 2,
        justification: "\"The service was quick.\"",
      },
      {
        difficulty: "hard",
        question: "What did Mike NOT enjoy?",
        answers: ["The fish", "The coffee", "The service", "The soup"], correct_index: 3,
        justification: "\"The soup was a little salty.\"",
      },
      {
        difficulty: "hard",
        question: "How much did Mike pay for his own meal?",
        answers: ["$20", "$18", "$25", "$7"], correct_index: 0,
        justification: "He ordered the lunch special: $20 (on a Wednesday, so it was available).",
      },
      {
        difficulty: "extreme",
        question: "How much did the two lunches cost together?",
        answers: ["$38", "$34", "$32", "$40"], correct_index: 1,
        justification: "Lunch special $20 + vegetable curry alone $14 = $34.",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Program: Green Building Forum, 5 June
9:00 A.M. — Welcome (Dr. Laura Finch)
9:30 A.M. — Solar Roofs for Offices (Mark Chen)
11:00 A.M. — Saving Water in Large Buildings (Priya Shah)
1:30 P.M. — Panel: The Future of Green Cities
3:00 P.M. — Recycled Materials in Construction (Tom Weller)

DOCUMENT 2 — E-mail
To: All registered participants
From: Forum Organizers
Date: 2 June
Subject: Program change

Dear participants,

Unfortunately, Priya Shah is unable to attend the forum because of a family emergency. Her talk will be replaced by a presentation on green roofs and gardens by Elena Rossi, an architect from Milan. All other sessions remain unchanged.

We apologize for the change.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the main topic of the forum?",
        answers: ["Office management", "Family businesses", "Environmentally friendly buildings", "Tourism in Milan"], correct_index: 2,
        justification: "\"Green Building Forum\": solar roofs, saving water, recycled materials.",
      },
      {
        difficulty: "normal",
        question: "Why was the e-mail sent?",
        answers: ["To cancel the forum", "To change the date", "To invite new speakers", "To announce a change in the program"], correct_index: 3,
        justification: "\"Subject: Program change.\"",
      },
      {
        difficulty: "hard",
        question: "Why will Ms. Shah not attend?",
        answers: ["Because of a family emergency", "Because she is ill", "Because her flight was canceled", "Because she changed jobs"], correct_index: 0,
        justification: "\"Because of a family emergency.\"",
      },
      {
        difficulty: "hard",
        question: "Who is Elena Rossi?",
        answers: ["An organizer of the forum", "An architect", "A panel member", "A water engineer"], correct_index: 1,
        justification: "\"Elena Rossi, an architect from Milan.\"",
      },
      {
        difficulty: "extreme",
        question: "At what time will Ms. Rossi most likely give her presentation?",
        answers: ["9:30 A.M.", "1:30 P.M.", "11:00 A.M.", "3:00 P.M."], correct_index: 2,
        justification: "She replaces Ms. Shah, whose talk was at 11:00 A.M.",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Apartment listing
For rent: 2-bedroom apartment, 3rd floor, 14 Rose Street
Rent: €950 per month (heating and water included; electricity not included)
Available from 1 May. No pets. Close to the university and two bus lines.
Contact: Mr. Paul Girard, 555-0163

DOCUMENT 2 — E-mail
To: Paul Girard
From: Lina Bakker
Subject: Apartment on Rose Street

Dear Mr. Girard,

I saw your listing for the apartment on Rose Street. I am a research assistant at the university and would like to move in at the beginning of May with a friend who works at the hospital.

Is there an elevator in the building? Also, we have a small cat; would that be a problem?

Best regards,
Lina Bakker`,
    questions: [
      {
        difficulty: "normal",
        question: "What is included in the rent?",
        answers: ["Electricity", "Internet", "Parking", "Heating and water"], correct_index: 3,
        justification: "\"Heating and water included; electricity not included.\"",
      },
      {
        difficulty: "normal",
        question: "Where does Ms. Bakker work?",
        answers: ["At the university", "At the hospital", "At a bus company", "At a real estate agency"], correct_index: 0,
        justification: "\"I am a research assistant at the university.\"",
      },
      {
        difficulty: "hard",
        question: "What does Ms. Bakker want to know about the building?",
        answers: ["If it has a garden", "If it has an elevator", "If it has parking", "If it is near the hospital"], correct_index: 1,
        justification: "\"Is there an elevator in the building?\"",
      },
      {
        difficulty: "hard",
        question: "When does Ms. Bakker want to move in?",
        answers: ["Immediately", "At the end of May", "At the beginning of May", "In June"], correct_index: 2,
        justification: "\"Move in at the beginning of May\" (the apartment is available from 1 May).",
      },
      {
        difficulty: "extreme",
        question: "What will most likely be a problem for Ms. Bakker?",
        answers: ["The rent is too high.", "The apartment is not available in May.", "The apartment is far from the university.", "She has a pet."], correct_index: 3,
        justification: "The listing says \"No pets\", and she has a small cat.",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Memo
To: All staff
From: Finance Department
Re: New travel expense rules (effective 1 January)

Hotel: maximum $150 per night.
Meals: maximum $60 per day (alcohol is not reimbursed).
Taxis: only when public transport is not available or after 10 P.M.
All claims must be submitted within 30 days of the trip, with receipts.

DOCUMENT 2 — E-mail
To: Finance Department
From: Grace Yoon
Date: 20 March
Subject: Expense claim — Chicago trip (10–12 February)

Hello,

Please find attached my expense claim for my trip to Chicago. My hotel cost $165 per night because all cheaper hotels near the client's office were full. I also took a taxi from the airport at 11:30 P.M. when my flight arrived late.

Thank you,
Grace Yoon`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the memo about?",
        answers: ["New rules for travel expenses", "A business trip to Chicago", "A new taxi company", "Salaries for next year"], correct_index: 0,
        justification: "\"New travel expense rules.\"",
      },
      {
        difficulty: "normal",
        question: "What is NOT reimbursed?",
        answers: ["Hotels", "Alcohol", "Meals", "Taxis at night"], correct_index: 1,
        justification: "\"Alcohol is not reimbursed.\"",
      },
      {
        difficulty: "hard",
        question: "Why did Ms. Yoon's hotel cost more than the limit?",
        answers: ["She wanted a better room.", "Her client chose the hotel.", "Cheaper hotels were full.", "Prices increased in February."], correct_index: 2,
        justification: "\"All cheaper hotels near the client's office were full.\"",
      },
      {
        difficulty: "hard",
        question: "Does Ms. Yoon's taxi follow the rules?",
        answers: ["No, because taxis are never allowed", "No, because she should have taken a bus", "Yes, because her client paid", "Yes, because it was after 10 P.M."], correct_index: 3,
        justification: "Taxis are allowed after 10 P.M.; she took it at 11:30 P.M.",
      },
      {
        difficulty: "extreme",
        question: "What problem might Ms. Yoon's claim have besides the hotel price?",
        answers: ["It was submitted more than 30 days after the trip.", "It has no receipts.", "Her meals cost too much.", "She went to the wrong city."], correct_index: 0,
        justification: "Claims must be sent within 30 days of the trip. The trip ended on 12 February, and she wrote on 20 March: 36 days later.",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Train timetable: Northbury to Kingsford (weekdays)
Departs Northbury — Arrives Kingsford
7:05 — 8:20
7:45 — 8:50 (express)
8:15 — 9:30
9:00 — 10:05 (express)

DOCUMENT 2 — Text messages
Hugo Lambert (6:50 A.M.): Morning! The meeting with the Kingsford client starts at 9:15. Which train are you taking?
Nina Shaw (6:52 A.M.): I was going to take the 8:15, but I just realized it's too late.
Hugo Lambert (6:53 A.M.): Take the express at 7:45. I'll be on it too. Car 4.
Nina Shaw (6:54 A.M.): Perfect. See you there.`,
    questions: [
      {
        difficulty: "normal",
        question: "What are the writers discussing?",
        answers: ["Where to have breakfast", "Which train to take", "How to buy tickets", "When to call the client"], correct_index: 1,
        justification: "\"Which train are you taking?\"",
      },
      {
        difficulty: "normal",
        question: "What time does the meeting start?",
        answers: ["8:50 A.M.", "9:30 A.M.", "9:15 A.M.", "7:45 A.M."], correct_index: 2,
        justification: "\"The meeting with the Kingsford client starts at 9:15.\"",
      },
      {
        difficulty: "hard",
        question: "At 6:52 A.M., why does Ms. Shaw say the 8:15 train is \"too late\"?",
        answers: ["It is canceled.", "It is full.", "It is not an express train.", "It arrives after the meeting starts."], correct_index: 3,
        justification: "The 8:15 arrives at 9:30, but the meeting starts at 9:15.",
      },
      {
        difficulty: "hard",
        question: "What time will the writers most likely arrive in Kingsford?",
        answers: ["8:50 A.M.", "8:20 A.M.", "9:30 A.M.", "10:05 A.M."], correct_index: 0,
        justification: "They take the 7:45 express, which arrives at 8:50.",
      },
      {
        difficulty: "extreme",
        question: "What is suggested about the express trains?",
        answers: ["They only run on weekends.", "They take less time than the other trains.", "They leave from Kingsford.", "They are more expensive."], correct_index: 1,
        justification: "Express trips take 65 minutes (7:45-8:50); the others take 75 minutes.",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Class schedule: Riverside Fitness (Evening Classes)
Monday: Spinning (6:30 P.M.), Yoga (7:30 P.M.)
Tuesday: Pilates (6:30 P.M.)
Wednesday: Spinning (6:30 P.M.), Boxing (7:30 P.M.)
Thursday: Yoga (6:30 P.M.)
Friday: No evening classes
Classes are included in Premium membership. Basic members pay $8 per class.

DOCUMENT 2 — E-mail
To: info@riversidefitness.com
From: Julia Stein
Subject: Yoga classes

Hello,

I am a Basic member and I attend yoga every Monday evening. Next month, I will be working late on Mondays. Is there another evening yoga class I could attend instead?

Also, how much more would Premium membership cost me each month?

Thanks,
Julia Stein`,
    questions: [
      {
        difficulty: "normal",
        question: "What type of membership does Ms. Stein have?",
        answers: ["Premium", "Student", "Basic", "Family"], correct_index: 2,
        justification: "\"I am a Basic member.\"",
      },
      {
        difficulty: "normal",
        question: "Why does Ms. Stein need to change her class?",
        answers: ["The Monday class is canceled.", "She is moving.", "She wants a different teacher.", "She will be working late on Mondays."], correct_index: 3,
        justification: "\"Next month, I will be working late on Mondays.\"",
      },
      {
        difficulty: "hard",
        question: "Which class could Ms. Stein attend instead?",
        answers: ["Thursday at 6:30 P.M.", "Tuesday at 6:30 P.M.", "Friday at 6:30 P.M.", "Wednesday at 7:30 P.M."], correct_index: 0,
        justification: "The only other evening yoga class is on Thursday at 6:30 P.M.",
      },
      {
        difficulty: "hard",
        question: "How much does Ms. Stein pay for each class now?",
        answers: ["Nothing", "$8", "$6.50", "$30"], correct_index: 1,
        justification: "\"Basic members pay $8 per class.\"",
      },
      {
        difficulty: "extreme",
        question: "What does Ms. Stein want to know about Premium membership?",
        answers: ["The class schedule", "The number of members", "The price difference", "If it includes Friday classes"], correct_index: 2,
        justification: "\"How much more would Premium membership cost me each month?\"",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Invoice
Greenway Printing — Invoice #2209
Customer: Hartley Consulting
500 business cards — $90
200 brochures (color) — $340
Design work (2 hours at $45/hour) — $90
Total: $520
Payment due within 30 days.

DOCUMENT 2 — E-mail
To: Greenway Printing
From: Olivia Hart
Subject: Invoice #2209

Hello,

Thank you for the quick delivery. However, I think there is an error on the invoice. We used our own design for the brochures and only asked you to adjust the logo, which your designer said took 30 minutes.

Could you please correct the design charge and send a new invoice?

Regards,
Olivia Hart`,
    questions: [
      {
        difficulty: "normal",
        question: "Why did Ms. Hart write?",
        answers: ["To order more brochures", "To complain about late delivery", "To ask for a new design", "To report a mistake on an invoice"], correct_index: 3,
        justification: "\"I think there is an error on the invoice.\"",
      },
      {
        difficulty: "normal",
        question: "What does Ms. Hart say about the delivery?",
        answers: ["It was fast.", "It was late.", "It was incomplete.", "It was damaged."], correct_index: 0,
        justification: "\"Thank you for the quick delivery.\"",
      },
      {
        difficulty: "hard",
        question: "Which charge does Ms. Hart think is wrong?",
        answers: ["The business cards", "The design work", "The brochures", "The delivery"], correct_index: 1,
        justification: "\"Could you please correct the design charge.\"",
      },
      {
        difficulty: "hard",
        question: "How much should the design work cost, according to Ms. Hart?",
        answers: ["$90", "$45", "$22.50", "Nothing"], correct_index: 2,
        justification: "30 minutes = half an hour at $45/hour = $22.50.",
      },
      {
        difficulty: "extreme",
        question: "What would the corrected total most likely be?",
        answers: ["$520", "$475", "$430", "$452.50"], correct_index: 3,
        justification: "$90 + $340 + $22.50 = $452.50.",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Article
Two Regional Banks to Merge

Valley Bank and Coastline Bank announced on Monday that they will merge to form Valley Coast Bank. The new bank will have 85 branches and about 3,000 employees. The merger is expected to be completed by the end of the year.

The banks said that some branches located close to each other may be combined, but no job losses are planned.

DOCUMENT 2 — E-mail
To: All Coastline Bank staff
From: Robert Hale, CEO
Subject: Our future

Dear colleagues,

As you may have read, we will soon join Valley Bank. I want to reassure you that every employee will keep his or her job. Over the next months, we will hold meetings in every region to answer your questions. The first meeting will take place in Harbor City on 18 March.

Robert Hale`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the article about?",
        answers: ["Two banks joining together", "A bank closing", "A new bank opening", "A bank hiring 3,000 people"], correct_index: 0,
        justification: "\"Valley Bank and Coastline Bank ... will merge.\"",
      },
      {
        difficulty: "normal",
        question: "What will the new bank be called?",
        answers: ["Valley Bank", "Valley Coast Bank", "Coastline Bank", "Harbor City Bank"], correct_index: 1,
        justification: "\"To form Valley Coast Bank.\"",
      },
      {
        difficulty: "hard",
        question: "What may happen to some branches?",
        answers: ["They will all close.", "They will move to Harbor City.", "Nearby branches may be combined.", "They will open on weekends."], correct_index: 2,
        justification: "\"Some branches located close to each other may be combined.\"",
      },
      {
        difficulty: "hard",
        question: "Why did Mr. Hale write to the staff?",
        answers: ["To announce his retirement", "To invite them to a party", "To ask them to move", "To reassure them about their jobs"], correct_index: 3,
        justification: "\"I want to reassure you that every employee will keep his or her job.\"",
      },
      {
        difficulty: "extreme",
        question: "What do the article and the e-mail agree on?",
        answers: ["No one is expected to lose their job.", "All branches will close.", "The merger is already complete.", "The first meeting is in Valley City."], correct_index: 0,
        justification: "The article: \"no job losses are planned\"; the e-mail: every employee keeps his or her job.",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Course list: City Adult Education Center (Autumn)
Spanish for Beginners — Mondays, 7–9 P.M. — 10 weeks — $180
Business Writing — Tuesdays, 6–8 P.M. — 6 weeks — $150
Introduction to Excel — Thursdays, 6–8 P.M. — 8 weeks — $160
Photography — Saturdays, 10 A.M.–12 P.M. — 8 weeks — $170
Students who sign up for two courses receive $30 off the second course.

DOCUMENT 2 — E-mail
To: registration@cityadulted.org
From: Paul Nguyen
Subject: Registration

Hello,

I would like to register for Business Writing and Introduction to Excel. I work until 5:30 P.M., so evening classes suit me well. Could you tell me which room the classes are in?

Best regards,
Paul Nguyen`,
    questions: [
      {
        difficulty: "normal",
        question: "Which course takes place on weekends?",
        answers: ["Spanish for Beginners", "Photography", "Business Writing", "Introduction to Excel"], correct_index: 1,
        justification: "\"Photography — Saturdays.\"",
      },
      {
        difficulty: "normal",
        question: "What does Mr. Nguyen ask about?",
        answers: ["The price of the courses", "The teachers' names", "The location of the classes", "The course books"], correct_index: 2,
        justification: "\"Could you tell me which room the classes are in?\"",
      },
      {
        difficulty: "hard",
        question: "On which days will Mr. Nguyen have classes?",
        answers: ["Mondays and Tuesdays", "Thursdays and Saturdays", "Mondays and Thursdays", "Tuesdays and Thursdays"], correct_index: 3,
        justification: "Business Writing is on Tuesdays and Excel on Thursdays.",
      },
      {
        difficulty: "hard",
        question: "Why are the evening classes convenient for Mr. Nguyen?",
        answers: ["He finishes work before they start.", "He doesn't work.", "His office is next door.", "He works at night."], correct_index: 0,
        justification: "He works until 5:30 P.M.; his classes start at 6 P.M.",
      },
      {
        difficulty: "extreme",
        question: "How much will Mr. Nguyen pay in total?",
        answers: ["$310", "$280", "$250", "$340"], correct_index: 1,
        justification: "$150 + $160 = $310, minus $30 for the second course = $280.",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Coupon
Harvest Market — 15% OFF
Get 15% off your total purchase of $50 or more.
Valid 1–31 October. One coupon per customer. Not valid on alcohol, gift cards, or items already on sale.

DOCUMENT 2 — E-mail
To: customercare@harvestmarket.com
From: Diane Fowler
Date: 2 November
Subject: Coupon problem

Hello,

Yesterday I tried to use your 15% coupon at the Elm Street store on a $70 purchase, but the cashier refused it. I was very disappointed, as I had kept the coupon specially. My purchase did not include any sale items.

Could you explain why it was refused?

Diane Fowler`,
    questions: [
      {
        difficulty: "normal",
        question: "What does the coupon offer?",
        answers: ["A free gift card", "Free delivery", "A discount on purchases of $50 or more", "A discount on alcohol"], correct_index: 2,
        justification: "\"Get 15% off your total purchase of $50 or more.\"",
      },
      {
        difficulty: "normal",
        question: "Why did Ms. Fowler write?",
        answers: ["She lost her coupon.", "She wants a gift card.", "She was charged twice.", "Her coupon was not accepted."], correct_index: 3,
        justification: "\"The cashier refused it.\"",
      },
      {
        difficulty: "hard",
        question: "Which item could NOT be bought with the coupon discount?",
        answers: ["A gift card", "Fresh vegetables", "Bread", "Cheese"], correct_index: 0,
        justification: "\"Not valid on alcohol, gift cards, or items already on sale.\"",
      },
      {
        difficulty: "hard",
        question: "When did Ms. Fowler try to use the coupon?",
        answers: ["On 31 October", "On 1 November", "On 2 November", "On 1 October"], correct_index: 1,
        justification: "She wrote on 2 November about \"yesterday\": 1 November.",
      },
      {
        difficulty: "extreme",
        question: "Why was Ms. Fowler's coupon most likely refused?",
        answers: ["Her purchase was too small.", "She bought sale items.", "It had expired.", "She used two coupons."], correct_index: 2,
        justification: "The coupon was valid until 31 October; she tried to use it on 1 November.",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Survey results
Employee Commuting Survey (420 responses)
Car: 52%
Public transport: 30%
Bicycle: 11%
Walking: 7%
Most common request: a secure place to park bicycles (mentioned by 140 employees).

DOCUMENT 2 — Memo
To: All employees
From: Facilities Manager
Re: Bicycle parking

Thank you for taking part in the commuting survey. Based on your feedback, we will install a covered, locked bicycle shelter with space for 60 bicycles next to the main entrance. Showers will also be added to the ground-floor locker rooms. The work should be finished by the end of May.`,
    questions: [
      {
        difficulty: "normal",
        question: "How do most employees travel to work?",
        answers: ["By public transport", "By bicycle", "On foot", "By car"], correct_index: 3,
        justification: "Car: 52%.",
      },
      {
        difficulty: "normal",
        question: "What will be built?",
        answers: ["A shelter for bicycles", "A new parking lot for cars", "A bus stop", "A new entrance"], correct_index: 0,
        justification: "\"A covered, locked bicycle shelter.\"",
      },
      {
        difficulty: "hard",
        question: "What else will be added for employees?",
        answers: ["Free bicycles", "Showers", "A café", "Electric car chargers"], correct_index: 1,
        justification: "\"Showers will also be added to the ground-floor locker rooms.\"",
      },
      {
        difficulty: "hard",
        question: "About how many survey respondents ride a bicycle to work?",
        answers: ["About 140", "About 60", "About 46", "About 126"], correct_index: 2,
        justification: "11% of 420 = about 46.",
      },
      {
        difficulty: "extreme",
        question: "What is suggested by the survey and the memo?",
        answers: ["All cyclists already have parking.", "The shelter is too small for current cyclists.", "Most employees want to walk.", "Some employees who asked for bike parking do not ride to work yet."], correct_index: 3,
        justification: "140 employees asked for bike parking, but only about 46 cycle now: some may start if parking exists.",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Flight itinerary
Passenger: Mr. Kenji Mori
Flight AZ 318 — Tokyo (NRT) to Frankfurt (FRA)
Departure: 14 May, 10:50 A.M. — Arrival: 14 May, 4:30 P.M. (local time)
Flight AZ 72 — Frankfurt (FRA) to Madrid (MAD)
Departure: 14 May, 6:15 P.M. — Arrival: 14 May, 8:55 P.M.

DOCUMENT 2 — E-mail
To: Kenji Mori
From: AeroZen Airlines
Date: 10 May
Subject: Schedule change

Dear Mr. Mori,

Due to an operational change, flight AZ 318 will now arrive in Frankfurt at 5:40 P.M. instead of 4:30 P.M. Your connecting flight to Madrid is not affected. We apologize for any inconvenience.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is Mr. Mori's final destination?",
        answers: ["Madrid", "Frankfurt", "Tokyo", "Paris"], correct_index: 0,
        justification: "The second flight goes from Frankfurt to Madrid.",
      },
      {
        difficulty: "normal",
        question: "Why was the e-mail sent?",
        answers: ["To cancel a flight", "To inform Mr. Mori of a new arrival time", "To offer an upgrade", "To confirm a hotel"], correct_index: 1,
        justification: "\"Flight AZ 318 will now arrive in Frankfurt at 5:40 P.M. instead of 4:30 P.M.\"",
      },
      {
        difficulty: "hard",
        question: "Which flight has changed?",
        answers: ["The flight from Frankfurt to Madrid", "Both flights", "The flight from Tokyo to Frankfurt", "Neither flight"], correct_index: 2,
        justification: "AZ 318 (Tokyo-Frankfurt) changes; the connection is \"not affected\".",
      },
      {
        difficulty: "hard",
        question: "When will Mr. Mori arrive in Madrid?",
        answers: ["At 5:40 P.M.", "At 6:15 P.M.", "At 10:05 P.M.", "At 8:55 P.M."], correct_index: 3,
        justification: "The Madrid flight is not affected: it still arrives at 8:55 P.M.",
      },
      {
        difficulty: "extreme",
        question: "How much time will Mr. Mori now have in Frankfurt between his flights?",
        answers: ["35 minutes", "1 hour and 45 minutes", "1 hour", "2 hours and 35 minutes"], correct_index: 0,
        justification: "He now arrives at 5:40 P.M., and the next flight leaves at 6:15 P.M.: 35 minutes.",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Advertisement
Easy Wheels Car Rental — Weekend Special
Compact car: $35 per day
Midsize car: $50 per day
Minivan (7 seats): $80 per day
Weekend Special: rent from Friday to Monday and pay for only two days!
Extra driver: $10 per rental. GPS: $5 per day.

DOCUMENT 2 — E-mail
To: reservations@easywheels.com
From: Tom Barrett
Subject: Reservation

Hello,

I'd like to rent a minivan from Friday, 6 June, to Monday, 9 June, for a family trip. There will be seven of us, and my brother will share the driving with me. We don't need a GPS.

Could you confirm the total price?

Thanks,
Tom Barrett`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the purpose of Mr. Barrett's e-mail?",
        answers: ["To complain about a car", "To reserve a vehicle", "To cancel a booking", "To ask for directions"], correct_index: 1,
        justification: "\"I'd like to rent a minivan.\"",
      },
      {
        difficulty: "normal",
        question: "Why does Mr. Barrett need a minivan?",
        answers: ["He is moving furniture.", "It is cheaper.", "Seven people are traveling.", "It has a GPS."], correct_index: 2,
        justification: "\"There will be seven of us\"; the minivan has 7 seats.",
      },
      {
        difficulty: "hard",
        question: "What extra will Mr. Barrett need to pay for?",
        answers: ["A GPS", "Insurance", "A child seat", "An additional driver"], correct_index: 3,
        justification: "\"My brother will share the driving\": extra driver $10. He doesn't need a GPS.",
      },
      {
        difficulty: "hard",
        question: "Why will Mr. Barrett benefit from the Weekend Special?",
        answers: ["He is renting from Friday to Monday.", "He is renting a minivan.", "He is a new customer.", "He doesn't need a GPS."], correct_index: 0,
        justification: "The special is for rentals \"from Friday to Monday\".",
      },
      {
        difficulty: "extreme",
        question: "What will the total price most likely be?",
        answers: ["$250", "$170", "$160", "$330"], correct_index: 1,
        justification: "Weekend Special: pay 2 days x $80 = $160, plus $10 for the extra driver = $170.",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Library events calendar (March)
5 March, 6 P.M. — Author talk: Sarah Lin, "Cities of Water"
12 March, 10 A.M. — Children's story time (ages 3–6)
19 March, 6 P.M. — Workshop: Starting Your Family History
26 March, 6 P.M. — Book club: "The Silent Valley"
All events are free. Workshops require registration because places are limited to 20.

DOCUMENT 2 — E-mail
To: events@oakfieldlibrary.org
From: George Adams
Subject: Family history

Hello,

My wife and I would like to attend the evening workshop on family history. We have started researching our grandparents and would love some advice. Do we need to bring anything?

Also, will the book club this month be in the same room as usual?

Thank you,
George Adams`,
    questions: [
      {
        difficulty: "normal",
        question: "How much do the library events cost?",
        answers: ["$5", "It depends on the event", "Nothing", "$20"], correct_index: 2,
        justification: "\"All events are free.\"",
      },
      {
        difficulty: "normal",
        question: "What does Mr. Adams want to learn about?",
        answers: ["Writing a book", "Reading to children", "Water in cities", "Researching his family history"], correct_index: 3,
        justification: "\"We have started researching our grandparents.\"",
      },
      {
        difficulty: "hard",
        question: "On which date is the event Mr. Adams wants to attend?",
        answers: ["19 March", "5 March", "12 March", "26 March"], correct_index: 0,
        justification: "The family history workshop is on 19 March.",
      },
      {
        difficulty: "hard",
        question: "What is suggested about Mr. Adams?",
        answers: ["He has written a book.", "He has attended the book club before.", "He works at the library.", "He has young children."], correct_index: 1,
        justification: "He asks if it will be \"in the same room as usual\", so he knows the usual room.",
      },
      {
        difficulty: "extreme",
        question: "What should Mr. Adams most likely do for the workshop?",
        answers: ["Pay a fee", "Bring a book", "Register in advance", "Arrive at 10 A.M."], correct_index: 2,
        justification: "\"Workshops require registration because places are limited to 20.\"",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Price list: Sound & Light Event Rentals (per day)
Speaker system (up to 100 guests): $120
Speaker system (up to 300 guests): $250
Microphone (wireless): $25 each
Projector and screen: $90
Delivery and setup: $60 (free for orders over $400)

DOCUMENT 2 — E-mail
To: Sound & Light Event Rentals
From: Monica Reyes
Subject: Equipment for 15 June

Hello,

We are organizing a charity dinner for about 200 guests on 15 June. We need a speaker system, two wireless microphones for the speeches, and a projector to show photos. Could you deliver and set up everything at the Grand Hall by 4 P.M.?

Best regards,
Monica Reyes`,
    questions: [
      {
        difficulty: "normal",
        question: "What event is Ms. Reyes organizing?",
        answers: ["A wedding", "A concert", "A business conference", "A charity dinner"], correct_index: 3,
        justification: "\"We are organizing a charity dinner.\"",
      },
      {
        difficulty: "normal",
        question: "What does Ms. Reyes want to show?",
        answers: ["Photos", "A film", "Sales figures", "A menu"], correct_index: 0,
        justification: "\"A projector to show photos.\"",
      },
      {
        difficulty: "hard",
        question: "Which speaker system will Ms. Reyes need?",
        answers: ["The one for up to 100 guests", "The one for up to 300 guests", "Two small systems", "None"], correct_index: 1,
        justification: "About 200 guests: the 100-guest system is too small.",
      },
      {
        difficulty: "hard",
        question: "How much will the equipment cost before delivery?",
        answers: ["$365", "$415", "$390", "$260"], correct_index: 2,
        justification: "$250 + 2 x $25 + $90 = $390.",
      },
      {
        difficulty: "extreme",
        question: "How much will Ms. Reyes most likely pay in total?",
        answers: ["$390", "$400", "$510", "$450"], correct_index: 3,
        justification: "$390 is not over $400, so delivery and setup cost $60: $390 + $60 = $450.",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Volunteer schedule: Green Valley Food Bank (week of 3 March)
Monday, 9 A.M.–12 P.M.: Sorting food — Tina, Raj
Tuesday, 2–5 P.M.: Packing boxes — Leo, Ana
Thursday, 9 A.M.–12 P.M.: Sorting food — Raj, Kim
Saturday, 10 A.M.–2 P.M.: Distribution — Tina, Leo, Ana

DOCUMENT 2 — E-mail
To: Volunteer Coordinator
From: Ana Lopez
Subject: Schedule change

Hi,

I have a doctor's appointment on Tuesday afternoon, so I can't do my shift that day. Kim said she is happy to take my place. In exchange, I can do her Thursday morning shift.

Please let me know if this is OK.

Thanks,
Ana`,
    questions: [
      {
        difficulty: "normal",
        question: "Why can't Ana work on Tuesday?",
        answers: ["She has a medical appointment.", "She is on vacation.", "She is sick.", "She has another job."], correct_index: 0,
        justification: "\"I have a doctor's appointment on Tuesday afternoon.\"",
      },
      {
        difficulty: "normal",
        question: "What does Ana propose?",
        answers: ["To cancel her Saturday shift", "To exchange shifts with Kim", "To work on Monday instead", "To stop volunteering"], correct_index: 1,
        justification: "Kim takes Tuesday; Ana takes Kim's Thursday shift.",
      },
      {
        difficulty: "hard",
        question: "What task will Ana do on Thursday?",
        answers: ["Packing boxes", "Distributing food", "Sorting food", "Driving a truck"], correct_index: 2,
        justification: "Kim's Thursday shift is \"Sorting food\".",
      },
      {
        difficulty: "hard",
        question: "Who will Ana work with on Thursday?",
        answers: ["Leo", "Tina", "Kim", "Raj"], correct_index: 3,
        justification: "Thursday: Raj and Kim. Ana replaces Kim, so she works with Raj.",
      },
      {
        difficulty: "extreme",
        question: "Who will most likely work with Leo on Tuesday?",
        answers: ["Kim", "Ana", "Raj", "Tina"], correct_index: 0,
        justification: "Tuesday was Leo and Ana; Kim takes Ana's place.",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Web page: Harbor Art Museum Membership
Individual: $60 per year — free entry for one person, 10% off in the shop
Dual: $95 per year — free entry for two adults, 10% off in the shop
Family: $120 per year — free entry for two adults and up to three children, 15% off in the shop, invitations to special events
Regular adult ticket: $18

DOCUMENT 2 — E-mail
To: membership@harborart.org
From: Laura Price
Subject: Membership question

Hello,

My husband and I visit the museum about four times a year with our two children. We are thinking about becoming members. Which membership would you recommend for us? Also, are children's tickets free without a membership?

Thank you,
Laura Price`,
    questions: [
      {
        difficulty: "normal",
        question: "Why did Ms. Price write?",
        answers: ["To buy tickets for an event", "To ask about membership options", "To complain about prices", "To cancel a membership"], correct_index: 1,
        justification: "\"We are thinking about becoming members. Which membership would you recommend?\"",
      },
      {
        difficulty: "normal",
        question: "How often does the Price family visit the museum?",
        answers: ["Every month", "Once a year", "About four times a year", "Every week"], correct_index: 2,
        justification: "\"About four times a year.\"",
      },
      {
        difficulty: "hard",
        question: "Which membership would most likely suit the Price family?",
        answers: ["Dual", "Individual", "Two Individual memberships", "Family"], correct_index: 3,
        justification: "Two adults and two children: only the Family membership includes children.",
      },
      {
        difficulty: "hard",
        question: "What does Ms. Price want to know about children?",
        answers: ["If their tickets are free", "If they can attend special events", "If there are activities for them", "If they need a membership card"], correct_index: 0,
        justification: "\"Are children's tickets free without a membership?\"",
      },
      {
        difficulty: "extreme",
        question: "How much do the parents' tickets alone cost per year without membership?",
        answers: ["$120", "$144", "$72", "$36"], correct_index: 1,
        justification: "2 adults x $18 x 4 visits = $144, more than the $120 Family membership.",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Notice
Office Move: Accounting Department
The accounting department will move from the 2nd floor to the 6th floor of the Taylor Building on Saturday, 15 November. Staff will start working in the new office on Monday, 17 November.
Phone numbers and e-mail addresses will not change. Visitors should go to the 6th-floor reception from 17 November.

DOCUMENT 2 — E-mail
To: Facilities
From: Hannah Gordon, Accounting
Date: 12 November
Subject: Office move

Hello,

I have a client meeting on Monday, 17 November, at 10 A.M. Will the meeting rooms on the 6th floor be ready by then? If not, could I book a room on the 2nd floor?

Also, will we need new keys or badges?

Thanks,
Hannah Gordon`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the notice about?",
        answers: ["A new building", "A change of phone numbers", "A department moving to another floor", "A new accounting manager"], correct_index: 2,
        justification: "\"The accounting department will move from the 2nd floor to the 6th floor.\"",
      },
      {
        difficulty: "normal",
        question: "What will NOT change?",
        answers: ["The floor of the department", "The reception for visitors", "The meeting rooms", "Phone numbers and e-mail addresses"], correct_index: 3,
        justification: "\"Phone numbers and e-mail addresses will not change.\"",
      },
      {
        difficulty: "hard",
        question: "Why is Ms. Gordon worried?",
        answers: ["She has a meeting on the first day in the new office.", "She lost her badge.", "She doesn't want to move.", "Her phone number will change."], correct_index: 0,
        justification: "Her client meeting is on Monday 17 November, the first working day after the move.",
      },
      {
        difficulty: "hard",
        question: "Where should Ms. Gordon's client go on 17 November?",
        answers: ["To the 2nd-floor reception", "To the 6th-floor reception", "To the main entrance", "To the Taylor Building café"], correct_index: 1,
        justification: "\"Visitors should go to the 6th-floor reception from 17 November.\"",
      },
      {
        difficulty: "extreme",
        question: "What is NOT one of Ms. Gordon's questions?",
        answers: ["If the new meeting rooms will be ready", "If she can book a room on the 2nd floor", "When the move will take place", "If staff will need new badges"], correct_index: 2,
        justification: "She already knows the move date. She asks about the rooms, a 2nd-floor room, and keys or badges.",
      },
    ],
  },
];
