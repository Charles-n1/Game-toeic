// More long-text questions (reading comprehension): one document + its questions.
// Same fields as createQuestion (questions.js), without "section", "text" and "category" (added there).

export const READING_TEXTS_4 = [
  {
    text: `Share a Ride to Work!

Our new car-sharing program helps employees who live in the same area travel to work together. Simply register on the intranet, enter your address and working hours, and the system will suggest colleagues who live near you.

Employees who share a car at least three days a week will receive a free parking space in the company garage. Sharing a ride saves money and reduces traffic.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the notice about?",
        answers: ["A program for sharing rides to work", "A new company car", "A bus service for employees", "Higher parking fees"], correct_index: 0,
        justification: "\"Our new car-sharing program helps employees ... travel to work together.\"",
      },
      {
        difficulty: "hard",
        question: "How does the system help employees?",
        answers: ["It sells cars at a discount.", "It suggests colleagues who live nearby.", "It pays for fuel.", "It plans the fastest route."], correct_index: 1,
        justification: "\"The system will suggest colleagues who live near you.\"",
      },
      {
        difficulty: "extreme",
        question: "What will employees who share a car three days a week receive?",
        answers: ["Extra vacation days", "A higher salary", "A free place to park", "A new car"], correct_index: 2,
        justification: "\"Will receive a free parking space in the company garage.\"",
      },
    ],
  },
  {
    text: `Dear Sales Team,

On 10 March, I placed an order (#5520) for 300 notebooks with our company logo. Unfortunately, our event has been canceled, and we no longer need them.

If production has not yet started, could you please cancel the order and refund the deposit of $150 we paid? If it is too late to cancel, please let me know, and we will discuss other options.

Best regards,
Ines Moreau, Marketing Assistant`,
    questions: [
      {
        difficulty: "normal",
        question: "What does Ms. Moreau want to do?",
        answers: ["Order more notebooks", "Change the logo", "Complain about quality", "Cancel an order"], correct_index: 3,
        justification: "\"Could you please cancel the order.\"",
      },
      {
        difficulty: "hard",
        question: "Why are the notebooks no longer needed?",
        answers: ["An event has been canceled.", "The logo has changed.", "They are too expensive.", "They arrived late."], correct_index: 0,
        justification: "\"Our event has been canceled.\"",
      },
      {
        difficulty: "extreme",
        question: "What is suggested about the order?",
        answers: ["It has already been delivered.", "It may be too late to stop it.", "It was paid in full.", "It was for 150 notebooks."], correct_index: 1,
        justification: "\"If production has not yet started ... If it is too late to cancel, please let me know.\"",
      },
    ],
  },
  {
    text: `Language Exchange Evenings

Want to practice a foreign language in a relaxed way? Join our language exchange evenings every Wednesday from 7 to 9 P.M. at the Blue Door Café.

Participants are matched with partners who want to learn their language: for example, an English speaker learning Spanish meets a Spanish speaker learning English. Each pair spends half the time speaking each language. Entry is free, but participants are asked to buy a drink.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is being advertised?",
        answers: ["A language school", "A new café", "Events to practice languages", "A translation service"], correct_index: 2,
        justification: "\"Join our language exchange evenings.\"",
      },
      {
        difficulty: "hard",
        question: "How are partners chosen?",
        answers: ["By age", "By level of English", "At random", "Each person learns the other's language."], correct_index: 3,
        justification: "\"Matched with partners who want to learn their language.\"",
      },
      {
        difficulty: "extreme",
        question: "What are participants expected to do?",
        answers: ["Buy something to drink", "Pay an entry fee", "Bring a dictionary", "Register online in advance"], correct_index: 0,
        justification: "\"Entry is free, but participants are asked to buy a drink.\"",
      },
    ],
  },
  {
    text: `Bakery Chain Launches Seasonal Flavor

Crumbly's, a chain of 120 bakeries, has launched a pumpkin and cinnamon muffin for the autumn season. The muffin was chosen by customers in an online vote, beating four other flavors.

The muffin will be available until the end of November. Crumbly's said that last year's seasonal product, an apple pie, sold out in many stores within days, so this year it has increased production by 50%.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the article about?",
        answers: ["A new bakery opening", "A new seasonal product", "A cooking competition", "A rise in flour prices"], correct_index: 1,
        justification: "\"Has launched a pumpkin and cinnamon muffin for the autumn season.\"",
      },
      {
        difficulty: "hard",
        question: "How was the flavor chosen?",
        answers: ["The head baker chose it.", "It won a competition.", "Customers voted online.", "It was last year's best seller."], correct_index: 2,
        justification: "\"Chosen by customers in an online vote.\"",
      },
      {
        difficulty: "extreme",
        question: "Why has Crumbly's increased production this year?",
        answers: ["It has opened more stores.", "Pumpkins are cheaper this year.", "The muffin will be sold all year.", "Last year's seasonal product sold out quickly."], correct_index: 3,
        justification: "\"Last year's seasonal product ... sold out in many stores within days.\"",
      },
    ],
  },
  {
    text: `Lucas Grant (4:40 P.M.): Hi Mei, the supplier says they haven't been paid for invoice 7781 yet.
Mei Wong (4:42 P.M.): It's waiting for approval from the department head.
Lucas Grant (4:43 P.M.): Mr. Patel is on vacation until Monday.
Mei Wong (4:45 P.M.): Then Ms. Russo can approve it. She's covering for him this week.
Lucas Grant (4:46 P.M.): Great, I'll send it to her now.`,
    questions: [
      {
        difficulty: "normal",
        question: "What problem is being discussed?",
        answers: ["An invoice has not been paid.", "A supplier sent the wrong items.", "Mr. Patel lost an invoice.", "A meeting was canceled."], correct_index: 0,
        justification: "\"The supplier says they haven't been paid for invoice 7781 yet.\"",
      },
      {
        difficulty: "hard",
        question: "At 4:43 P.M., why does Mr. Grant write, \"Mr. Patel is on vacation until Monday\"?",
        answers: ["To ask Ms. Wong to call Mr. Patel", "To explain why the approval could be delayed", "To complain about Mr. Patel", "To request vacation days"], correct_index: 1,
        justification: "The invoice waits for the department head, who is away.",
      },
      {
        difficulty: "extreme",
        question: "What will Mr. Grant most likely do next?",
        answers: ["Wait until Monday", "Pay the supplier himself", "Send the invoice to Ms. Russo", "Call the supplier"], correct_index: 2,
        justification: "\"I'll send it to her now\" (Ms. Russo can approve it).",
      },
    ],
  },
  {
    text: `MEMO
To: All employees
From: Security
Subject: Visitor badges

From Monday, all visitors must wear a visitor badge at all times while in the building. Badges will be given out at reception after visitors sign in with a photo ID.

Employees who invite guests are responsible for meeting them at reception and accompanying them during their visit. Badges must be returned to reception when visitors leave.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the memo about?",
        answers: ["A new security manager", "New employee badges", "A change in reception hours", "A new rule for visitors"], correct_index: 3,
        justification: "\"All visitors must wear a visitor badge at all times.\"",
      },
      {
        difficulty: "hard",
        question: "What must visitors show to get a badge?",
        answers: ["A photo ID", "An invitation letter", "A business card", "A parking ticket"], correct_index: 0,
        justification: "\"After visitors sign in with a photo ID.\"",
      },
      {
        difficulty: "extreme",
        question: "What are employees who invite guests required to do?",
        answers: ["Sign in with their own ID", "Stay with their guests during the visit", "Pay for the badges", "Inform security a week before"], correct_index: 1,
        justification: "\"Responsible for meeting them at reception and accompanying them during their visit.\"",
      },
    ],
  },
  {
    text: `Northside Pharmacy — Holiday Hours

24 December: 9 A.M. – 1 P.M.
25 and 26 December: Closed
27–30 December: Normal hours (8 A.M. – 7 P.M.)
31 December: 9 A.M. – 3 P.M.
1 January: Closed

If you need medicine while we are closed, the Central Pharmacy on King Street is open 24 hours a day, every day of the year.`,
    questions: [
      {
        difficulty: "normal",
        question: "What information does the notice give?",
        answers: ["The price of medicines", "A new pharmacy address", "The pharmacy's hours during the holidays", "A health warning"], correct_index: 2,
        justification: "\"Northside Pharmacy — Holiday Hours.\"",
      },
      {
        difficulty: "hard",
        question: "When does the pharmacy close early?",
        answers: ["On 27 December", "On 25 December", "On 1 January", "On 24 and 31 December"], correct_index: 3,
        justification: "It closes at 1 P.M. on 24 December and at 3 P.M. on 31 December.",
      },
      {
        difficulty: "extreme",
        question: "What can someone do on 25 December if they need medicine?",
        answers: ["Go to a pharmacy on King Street", "Wait until 27 December only", "Call Northside Pharmacy", "Order online from Northside"], correct_index: 0,
        justification: "Northside is closed, but \"the Central Pharmacy on King Street is open 24 hours a day, every day\".",
      },
    ],
  },
  {
    text: `Dear Ms. Clarke,

Welcome to Summit Fitness! Your membership is now active, and you can use the gym starting today. Your membership card will be ready at the front desk; please bring a photo ID to collect it.

As a new member, you are entitled to a free introduction session with one of our trainers, who will show you how to use the equipment safely. You can book it through our app.

The Summit Fitness Team`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the purpose of the e-mail?",
        answers: ["To ask for a payment", "To welcome a new gym member", "To advertise a new gym", "To cancel a membership"], correct_index: 1,
        justification: "\"Welcome to Summit Fitness! Your membership is now active.\"",
      },
      {
        difficulty: "hard",
        question: "Where can Ms. Clarke get her membership card?",
        answers: ["By mail", "In the app", "At the front desk", "From a trainer"], correct_index: 2,
        justification: "\"Your membership card will be ready at the front desk.\"",
      },
      {
        difficulty: "extreme",
        question: "What will happen during the introduction session?",
        answers: ["Ms. Clarke will pay her fees.", "Ms. Clarke will get her ID.", "Ms. Clarke will meet other members.", "A trainer will explain how to use the machines."], correct_index: 3,
        justification: "\"Show you how to use the equipment safely.\"",
      },
    ],
  },
  {
    text: `Print Your Logo — PrintWear

Need T-shirts for your team, event, or business? PrintWear can print your logo or design on T-shirts, caps, and bags.

Minimum order: 20 items. Prices start at $8 per T-shirt for orders over 100. Upload your design on our website, and we will send you a free sample photo within 24 hours. Standard delivery takes seven working days; express delivery in three days is available for an extra fee.`,
    questions: [
      {
        difficulty: "normal",
        question: "What does PrintWear do?",
        answers: ["Prints designs on clothing and bags", "Designs logos for companies", "Sells sports equipment", "Prints business cards"], correct_index: 0,
        justification: "\"Can print your logo or design on T-shirts, caps, and bags.\"",
      },
      {
        difficulty: "hard",
        question: "What is the smallest order possible?",
        answers: ["1 item", "20 items", "100 items", "8 items"], correct_index: 1,
        justification: "\"Minimum order: 20 items.\"",
      },
      {
        difficulty: "extreme",
        question: "What will customers receive after uploading their design?",
        answers: ["A free T-shirt", "A discount code", "A photo showing what the product will look like", "The final products in three days"], correct_index: 2,
        justification: "\"We will send you a free sample photo within 24 hours.\"",
      },
    ],
  },
  {
    text: `New Rules for Electric Scooters

From 1 July, rental electric scooters in the city of Linford may no longer be ridden on sidewalks. Riders must use bike lanes or roads with a speed limit of 30 km/h or less.

Scooters must also be parked in special parking zones marked on the app. Riders who leave scooters elsewhere will be fined $25. The city introduced the rules after receiving many complaints from pedestrians.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the article about?",
        answers: ["A new scooter rental company", "A new bike lane", "A rise in scooter prices", "New rules for using electric scooters"], correct_index: 3,
        justification: "\"New Rules for Electric Scooters.\"",
      },
      {
        difficulty: "hard",
        question: "Where will riders NOT be allowed to ride?",
        answers: ["On sidewalks", "In bike lanes", "On slow roads", "In parks"], correct_index: 0,
        justification: "\"May no longer be ridden on sidewalks.\"",
      },
      {
        difficulty: "extreme",
        question: "Why did the city introduce the rules?",
        answers: ["Scooter companies asked for them.", "Many people walking complained.", "There were too few parking zones.", "Riders wanted faster roads."], correct_index: 1,
        justification: "\"After receiving many complaints from pedestrians.\"",
      },
    ],
  },
  {
    text: `Internet Outage This Evening

The office internet connection will be unavailable tonight from 9 P.M. to midnight while our provider upgrades its equipment. After the upgrade, our connection will be twice as fast.

Please save your work and log out of any online systems before 9 P.M. Employees who need to work during this time may connect through their mobile phones but should avoid downloading large files.`,
    questions: [
      {
        difficulty: "normal",
        question: "Why will the internet be unavailable?",
        answers: ["There is a power cut.", "The office is moving.", "The provider is upgrading equipment.", "The bill was not paid."], correct_index: 2,
        justification: "\"While our provider upgrades its equipment.\"",
      },
      {
        difficulty: "hard",
        question: "What will be the result of the work?",
        answers: ["Cheaper internet", "New computers", "Longer office hours", "A faster connection"], correct_index: 3,
        justification: "\"Our connection will be twice as fast.\"",
      },
      {
        difficulty: "extreme",
        question: "What advice is given to employees who must work during the outage?",
        answers: ["Use their phones but avoid big downloads", "Come back after midnight", "Work from a café", "Call the internet provider"], correct_index: 0,
        justification: "\"May connect through their mobile phones but should avoid downloading large files.\"",
      },
    ],
  },
  {
    text: `Dear Mr. Lindqvist,

This is a friendly reminder that invoice #9012 for $2,450, dated 1 May, was due on 31 May and remains unpaid.

If you have already sent the payment, please disregard this message. Otherwise, we would appreciate payment within the next ten days. If there is a problem with the invoice, please contact me so that we can resolve it.

Kind regards,
Tara Singh, Accounts, Nordic Office Supplies`,
    questions: [
      {
        difficulty: "normal",
        question: "Why did Ms. Singh write?",
        answers: ["To send a new invoice", "To remind a customer about a late payment", "To offer a discount", "To confirm a delivery"], correct_index: 1,
        justification: "\"Was due on 31 May and remains unpaid.\"",
      },
      {
        difficulty: "hard",
        question: "What should Mr. Lindqvist do if he has already paid?",
        answers: ["Send a copy of the payment", "Call Ms. Singh", "Ignore the message", "Pay again"], correct_index: 2,
        justification: "\"If you have already sent the payment, please disregard this message\" (= ignore it).",
      },
      {
        difficulty: "extreme",
        question: "What does Ms. Singh offer to do?",
        answers: ["Cancel the invoice", "Reduce the amount", "Give more than ten days", "Help solve any problem with the invoice"], correct_index: 3,
        justification: "\"If there is a problem with the invoice, please contact me so that we can resolve it.\"",
      },
    ],
  },
  {
    text: `Cancellation Policy — Hotel Belmont

Reservations can be canceled free of charge up to 48 hours before the arrival date. Cancellations made less than 48 hours before arrival will be charged the cost of the first night.

Guests who do not arrive and do not cancel will be charged for the full stay. Special offer bookings ("Non-Refundable Rate") cannot be canceled or changed.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the text about?",
        answers: ["Rules for canceling a hotel booking", "Hotel room prices", "Check-in times", "Special offers"], correct_index: 0,
        justification: "\"Cancellation Policy.\"",
      },
      {
        difficulty: "hard",
        question: "How much will a guest pay if they cancel one day before arrival?",
        answers: ["Nothing", "The price of one night", "The full stay", "Half of the first night"], correct_index: 1,
        justification: "Less than 48 hours: \"charged the cost of the first night\".",
      },
      {
        difficulty: "extreme",
        question: "What is true about \"Non-Refundable Rate\" bookings?",
        answers: ["They can be canceled for free.", "They include breakfast.", "The dates cannot be changed.", "They cost more than other bookings."], correct_index: 2,
        justification: "\"Cannot be canceled or changed.\"",
      },
    ],
  },
  {
    text: `Annual Job Fair Attracts Record Crowd

More than 6,000 people attended the Greenville Job Fair at the Civic Center on Saturday, up from 4,500 last year. Over 120 employers from industries such as health care, technology, and retail took part.

Many employers interviewed candidates on the spot. Organizers also offered free workshops on writing résumés and preparing for interviews, which were so popular that extra sessions had to be added.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the article about?",
        answers: ["A new company", "A health care conference", "A retail sale", "A job fair"], correct_index: 3,
        justification: "\"More than 6,000 people attended the Greenville Job Fair.\"",
      },
      {
        difficulty: "hard",
        question: "How many more visitors came than last year?",
        answers: ["About 1,500", "About 6,000", "About 120", "About 4,500"], correct_index: 0,
        justification: "6,000 - 4,500 = 1,500.",
      },
      {
        difficulty: "extreme",
        question: "What is indicated about the workshops?",
        answers: ["They were canceled.", "More sessions were added because of demand.", "They were only for employers.", "They cost $20."], correct_index: 1,
        justification: "\"So popular that extra sessions had to be added.\"",
      },
    ],
  },
  {
    text: `Hi Priya,

Congratulations on your promotion to regional sales manager! Everyone on the team agrees that it's well deserved; your work on the Asian market this year has been outstanding.

We'll miss having you in our office, but I know you'll do a great job in Singapore. Let's have a farewell lunch before you leave at the end of the month. How about next Friday?

Best,
Marcus`,
    questions: [
      {
        difficulty: "normal",
        question: "Why did Marcus write?",
        answers: ["To offer a colleague a job", "To complain about sales", "To congratulate a colleague", "To plan a business trip"], correct_index: 2,
        justification: "\"Congratulations on your promotion.\"",
      },
      {
        difficulty: "hard",
        question: "Why does Marcus say the promotion is deserved?",
        answers: ["Because Priya has worked there for years", "Because Priya speaks several languages", "Because Priya lives in Singapore", "Because of Priya's excellent results"], correct_index: 3,
        justification: "\"Your work on the Asian market this year has been outstanding.\"",
      },
      {
        difficulty: "extreme",
        question: "What is suggested about Priya?",
        answers: ["She will move to another office.", "She is retiring.", "She will become Marcus's assistant.", "She is leaving the company."], correct_index: 0,
        justification: "\"We'll miss having you in our office ... you'll do a great job in Singapore.\"",
      },
    ],
  },
  {
    text: `Fire Safety Check

On Tuesday, 15 April, technicians from FireGuard will check all fire extinguishers and alarms in the building. The work will take place between 9 A.M. and 5 P.M.

The fire alarm may ring briefly several times during the day; there is no need to leave the building unless you hear a continuous alarm for more than one minute. Technicians may need to enter your office for a few minutes.`,
    questions: [
      {
        difficulty: "normal",
        question: "What will happen on 15 April?",
        answers: ["A fire drill will take place.", "Fire safety equipment will be checked.", "New alarms will be sold.", "The building will be closed."], correct_index: 1,
        justification: "\"Technicians ... will check all fire extinguishers and alarms.\"",
      },
      {
        difficulty: "hard",
        question: "What should employees do if the alarm rings briefly?",
        answers: ["Leave the building", "Call FireGuard", "Continue working", "Go to the ground floor"], correct_index: 2,
        justification: "\"No need to leave the building unless you hear a continuous alarm for more than one minute.\"",
      },
      {
        difficulty: "extreme",
        question: "When should employees leave the building?",
        answers: ["At 9 A.M.", "When technicians enter their office", "At 5 P.M.", "If the alarm rings without stopping for over a minute"], correct_index: 3,
        justification: "Only for \"a continuous alarm for more than one minute\".",
      },
    ],
  },
  {
    text: `BrightMinds Tutoring Center

Is your child finding math or science difficult? BrightMinds offers small-group and private lessons for students aged 10 to 18, taught by qualified teachers.

Before the first lesson, every student takes a free assessment so we can understand their level. Lessons are available after school and on Saturdays. Book three months in advance and receive one free private lesson.`,
    questions: [
      {
        difficulty: "normal",
        question: "What does BrightMinds offer?",
        answers: ["Extra lessons for school students", "Training for teachers", "Science equipment", "University courses"], correct_index: 0,
        justification: "\"Small-group and private lessons for students aged 10 to 18.\"",
      },
      {
        difficulty: "hard",
        question: "What happens before a student's first lesson?",
        answers: ["Parents meet the director.", "The student's level is tested.", "The student chooses a teacher.", "Parents pay for three months."], correct_index: 1,
        justification: "\"Every student takes a free assessment so we can understand their level.\"",
      },
      {
        difficulty: "extreme",
        question: "How can families get a free private lesson?",
        answers: ["By choosing Saturday lessons", "By bringing a friend", "By booking three months at once", "By taking the assessment"], correct_index: 2,
        justification: "\"Book three months in advance and receive one free private lesson.\"",
      },
    ],
  },
  {
    text: `Delivery Driver (9:02 A.M.): Hello, I'm outside 45 Park Road with your package, but no one is answering.
Jenna Moore (9:04 A.M.): Sorry, I'm at work! It should go to my office: 12 Hill Street, 3rd floor.
Delivery Driver (9:06 A.M.): The address on the package is Park Road. I can't change it here.
Jenna Moore (9:07 A.M.): Can you leave it with my neighbor at number 47?
Delivery Driver (9:08 A.M.): Yes, I'll do that and send you a photo.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the problem?",
        answers: ["The package is damaged.", "The driver is lost.", "The package is late.", "No one is home to receive a package."], correct_index: 3,
        justification: "\"I'm outside 45 Park Road ... but no one is answering.\"",
      },
      {
        difficulty: "hard",
        question: "At 9:06 A.M., what does the driver mean when he writes, \"I can't change it here\"?",
        answers: ["He is not able to deliver to a different address.", "He cannot give change for cash.", "He cannot open the package.", "He cannot wait any longer."], correct_index: 0,
        justification: "The address on the package is Park Road; he can't send it to Hill Street.",
      },
      {
        difficulty: "extreme",
        question: "Where will the package most likely be left?",
        answers: ["At 12 Hill Street", "At 47 Park Road", "At 45 Park Road", "At the post office"], correct_index: 1,
        justification: "\"Leave it with my neighbor at number 47\" (on Park Road).",
      },
    ],
  },
  {
    text: `Clothing Collection for Charity

The Helping Hands charity will collect clean, used clothing in the lobby of our building from 3 to 14 March. Coats, sweaters, and shoes are especially needed for the winter season.

Please put items in a bag and place them in the large boxes next to the elevators. Damaged clothing and underwear cannot be accepted. All items will be given to local families in need.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the notice about?",
        answers: ["A clothing sale", "A new clothing store", "A clothing collection for people in need", "A winter clothing rule"], correct_index: 2,
        justification: "\"Will collect clean, used clothing ... given to local families in need.\"",
      },
      {
        difficulty: "hard",
        question: "Which items are especially needed?",
        answers: ["Summer clothes", "Children's toys", "Underwear", "Warm clothes for winter"], correct_index: 3,
        justification: "\"Coats, sweaters, and shoes are especially needed for the winter season.\"",
      },
      {
        difficulty: "extreme",
        question: "Which item would NOT be accepted?",
        answers: ["A torn jacket", "A clean sweater", "A pair of shoes", "A warm coat"], correct_index: 0,
        justification: "\"Damaged clothing ... cannot be accepted.\"",
      },
    ],
  },
  {
    text: `Dear Mr. Ito,

Thank you for sending samples of your recycled packaging materials. Our team was impressed by their quality, and we are considering using them for our new range of skin care products.

Would you be available to meet next week to discuss prices and delivery times? We are particularly interested in whether you can supply 50,000 boxes per month. I am free on Tuesday or Thursday afternoon.

Best regards,
Laura Bennett, Purchasing Manager, Pure Glow Cosmetics`,
    questions: [
      {
        difficulty: "normal",
        question: "Why did Ms. Bennett write?",
        answers: ["To order samples", "To arrange a meeting with a supplier", "To complain about quality", "To sell cosmetics"], correct_index: 1,
        justification: "\"Would you be available to meet next week to discuss prices and delivery times?\"",
      },
      {
        difficulty: "hard",
        question: "What did Mr. Ito send to Pure Glow Cosmetics?",
        answers: ["A price list", "Skin care products", "Packaging samples", "A contract"], correct_index: 2,
        justification: "\"Thank you for sending samples of your recycled packaging materials.\"",
      },
      {
        difficulty: "extreme",
        question: "What does Ms. Bennett want to know?",
        answers: ["If the packaging is recycled", "If Mr. Ito likes skin care products", "If the samples are free", "If Mr. Ito's company can produce enough boxes"], correct_index: 3,
        justification: "\"Whether you can supply 50,000 boxes per month.\"",
      },
    ],
  },
  {
    text: `Main Street to Become Pedestrian Zone

From 1 May, cars will no longer be allowed on Main Street between the town hall and the river. The street will become a pedestrian zone with new trees, benches, and space for café tables.

Delivery vehicles will be allowed to enter only between 6 and 10 A.M. Shop owners were divided on the plan: some fear losing customers who drive, while others expect more people to walk by their shops.`,
    questions: [
      {
        difficulty: "normal",
        question: "What will happen to Main Street?",
        answers: ["It will be closed to cars.", "It will be widened.", "It will get new parking spaces.", "It will be renamed."], correct_index: 0,
        justification: "\"Cars will no longer be allowed on Main Street.\"",
      },
      {
        difficulty: "hard",
        question: "When can delivery vehicles enter the street?",
        answers: ["At any time", "Early in the morning", "Only on Sundays", "In the evening"], correct_index: 1,
        justification: "\"Only between 6 and 10 A.M.\"",
      },
      {
        difficulty: "extreme",
        question: "What does the article say about shop owners?",
        answers: ["They all support the plan.", "They asked for the change.", "They do not all agree about the plan.", "They will move their shops."], correct_index: 2,
        justification: "\"Shop owners were divided on the plan.\"",
      },
    ],
  },
  {
    text: `Peak Rentals — Ski & Snowboard Equipment

Rent everything you need for the slopes: skis, snowboards, boots, helmets, and poles. Daily rentals start at $30 for adults and $20 for children.

Reserve online at least 24 hours in advance and save 10%. Your equipment will be ready for pickup at our shop next to the main lift. Helmets are free with any ski or snowboard rental.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is being advertised?",
        answers: ["Ski lessons", "A mountain hotel", "A sports clothing sale", "Winter sports equipment for rent"], correct_index: 3,
        justification: "\"Rent everything you need for the slopes.\"",
      },
      {
        difficulty: "hard",
        question: "Where is the shop located?",
        answers: ["Next to the main lift", "In the town center", "At the hotel", "At the train station"], correct_index: 0,
        justification: "\"At our shop next to the main lift.\"",
      },
      {
        difficulty: "extreme",
        question: "What is free for customers who rent skis?",
        answers: ["Boots", "A helmet", "Poles", "A lift ticket"], correct_index: 1,
        justification: "\"Helmets are free with any ski or snowboard rental.\"",
      },
    ],
  },
  {
    text: `New Parking Permits for Staff

The new parking permits for next year are now available. Please collect yours from the facilities office by 20 December. Old permits will not be valid after 31 December.

This year, the number of parking spaces has been reduced because of construction work on the east side of the site. Permits will therefore be given first to employees who live more than 10 kilometers away or who cannot use public transport.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the notice about?",
        answers: ["New public transport", "A new office", "New parking permits", "Car repairs"], correct_index: 2,
        justification: "\"The new parking permits for next year are now available.\"",
      },
      {
        difficulty: "hard",
        question: "Why are there fewer parking spaces this year?",
        answers: ["Because more people drive", "Because of a new bike lane", "Because the parking lot was sold", "Because of construction work"], correct_index: 3,
        justification: "\"Because of construction work on the east side of the site.\"",
      },
      {
        difficulty: "extreme",
        question: "Who is most likely to receive a permit first?",
        answers: ["An employee living 25 km away", "An employee living near a train station", "A new employee", "An employee who works part-time"], correct_index: 0,
        justification: "Priority goes to employees \"who live more than 10 kilometers away\".",
      },
    ],
  },
  {
    text: `Dear Mr. Santos,

Thank you for your reservation request for a group of 18 people on Friday, 12 July, at 8 P.M. We are happy to confirm your booking in our private dining room.

For groups of more than 12, we offer a set menu at $45 per person, which includes three courses. A deposit of $200 is required to secure the booking; it will be deducted from your final bill.

Kind regards,
The Olive Garden Restaurant`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the purpose of the e-mail?",
        answers: ["To offer a job", "To confirm a restaurant booking", "To cancel a reservation", "To advertise a new menu"], correct_index: 1,
        justification: "\"We are happy to confirm your booking.\"",
      },
      {
        difficulty: "hard",
        question: "What will the group eat?",
        answers: ["Whatever each person chooses", "A buffet", "A fixed three-course menu", "Only desserts"], correct_index: 2,
        justification: "\"For groups of more than 12, we offer a set menu ... three courses.\"",
      },
      {
        difficulty: "extreme",
        question: "How much will Mr. Santos pay on the evening if the group orders only the set menu?",
        answers: ["$810", "$200", "$45", "$610"], correct_index: 3,
        justification: "18 x $45 = $810, minus the $200 deposit already paid = $610.",
      },
    ],
  },
  {
    text: `Review: Zenbook Air 14 Laptop

I've been using the Zenbook Air 14 for my work as a graphic designer for three months. The screen is bright and the colors are accurate, which is essential for my job. The battery easily lasts a full working day.

On the negative side, it has only two USB ports, so I often need an adapter. It's also not cheap, but compared with similar models, it offers good value.

— R. Kim`,
    questions: [
      {
        difficulty: "normal",
        question: "What does the reviewer use the laptop for?",
        answers: ["Graphic design work", "Playing games", "Teaching", "Writing books"], correct_index: 0,
        justification: "\"For my work as a graphic designer.\"",
      },
      {
        difficulty: "hard",
        question: "What does the reviewer NOT like?",
        answers: ["The screen", "The number of USB ports", "The battery", "The colors"], correct_index: 1,
        justification: "\"It has only two USB ports, so I often need an adapter.\"",
      },
      {
        difficulty: "extreme",
        question: "What does the reviewer think about the price?",
        answers: ["It is very cheap.", "It is too high for the quality.", "It is fair compared with similar laptops.", "It is the same as all laptops."], correct_index: 2,
        justification: "\"Not cheap, but compared with similar models, it offers good value.\"",
      },
    ],
  },
  {
    text: `New Library Branch Opens in Eastfield

The city opened its seventh public library branch in the Eastfield neighborhood on Monday. The two-story building includes a children's area, a computer lab, and a café run by a local social enterprise.

Eastfield residents previously had to travel more than 5 kilometers to the nearest library. The branch is open seven days a week and offers free English classes for adults on weekday evenings.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the article about?",
        answers: ["A new school", "A computer store", "A café opening", "A new library branch"], correct_index: 3,
        justification: "\"The city opened its seventh public library branch.\"",
      },
      {
        difficulty: "hard",
        question: "What is mentioned about the café?",
        answers: ["It is run by a local social enterprise.", "It is owned by the city.", "It is only for children.", "It is open at night."], correct_index: 0,
        justification: "\"A café run by a local social enterprise.\"",
      },
      {
        difficulty: "extreme",
        question: "Why is the new branch important for Eastfield residents?",
        answers: ["They wanted a new café.", "They used to live far from a library.", "They work in the computer lab.", "Their old library closed."], correct_index: 1,
        justification: "\"Previously had to travel more than 5 kilometers to the nearest library.\"",
      },
    ],
  },
  {
    text: `Ticket Machines Upgrade

All ticket machines at Westgate Station will be replaced between 4 and 8 March. During this time, some machines may be out of service. Tickets can also be bought at the ticket office, which will stay open longer (6 A.M. to 10 P.M.).

The new machines will accept contactless payment and mobile phones, and will be available in six languages.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is happening at Westgate Station?",
        answers: ["The station is closing.", "Ticket prices are rising.", "Ticket machines are being replaced.", "The ticket office is moving."], correct_index: 2,
        justification: "\"All ticket machines ... will be replaced between 4 and 8 March.\"",
      },
      {
        difficulty: "hard",
        question: "What change will be made at the ticket office?",
        answers: ["It will close.", "It will only accept cash.", "It will move to another floor.", "It will open for more hours."], correct_index: 3,
        justification: "\"Will stay open longer (6 A.M. to 10 P.M.).\"",
      },
      {
        difficulty: "extreme",
        question: "What is NOT mentioned as a feature of the new machines?",
        answers: ["Printing receipts by e-mail", "Contactless payment", "Payment by mobile phone", "Several languages"], correct_index: 0,
        justification: "Contactless, mobile phones and six languages are mentioned. E-mail receipts are not.",
      },
    ],
  },
  {
    text: `Dear Customers,

We would like to apologize for the problems with our website on Monday, when many of you were unable to place orders for about six hours. The problem was caused by a technical failure at our hosting company and has now been fixed.

To thank you for your patience, we are offering free delivery on all orders placed this week. No code is needed; the discount will be applied automatically at checkout.

The Freshly Team`,
    questions: [
      {
        difficulty: "normal",
        question: "Why did the company write to customers?",
        answers: ["To announce a new website", "To apologize for a website problem", "To ask for feedback", "To announce higher prices"], correct_index: 1,
        justification: "\"We would like to apologize for the problems with our website.\"",
      },
      {
        difficulty: "hard",
        question: "What caused the problem?",
        answers: ["Too many customers", "A mistake by the Freshly team", "A failure at another company", "A power cut at the warehouse"], correct_index: 2,
        justification: "\"Caused by a technical failure at our hosting company.\"",
      },
      {
        difficulty: "extreme",
        question: "How can customers get free delivery?",
        answers: ["By entering a code", "By calling customer service", "By ordering on Monday", "By ordering this week"], correct_index: 3,
        justification: "\"Free delivery on all orders placed this week ... applied automatically.\"",
      },
    ],
  },
  {
    text: `CleanCycle — Cleaning Products by Subscription

Never run out of cleaning products again! CleanCycle delivers eco-friendly cleaning products to your door every month. Our products are made from plant-based ingredients and come in refillable bottles.

Choose the products you need, and we'll deliver refills automatically. You can pause or cancel your subscription at any time. First box half price for new customers.`,
    questions: [
      {
        difficulty: "normal",
        question: "What does CleanCycle sell?",
        answers: ["Cleaning products", "Bicycles", "House cleaning services", "Plants"], correct_index: 0,
        justification: "\"Delivers eco-friendly cleaning products to your door every month.\"",
      },
      {
        difficulty: "hard",
        question: "What is special about the bottles?",
        answers: ["They are made of glass.", "They can be refilled.", "They are free.", "They are larger than usual."], correct_index: 1,
        justification: "\"Come in refillable bottles.\"",
      },
      {
        difficulty: "extreme",
        question: "What is true about the subscription?",
        answers: ["It must last at least a year.", "It costs half price every month.", "Customers can stop it whenever they want.", "Products are delivered every week."], correct_index: 2,
        justification: "\"You can pause or cancel your subscription at any time.\"",
      },
    ],
  },
  {
    text: `Company Tests Four-Day Work Week

Software company Pixelworks has started a six-month trial of a four-day work week for its 200 employees. Staff will work 32 hours per week instead of 40, with no change in salary.

The company's CEO said the goal is to see if employees can be equally productive in less time. Pixelworks will measure results by looking at the number of projects completed and at customer satisfaction scores.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is Pixelworks testing?",
        answers: ["A new software product", "A higher salary", "Working from home", "A shorter work week"], correct_index: 3,
        justification: "\"A six-month trial of a four-day work week.\"",
      },
      {
        difficulty: "hard",
        question: "What will happen to employees' salaries?",
        answers: ["They will stay the same.", "They will be reduced.", "They will increase.", "They will be paid weekly."], correct_index: 0,
        justification: "\"With no change in salary.\"",
      },
      {
        difficulty: "extreme",
        question: "How will the company judge the trial?",
        answers: ["By asking employees to vote", "By looking at completed projects and customer opinions", "By counting hours worked", "By comparing salaries"], correct_index: 1,
        justification: "\"By looking at the number of projects completed and at customer satisfaction scores.\"",
      },
    ],
  },
  {
    text: `Construction Next Door

Construction of a new apartment building next to our office will begin on 2 June and is expected to last about one year. Most noisy work will take place between 8 A.M. and 5 P.M. on weekdays.

To reduce disturbance, we have installed new windows on the side of the building facing the site. Employees who find the noise difficult can book a quiet room on the north side of the building.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the notice about?",
        answers: ["Repairs inside the office", "A new office building for the company", "Building work near the office", "A change of office hours"], correct_index: 2,
        justification: "\"Construction of a new apartment building next to our office.\"",
      },
      {
        difficulty: "hard",
        question: "What has the company done to reduce noise?",
        answers: ["Moved all employees", "Asked the builders to work at night", "Closed the office", "Installed new windows"], correct_index: 3,
        justification: "\"We have installed new windows on the side of the building facing the site.\"",
      },
      {
        difficulty: "extreme",
        question: "What is suggested about the north side of the building?",
        answers: ["It is quieter.", "It faces the construction site.", "It will be closed.", "It has no windows."], correct_index: 0,
        justification: "Employees can book \"a quiet room on the north side\", away from the noise.",
      },
    ],
  },
  {
    text: `Dear Ms. Laine,

Please find attached the service contract for the maintenance of your company's air conditioning systems, as discussed during our meeting on Tuesday.

Please review the contract carefully. If you agree with the terms, sign both copies and return one to us by 30 April. Our technicians can carry out the first inspection in the second week of May.

Best regards,
Paolo Ricci, CoolAir Services`,
    questions: [
      {
        difficulty: "normal",
        question: "What did Mr. Ricci send?",
        answers: ["An invoice", "A contract", "A new air conditioner", "A meeting agenda"], correct_index: 1,
        justification: "\"Please find attached the service contract.\"",
      },
      {
        difficulty: "hard",
        question: "What is Ms. Laine asked to do if she agrees?",
        answers: ["Call Mr. Ricci", "Pay a deposit", "Sign and send back one copy", "Arrange a meeting"], correct_index: 2,
        justification: "\"Sign both copies and return one to us by 30 April.\"",
      },
      {
        difficulty: "extreme",
        question: "When could the first inspection take place?",
        answers: ["On Tuesday", "Before 30 April", "In June", "In mid-May"], correct_index: 3,
        justification: "\"In the second week of May.\"",
      },
    ],
  },
  {
    text: `Eva Martin (9:55 A.M.): I'm in Room 3 for my 10 o'clock meeting, but another team is already here.
Josh Reed (9:57 A.M.): The booking system shows Room 3 is yours. They may have made a mistake.
Eva Martin (9:58 A.M.): They say they booked it too. Their meeting runs until 11.
Josh Reed (10:00 A.M.): Room 5 is empty right now. Why don't you use that one?
Eva Martin (10:01 A.M.): OK, thanks. I'll ask IT to check the booking system later.`,
    questions: [
      {
        difficulty: "normal",
        question: "What problem does Ms. Martin have?",
        answers: ["Two teams booked the same room.", "Her meeting was canceled.", "She cannot find Room 3.", "The booking system is down."], correct_index: 0,
        justification: "\"Another team is already here ... They say they booked it too.\"",
      },
      {
        difficulty: "hard",
        question: "What does Mr. Reed suggest?",
        answers: ["Waiting until 11", "Using a different room", "Canceling the meeting", "Asking the other team to leave"], correct_index: 1,
        justification: "\"Room 5 is empty right now. Why don't you use that one?\"",
      },
      {
        difficulty: "extreme",
        question: "What will Ms. Martin most likely do after the meeting?",
        answers: ["Book Room 3 for tomorrow", "Talk to the other team's manager", "Contact the IT department", "Call Mr. Reed"], correct_index: 2,
        justification: "\"I'll ask IT to check the booking system later.\"",
      },
    ],
  },
  {
    text: `Recycle Your Old Electronics

Do you have old phones, laptops, or cables at home? Bring them to the electronics recycling point in the main lobby from 1 to 30 November.

All data on phones and computers will be securely deleted before the devices are recycled. Working devices will be repaired and donated to local schools. Batteries must be removed and placed in the separate battery box.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the notice about?",
        answers: ["Selling new phones", "Repairing laptops", "A school donation drive for books", "Recycling old electronic devices"], correct_index: 3,
        justification: "\"Bring them to the electronics recycling point.\"",
      },
      {
        difficulty: "hard",
        question: "What will happen to devices that still work?",
        answers: ["They will be fixed and given to schools.", "They will be sold.", "They will be returned to their owners.", "They will be used by the company."], correct_index: 0,
        justification: "\"Working devices will be repaired and donated to local schools.\"",
      },
      {
        difficulty: "extreme",
        question: "What should people do with batteries?",
        answers: ["Leave them in the devices", "Put them in a separate box", "Take them home", "Throw them away"], correct_index: 1,
        justification: "\"Batteries must be removed and placed in the separate battery box.\"",
      },
    ],
  },
  {
    text: `Willow Manor — Your Perfect Wedding Venue

Celebrate your special day at Willow Manor, a beautiful 18th-century house surrounded by gardens. Our ballroom can hold up to 150 guests, and outdoor ceremonies can take place by the lake.

Our wedding packages include the room, a three-course dinner, flowers, and a night in our bridal suite. Book a visit to see the house; weekends in summer are usually booked a year in advance.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is being advertised?",
        answers: ["A flower shop", "A hotel restaurant", "A place to hold weddings", "A history museum"], correct_index: 2,
        justification: "\"Willow Manor — Your Perfect Wedding Venue.\"",
      },
      {
        difficulty: "hard",
        question: "What is included in the wedding packages?",
        answers: ["Music", "Photography", "Wedding dresses", "Flowers"], correct_index: 3,
        justification: "\"The room, a three-course dinner, flowers, and a night in our bridal suite.\"",
      },
      {
        difficulty: "extreme",
        question: "What is suggested about summer weekends?",
        answers: ["They are very popular.", "They are cheaper.", "They are not available.", "They are only for outdoor weddings."], correct_index: 0,
        justification: "\"Usually booked a year in advance.\"",
      },
    ],
  },
  {
    text: `Dear Mr. Haddad,

Following your interview last week, we are pleased to offer you the position of Logistics Coordinator at Transcore Shipping, starting on 1 September.

Your annual salary will be $52,000, and you will be entitled to 25 days of paid vacation per year. The first three months will be a probation period. Please confirm whether you accept this offer by 15 August.

Sincerely,
Diana Ross, Human Resources Manager`,
    questions: [
      {
        difficulty: "normal",
        question: "Why was the letter sent?",
        answers: ["To invite Mr. Haddad to an interview", "To offer Mr. Haddad a job", "To reject Mr. Haddad's application", "To change Mr. Haddad's salary"], correct_index: 1,
        justification: "\"We are pleased to offer you the position.\"",
      },
      {
        difficulty: "hard",
        question: "How many days of paid vacation will Mr. Haddad have?",
        answers: ["3 months", "15 days per year", "25 days per year", "52 days per year"], correct_index: 2,
        justification: "\"25 days of paid vacation per year.\"",
      },
      {
        difficulty: "extreme",
        question: "What is true about Mr. Haddad's first three months?",
        answers: ["They are unpaid.", "They will be spent abroad.", "They are vacation.", "They are a trial period."], correct_index: 3,
        justification: "\"The first three months will be a probation period\" (= a trial period).",
      },
    ],
  },
  {
    text: `Food Festival Returns to the Harbor

The Taste of the Harbor festival will return on 14 and 15 September, with more than 60 food stalls offering dishes from around the world. This year's festival will also include cooking demonstrations by well-known chefs and a market selling local produce.

Entry is free, but visitors are encouraged to bring their own reusable cups and containers, as the festival aims to produce no plastic waste.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the article about?",
        answers: ["A food festival", "A new restaurant", "A cooking school", "A harbor renovation"], correct_index: 0,
        justification: "\"The Taste of the Harbor festival will return.\"",
      },
      {
        difficulty: "hard",
        question: "What is new at this year's festival?",
        answers: ["Food stalls", "Cooking demonstrations", "Free entry", "Dishes from around the world"], correct_index: 1,
        justification: "\"This year's festival will also include cooking demonstrations.\"",
      },
      {
        difficulty: "extreme",
        question: "Why are visitors asked to bring their own cups?",
        answers: ["Cups are not sold at the festival.", "Drinks are cheaper in your own cup.", "The festival wants to avoid plastic waste.", "Glass is not allowed."], correct_index: 2,
        justification: "\"The festival aims to produce no plastic waste.\"",
      },
    ],
  },
  {
    text: `Kitchen Closed for Two Days

The second-floor kitchen will be closed on Thursday and Friday while the old refrigerator and dishwasher are replaced. Please use the kitchen on the third floor during this time.

Please remove all your food from the second-floor refrigerator by Wednesday at 5 P.M. Any items left after that time will be thrown away. The new appliances will be more energy efficient.`,
    questions: [
      {
        difficulty: "normal",
        question: "Why will the kitchen be closed?",
        answers: ["It is being cleaned.", "It is being painted.", "There is a water leak.", "Some appliances are being replaced."], correct_index: 3,
        justification: "\"While the old refrigerator and dishwasher are replaced.\"",
      },
      {
        difficulty: "hard",
        question: "Where should employees go to use a kitchen?",
        answers: ["To the third floor", "To the cafeteria", "To the first floor", "Outside the building"], correct_index: 0,
        justification: "\"Please use the kitchen on the third floor during this time.\"",
      },
      {
        difficulty: "extreme",
        question: "What will happen to food left in the refrigerator on Thursday?",
        answers: ["It will be moved to the third floor.", "It will be thrown away.", "It will be given to charity.", "It will be kept in the new refrigerator."], correct_index: 1,
        justification: "\"Any items left after that time will be thrown away.\"",
      },
    ],
  },
  {
    text: `Dear Ms. Novak,

Thank you for your recent purchase of a Vortex vacuum cleaner from our online store. We hope you are enjoying it!

We would be grateful if you could take two minutes to review your purchase on our website. Your feedback helps other customers make better choices. As a thank-you, everyone who leaves a review this month will be entered into a draw to win a $100 gift card.

Best wishes,
HomeTech Online`,
    questions: [
      {
        difficulty: "normal",
        question: "Why did HomeTech Online write to Ms. Novak?",
        answers: ["To confirm a delivery", "To offer a discount", "To ask her to review a product", "To announce a new product"], correct_index: 2,
        justification: "\"We would be grateful if you could take two minutes to review your purchase.\"",
      },
      {
        difficulty: "hard",
        question: "According to the e-mail, why are reviews useful?",
        answers: ["They improve the product.", "They help the company set prices.", "They are needed for the warranty.", "They help other buyers decide."], correct_index: 3,
        justification: "\"Your feedback helps other customers make better choices.\"",
      },
      {
        difficulty: "extreme",
        question: "What could Ms. Novak win?",
        answers: ["A gift card", "A new vacuum cleaner", "Free delivery for a year", "A refund"], correct_index: 0,
        justification: "\"A draw to win a $100 gift card.\"",
      },
    ],
  },
  {
    text: `Shipping Options — Nordic Home Store

Standard shipping (5–7 working days): free on orders over $75, otherwise $6.95
Express shipping (2 working days): $14.95
Next-day delivery (orders placed before 2 P.M.): $24.95

Large items such as furniture are delivered by our own team. You will be contacted to choose a delivery date. We currently ship only within the country.`,
    questions: [
      {
        difficulty: "normal",
        question: "What information is given in the text?",
        answers: ["Furniture prices", "Delivery options and prices", "Store opening hours", "How to return items"], correct_index: 1,
        justification: "\"Shipping Options.\"",
      },
      {
        difficulty: "hard",
        question: "How much does standard shipping cost for a $50 order?",
        answers: ["Nothing", "$14.95", "$6.95", "$24.95"], correct_index: 2,
        justification: "Free only over $75; otherwise $6.95.",
      },
      {
        difficulty: "extreme",
        question: "What is true about furniture deliveries?",
        answers: ["They always arrive the next day.", "They cost $14.95.", "They can be sent abroad.", "The customer chooses the delivery date with the store."], correct_index: 3,
        justification: "\"You will be contacted to choose a delivery date.\"",
      },
    ],
  },
  {
    text: `Car Maker Recalls 50,000 Vehicles

Carvo Motors is recalling 50,000 cars of its Breeze model made between 2021 and 2022 because of a problem with the seat belts. In some cases, the belts may not lock correctly during a sudden stop.

Owners will receive a letter and can have the seat belts replaced for free at any Carvo dealer. The company says no accidents have been reported. The repair takes about one hour.`,
    questions: [
      {
        difficulty: "normal",
        question: "Why is Carvo Motors recalling the cars?",
        answers: ["There is a problem with the seat belts.", "The brakes are faulty.", "The engine may overheat.", "The cars use too much fuel."], correct_index: 0,
        justification: "\"Because of a problem with the seat belts.\"",
      },
      {
        difficulty: "hard",
        question: "What will owners of the cars have to pay?",
        answers: ["The cost of new belts", "Nothing", "A small fee", "Half the cost"], correct_index: 1,
        justification: "\"Can have the seat belts replaced for free.\"",
      },
      {
        difficulty: "extreme",
        question: "What is indicated about the problem?",
        answers: ["It affects all Carvo models.", "It takes a full day to repair.", "It has not caused any known accidents.", "It was found in 2020."], correct_index: 2,
        justification: "\"The company says no accidents have been reported.\"",
      },
    ],
  },
  {
    text: `Office Temperature

To save energy, the heating in the office will be set to 20°C from October to March. Please do not open windows while the heating is on, and close office doors at the end of the day.

If you feel cold, you may use a blanket at your desk, but personal electric heaters are not allowed for safety reasons. If the temperature in your area seems lower than 20°C, please contact facilities.`,
    questions: [
      {
        difficulty: "normal",
        question: "Why will the heating be set to 20°C?",
        answers: ["Because of a broken heater", "Because employees asked for it", "To protect the computers", "To save energy"], correct_index: 3,
        justification: "\"To save energy.\"",
      },
      {
        difficulty: "hard",
        question: "What is NOT allowed?",
        answers: ["Using a personal electric heater", "Using a blanket", "Closing doors", "Contacting facilities"], correct_index: 0,
        justification: "\"Personal electric heaters are not allowed for safety reasons.\"",
      },
      {
        difficulty: "extreme",
        question: "When should employees contact facilities?",
        answers: ["If they want to open a window", "If their area is colder than it should be", "If they need a blanket", "At the end of each day"], correct_index: 1,
        justification: "\"If the temperature in your area seems lower than 20°C, please contact facilities.\"",
      },
    ],
  },
  {
    text: `Dear Customer,

We are writing to let you know that our Elm Street branch will close on 28 June. Your accounts will be transferred automatically to our Market Square branch, which is less than one kilometer away. Your account numbers and cards will not change.

The Market Square branch has recently been renovated and now offers longer opening hours, including Saturday mornings. Our cash machine on Elm Street will remain in service.

Sincerely,
Unity Bank`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the purpose of the letter?",
        answers: ["To offer a new bank card", "To advertise a loan", "To announce that a bank branch is closing", "To change account numbers"], correct_index: 2,
        justification: "\"Our Elm Street branch will close on 28 June.\"",
      },
      {
        difficulty: "hard",
        question: "What will happen to customers' accounts?",
        answers: ["They will be closed.", "They will get new numbers.", "They will be moved online only.", "They will be moved to another branch."], correct_index: 3,
        justification: "\"Your accounts will be transferred automatically to our Market Square branch.\"",
      },
      {
        difficulty: "extreme",
        question: "What will still be available on Elm Street?",
        answers: ["A cash machine", "The branch on Saturdays", "A customer service desk", "Nothing"], correct_index: 0,
        justification: "\"Our cash machine on Elm Street will remain in service.\"",
      },
    ],
  },
];
