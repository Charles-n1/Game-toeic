// More long-text questions with SEVERAL documents ("DOCUMENT 1 — ...", "DOCUMENT 2 — ...").
// Same fields as createQuestion (questions.js), without "section", "text" and "category" (added there).

export const MULTI_TEXTS_4 = [
  {
    text: `DOCUMENT 1 — Private dining: The Copper Pot
Our private room seats up to 20 guests.
Minimum spend: $600 on Friday and Saturday evenings; $400 on other evenings.
Set menus: $35 or $50 per person.
A deposit of $100 is required to confirm a booking.

DOCUMENT 2 — E-mail
To: events@copperpot.com
From: Rachel Moore
Subject: Private room booking

Hello,

I would like to book your private room for a team dinner on Thursday, 14 November, for 12 people. We would choose the $35 set menu. Could you confirm whether this would reach your minimum spend?

Rachel Moore`,
    questions: [
      {
        difficulty: "normal",
        question: "What is Ms. Moore planning?",
        answers: ["A team dinner", "A wedding", "A birthday lunch", "A cooking class"], correct_index: 0,
        justification: "\"For a team dinner.\"",
      },
      {
        difficulty: "normal",
        question: "What is required to confirm a booking?",
        answers: ["Full payment", "A $100 deposit", "A signed contract", "A menu choice"], correct_index: 1,
        justification: "\"A deposit of $100 is required to confirm a booking.\"",
      },
      {
        difficulty: "hard",
        question: "What is the minimum spend for Ms. Moore's dinner?",
        answers: ["$600", "$420", "$400", "$100"], correct_index: 2,
        justification: "It is on a Thursday: \"$400 on other evenings\".",
      },
      {
        difficulty: "hard",
        question: "How much would the set menus cost for the group?",
        answers: ["$600", "$350", "$700", "$420"], correct_index: 3,
        justification: "12 people x $35 = $420.",
      },
      {
        difficulty: "extreme",
        question: "Would Ms. Moore's booking reach the minimum spend?",
        answers: ["Yes, because $420 is more than $400.", "No, it would need $600.", "No, the group is too small.", "Yes, but only with drinks."], correct_index: 0,
        justification: "On a Thursday the minimum is $400, and the set menus cost $420.",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Pricing: TaskFlow Project Software
Starter: up to 5 users — $30 per month
Team: up to 25 users — $120 per month
Business: up to 100 users — $400 per month
Pay yearly and get two months free.

DOCUMENT 2 — E-mail
To: sales@taskflow.com
From: Lena Fischer
Subject: Subscription

Hello,

Our company has 18 employees, and we expect to hire about 4 more next year. We would like to try TaskFlow for one year and pay for the whole year at once.

Could you confirm which plan we need and the total price?

Lena Fischer`,
    questions: [
      {
        difficulty: "normal",
        question: "What is TaskFlow?",
        answers: ["A recruitment agency", "Project management software", "An accounting firm", "A training company"], correct_index: 1,
        justification: "\"TaskFlow Project Software.\"",
      },
      {
        difficulty: "normal",
        question: "How many employees does Ms. Fischer's company have now?",
        answers: ["22", "25", "18", "4"], correct_index: 2,
        justification: "\"Our company has 18 employees.\"",
      },
      {
        difficulty: "hard",
        question: "Which plan does Ms. Fischer's company need?",
        answers: ["Starter", "Business", "Two Starter plans", "Team"], correct_index: 3,
        justification: "18 employees, about 22 next year: up to 25 users = Team.",
      },
      {
        difficulty: "hard",
        question: "What is the benefit of paying yearly?",
        answers: ["Two months are free.", "More users are allowed.", "A free training session", "A 50% discount"], correct_index: 0,
        justification: "\"Pay yearly and get two months free.\"",
      },
      {
        difficulty: "extreme",
        question: "How much will the company pay for one year?",
        answers: ["$1,440", "$1,200", "$1,320", "$4,000"], correct_index: 1,
        justification: "Team: $120 x 12 = $1,440, minus two free months ($240) = $1,200.",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Courier rates: CityDash (same-day delivery within the city)
Envelope (up to 0.5 kg): $12
Small parcel (up to 5 kg): $20
Large parcel (up to 20 kg): $35
Orders placed after 2 P.M. are delivered the next morning. Signature on delivery: +$3.

DOCUMENT 2 — E-mail
To: orders@citydash.com
From: Tom Hughes, Hughes Legal
Date: Wednesday, 3:30 P.M.
Subject: Urgent delivery

Hello,

I need to send a signed contract (in an envelope) to a client across town. It must be signed for on delivery. The client needs it today if possible. Could you collect it from our office in the next hour?

Tom Hughes`,
    questions: [
      {
        difficulty: "normal",
        question: "What does Mr. Hughes want to send?",
        answers: ["A large parcel", "Office furniture", "A contract", "A computer"], correct_index: 2,
        justification: "\"A signed contract (in an envelope).\"",
      },
      {
        difficulty: "normal",
        question: "What extra service does Mr. Hughes need?",
        answers: ["Insurance", "Weekend delivery", "Gift wrapping", "A signature on delivery"], correct_index: 3,
        justification: "\"It must be signed for on delivery.\"",
      },
      {
        difficulty: "hard",
        question: "How much will the delivery cost?",
        answers: ["$15", "$12", "$23", "$20"], correct_index: 0,
        justification: "Envelope $12 + signature $3 = $15.",
      },
      {
        difficulty: "hard",
        question: "What type of business is Hughes Legal?",
        answers: ["A courier company", "A law firm", "A bank", "A printing shop"], correct_index: 1,
        justification: "\"Hughes Legal\" sends a signed contract to a client: a legal business.",
      },
      {
        difficulty: "extreme",
        question: "When will the contract most likely be delivered?",
        answers: ["Within one hour", "That afternoon", "The next morning", "In two days"], correct_index: 2,
        justification: "He ordered at 3:30 P.M.; orders placed after 2 P.M. are delivered the next morning.",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Project timeline: Aurora Smart Lamp
Design approved — 15 January
Prototype testing — February to March
Factory production begins — 1 May
Lamps in stores — 1 June
Marketing campaign starts — 15 May

DOCUMENT 2 — E-mail
To: Aurora Project Team
From: Daniel Cho, Project Manager
Date: 20 March
Subject: Timeline update

Hi all,

Testing has shown a problem with the lamp's power switch. The engineers need four more weeks to fix it, so factory production will now start one month later than planned. All later dates will move by one month as well.

Daniel`,
    questions: [
      {
        difficulty: "normal",
        question: "What product is being developed?",
        answers: ["A smartphone", "A power station", "A light bulb factory", "A smart lamp"], correct_index: 3,
        justification: "\"Aurora Smart Lamp.\"",
      },
      {
        difficulty: "normal",
        question: "What problem was found?",
        answers: ["A problem with the power switch", "A problem with the color", "A problem with the price", "A problem with the factory"], correct_index: 0,
        justification: "\"Testing has shown a problem with the lamp's power switch.\"",
      },
      {
        difficulty: "hard",
        question: "When will factory production now begin?",
        answers: ["1 May", "1 June", "15 May", "1 July"], correct_index: 1,
        justification: "One month later than 1 May: 1 June.",
      },
      {
        difficulty: "hard",
        question: "When will the marketing campaign most likely start now?",
        answers: ["15 May", "1 June", "15 June", "15 July"], correct_index: 2,
        justification: "All later dates move by one month: 15 May becomes 15 June.",
      },
      {
        difficulty: "extreme",
        question: "When will the lamps most likely be in stores?",
        answers: ["1 June", "15 June", "1 August", "1 July"], correct_index: 3,
        justification: "1 June + one month = 1 July.",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Membership options: Pinewood Golf Club
Weekday membership (Monday–Friday): $900 per year
Full membership (7 days): $1,400 per year
Junior membership (under 18): $300 per year
New members joining before 31 March pay no joining fee (normally $200).

DOCUMENT 2 — E-mail
To: membership@pinewoodgolf.com
From: Martin Shaw
Date: 12 April
Subject: Joining the club

Hello,

I recently retired and would like to join the club with my 15-year-old grandson, who stays with me every weekend. I mostly plan to play on weekdays, when the course is quieter, but my grandson can only play on weekends.

Could you tell me the total cost for both of us?

Martin Shaw`,
    questions: [
      {
        difficulty: "normal",
        question: "Why does Mr. Shaw have more free time?",
        answers: ["He has recently retired.", "He lost his job.", "He is on vacation.", "He works part-time."], correct_index: 0,
        justification: "\"I recently retired.\"",
      },
      {
        difficulty: "normal",
        question: "When does Mr. Shaw prefer to play?",
        answers: ["On weekends", "On weekdays", "Only on Mondays", "In the evenings"], correct_index: 1,
        justification: "\"I mostly plan to play on weekdays.\"",
      },
      {
        difficulty: "hard",
        question: "Which membership will Mr. Shaw's grandson most likely have?",
        answers: ["Weekday", "Full", "Junior", "None"], correct_index: 2,
        justification: "He is 15: junior membership (under 18).",
      },
      {
        difficulty: "hard",
        question: "Will they pay the joining fee?",
        answers: ["No, because Mr. Shaw is retired.", "No, because the grandson is a junior.", "No, joining is always free.", "Yes, because they are joining after 31 March."], correct_index: 3,
        justification: "Mr. Shaw wrote on 12 April; the free offer ended on 31 March.",
      },
      {
        difficulty: "extreme",
        question: "What will the total cost most likely be if Mr. Shaw chooses a weekday membership?",
        answers: ["$1,600", "$1,200", "$1,900", "$1,400"], correct_index: 0,
        justification: "$900 (weekday) + $300 (junior) = $1,200, plus two joining fees ($400) = $1,600.",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Rewards program: StayWell Hotels
Earn 10 points per $1 spent on rooms.
Free night (standard room): 15,000 points
Free night (suite): 30,000 points
Points expire after 24 months without any stay.

DOCUMENT 2 — E-mail
To: rewards@staywell.com
From: Priya Raman
Subject: Using my points

Hello,

I have 27,000 points in my account. I'd like to use them for a two-night stay in Rome in September. I was hoping to book a suite, but I'm not sure I have enough points. My last stay with you was in March this year.

Priya Raman`,
    questions: [
      {
        difficulty: "normal",
        question: "What does Ms. Raman want to do?",
        answers: ["Buy more points", "Use her points for a hotel stay", "Cancel a booking", "Join the program"], correct_index: 1,
        justification: "\"I'd like to use them for a two-night stay in Rome.\"",
      },
      {
        difficulty: "normal",
        question: "Where does Ms. Raman want to stay?",
        answers: ["In Paris", "In March", "In Rome", "Near the airport"], correct_index: 2,
        justification: "\"A two-night stay in Rome.\"",
      },
      {
        difficulty: "hard",
        question: "How many points are needed for two free nights in a standard room?",
        answers: ["15,000", "27,000", "60,000", "30,000"], correct_index: 3,
        justification: "2 x 15,000 = 30,000 points.",
      },
      {
        difficulty: "hard",
        question: "Are Ms. Raman's points close to expiring?",
        answers: ["No, she stayed with StayWell in March.", "Yes, they expire this month.", "Yes, they expire after 12 months.", "The text does not say."], correct_index: 0,
        justification: "Points expire after 24 months without a stay; her last stay was in March this year.",
      },
      {
        difficulty: "extreme",
        question: "What can Ms. Raman most likely get with her points?",
        answers: ["Two free nights in a suite", "One free night in a standard room", "One free night in a suite", "Two free nights in a standard room"], correct_index: 1,
        justification: "27,000 points: enough for one standard night (15,000), but not a suite (30,000) or two standard nights (30,000).",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Memo
To: Department managers
From: Finance
Re: Office supply budgets
Each department has a budget of $500 for office supplies this quarter. Purchases over $200 must be approved by Finance before ordering. Furniture and electronics are not part of the office supply budget.

DOCUMENT 2 — E-mail
To: Finance
From: Gary Lee, Marketing Manager
Subject: Purchase request

Hello,

So far this quarter, my department has spent $320 on office supplies. I would now like to order printer paper and ink for $150, as well as a new office chair for $180. Please let me know if this is acceptable.

Gary Lee`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the memo about?",
        answers: ["A new office", "Salaries", "Budgets for office supplies", "A furniture sale"], correct_index: 2,
        justification: "\"Re: Office supply budgets.\"",
      },
      {
        difficulty: "normal",
        question: "Which department does Mr. Lee manage?",
        answers: ["Finance", "IT", "Sales", "Marketing"], correct_index: 3,
        justification: "\"Gary Lee, Marketing Manager.\"",
      },
      {
        difficulty: "hard",
        question: "How much of the supply budget does the Marketing department have left?",
        answers: ["$180", "$500", "$320", "$30"], correct_index: 0,
        justification: "$500 - $320 = $180.",
      },
      {
        difficulty: "hard",
        question: "Which item cannot be paid from the office supply budget?",
        answers: ["The printer paper", "The office chair", "The ink", "Pens"], correct_index: 1,
        justification: "\"Furniture and electronics are not part of the office supply budget.\"",
      },
      {
        difficulty: "extreme",
        question: "Can the printer paper and ink be paid from the supply budget?",
        answers: ["No, they cost more than $200.", "No, the budget is already spent.", "Yes, $150 fits in the remaining $180.", "Only with the CEO's approval."], correct_index: 2,
        justification: "$150 is less than the $180 left, and less than $200, so no special approval is needed.",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Fees: Little Steps Daycare
Full day (7:30 A.M.–6 P.M.): $60 per day
Half day (7:30 A.M.–1 P.M. or 1–6 P.M.): $35 per day
Late pick-up: $10 for every 15 minutes after 6 P.M.
Families with two children enrolled receive 10% off the second child's fees.

DOCUMENT 2 — E-mail
To: info@littlesteps.com
From: Sara Kim
Subject: Enrollment

Hello,

I would like to enroll my two children, Leo and Mia, from September. Leo will need full days, five days a week. Mia will only need afternoons, three days a week. I work until 6 P.M., and my office is 20 minutes away.

Sara Kim`,
    questions: [
      {
        difficulty: "normal",
        question: "Why did Ms. Kim write?",
        answers: ["To complain about fees", "To apply for a job", "To change pick-up times", "To enroll her children"], correct_index: 3,
        justification: "\"I would like to enroll my two children.\"",
      },
      {
        difficulty: "normal",
        question: "What time does a full day end?",
        answers: ["6 P.M.", "1 P.M.", "7:30 P.M.", "5 P.M."], correct_index: 0,
        justification: "\"Full day (7:30 A.M.–6 P.M.).\"",
      },
      {
        difficulty: "hard",
        question: "How much will Leo's care cost per week?",
        answers: ["$175", "$300", "$60", "$270"], correct_index: 1,
        justification: "5 full days x $60 = $300.",
      },
      {
        difficulty: "hard",
        question: "What will Ms. Kim most likely have to pay because of her work hours?",
        answers: ["A registration fee", "Extra lunch fees", "Late pick-up fees", "Nothing extra"], correct_index: 2,
        justification: "She works until 6 P.M. and her office is 20 minutes away: she will arrive after 6 P.M.",
      },
      {
        difficulty: "extreme",
        question: "How much will Mia's care cost per week with the discount?",
        answers: ["$105", "$90", "$180", "$94.50"], correct_index: 3,
        justification: "3 half days x $35 = $105, minus 10% (second child) = $94.50.",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Residential parking zones: Harbor District
Zone A (streets north of Main Street): permit $80 per year
Zone B (streets south of Main Street): permit $60 per year
Each household may have a maximum of two permits.
Visitor permits: $5 per day, maximum 30 days per year per household.

DOCUMENT 2 — E-mail
To: parking@harborcity.gov
From: Luis Romero
Subject: Parking permits

Hello,

We live at 15 Elm Street, just north of Main Street. My wife and I each have a car, and my mother visits us for two weeks every summer with her car. How much will this cost us per year?

Luis Romero`,
    questions: [
      {
        difficulty: "normal",
        question: "What is Mr. Romero asking about?",
        answers: ["The cost of parking permits", "A parking ticket", "A new parking lot", "Buying a car"], correct_index: 0,
        justification: "\"How much will this cost us per year?\"",
      },
      {
        difficulty: "normal",
        question: "How many permits can each household have?",
        answers: ["One", "Two", "Three", "As many as needed"], correct_index: 1,
        justification: "\"A maximum of two permits.\"",
      },
      {
        difficulty: "hard",
        question: "Which zone does Mr. Romero live in?",
        answers: ["Zone B", "Both zones", "Zone A", "Neither zone"], correct_index: 2,
        justification: "Elm Street is \"just north of Main Street\": Zone A.",
      },
      {
        difficulty: "hard",
        question: "How much will the visitor permits for his mother cost?",
        answers: ["$5", "$150", "$35", "$70"], correct_index: 3,
        justification: "Two weeks = 14 days x $5 = $70.",
      },
      {
        difficulty: "extreme",
        question: "What will the total cost be per year?",
        answers: ["$230", "$190", "$160", "$300"], correct_index: 0,
        justification: "2 Zone A permits x $80 = $160, plus $70 for visitor permits = $230.",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Workshop: Introduction to Woodworking
Saturday, 9 March, 10 A.M.–4 P.M. — Maker Space, 22 Mill Road
Participants will build a small wooden shelf to take home.
Open to adults (18+). Maximum 8 participants. Price: $90, including all materials and lunch.
Wear closed shoes; safety glasses are provided.

DOCUMENT 2 — E-mail
To: workshops@makerspace.org
From: Helen Cooper
Subject: Woodworking workshop

Hello,

I'd love to sign up for the woodworking workshop with my son, who is 16 and very interested in carpentry. Is there any way he could attend with me? I'd also like to know if we should bring our own safety glasses.

Helen Cooper`,
    questions: [
      {
        difficulty: "normal",
        question: "What will participants make?",
        answers: ["A chair", "A small shelf", "A table", "A box"], correct_index: 1,
        justification: "\"Participants will build a small wooden shelf.\"",
      },
      {
        difficulty: "normal",
        question: "What is included in the price?",
        answers: ["Safety shoes", "A tool set to take home", "Materials and lunch", "Transportation"], correct_index: 2,
        justification: "\"Including all materials and lunch.\"",
      },
      {
        difficulty: "hard",
        question: "Why might Ms. Cooper's son not be able to attend?",
        answers: ["The workshop is full.", "He has no experience.", "He has no closed shoes.", "He is under 18."], correct_index: 3,
        justification: "The workshop is \"open to adults (18+)\", and he is 16.",
      },
      {
        difficulty: "hard",
        question: "What is the answer to Ms. Cooper's question about safety glasses?",
        answers: ["They are provided.", "Participants must bring them.", "They can be bought for $10.", "They are not needed."], correct_index: 0,
        justification: "\"Safety glasses are provided.\"",
      },
      {
        difficulty: "extreme",
        question: "What should Ms. Cooper wear to the workshop?",
        answers: ["Gloves", "Closed shoes", "A helmet", "A uniform"], correct_index: 1,
        justification: "\"Wear closed shoes.\"",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Ticket prices: Royal Theater ("The Glass Garden")
Front stalls: $75
Rear stalls: $55
Balcony: $35
Discounts: students and seniors (65+) get 20% off. Wednesday matinee (2 P.M.): all seats $30.

DOCUMENT 2 — E-mail
To: boxoffice@royaltheater.com
From: Anne Walsh
Subject: Tickets for "The Glass Garden"

Hello,

I would like to buy three front stalls tickets for Friday evening's performance: for myself, my husband (67), and our granddaughter, who is a university student. I'm 63.

Could you tell me the total price?

Anne Walsh`,
    questions: [
      {
        difficulty: "normal",
        question: "What does Ms. Walsh want to buy?",
        answers: ["Concert tickets", "A theater membership", "Theater tickets", "A gift card"], correct_index: 2,
        justification: "\"I would like to buy three front stalls tickets.\"",
      },
      {
        difficulty: "normal",
        question: "What is the price of a balcony seat without a discount?",
        answers: ["$30", "$55", "$75", "$35"], correct_index: 3,
        justification: "\"Balcony: $35.\"",
      },
      {
        difficulty: "hard",
        question: "Who in Ms. Walsh's group will NOT get a discount?",
        answers: ["Ms. Walsh", "Her husband", "Her granddaughter", "Everyone will get a discount."], correct_index: 0,
        justification: "She is 63 (under 65) and not a student. Her husband (67) and granddaughter (student) get 20% off.",
      },
      {
        difficulty: "hard",
        question: "Why can't the group use the $30 offer?",
        answers: ["It is only for students.", "It is only for the Wednesday matinee.", "It is only for balcony seats.", "It has ended."], correct_index: 1,
        justification: "The $30 price is for the Wednesday 2 P.M. matinee; they want Friday evening.",
      },
      {
        difficulty: "extreme",
        question: "What will the total price be?",
        answers: ["$225", "$180", "$195", "$165"], correct_index: 2,
        justification: "$75 + 2 x $60 ($75 - 20%) = $75 + $120 = $195.",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Day tour: Coastal Highlights (by bus)
8:00 A.M. — Departure from Central Square
10:00 A.M. — Lighthouse visit (1 hour)
12:00 P.M. — Lunch at a fish restaurant (not included)
2:00 P.M. — Boat trip to Seal Island (included)
5:30 P.M. — Return to Central Square
Price: $65 per adult, $40 per child (under 12)

DOCUMENT 2 — E-mail
To: tours@coastalhighlights.com
From: Mark Evans
Subject: Coastal Highlights tour

Hello,

My wife, our 10-year-old son and I would like to join the tour on Saturday. My son doesn't eat fish; are there other options at lunch? Also, my wife sometimes gets seasick. Is the boat trip long?

Mark Evans`,
    questions: [
      {
        difficulty: "normal",
        question: "Where does the tour start?",
        answers: ["The lighthouse", "Seal Island", "A fish restaurant", "Central Square"], correct_index: 3,
        justification: "\"Departure from Central Square.\"",
      },
      {
        difficulty: "normal",
        question: "What is NOT included in the price?",
        answers: ["Lunch", "The boat trip", "The bus", "The lighthouse visit"], correct_index: 0,
        justification: "\"Lunch at a fish restaurant (not included).\"",
      },
      {
        difficulty: "hard",
        question: "Why is Mr. Evans worried about the boat trip?",
        answers: ["His son is afraid of water.", "His wife sometimes feels sick on boats.", "It costs extra.", "It is too early."], correct_index: 1,
        justification: "\"My wife sometimes gets seasick.\"",
      },
      {
        difficulty: "hard",
        question: "Why does Mr. Evans ask about lunch options?",
        answers: ["His wife is vegetarian.", "He wants a cheaper lunch.", "His son does not eat fish.", "He wants to bring food."], correct_index: 2,
        justification: "\"My son doesn't eat fish.\"",
      },
      {
        difficulty: "extreme",
        question: "How much will the tour cost for the Evans family?",
        answers: ["$195", "$130", "$145", "$170"], correct_index: 3,
        justification: "2 adults x $65 + 1 child (10, under 12) x $40 = $130 + $40 = $170.",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Information for sellers: Greenfield Farmers Market
Market days: every Saturday, 8 A.M.–1 P.M.
Stall fee: $25 per Saturday, or $250 for the whole season (14 Saturdays)
Only products grown or made within 50 km of Greenfield may be sold.
Applications for the season must be received by 1 March.

DOCUMENT 2 — Application e-mail
To: market@greenfield.org
From: Julia Banks, Hilltop Honey
Date: 20 February
Subject: Stall application

Hello,

I keep bees on my farm, 30 km from Greenfield, and would like to sell my honey and beeswax candles at the market for the whole season. I would also like to sell some olive oil that I import from Greece.

Julia Banks`,
    questions: [
      {
        difficulty: "normal",
        question: "What does Ms. Banks produce?",
        answers: ["Honey and candles", "Vegetables", "Bread", "Cheese"], correct_index: 0,
        justification: "\"My honey and beeswax candles.\"",
      },
      {
        difficulty: "normal",
        question: "When does the market take place?",
        answers: ["Every day", "On Saturday mornings", "On Sunday afternoons", "Once a month"], correct_index: 1,
        justification: "\"Every Saturday, 8 A.M.–1 P.M.\"",
      },
      {
        difficulty: "hard",
        question: "How much would Ms. Banks save with the season fee compared with paying each week?",
        answers: ["$25", "$250", "$100", "$350"], correct_index: 2,
        justification: "14 x $25 = $350; the season fee is $250: $100 saved.",
      },
      {
        difficulty: "hard",
        question: "Did Ms. Banks apply in time?",
        answers: ["No, she applied too late.", "No, the market is full.", "The deadline is not mentioned.", "Yes, before the 1 March deadline."], correct_index: 3,
        justification: "She applied on 20 February.",
      },
      {
        difficulty: "extreme",
        question: "Which product will Ms. Banks most likely NOT be allowed to sell?",
        answers: ["The olive oil", "The honey", "The candles", "None of them"], correct_index: 0,
        justification: "Only products from within 50 km can be sold; the olive oil comes from Greece.",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Rates: LinguaPro Translation Services
Standard translation: $0.12 per word (delivery in 5 working days)
Express translation: $0.18 per word (delivery in 2 working days)
Certified translation (for official documents): + $25 per document
Minimum charge: $50

DOCUMENT 2 — E-mail
To: quotes@linguapro.com
From: Ahmed Saleh
Subject: Quote request

Hello,

I need a 1,000-word business contract translated from Arabic into English. It is not an official document, but I need it within three working days for a meeting with a client.

Could you send me a quote?

Ahmed Saleh`,
    questions: [
      {
        difficulty: "normal",
        question: "What does Mr. Saleh need?",
        answers: ["A language course", "A document translated", "An interpreter for a meeting", "A contract written"], correct_index: 1,
        justification: "\"I need a 1,000-word business contract translated.\"",
      },
      {
        difficulty: "normal",
        question: "Into which language will the contract be translated?",
        answers: ["Arabic", "French", "English", "Spanish"], correct_index: 2,
        justification: "\"From Arabic into English.\"",
      },
      {
        difficulty: "hard",
        question: "Which service will Mr. Saleh most likely need?",
        answers: ["Standard translation", "Certified translation", "No service is suitable.", "Express translation"], correct_index: 3,
        justification: "He needs it within three days; standard takes five, express takes two.",
      },
      {
        difficulty: "hard",
        question: "Why won't Mr. Saleh pay the $25 extra charge?",
        answers: ["The contract is not an official document.", "The contract is too short.", "He is a regular customer.", "He ordered online."], correct_index: 0,
        justification: "The extra $25 is for certified (official) documents; his \"is not an official document\".",
      },
      {
        difficulty: "extreme",
        question: "How much will the translation most likely cost?",
        answers: ["$120", "$180", "$205", "$50"], correct_index: 1,
        justification: "Express: 1,000 words x $0.18 = $180 (above the $50 minimum).",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — HR policy: Employee referral program
Employees who recommend a candidate who is hired receive a bonus of $1,000.
The bonus is paid after the new employee has completed six months with the company.
Managers cannot receive a bonus for hiring people into their own team.

DOCUMENT 2 — E-mail
To: Human Resources
From: Olivia Grant, Senior Engineer
Date: 5 September
Subject: Referral bonus

Hello,

My former colleague, Tom Ellis, joined our IT department on 1 April after I recommended him. I haven't received the referral bonus yet. Could you tell me when I can expect it?

Olivia Grant`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the referral program?",
        answers: ["A training program", "A health insurance plan", "A bonus for recommending new employees", "A program for interns"], correct_index: 2,
        justification: "\"Employees who recommend a candidate who is hired receive a bonus.\"",
      },
      {
        difficulty: "normal",
        question: "How much is the bonus?",
        answers: ["$500", "$6,000", "$100", "$1,000"], correct_index: 3,
        justification: "\"A bonus of $1,000.\"",
      },
      {
        difficulty: "hard",
        question: "Who is Tom Ellis?",
        answers: ["A person Ms. Grant recommended", "Ms. Grant's manager", "An HR employee", "A candidate who was not hired"], correct_index: 0,
        justification: "\"Tom Ellis, joined our IT department ... after I recommended him.\"",
      },
      {
        difficulty: "hard",
        question: "When will Mr. Ellis complete six months with the company?",
        answers: ["On 1 September", "On 1 October", "On 5 September", "On 1 April"], correct_index: 1,
        justification: "He joined on 1 April; six months later is 1 October.",
      },
      {
        difficulty: "extreme",
        question: "Why hasn't Ms. Grant received the bonus yet?",
        answers: ["She is his manager.", "He did not get the job.", "Mr. Ellis has not worked there for six months yet.", "She forgot to apply."], correct_index: 2,
        justification: "She wrote on 5 September; the six months end on 1 October.",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Vacation policy (extract)
Full-time employees receive 25 days of paid vacation per year.
Requests for more than 10 consecutive working days must be approved by the department director.
Requests must be submitted at least one month in advance.
Unused days (up to 5) may be carried over to the next year.

DOCUMENT 2 — E-mail
To: Linda Park, Team Leader
From: Sam Torres
Date: 2 June
Subject: Vacation request

Hi Linda,

I would like to take vacation from 1 to 19 July (three weeks, 15 working days) to visit my family in Mexico. I have 22 days left this year. Since you are my manager, could you approve this?

Thanks,
Sam`,
    questions: [
      {
        difficulty: "normal",
        question: "Why does Mr. Torres want to take vacation?",
        answers: ["To attend a wedding", "To study", "To move house", "To visit his family"], correct_index: 3,
        justification: "\"To visit my family in Mexico.\"",
      },
      {
        difficulty: "normal",
        question: "How many vacation days do full-time employees get each year?",
        answers: ["25", "22", "15", "10"], correct_index: 0,
        justification: "\"25 days of paid vacation per year.\"",
      },
      {
        difficulty: "hard",
        question: "How many vacation days will Mr. Torres have left after this trip?",
        answers: ["10", "7", "3", "22"], correct_index: 1,
        justification: "22 - 15 = 7 days.",
      },
      {
        difficulty: "hard",
        question: "Did Mr. Torres make his request early enough?",
        answers: ["Yes, it is two months in advance.", "Yes, there is no deadline.", "No, it is less than one month in advance.", "No, it is one year late."], correct_index: 2,
        justification: "He wrote on 2 June for 1 July: less than one month before.",
      },
      {
        difficulty: "extreme",
        question: "Who must approve Mr. Torres's request?",
        answers: ["Linda Park alone", "Human Resources", "No one", "The department director"], correct_index: 3,
        justification: "15 working days is more than 10 consecutive days: the department director must approve.",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Maintenance log: Printer PR-3 (2nd floor)
3 March — Paper jam fixed (J. Lee)
17 March — Toner replaced (J. Lee)
2 April — Paper jam fixed (M. Ortiz)
9 April — Paper jam fixed (J. Lee)
Note: If the same problem happens three times in one month, contact the supplier for a repair visit.

DOCUMENT 2 — E-mail
To: J. Lee, Office Support
From: Hannah Burke
Date: 16 April
Subject: Printer PR-3

Hi,

The printer on the second floor has jammed again this morning. It's becoming a real problem, as our team prints a lot of reports. Could you take a look?

Thanks,
Hannah`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the problem with printer PR-3?",
        answers: ["It keeps jamming.", "It has no toner.", "It is too slow.", "It prints in the wrong color."], correct_index: 0,
        justification: "\"The printer ... has jammed again.\"",
      },
      {
        difficulty: "normal",
        question: "Who fixed most of the problems in the log?",
        answers: ["M. Ortiz", "J. Lee", "Hannah Burke", "The supplier"], correct_index: 1,
        justification: "J. Lee appears three times; M. Ortiz once.",
      },
      {
        difficulty: "hard",
        question: "Why is the problem important for Ms. Burke's team?",
        answers: ["They are moving offices.", "They have no other printer.", "They print many reports.", "They work at night."], correct_index: 2,
        justification: "\"Our team prints a lot of reports.\"",
      },
      {
        difficulty: "hard",
        question: "How many paper jams have happened in April, including Ms. Burke's?",
        answers: ["Two", "Four", "One", "Three"], correct_index: 3,
        justification: "2 April, 9 April, and 16 April (this morning) = three.",
      },
      {
        difficulty: "extreme",
        question: "What should most likely happen next?",
        answers: ["The supplier should be contacted for a repair visit.", "The toner should be replaced.", "The printer should be moved.", "Nothing, it is normal."], correct_index: 0,
        justification: "Three jams in one month: \"contact the supplier for a repair visit\".",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Flyer
Sportsline — Summer Sale (1–15 July)
All running shoes: 30% off
Swimwear: 20% off
Tennis rackets: buy one, get the second at half price
Sale prices are applied at the checkout. Members get an extra 5% off everything.

DOCUMENT 2 — Receipt
Sportsline — 6 July
Running shoes (regular price $100) — $70.00
Tennis racket (regular price $80) — $80.00
Tennis racket (regular price $80) — $40.00
Total: $190.00
Member: No`,
    questions: [
      {
        difficulty: "normal",
        question: "What kind of store is Sportsline?",
        answers: ["A clothing store for children", "A sports store", "A shoe repair shop", "A tennis club"], correct_index: 1,
        justification: "It sells running shoes, swimwear and tennis rackets.",
      },
      {
        difficulty: "normal",
        question: "When does the sale end?",
        answers: ["On 1 July", "On 6 July", "On 15 July", "On 31 July"], correct_index: 2,
        justification: "\"Summer Sale (1–15 July).\"",
      },
      {
        difficulty: "hard",
        question: "Was the discount on the running shoes applied correctly?",
        answers: ["No, it should be $80.", "No, it should be $65.", "No discount was applied.", "Yes, 30% off $100 is $70."], correct_index: 3,
        justification: "$100 - 30% = $70.",
      },
      {
        difficulty: "hard",
        question: "Why was one tennis racket only $40?",
        answers: ["The second racket was half price.", "It was damaged.", "It was a member price.", "It was a children's racket."], correct_index: 0,
        justification: "\"Buy one, get the second at half price\": $80 / 2 = $40.",
      },
      {
        difficulty: "extreme",
        question: "How much would the customer have paid as a member?",
        answers: ["$190.00", "$180.50", "$171.00", "$185.00"], correct_index: 1,
        justification: "Members get an extra 5% off: $190 - $9.50 = $180.50.",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Schedule: Language Exchange Café
Monday: Spanish–English (7–9 P.M.)
Tuesday: French–English (7–9 P.M.)
Thursday: Japanese–English (6–8 P.M.)
Saturday: German–English (3–5 P.M.)
Free entry. Please buy one drink.

DOCUMENT 2 — Text messages
Lucy Ward (12:15 P.M.): Want to go to the language café this week? I want to practice my French.
Tom Reyes (12:17 P.M.): Sure, but I'm learning Japanese, remember?
Lucy Ward (12:18 P.M.): Oh right! Then we'd have to go on different days.
Tom Reyes (12:20 P.M.): I have a late meeting on Thursday until 7, though.
Lucy Ward (12:21 P.M.): You could still catch the last hour!`,
    questions: [
      {
        difficulty: "normal",
        question: "Which language is Ms. Ward learning?",
        answers: ["Japanese", "Spanish", "French", "German"], correct_index: 2,
        justification: "\"I want to practice my French.\"",
      },
      {
        difficulty: "normal",
        question: "What do visitors have to do at the café?",
        answers: ["Pay an entry fee", "Bring a book", "Register online", "Buy a drink"], correct_index: 3,
        justification: "\"Free entry. Please buy one drink.\"",
      },
      {
        difficulty: "hard",
        question: "Which evening will Ms. Ward most likely go?",
        answers: ["Tuesday", "Monday", "Thursday", "Saturday"], correct_index: 0,
        justification: "French–English is on Tuesday.",
      },
      {
        difficulty: "hard",
        question: "Why does Mr. Reyes mention his meeting?",
        answers: ["He wants to cancel it.", "It may stop him from attending the whole session.", "It is about Japanese clients.", "He wants Ms. Ward to join it."], correct_index: 1,
        justification: "His meeting on Thursday lasts until 7; the Japanese session is from 6 to 8.",
      },
      {
        difficulty: "extreme",
        question: "At 12:21 P.M., what does Ms. Ward mean by \"the last hour\"?",
        answers: ["From 8 to 9 P.M. on Tuesday", "From 4 to 5 P.M. on Saturday", "From 7 to 8 P.M. on Thursday", "From 6 to 7 P.M. on Thursday"], correct_index: 2,
        justification: "The Japanese session runs from 6 to 8 P.M.; after his meeting ends at 7, he can attend from 7 to 8.",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Price list: FixIt Laptop Repair
Screen replacement: $120
Battery replacement: $80
Keyboard replacement: $70
Diagnostic check: $30 (free if you choose to repair with us)
All repairs come with a 6-month guarantee. Most repairs are done within 3 working days.

DOCUMENT 2 — E-mail
To: info@fixitrepair.com
From: Jack Turner
Subject: Laptop repair

Hello,

My laptop's battery only lasts about 30 minutes now, and two keys on the keyboard have stopped working. I use it for work, so I need it back as soon as possible. Could you tell me the price for both repairs?

Jack Turner`,
    questions: [
      {
        difficulty: "normal",
        question: "What problems does Mr. Turner's laptop have?",
        answers: ["The screen and the battery", "The screen only", "The keyboard only", "The battery and the keyboard"], correct_index: 3,
        justification: "The battery lasts only 30 minutes, and two keys have stopped working.",
      },
      {
        difficulty: "normal",
        question: "How long are repairs guaranteed?",
        answers: ["6 months", "3 days", "1 year", "30 days"], correct_index: 0,
        justification: "\"All repairs come with a 6-month guarantee.\"",
      },
      {
        difficulty: "hard",
        question: "Why does Mr. Turner need the laptop quickly?",
        answers: ["It was a gift.", "He uses it for work.", "He is traveling.", "He has an exam."], correct_index: 1,
        justification: "\"I use it for work.\"",
      },
      {
        difficulty: "hard",
        question: "When is the diagnostic check free?",
        answers: ["Always", "Only for new laptops", "When the customer has the repair done at FixIt", "Only on weekends"], correct_index: 2,
        justification: "\"Free if you choose to repair with us.\"",
      },
      {
        difficulty: "extreme",
        question: "How much will both repairs cost if Mr. Turner has them done at FixIt?",
        answers: ["$180", "$200", "$190", "$150"], correct_index: 3,
        justification: "Battery $80 + keyboard $70 = $150 (the diagnostic check is free).",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Hotel shuttle schedule: Airport Lodge
Hotel → Airport: every 30 minutes, 4:30 A.M. – 10:30 P.M. (on the hour and half hour)
Airport → Hotel: every 30 minutes, 5:00 A.M. – 11:00 P.M.
Journey time: 15 minutes. Free for hotel guests.

DOCUMENT 2 — E-mail
To: frontdesk@airportlodge.com
From: Elena Petrova
Subject: Shuttle tomorrow

Hello,

I'm staying in room 214 and have a flight tomorrow at 7:15 A.M. I need to be at the airport two hours before departure. Which shuttle should I take? Also, can I have breakfast before I leave? I believe the restaurant opens at 6 A.M.

Elena Petrova`,
    questions: [
      {
        difficulty: "normal",
        question: "How much does the shuttle cost for hotel guests?",
        answers: ["Nothing", "$15", "$5", "$30"], correct_index: 0,
        justification: "\"Free for hotel guests.\"",
      },
      {
        difficulty: "normal",
        question: "How long does the shuttle take to reach the airport?",
        answers: ["30 minutes", "15 minutes", "1 hour", "2 hours"], correct_index: 1,
        justification: "\"Journey time: 15 minutes.\"",
      },
      {
        difficulty: "hard",
        question: "By what time does Ms. Petrova need to be at the airport?",
        answers: ["7:15 A.M.", "6:00 A.M.", "5:15 A.M.", "4:30 A.M."], correct_index: 2,
        justification: "Two hours before her 7:15 A.M. flight: 5:15 A.M.",
      },
      {
        difficulty: "hard",
        question: "Which shuttle should Ms. Petrova take?",
        answers: ["The 4:30 A.M. shuttle", "The 5:30 A.M. shuttle", "The 6:00 A.M. shuttle", "The 5:00 A.M. shuttle"], correct_index: 3,
        justification: "The 5:00 shuttle arrives at 5:15. The 5:30 would be too late; 4:30 is earlier than needed.",
      },
      {
        difficulty: "extreme",
        question: "What is the answer to Ms. Petrova's question about breakfast?",
        answers: ["She will leave before the restaurant opens.", "She can eat at 6 A.M.", "Breakfast is served on the shuttle.", "Breakfast is served at the airport only."], correct_index: 0,
        justification: "She leaves at 5:00 A.M., but the restaurant opens at 6 A.M.",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Charity auction: items and starting bids
Item 1 — Weekend at a mountain cabin — starting bid $300
Item 2 — Signed football shirt — starting bid $150
Item 3 — Cooking class for two — starting bid $80
Item 4 — Painting by local artist Rosa Lim — starting bid $250
Bids must be increased by at least $20. Online bidding closes on Friday at 8 P.M.

DOCUMENT 2 — E-mail
To: auction@hopecharity.org
From: David Nolan
Date: Thursday
Subject: Bid on Item 4

Hello,

I would like to bid on Rosa Lim's painting. The website shows that the current highest bid is $340. I'd like to offer $350. My wife is a big fan of her work.

David Nolan`,
    questions: [
      {
        difficulty: "normal",
        question: "Why is the auction being held?",
        answers: ["To sell a company's products", "To raise money for a charity", "To close an art gallery", "To find a new artist"], correct_index: 1,
        justification: "\"Charity auction.\"",
      },
      {
        difficulty: "normal",
        question: "Which item does Mr. Nolan want?",
        answers: ["A football shirt", "A cooking class", "A painting", "A weekend at a cabin"], correct_index: 2,
        justification: "\"I would like to bid on Rosa Lim's painting.\"",
      },
      {
        difficulty: "hard",
        question: "Why does Mr. Nolan want the painting?",
        answers: ["He is an art collector.", "He knows Rosa Lim.", "It is a good investment.", "His wife likes the artist's work."], correct_index: 3,
        justification: "\"My wife is a big fan of her work.\"",
      },
      {
        difficulty: "hard",
        question: "When does online bidding close?",
        answers: ["On Friday at 8 P.M.", "On Thursday", "On Saturday morning", "When the starting bid is reached"], correct_index: 0,
        justification: "\"Online bidding closes on Friday at 8 P.M.\"",
      },
      {
        difficulty: "extreme",
        question: "What is the lowest bid Mr. Nolan can make?",
        answers: ["$350", "$360", "$340", "$270"], correct_index: 1,
        justification: "The current bid is $340, and bids must increase by at least $20: $360. His $350 is too low.",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Price list: Greenhouse Studios (photo studio rental)
Hourly rental: $50 per hour (minimum 2 hours)
Half day (4 hours): $180
Full day (8 hours): $320
Lighting kit: $40 per booking
Weekend bookings: + 20%

DOCUMENT 2 — E-mail
To: bookings@greenhousestudios.com
From: Nadia Rahman
Subject: Studio booking

Hello,

I'd like to rent the studio on Saturday, 12 October, from 9 A.M. to 1 P.M. for a photo shoot of our new jewelry collection. I'll bring my own lighting equipment.

Could you confirm the price?

Nadia Rahman`,
    questions: [
      {
        difficulty: "normal",
        question: "What does Ms. Rahman want to rent?",
        answers: ["A camera", "A meeting room", "A photo studio", "A jewelry store"], correct_index: 2,
        justification: "\"I'd like to rent the studio ... for a photo shoot.\"",
      },
      {
        difficulty: "normal",
        question: "What will Ms. Rahman photograph?",
        answers: ["Clothing", "Food", "People", "Jewelry"], correct_index: 3,
        justification: "\"A photo shoot of our new jewelry collection.\"",
      },
      {
        difficulty: "hard",
        question: "Which option is the cheapest for Ms. Rahman's booking?",
        answers: ["The half-day rate", "The hourly rate", "The full-day rate", "They all cost the same."], correct_index: 0,
        justification: "9 A.M. to 1 P.M. = 4 hours: half day $180, hourly 4 x $50 = $200.",
      },
      {
        difficulty: "hard",
        question: "Why won't Ms. Rahman pay for the lighting kit?",
        answers: ["It is free on Saturdays.", "She is bringing her own equipment.", "It is included in the half day.", "The studio has natural light."], correct_index: 1,
        justification: "\"I'll bring my own lighting equipment.\"",
      },
      {
        difficulty: "extreme",
        question: "What will the total price most likely be?",
        answers: ["$180", "$240", "$216", "$256"], correct_index: 2,
        justification: "Saturday is a weekend: $180 + 20% ($36) = $216.",
      },
    ],
  },
];
