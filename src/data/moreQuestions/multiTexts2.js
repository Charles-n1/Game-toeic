// More long-text questions with SEVERAL documents ("DOCUMENT 1 — ...", "DOCUMENT 2 — ...").
// Same fields as createQuestion (questions.js), without "section", "text" and "category" (added there).

export const MULTI_TEXTS_2 = [
  {
    text: `DOCUMENT 1 — Invitation
Free Webinar: Social Media for Small Businesses
Wednesday, 10 April, 3:00 P.M. (London time)
Speaker: Amira Haddad, founder of BrightPost Marketing
Learn how to plan a month of posts in one hour and how to measure your results.
Register at brightpost.com/webinar. A recording will be sent to everyone who registers.

DOCUMENT 2 — E-mail
To: webinars@brightpost.com
From: Daniel Ruiz
Subject: Webinar on 10 April

Hello,

I have registered for the webinar, but I live in New York, where it will be 10 A.M., and I have a meeting with a client at that time. Will I still be able to watch it later?

Also, do you offer any paid courses on the same topic?

Thanks,
Daniel Ruiz`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the webinar about?",
        answers: ["Using social media for a small business", "Starting a business in London", "Hiring marketing staff", "Building a website"], correct_index: 0,
        justification: "\"Social Media for Small Businesses.\"",
      },
      {
        difficulty: "normal",
        question: "Who is Amira Haddad?",
        answers: ["A client of Mr. Ruiz", "The founder of a marketing company", "A webinar participant", "A London journalist"], correct_index: 1,
        justification: "\"Founder of BrightPost Marketing.\"",
      },
      {
        difficulty: "hard",
        question: "Why can't Mr. Ruiz attend the webinar live?",
        answers: ["He did not register.", "He is traveling to London.", "He has a meeting at that time.", "The webinar is full."], correct_index: 2,
        justification: "\"I have a meeting with a client at that time.\"",
      },
      {
        difficulty: "hard",
        question: "What else does Mr. Ruiz want to know?",
        answers: ["The price of the webinar", "The speaker's e-mail address", "How to register", "If there are paid courses"], correct_index: 3,
        justification: "\"Do you offer any paid courses on the same topic?\"",
      },
      {
        difficulty: "extreme",
        question: "How will Mr. Ruiz most likely be able to watch the webinar?",
        answers: ["Through a recording sent after the event", "By asking the speaker to repeat it", "By attending at 3:00 P.M. New York time", "He will not be able to watch it."], correct_index: 0,
        justification: "\"A recording will be sent to everyone who registers\", and he has registered.",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Warranty information: Polar Fridge PF-200
This refrigerator is covered by a two-year warranty on all parts and labor from the date of purchase. The compressor is covered for five years (parts only).
The warranty does not cover damage caused by moving the appliance or by incorrect use.

DOCUMENT 2 — E-mail
To: support@polarappliances.com
From: Irene Costa
Date: 14 September
Subject: Fridge problem

Hello,

I bought a Polar PF-200 refrigerator on 2 March three years ago. Last week it stopped cooling, and a technician told me that the compressor is broken. Is this repair covered? I have kept my receipt.

Irene Costa`,
    questions: [
      {
        difficulty: "normal",
        question: "Why did Ms. Costa write?",
        answers: ["To order a new refrigerator", "To ask if a repair is covered", "To complain about a technician", "To ask for a receipt"], correct_index: 1,
        justification: "\"Is this repair covered?\"",
      },
      {
        difficulty: "normal",
        question: "What is wrong with Ms. Costa's refrigerator?",
        answers: ["It is too noisy.", "Its door is broken.", "It does not keep food cold.", "It uses too much electricity."], correct_index: 2,
        justification: "\"It stopped cooling.\"",
      },
      {
        difficulty: "hard",
        question: "What is NOT covered by the warranty?",
        answers: ["Parts in the first two years", "Labor in the first two years", "The compressor's parts for five years", "Damage caused by moving the fridge"], correct_index: 3,
        justification: "\"Does not cover damage caused by moving the appliance.\"",
      },
      {
        difficulty: "hard",
        question: "How old is Ms. Costa's refrigerator?",
        answers: ["About three and a half years", "Less than two years", "About five years", "Six months"], correct_index: 0,
        justification: "Bought on 2 March three years ago; she writes in September.",
      },
      {
        difficulty: "extreme",
        question: "What will most likely be covered for Ms. Costa?",
        answers: ["The part and the labor", "The compressor part, but not the labor", "Nothing at all", "A new refrigerator"], correct_index: 1,
        justification: "After two years, only the compressor is covered (for five years), \"parts only\".",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Catering menu: Olive & Thyme
Sandwich platter (serves 10): $65
Salad bowl (serves 8): $40
Fruit platter (serves 10): $35
Cookies (box of 20): $18
Minimum order: $100. Orders must be placed 48 hours in advance. Delivery: $15.

DOCUMENT 2 — E-mail
To: orders@oliveandthyme.com
From: Jason Park
Date: Monday, 9 June
Subject: Lunch order

Hi,

I'd like to order lunch for a training session on Wednesday, 11 June, for 20 people. Please send two sandwich platters and one box of cookies to our office at 42 King Street by 12 P.M.

Thanks,
Jason Park`,
    questions: [
      {
        difficulty: "normal",
        question: "What is Mr. Park ordering for?",
        answers: ["A birthday party", "A client dinner", "A training session", "A conference"], correct_index: 2,
        justification: "\"Lunch for a training session.\"",
      },
      {
        difficulty: "normal",
        question: "How far in advance must orders be placed?",
        answers: ["One week", "24 hours", "The same day", "48 hours"], correct_index: 3,
        justification: "\"Orders must be placed 48 hours in advance.\"",
      },
      {
        difficulty: "hard",
        question: "Did Mr. Park order early enough?",
        answers: ["Yes, he ordered two days before.", "No, he ordered only one day before.", "No, he needed to order a week before.", "There is no time limit."], correct_index: 0,
        justification: "He wrote on Monday for Wednesday: 48 hours in advance.",
      },
      {
        difficulty: "hard",
        question: "How much does Mr. Park's food cost before delivery?",
        answers: ["$130", "$148", "$83", "$163"], correct_index: 1,
        justification: "2 x $65 + $18 = $130 + $18 = $148.",
      },
      {
        difficulty: "extreme",
        question: "What will Mr. Park pay in total?",
        answers: ["$148", "$130", "$163", "$178"], correct_index: 2,
        justification: "$148 (over the $100 minimum) + $15 delivery = $163.",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Listing: Office space for rent
Suite 210, Maple Business Park
Size: 120 m² — 3 private offices, open-plan area for 10 desks, kitchen
Rent: $3,600 per month
Available from 1 June. Free parking for 8 cars.
Contact: Lisa Moreno, Maple Realty

DOCUMENT 2 — E-mail
To: Lisa Moreno
From: Owen Fitch, Fitch Design Studio
Subject: Suite 210

Dear Ms. Moreno,

My company is looking for a new office for our 12 employees. Suite 210 looks interesting, but we would need at least 10 parking spaces. Would it be possible to rent extra spaces nearby?

We would also like to move in by 15 May if possible.

Best regards,
Owen Fitch`,
    questions: [
      {
        difficulty: "normal",
        question: "What is being offered in the listing?",
        answers: ["An apartment for sale", "A parking garage", "A kitchen for rent", "An office for rent"], correct_index: 3,
        justification: "\"Office space for rent.\"",
      },
      {
        difficulty: "normal",
        question: "How many people work at Fitch Design Studio?",
        answers: ["12", "10", "8", "3"], correct_index: 0,
        justification: "\"Our 12 employees.\"",
      },
      {
        difficulty: "hard",
        question: "What concern does Mr. Fitch have about parking?",
        answers: ["It is too expensive.", "There are not enough spaces.", "It is too far away.", "It is not covered."], correct_index: 1,
        justification: "He needs at least 10 spaces; the suite has free parking for 8 cars.",
      },
      {
        difficulty: "hard",
        question: "How many extra parking spaces does Mr. Fitch need?",
        answers: ["At least 4", "At least 10", "At least 2", "At least 12"], correct_index: 2,
        justification: "10 needed - 8 available = 2.",
      },
      {
        difficulty: "extreme",
        question: "What other problem could there be with Mr. Fitch's request?",
        answers: ["The office is too small for 3 offices.", "The rent is per week.", "The office has no kitchen.", "The office is available only from 1 June."], correct_index: 3,
        justification: "He wants to move in by 15 May, but the suite is available from 1 June.",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Training calendar: Leadership Skills
Course 1: Giving Feedback — 4 March (full day)
Course 2: Managing Time — 11 March (morning only)
Course 3: Leading Meetings — 18 March (full day)
Course 4: Handling Conflict — 25 March (afternoon only)
Courses are open to team leaders and managers. Maximum 15 participants per course.

DOCUMENT 2 — E-mail
To: Training Department
From: Sandra Holt, Sales Manager
Subject: Registrations

Hello,

Please register my two new team leaders, Mark and Yuki, for the courses on giving feedback and handling conflict. Mark cannot attend anything in the morning on 25 March because of a client visit, but that should not be a problem.

Thanks,
Sandra Holt`,
    questions: [
      {
        difficulty: "normal",
        question: "Who can attend the courses?",
        answers: ["Team leaders and managers", "All employees", "Only new employees", "Only sales staff"], correct_index: 0,
        justification: "\"Courses are open to team leaders and managers.\"",
      },
      {
        difficulty: "normal",
        question: "Why did Ms. Holt write?",
        answers: ["To cancel a course", "To sign up two employees for training", "To become a trainer", "To complain about a course"], correct_index: 1,
        justification: "\"Please register my two new team leaders.\"",
      },
      {
        difficulty: "hard",
        question: "On which dates will Mark and Yuki attend training?",
        answers: ["11 March and 18 March", "4 March and 18 March", "4 March and 25 March", "11 March and 25 March"], correct_index: 2,
        justification: "Giving Feedback (4 March) and Handling Conflict (25 March).",
      },
      {
        difficulty: "hard",
        question: "What is the maximum number of people in a course?",
        answers: ["2", "25", "10", "15"], correct_index: 3,
        justification: "\"Maximum 15 participants per course.\"",
      },
      {
        difficulty: "extreme",
        question: "Why does Ms. Holt think Mark's client visit is not a problem?",
        answers: ["The course on 25 March is in the afternoon.", "The client visit is canceled.", "Mark does not need the course.", "Yuki will meet the client."], correct_index: 0,
        justification: "Handling Conflict on 25 March is \"afternoon only\", and his visit is in the morning.",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Notice on store door
Hillside Hardware — New Opening Hours from 1 July
Monday–Friday: 8 A.M. – 6 P.M.
Saturday: 9 A.M. – 4 P.M.
Sunday: Closed
(Previously open until 8 P.M. on weekdays and 10 A.M.–2 P.M. on Sundays)

DOCUMENT 2 — Online comment
I'm disappointed by Hillside Hardware's new hours. I work until 6 P.M. every weekday, and Sunday was the only day I had time to shop for my home projects. Now the only time I can go is on Saturday. I hope they will think again.
— Peter Ng, 8 July`,
    questions: [
      {
        difficulty: "normal",
        question: "What changed at Hillside Hardware?",
        answers: ["Its prices", "Its opening hours", "Its location", "Its owner"], correct_index: 1,
        justification: "\"New Opening Hours from 1 July.\"",
      },
      {
        difficulty: "normal",
        question: "How does Mr. Ng feel about the change?",
        answers: ["Happy", "Surprised but pleased", "Disappointed", "Not interested"], correct_index: 2,
        justification: "\"I'm disappointed by Hillside Hardware's new hours.\"",
      },
      {
        difficulty: "hard",
        question: "What is NOT true about the new hours?",
        answers: ["The store closes at 6 P.M. on weekdays.", "The store opens at 9 A.M. on Saturdays.", "The store closes earlier on weekdays than before.", "The store is open on Sundays."], correct_index: 3,
        justification: "\"Sunday: Closed.\"",
      },
      {
        difficulty: "hard",
        question: "Why did Mr. Ng usually shop on Sundays?",
        answers: ["He works on weekdays until the store closed.", "The store had sales on Sundays.", "He lives far away.", "The store was less crowded."], correct_index: 0,
        justification: "\"Sunday was the only day I had time to shop.\"",
      },
      {
        difficulty: "extreme",
        question: "What is suggested about Mr. Ng's weekday shopping before July?",
        answers: ["He shopped every evening.", "He could have shopped after work but did not.", "The store was closed when he finished work.", "He shopped during his lunch break."], correct_index: 1,
        justification: "He finishes at 6 P.M., and the store used to be open until 8 P.M., yet he says Sunday was his only time.",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Bus timetable: Route 7 (Airport — City Center)
Leaves Airport: 6:00, 6:40, 7:20, 8:00 (every 40 minutes until 22:00)
Journey time: 35 minutes
Single fare: $3.50. Day pass: $8.

DOCUMENT 2 — Text messages
Clara Diaz (7:05 A.M.): Just landed! Getting my bag now.
Mike Owens (7:06 A.M.): Great. Take the Route 7 bus, it stops right outside the office.
Clara Diaz (7:15 A.M.): Got my bag. Is the bus better than a taxi?
Mike Owens (7:16 A.M.): A taxi costs about $40. The bus is fine, and the next one leaves soon.
Clara Diaz (7:17 A.M.): OK, I'll get it. See you soon.`,
    questions: [
      {
        difficulty: "normal",
        question: "Where is Ms. Diaz at the beginning of the conversation?",
        answers: ["At the office", "On the bus", "At the airport", "At a hotel"], correct_index: 2,
        justification: "\"Just landed! Getting my bag now.\"",
      },
      {
        difficulty: "normal",
        question: "Why does Mr. Owens recommend the bus?",
        answers: ["It is faster than a taxi.", "Taxis are not available.", "It runs every five minutes.", "It is much cheaper than a taxi."], correct_index: 3,
        justification: "A taxi costs about $40; the bus costs $3.50.",
      },
      {
        difficulty: "hard",
        question: "What does Mr. Owens say about the bus?",
        answers: ["It stops near the office.", "It is often late.", "It is free for visitors.", "It goes to the hotel."], correct_index: 0,
        justification: "\"It stops right outside the office.\"",
      },
      {
        difficulty: "hard",
        question: "Which bus will Ms. Diaz most likely take?",
        answers: ["The 7:05 bus", "The 7:20 bus", "The 8:00 bus", "The 6:40 bus"], correct_index: 1,
        justification: "She is ready at 7:17; \"the next one leaves soon\": 7:20.",
      },
      {
        difficulty: "extreme",
        question: "At what time will Ms. Diaz most likely arrive in the city center?",
        answers: ["7:20 A.M.", "8:35 A.M.", "7:55 A.M.", "7:40 A.M."], correct_index: 2,
        justification: "7:20 + 35 minutes = 7:55 A.M.",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Price list: Fresco Paper Co.
Copy paper, A4, box of 5 reams: $24
Orders of 10–49 boxes: 5% discount
Orders of 50 boxes or more: 10% discount
Free delivery for orders of 20 boxes or more.

DOCUMENT 2 — Purchase order
To: Fresco Paper Co.
From: Linden Accounting
Date: 3 February
Item: Copy paper, A4, box of 5 reams
Quantity: 40 boxes
Delivery address: 18 Linden Road, 2nd floor
Notes: Please deliver before 10 February. Our office is closed on Saturdays.`,
    questions: [
      {
        difficulty: "normal",
        question: "What did Linden Accounting order?",
        answers: ["Envelopes", "Printers", "Notebooks", "Copy paper"], correct_index: 3,
        justification: "\"Copy paper, A4.\"",
      },
      {
        difficulty: "normal",
        question: "What does the purchase order ask?",
        answers: ["Delivery before a certain date", "A free sample", "A special color", "Delivery on Saturday"], correct_index: 0,
        justification: "\"Please deliver before 10 February.\"",
      },
      {
        difficulty: "hard",
        question: "What discount will Linden Accounting receive?",
        answers: ["10%", "5%", "No discount", "15%"], correct_index: 1,
        justification: "40 boxes is between 10 and 49: 5%.",
      },
      {
        difficulty: "hard",
        question: "How much will delivery cost?",
        answers: ["$24", "$10", "Nothing", "It depends on the day"], correct_index: 2,
        justification: "Free delivery for 20 boxes or more; they ordered 40.",
      },
      {
        difficulty: "extreme",
        question: "What is the total price of the order?",
        answers: ["$960", "$864", "$936", "$912"], correct_index: 3,
        justification: "40 x $24 = $960, minus 5% ($48) = $912.",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Information for participants
Medical Technology Congress — Vienna, 22–24 September
Special rates have been reserved at two hotels:
Hotel Danube (5-minute walk from the venue): €165 per night
Parkhotel Mira (20 minutes by tram): €120 per night
Use the code MTC24 when booking. Special rates are available until 15 August.

DOCUMENT 2 — E-mail
To: reservations@parkhotelmira.at
From: Dr. Eva Lindgren
Date: 1 August
Subject: Booking for the Medical Technology Congress

Hello,

I would like to book a single room from 21 to 24 September (three nights) using the congress code MTC24. I prefer a quieter location and don't mind taking public transport.

Best regards,
Dr. Eva Lindgren`,
    questions: [
      {
        difficulty: "normal",
        question: "Where will the congress take place?",
        answers: ["In Vienna", "In Stockholm", "At Parkhotel Mira", "Online"], correct_index: 0,
        justification: "\"Medical Technology Congress — Vienna.\"",
      },
      {
        difficulty: "normal",
        question: "What must participants use to get the special rate?",
        answers: ["A membership card", "A code", "A student ID", "A coupon"], correct_index: 1,
        justification: "\"Use the code MTC24 when booking.\"",
      },
      {
        difficulty: "hard",
        question: "Why did Dr. Lindgren choose Parkhotel Mira?",
        answers: ["It is closer to the venue.", "It has a pool.", "She prefers a quiet place.", "Her colleagues are staying there."], correct_index: 2,
        justification: "\"I prefer a quieter location and don't mind taking public transport.\"",
      },
      {
        difficulty: "hard",
        question: "Will Dr. Lindgren get the special rate?",
        answers: ["No, she booked too late.", "No, the code is only for Hotel Danube.", "No, she booked too many nights.", "Yes, she booked before the deadline."], correct_index: 3,
        justification: "She wrote on 1 August; special rates are available until 15 August.",
      },
      {
        difficulty: "extreme",
        question: "How much will Dr. Lindgren's room cost in total?",
        answers: ["€360", "€495", "€480", "€330"], correct_index: 0,
        justification: "3 nights x €120 = €360.",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Internship advertisement
Summer Internship — Greenleaf Foods (Marketing Department)
Duration: 10 weeks, from 16 June to 22 August
Open to university students in their second or third year of a business or marketing degree.
Interns receive a monthly payment of $1,500 and free lunch in the staff cafeteria.
Apply by 30 April.

DOCUMENT 2 — E-mail
To: internships@greenleaffoods.com
From: Sophie Turner
Date: 28 April
Subject: Summer internship

Dear Hiring Team,

I am a first-year student in marketing at Bristol University, and I would love to join your summer internship. Last summer, I worked part-time at a supermarket, where I helped organize product promotions.

I have attached my CV. I can start any time after my exams end on 10 June.

Sincerely,
Sophie Turner`,
    questions: [
      {
        difficulty: "normal",
        question: "How long is the internship?",
        answers: ["Six months", "Ten weeks", "One year", "Two weeks"], correct_index: 1,
        justification: "\"Duration: 10 weeks.\"",
      },
      {
        difficulty: "normal",
        question: "What do interns receive besides a monthly payment?",
        answers: ["A company car", "Free housing", "Free lunch", "A laptop"], correct_index: 2,
        justification: "\"Free lunch in the staff cafeteria.\"",
      },
      {
        difficulty: "hard",
        question: "What experience does Ms. Turner mention?",
        answers: ["Working at Greenleaf Foods", "Teaching marketing", "Organizing exams", "Helping with promotions in a supermarket"], correct_index: 3,
        justification: "\"I helped organize product promotions.\"",
      },
      {
        difficulty: "hard",
        question: "Is Ms. Turner available for the full internship?",
        answers: ["Yes, her exams end before it starts.", "No, her exams end after it starts.", "No, she works at a supermarket.", "No, she will be in Bristol."], correct_index: 0,
        justification: "Her exams end on 10 June; the internship starts on 16 June.",
      },
      {
        difficulty: "extreme",
        question: "Why might Ms. Turner's application be refused?",
        answers: ["She applied after the deadline.", "She is not in her second or third year.", "She is not studying marketing.", "She has no work experience."], correct_index: 1,
        justification: "It is open to second- or third-year students; she is \"a first-year student\". (She applied on time, on 28 April.)",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Electricity bill
Northgrid Energy — Account 77-4120 — Customer: Martin Lowe
Billing period: 1 January – 31 January
Electricity used: 820 kWh (December: 410 kWh)
Price per kWh: $0.20
Amount due: $164.00

DOCUMENT 2 — E-mail
To: billing@northgrid.com
From: Martin Lowe
Subject: January bill

Hello,

My January bill is twice as high as my December bill, although nothing has changed in my home. I think the meter reading might be wrong. Could someone check it?

Also, I was away on vacation for the first week of January, so I expected the bill to be lower, not higher.

Martin Lowe`,
    questions: [
      {
        difficulty: "normal",
        question: "Why did Mr. Lowe write?",
        answers: ["He wants to change his address.", "He is moving.", "He thinks his bill is wrong.", "He wants to pay online."], correct_index: 2,
        justification: "\"I think the meter reading might be wrong.\"",
      },
      {
        difficulty: "normal",
        question: "What does Mr. Lowe ask the company to do?",
        answers: ["Cancel his account", "Send a new meter", "Lower the price per kWh", "Check the meter reading"], correct_index: 3,
        justification: "\"Could someone check it?\"",
      },
      {
        difficulty: "hard",
        question: "How much was Mr. Lowe's December bill, at the same price?",
        answers: ["$82", "$164", "$41", "$120"], correct_index: 0,
        justification: "410 kWh x $0.20 = $82.",
      },
      {
        difficulty: "hard",
        question: "How much more electricity did Mr. Lowe use in January than in December?",
        answers: ["820 kWh", "410 kWh", "164 kWh", "205 kWh"], correct_index: 1,
        justification: "820 - 410 = 410 kWh: twice as much.",
      },
      {
        difficulty: "extreme",
        question: "Why does Mr. Lowe find the January bill especially strange?",
        answers: ["The price per kWh changed.", "He bought new appliances.", "He was not at home for part of the month.", "He paid in advance."], correct_index: 2,
        justification: "\"I was away on vacation for the first week of January.\"",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Notice
Oakdale Leisure Center — Holiday Hours
24 December: 7 A.M. – 2 P.M.
25–26 December: Closed
27–30 December: 8 A.M. – 6 P.M.
31 December: 7 A.M. – 2 P.M.
1 January: Closed
Group classes will not run between 24 December and 1 January. The pool will be closed for cleaning on 27 and 28 December.

DOCUMENT 2 — E-mail
To: info@oakdaleleisure.com
From: Rachel Dunn
Subject: Holiday visit

Hello,

My family and I will be visiting my parents in Oakdale from 26 to 29 December. We would like to go swimming together one afternoon. Which day would be best? Can visitors buy a day pass?

Thanks,
Rachel Dunn`,
    questions: [
      {
        difficulty: "normal",
        question: "What does the notice describe?",
        answers: ["New prices", "A swimming competition", "Classes for children", "Opening times during the holidays"], correct_index: 3,
        justification: "\"Holiday Hours.\"",
      },
      {
        difficulty: "normal",
        question: "What will NOT take place between 24 December and 1 January?",
        answers: ["Group classes", "Swimming", "Gym sessions", "Day pass sales"], correct_index: 0,
        justification: "\"Group classes will not run between 24 December and 1 January.\"",
      },
      {
        difficulty: "hard",
        question: "What does Ms. Dunn want to do?",
        answers: ["Take a group class", "Go swimming with her family", "Become a member", "Book a party"], correct_index: 1,
        justification: "\"We would like to go swimming together one afternoon.\"",
      },
      {
        difficulty: "hard",
        question: "Why is the pool closed on 27 and 28 December?",
        answers: ["For a competition", "Because of the holidays", "For cleaning", "For repairs to the roof"], correct_index: 2,
        justification: "\"The pool will be closed for cleaning on 27 and 28 December.\"",
      },
      {
        difficulty: "extreme",
        question: "Which day would most likely be best for Ms. Dunn's family to swim?",
        answers: ["26 December", "27 December", "28 December", "29 December"], correct_index: 3,
        justification: "They visit from 26 to 29 December; the center is closed on the 26th and the pool on the 27th and 28th.",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Article
NovaTech Launches New Smartwatch
NovaTech has launched the Pulse 3, a smartwatch with a battery that lasts up to ten days, twice as long as the previous model. The watch also measures sleep quality and can be used to pay in stores. It costs $249 and comes in three colors.

DOCUMENT 2 — Customer review
★★★☆☆ — Pulse 3
I bought the Pulse 3 mainly because of the long battery life, but I only get about six days with normal use. The sleep tracking is impressive and the payment feature works well. However, the watch strap broke after just one month. Good watch, but not perfect for the price.
— Kim L.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the article about?",
        answers: ["A new smartwatch", "A new phone", "A sleep clinic", "A payment app"], correct_index: 0,
        justification: "\"NovaTech has launched the Pulse 3, a smartwatch.\"",
      },
      {
        difficulty: "normal",
        question: "Why did Kim buy the Pulse 3?",
        answers: ["For its low price", "For its long battery life", "For its color", "For its strap"], correct_index: 1,
        justification: "\"I bought the Pulse 3 mainly because of the long battery life.\"",
      },
      {
        difficulty: "hard",
        question: "What problem did Kim have?",
        answers: ["The payment feature failed.", "The screen cracked.", "The strap broke.", "The sleep tracking did not work."], correct_index: 2,
        justification: "\"The watch strap broke after just one month.\"",
      },
      {
        difficulty: "hard",
        question: "How long did the previous model's battery last?",
        answers: ["Up to ten days", "Up to six days", "Up to twenty days", "Up to five days"], correct_index: 3,
        justification: "The Pulse 3 lasts up to ten days, \"twice as long as the previous model\": up to five.",
      },
      {
        difficulty: "extreme",
        question: "What does Kim's review suggest about the article's information?",
        answers: ["The battery does not last as long as announced.", "The watch is cheaper than announced.", "The watch cannot be used to pay.", "The watch does not measure sleep."], correct_index: 0,
        justification: "The article says up to ten days; Kim gets about six days.",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Ticket information: City Jazz Festival (Saturday, 21 June)
Adult: $45
Student (with valid ID): $30
Children under 12: free (must be with an adult)
Groups of 10 or more: 20% off adult tickets
Gates open at 2 P.M. No food or drinks may be brought in.

DOCUMENT 2 — E-mail
To: tickets@cityjazzfest.com
From: Henry Wilson
Subject: Group tickets

Hello,

I'm organizing a trip to the festival for our company's social club. We are 12 adults, and two of them will bring their children, aged 8 and 10. Could you tell me the total price?

Also, can we bring a picnic?

Henry Wilson`,
    questions: [
      {
        difficulty: "normal",
        question: "Who is Mr. Wilson organizing the trip for?",
        answers: ["A school", "A company social club", "A family", "A jazz band"], correct_index: 1,
        justification: "\"Our company's social club.\"",
      },
      {
        difficulty: "normal",
        question: "What time do the gates open?",
        answers: ["12 P.M.", "6 P.M.", "2 P.M.", "10 A.M."], correct_index: 2,
        justification: "\"Gates open at 2 P.M.\"",
      },
      {
        difficulty: "hard",
        question: "What will the children pay?",
        answers: ["$30 each", "$45 each", "$36 each", "Nothing"], correct_index: 3,
        justification: "They are 8 and 10: \"Children under 12: free.\"",
      },
      {
        difficulty: "hard",
        question: "What is the answer to Mr. Wilson's question about a picnic?",
        answers: ["Bringing food is not allowed.", "Picnics are allowed.", "Only drinks are allowed.", "Picnics cost extra."], correct_index: 0,
        justification: "\"No food or drinks may be brought in.\"",
      },
      {
        difficulty: "extreme",
        question: "What will the group most likely pay in total?",
        answers: ["$540", "$432", "$468", "$360"], correct_index: 1,
        justification: "12 adults x $45 = $540, minus 20% ($108) = $432. Children are free.",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Memo
To: Department heads
From: IT Department
Re: New e-mail software

The new e-mail software will be installed department by department:
Finance — 3 March
Human Resources — 5 March
Sales — 10 March
Marketing — 12 March
On the installation day, employees will not have access to e-mail between 9 A.M. and 11 A.M. A one-hour training session will be held the day before installation for each department.

DOCUMENT 2 — E-mail
To: IT Department
From: Paolo Bruni, Sales Director
Subject: Installation date

Hello,

The installation date for my department is a problem, because we have our biggest client presentation that morning and we will need e-mail. Could we change dates with Marketing? I have checked with their director, who agrees.

Paolo Bruni`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the memo about?",
        answers: ["A new e-mail address", "A training course on sales", "The schedule for installing new software", "A client presentation"], correct_index: 2,
        justification: "\"The new e-mail software will be installed department by department.\"",
      },
      {
        difficulty: "normal",
        question: "What will happen on the installation day?",
        answers: ["Computers will be replaced.", "Employees will work from home.", "The office will close.", "E-mail will not work for two hours."], correct_index: 3,
        justification: "\"Employees will not have access to e-mail between 9 A.M. and 11 A.M.\"",
      },
      {
        difficulty: "hard",
        question: "When is the sales department's client presentation?",
        answers: ["On the morning of 10 March", "On the morning of 12 March", "On 3 March", "On 9 March"], correct_index: 0,
        justification: "It is on the installation day for Sales: 10 March.",
      },
      {
        difficulty: "hard",
        question: "What has Mr. Bruni already done?",
        answers: ["Moved the client presentation", "Talked to the marketing director", "Attended the training", "Installed the software"], correct_index: 1,
        justification: "\"I have checked with their director, who agrees.\"",
      },
      {
        difficulty: "extreme",
        question: "If the change is accepted, when will the sales team's training take place?",
        answers: ["On 9 March", "On 12 March", "On 11 March", "On 10 March"], correct_index: 2,
        justification: "Sales would be installed on 12 March, and training is held the day before: 11 March.",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Sign at City Center Parking Garage
Rates
Up to 1 hour: $3
1–3 hours: $7
3–6 hours: $12
More than 6 hours: $20 (daily maximum)
Evening rate (enter after 6 P.M., leave before 2 A.M.): $5
Monthly pass: $160

DOCUMENT 2 — E-mail
To: info@citycenterparking.com
From: Nina Patel
Subject: Parking

Hello,

I have just started a new job near your garage. I work Monday to Friday from 9 A.M. to 5:30 P.M., so I would park for about nine hours a day. Would the monthly pass be cheaper for me than paying every day?

Also, is the garage open on weekends?

Thank you,
Nina Patel`,
    questions: [
      {
        difficulty: "normal",
        question: "Why did Ms. Patel write?",
        answers: ["To complain about a fine", "To apply for a job", "To report a damaged car", "To ask about parking costs"], correct_index: 3,
        justification: "\"Would the monthly pass be cheaper for me?\"",
      },
      {
        difficulty: "normal",
        question: "How much does it cost to park for two hours?",
        answers: ["$7", "$3", "$12", "$5"], correct_index: 0,
        justification: "\"1–3 hours: $7.\"",
      },
      {
        difficulty: "hard",
        question: "How much would Ms. Patel pay for one working day without a pass?",
        answers: ["$12", "$20", "$9", "$5"], correct_index: 1,
        justification: "About nine hours: more than 6 hours = $20 (daily maximum).",
      },
      {
        difficulty: "hard",
        question: "Why can't Ms. Patel use the evening rate on workdays?",
        answers: ["She works on weekends.", "She leaves after 2 A.M.", "She arrives before 6 P.M.", "It is only for monthly pass holders."], correct_index: 2,
        justification: "The evening rate is for cars entering after 6 P.M.; she arrives before 9 A.M.",
      },
      {
        difficulty: "extreme",
        question: "Would the monthly pass save Ms. Patel money in a month with 20 working days?",
        answers: ["No, it would cost $40 more", "Yes, about $40", "No, the price is the same", "Yes, about $240"], correct_index: 3,
        justification: "20 days x $20 = $400; the pass costs $160: she saves $240.",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Shipping rates: SpeedPost International
Packages up to 2 kg — Europe: $25, Asia: $40, Americas: $45
Packages 2–5 kg — Europe: $45, Asia: $70, Americas: $80
Express delivery (2 days): +50%
Insurance: 2% of the declared value

DOCUMENT 2 — E-mail
To: SpeedPost Customer Service
From: Jonas Weber
Subject: Shipping quote

Hello,

I need to send a package weighing 3.5 kg from Berlin to a customer in Tokyo. It contains camera equipment worth $1,000, so I would like to insure it. Standard delivery is fine, as there is no rush.

Could you confirm the total price?

Jonas Weber`,
    questions: [
      {
        difficulty: "normal",
        question: "Where is Mr. Weber sending the package?",
        answers: ["To Asia", "To Europe", "To the Americas", "To Berlin"], correct_index: 0,
        justification: "\"To a customer in Tokyo.\"",
      },
      {
        difficulty: "normal",
        question: "What is in the package?",
        answers: ["Books", "Camera equipment", "Clothing", "Documents"], correct_index: 1,
        justification: "\"It contains camera equipment.\"",
      },
      {
        difficulty: "hard",
        question: "What is the shipping price for Mr. Weber's package before insurance?",
        answers: ["$40", "$105", "$70", "$45"], correct_index: 2,
        justification: "3.5 kg (2–5 kg category) to Asia = $70, with standard delivery.",
      },
      {
        difficulty: "hard",
        question: "How much will the insurance cost?",
        answers: ["$2", "$10", "$70", "$20"], correct_index: 3,
        justification: "2% of $1,000 = $20.",
      },
      {
        difficulty: "extreme",
        question: "What will the total price most likely be?",
        answers: ["$90", "$125", "$60", "$105"], correct_index: 0,
        justification: "$70 (shipping) + $20 (insurance) = $90. No express charge.",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Museum announcement
New exhibition: "The Human Body" — Science Discovery Museum
From 1 March to 30 June
This interactive exhibition shows how the human body works through models, videos, and games.
Recommended for ages 8 and up. Some videos may not be suitable for younger children.
Tickets: $12 adults, $8 children (4–16), free for children under 4.

DOCUMENT 2 — E-mail
To: info@sciencediscovery.org
From: Maria Santos
Subject: The Human Body exhibition

Hello,

I would like to visit the new exhibition with my two children, aged 5 and 9, during the Easter holidays. Is the exhibition suitable for my younger child? Also, is there a café in the museum?

Thank you,
Maria Santos`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the exhibition about?",
        answers: ["The history of medicine", "How the human body works", "Animals", "Space"], correct_index: 1,
        justification: "\"Shows how the human body works.\"",
      },
      {
        difficulty: "normal",
        question: "How long will the exhibition last?",
        answers: ["One month", "Two weeks", "About four months", "One year"], correct_index: 2,
        justification: "From 1 March to 30 June.",
      },
      {
        difficulty: "hard",
        question: "Why is Ms. Santos concerned about her younger child?",
        answers: ["Children under 6 cannot enter.", "Tickets are expensive for children.", "The exhibition is too long.", "The exhibition is recommended for ages 8 and up."], correct_index: 3,
        justification: "Her child is 5; it is \"recommended for ages 8 and up\".",
      },
      {
        difficulty: "hard",
        question: "What else does Ms. Santos ask about?",
        answers: ["A café", "Parking", "Guided tours", "Opening hours"], correct_index: 0,
        justification: "\"Is there a café in the museum?\"",
      },
      {
        difficulty: "extreme",
        question: "How much will Ms. Santos pay for tickets for herself and her children?",
        answers: ["$20", "$28", "$36", "$24"], correct_index: 1,
        justification: "Adult $12 + two children (5 and 9, aged 4–16) x $8 = $12 + $16 = $28.",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Workshop agenda: Writing Better Reports
9:00 — Introduction
9:30 — Planning your report
10:30 — Coffee break
10:45 — Writing clear summaries
12:00 — Lunch
1:00 — Using charts and tables
2:30 — Practice exercise
3:30 — End

DOCUMENT 2 — Feedback form
Name: Lucy Grant
Which session did you find most useful? The session after lunch. I often have to present sales figures, and I learned some simple ways to make them easier to read.
What could be improved? The practice exercise was too short; we did not have time to finish.
Would you recommend this workshop? Yes.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the workshop about?",
        answers: ["Selling products", "Using software", "Writing reports", "Giving presentations"], correct_index: 2,
        justification: "\"Writing Better Reports.\"",
      },
      {
        difficulty: "normal",
        question: "Would Ms. Grant recommend the workshop?",
        answers: ["No", "Only the morning sessions", "She did not say", "Yes"], correct_index: 3,
        justification: "\"Would you recommend this workshop? Yes.\"",
      },
      {
        difficulty: "hard",
        question: "Which session did Ms. Grant find most useful?",
        answers: ["Using charts and tables", "Planning your report", "Writing clear summaries", "Introduction"], correct_index: 0,
        justification: "The session after lunch (1:00) is \"Using charts and tables\".",
      },
      {
        difficulty: "hard",
        question: "Why was that session useful for Ms. Grant?",
        answers: ["She plans long reports.", "She often presents sales figures.", "She writes summaries every day.", "She teaches workshops."], correct_index: 1,
        justification: "\"I often have to present sales figures.\"",
      },
      {
        difficulty: "extreme",
        question: "What does Ms. Grant suggest changing?",
        answers: ["Making the lunch break shorter", "Removing the coffee break", "Giving more time for the practice activity", "Starting earlier"], correct_index: 2,
        justification: "\"The practice exercise was too short; we did not have time to finish.\"",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Service menu: QuickFix Auto
Oil change: $55
Tire rotation: $30
Brake inspection: $40 (free with any oil change)
Air conditioning check: $65
Car wash: $15

DOCUMENT 2 — Invoice
QuickFix Auto — Invoice #4418
Customer: Alan Brooks
Oil change — $55
Brake inspection — $40
Air conditioning check — $65
Total: $160`,
    questions: [
      {
        difficulty: "normal",
        question: "What type of business is QuickFix Auto?",
        answers: ["A car rental company", "A gas station", "A car dealer", "A car service center"], correct_index: 3,
        justification: "It offers oil changes, tire rotations and inspections.",
      },
      {
        difficulty: "normal",
        question: "Which service did Mr. Brooks NOT receive?",
        answers: ["A tire rotation", "An oil change", "A brake inspection", "An air conditioning check"], correct_index: 0,
        justification: "The invoice lists an oil change, a brake inspection and an air conditioning check.",
      },
      {
        difficulty: "hard",
        question: "What is the cheapest service on the menu?",
        answers: ["A tire rotation", "A car wash", "A brake inspection", "An oil change"], correct_index: 1,
        justification: "Car wash: $15.",
      },
      {
        difficulty: "hard",
        question: "What mistake does the invoice contain?",
        answers: ["The oil change price is wrong.", "The air conditioning check was not done.", "The brake inspection should have been free.", "There is no mistake."], correct_index: 2,
        justification: "The brake inspection is \"free with any oil change\", and Mr. Brooks had an oil change.",
      },
      {
        difficulty: "extreme",
        question: "What should the correct total be?",
        answers: ["$160", "$135", "$105", "$120"], correct_index: 3,
        justification: "$55 + $0 (free inspection) + $65 = $120.",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Course information: Lingua Institute (German)
A1 (Beginner) — Mondays and Wednesdays, 6–8 P.M.
A2 (Elementary) — Tuesdays and Thursdays, 6–8 P.M.
B1 (Intermediate) — Mondays and Wednesdays, 7–9 P.M.
B2 (Upper intermediate) — Saturdays, 10 A.M.–2 P.M.
New students who have studied German before must take a free online placement test.

DOCUMENT 2 — E-mail
To: Kai Jensen
From: Lingua Institute
Subject: Your placement test result

Dear Mr. Jensen,

Thank you for taking our placement test. Your result shows that you are at the B1 level. We would therefore recommend our intermediate course. Courses begin on 7 October. Please confirm your registration by 30 September.

Lingua Institute`,
    questions: [
      {
        difficulty: "normal",
        question: "Why did Lingua Institute write to Mr. Jensen?",
        answers: ["To give him his test result", "To cancel his course", "To offer him a job", "To ask for payment"], correct_index: 0,
        justification: "\"Thank you for taking our placement test. Your result shows ...\"",
      },
      {
        difficulty: "normal",
        question: "When do the courses start?",
        answers: ["On 30 September", "On 7 October", "On 1 October", "On 7 September"], correct_index: 1,
        justification: "\"Courses begin on 7 October.\"",
      },
      {
        difficulty: "hard",
        question: "What is suggested about Mr. Jensen?",
        answers: ["He is a German teacher.", "He has never studied a language.", "He has studied German before.", "He lives in Germany."], correct_index: 2,
        justification: "Only students who have studied German before take the placement test.",
      },
      {
        difficulty: "hard",
        question: "On which days will Mr. Jensen's classes most likely be?",
        answers: ["Tuesdays and Thursdays", "Saturdays", "Mondays and Thursdays", "Mondays and Wednesdays"], correct_index: 3,
        justification: "B1 (Intermediate): Mondays and Wednesdays.",
      },
      {
        difficulty: "extreme",
        question: "At what time will Mr. Jensen's classes end?",
        answers: ["9 P.M.", "8 P.M.", "2 P.M.", "6 P.M."], correct_index: 0,
        justification: "B1 classes run from 7 to 9 P.M.",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Company newsletter
Promotions This Month
We are pleased to announce that Laura Kim has been promoted to Head of Product Design. Laura joined us six years ago as a junior designer and led the design of our award-winning Breeze fan. She will now manage a team of 14 designers.
Also, David Moss has been promoted to Senior Accountant.

DOCUMENT 2 — E-mail
To: Laura Kim
From: Ben Carter
Subject: Congratulations!

Hi Laura,

Congratulations on your new role! I still remember when we were both junior designers on our first day. The Breeze project was a great success, and I'm sure you'll do a fantastic job leading the team. I'm looking forward to working for you!

Ben`,
    questions: [
      {
        difficulty: "normal",
        question: "What is Laura Kim's new position?",
        answers: ["Senior Accountant", "Head of Product Design", "Junior Designer", "Sales Director"], correct_index: 1,
        justification: "\"Promoted to Head of Product Design.\"",
      },
      {
        difficulty: "normal",
        question: "Why did Ben Carter write?",
        answers: ["To apply for a promotion", "To complain about a project", "To congratulate a colleague", "To leave the company"], correct_index: 2,
        justification: "\"Congratulations on your new role!\"",
      },
      {
        difficulty: "hard",
        question: "How many people will Ms. Kim manage?",
        answers: ["6", "1", "24", "14"], correct_index: 3,
        justification: "\"She will now manage a team of 14 designers.\"",
      },
      {
        difficulty: "hard",
        question: "What was Ms. Kim's most famous project?",
        answers: ["The Breeze fan", "A new accounting system", "A training program", "A company newsletter"], correct_index: 0,
        justification: "\"Led the design of our award-winning Breeze fan.\"",
      },
      {
        difficulty: "extreme",
        question: "What is suggested about Ben Carter?",
        answers: ["He is a senior accountant.", "He is a designer who joined the company six years ago.", "He is Ms. Kim's manager.", "He is leaving the design team."], correct_index: 1,
        justification: "They were both junior designers on their first day (six years ago), and he will now work for her.",
      },
    ],
  },
  {
    text: `DOCUMENT 1 — Rental agreement (extract)
Tenant: Michael Grant — Apartment 4B, 22 Oak Street
Monthly rent: $1,300, due on the 1st of each month
Lease period: 1 January – 31 December
Early termination: the tenant must give 60 days' written notice and pay a fee equal to one month's rent.

DOCUMENT 2 — E-mail
To: Oak Street Properties
From: Michael Grant
Date: 1 July
Subject: Ending my lease early

Hello,

I have accepted a job in another city, and I need to move out of my apartment. I would like to end my lease as soon as possible. Please let me know the earliest date I can leave and how much I will need to pay.

Michael Grant`,
    questions: [
      {
        difficulty: "normal",
        question: "Why does Mr. Grant want to leave his apartment?",
        answers: ["The rent is too high.", "He bought a house.", "He has a new job in another city.", "The apartment is too small."], correct_index: 2,
        justification: "\"I have accepted a job in another city.\"",
      },
      {
        difficulty: "normal",
        question: "When does the lease normally end?",
        answers: ["1 July", "1 January", "30 June", "31 December"], correct_index: 3,
        justification: "\"Lease period: 1 January – 31 December.\"",
      },
      {
        difficulty: "hard",
        question: "How much is the early termination fee?",
        answers: ["$1,300", "$2,600", "$650", "Nothing"], correct_index: 0,
        justification: "\"A fee equal to one month's rent\": $1,300.",
      },
      {
        difficulty: "hard",
        question: "What must Mr. Grant give the landlord?",
        answers: ["A new tenant", "Written notice 60 days in advance", "The keys on 1 July", "A letter from his employer"], correct_index: 1,
        justification: "\"The tenant must give 60 days' written notice.\"",
      },
      {
        difficulty: "extreme",
        question: "What is the earliest date Mr. Grant can most likely end his lease?",
        answers: ["1 July", "31 December", "Around the end of August", "Mid-July"], correct_index: 2,
        justification: "He gave notice on 1 July; 60 days later is around 30 August.",
      },
    ],
  },
];
