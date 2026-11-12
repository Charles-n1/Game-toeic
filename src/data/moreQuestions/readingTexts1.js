// More long-text questions (reading comprehension): one document + its questions.
// Same fields as createQuestion (questions.js), without "section", "text" and "category" (added there).

export const READING_TEXTS_1 = [
  {
    text: `Bean There Café — Now Open on Elm Street!

Our second location opens on Monday, 6 May. To celebrate, every customer will receive a free pastry with any drink during the first week. Bean There is known for its locally roasted coffee and homemade cakes. We also offer free Wi-Fi and a quiet upstairs room that can be reserved for small meetings.

Open daily, 7 A.M.–8 P.M.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is being announced?",
        answers: ["The opening of a new café location", "A change in opening hours", "A new coffee menu", "A coffee-roasting class"], correct_index: 0,
        justification: "\"Our second location opens on Monday.\"",
      },
      {
        difficulty: "hard",
        question: "What will customers receive during the first week?",
        answers: ["A free drink", "A free pastry with a drink", "A discount on cakes", "A free meeting room"], correct_index: 1,
        justification: "\"A free pastry with any drink during the first week.\"",
      },
      {
        difficulty: "extreme",
        question: "What is suggested about Bean There Café?",
        answers: ["It is open only on weekdays.", "It imports its coffee already roasted.", "It already has another location.", "It charges for Wi-Fi."], correct_index: 2,
        justification: "Elm Street is its \"second location\", so another one exists. It is open daily, roasts locally, and Wi-Fi is free.",
      },
    ],
  },
  {
    text: `To: All staff
From: IT Department
Date: 2 October
Subject: New e-mail system

On Saturday, 12 October, we will move all company e-mail accounts to a new system. E-mail will not be available between 8 A.M. and 6 P.M. that day. Your messages, contacts, and calendar will be transferred automatically.

On Monday, you will need to set a new password the first time you log in. A short user guide will be sent to you by Friday.`,
    questions: [
      {
        difficulty: "normal",
        question: "Why was the e-mail sent?",
        answers: ["To ask staff to work on Saturday", "To introduce a new IT manager", "To report a security problem", "To announce a change to the e-mail system"], correct_index: 3,
        justification: "\"We will move all company e-mail accounts to a new system.\"",
      },
      {
        difficulty: "hard",
        question: "What will employees have to do on Monday?",
        answers: ["Create a new password", "Transfer their contacts", "Attend a training session", "Install new software"], correct_index: 0,
        justification: "\"You will need to set a new password the first time you log in.\" Contacts are transferred automatically.",
      },
      {
        difficulty: "extreme",
        question: "What will employees receive before the change?",
        answers: ["A new computer", "Instructions for using the new system", "A copy of their old messages", "A new e-mail address"], correct_index: 1,
        justification: "\"A short user guide will be sent to you by Friday\" (before Saturday's change).",
      },
    ],
  },
  {
    text: `Riverside History Museum — Audio Guides

Audio guides are available at the ticket desk in English, Spanish, French, and Japanese. The guide is free for members and costs $4 for other visitors.

A photo ID must be left at the desk as a deposit and will be returned when the guide is brought back. Please note that audio guides must be returned 30 minutes before the museum closes.`,
    questions: [
      {
        difficulty: "normal",
        question: "How much does an audio guide cost for visitors who are not members?",
        answers: ["Nothing", "$30", "$4", "It depends on the language"], correct_index: 2,
        justification: "\"Free for members and costs $4 for other visitors.\"",
      },
      {
        difficulty: "hard",
        question: "What must visitors leave at the desk?",
        answers: ["Their bags", "A cash deposit", "Their membership card", "A form of identification"], correct_index: 3,
        justification: "\"A photo ID must be left at the desk as a deposit.\"",
      },
      {
        difficulty: "extreme",
        question: "What is NOT mentioned about the audio guides?",
        answers: ["They can be reserved online.", "They are available in several languages.", "Members do not pay for them.", "They must be returned before closing time."], correct_index: 0,
        justification: "Languages, the price for members and the return time are all mentioned. Online booking is not.",
      },
    ],
  },
  {
    text: `Marlow Insurance to Move Headquarters

Marlow Insurance announced yesterday that it will move its headquarters from the city center to the new Westpark business district next spring. The company has outgrown its current offices, where around 600 people work.

The new building will have space for 900 employees, a large cafeteria, and a fitness center. A company spokesperson said that most staff will be able to reach the new site by tram, which stops directly in front of the building.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the article mainly about?",
        answers: ["A new tram line in the city", "A company moving its main office", "The opening of a fitness center", "A company hiring new managers"], correct_index: 1,
        justification: "\"It will move its headquarters ... to the new Westpark business district.\"",
      },
      {
        difficulty: "hard",
        question: "Why is Marlow Insurance moving?",
        answers: ["Its rent has increased.", "Its employees asked for a gym.", "Its current offices are too small.", "The city center is difficult to reach."], correct_index: 2,
        justification: "\"Outgrown its current offices\" = it is now too big for them.",
      },
      {
        difficulty: "extreme",
        question: "What is suggested about Marlow Insurance?",
        answers: ["It will close its city-center stores.", "It is paying for a new tram line.", "It has already moved some employees.", "It may hire more staff in the future."], correct_index: 3,
        justification: "About 600 people work there now, but the new building has space for 900.",
      },
    ],
  },
  {
    text: `Kate Morgan (9:12 A.M.): Hi Leo, are you at the office yet? The client from Berlin just called. She'll be here at 10 instead of 11.
Leo Brandt (9:14 A.M.): I'm on the train. I should arrive around 9:45.
Kate Morgan (9:15 A.M.): OK. Can you bring the printed contracts? They're on your desk, right?
Leo Brandt (9:16 A.M.): Actually, I left them in the meeting room yesterday.
Kate Morgan (9:17 A.M.): No problem, I'll get them.`,
    questions: [
      {
        difficulty: "normal",
        question: "Why does Ms. Morgan write to Mr. Brandt?",
        answers: ["A meeting time has changed.", "A train has been canceled.", "A contract has been lost.", "A client wants to cancel."], correct_index: 0,
        justification: "\"She'll be here at 10 instead of 11.\"",
      },
      {
        difficulty: "hard",
        question: "Where are the contracts?",
        answers: ["On Mr. Brandt's desk", "In the meeting room", "On the train", "At the client's office"], correct_index: 1,
        justification: "\"I left them in the meeting room yesterday.\"",
      },
      {
        difficulty: "extreme",
        question: "At 9:17 A.M., what does Ms. Morgan mean when she writes, \"No problem, I'll get them\"?",
        answers: ["She will print new contracts.", "She will call the client back.", "She will pick up the documents herself.", "She will wait for Mr. Brandt at the station."], correct_index: 2,
        justification: "\"Them\" = the contracts in the meeting room: she will go and take them.",
      },
    ],
  },
  {
    text: `Homeline Furniture — Spring Sale

From 1 to 15 April, save up to 40% on sofas, tables, and beds. Free delivery is available on all orders over $500 within 30 kilometers of our store.

Visit our showroom on Kent Avenue or shop online at homeline.com.

Note: Sale prices do not apply to items already reduced in our clearance section.`,
    questions: [
      {
        difficulty: "normal",
        question: "How long does the sale last?",
        answers: ["One weekend", "One month", "Until the items are sold out", "About two weeks"], correct_index: 3,
        justification: "From 1 to 15 April.",
      },
      {
        difficulty: "hard",
        question: "Who can get free delivery?",
        answers: ["Customers who spend over $500 and live near the store", "All online customers", "Customers who buy a sofa", "Customers who visit the showroom"], correct_index: 0,
        justification: "\"Orders over $500 within 30 kilometers of our store\": both conditions.",
      },
      {
        difficulty: "extreme",
        question: "What is indicated about the clearance section?",
        answers: ["It is only available online.", "Its items are not part of the spring sale.", "Its prices are 40% lower.", "It will close on 15 April."], correct_index: 1,
        justification: "\"Sale prices do not apply to items already reduced in our clearance section.\"",
      },
    ],
  },
  {
    text: `MEMO
To: All employees
From: Human Resources
Re: Summer dress code

From 1 June to 31 August, employees may wear casual clothing on Fridays. Jeans and short-sleeved shirts are acceptable, but sports clothing and sandals are not.

Employees who are meeting clients on a Friday should continue to wear business clothing. If you are unsure, please speak to your manager.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the purpose of the memo?",
        answers: ["To announce new uniforms", "To invite staff to a summer party", "To explain a temporary change to clothing rules", "To change working hours on Fridays"], correct_index: 2,
        justification: "Casual clothing on Fridays, only from June to August.",
      },
      {
        difficulty: "hard",
        question: "What is NOT allowed on Fridays?",
        answers: ["Jeans", "Short-sleeved shirts", "Business clothing", "Sandals"], correct_index: 3,
        justification: "\"Sports clothing and sandals are not\" acceptable.",
      },
      {
        difficulty: "extreme",
        question: "Who should still wear business clothing on Fridays?",
        answers: ["Employees who have meetings with clients", "Managers", "New employees", "Employees who work in summer"], correct_index: 0,
        justification: "\"Employees who are meeting clients on a Friday should continue to wear business clothing.\"",
      },
    ],
  },
  {
    text: `Dear Ms. Hughes,

Your subscription to Garden Monthly will end with the June issue. To continue receiving the magazine without interruption, please renew before 20 May.

Renew for one year for $36, or choose our two-year option for $60 and save $12. As a thank-you, all subscribers who renew before the deadline will receive a free seed collection.

Sincerely,
Garden Monthly Customer Service`,
    questions: [
      {
        difficulty: "normal",
        question: "Why was the letter sent?",
        answers: ["To thank Ms. Hughes for an order", "To ask Ms. Hughes to renew her subscription", "To announce a new magazine", "To confirm a payment"], correct_index: 1,
        justification: "\"Please renew before 20 May.\"",
      },
      {
        difficulty: "hard",
        question: "What will subscribers who renew early receive?",
        answers: ["A free issue", "A $12 refund", "Free seeds", "A gardening book"], correct_index: 2,
        justification: "\"Will receive a free seed collection.\"",
      },
      {
        difficulty: "extreme",
        question: "How much would two separate one-year subscriptions cost?",
        answers: ["$60", "$48", "$36", "$72"], correct_index: 3,
        justification: "2 x $36 = $72. That's why the two-year option ($60) saves $12.",
      },
    ],
  },
  {
    text: `Notice to Residents

Work to replace water pipes on Hill Street will begin on 3 July and is expected to last six weeks. During this time, Hill Street will be closed to traffic between Oak Road and Park Lane. Residents will still be able to reach their homes on foot.

Parking permits for the nearby Station Road car park will be provided free of charge. For questions, please call the city works office at 555-0148.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the purpose of the notice?",
        answers: ["To inform residents about road work", "To announce a new car park", "To ask residents to save water", "To advertise a job at the city works office"], correct_index: 0,
        justification: "Work to replace water pipes; the street will be closed.",
      },
      {
        difficulty: "hard",
        question: "What will residents receive?",
        answers: ["Free bus tickets", "Free parking permits", "A lower water bill", "A new water meter"], correct_index: 1,
        justification: "\"Parking permits ... will be provided free of charge.\"",
      },
      {
        difficulty: "extreme",
        question: "What is suggested about residents of Hill Street?",
        answers: ["They will have no water for six weeks.", "They must move out during the work.", "They will not be able to drive to their homes.", "They have to pay for the new pipes."], correct_index: 2,
        justification: "The street is closed to traffic; they can reach their homes only on foot.",
      },
    ],
  },
  {
    text: `Dear Mr. Patel,

Thank you for your continued business. Due to higher transport costs, we must increase the price of our printer paper by 5% starting 1 September.

However, as one of our long-term customers, you can keep the current price on any order placed before 31 August, even if it is delivered later. Please contact me if you would like to place a large order before the change.

Regards,
Sophie Lam, Account Manager, Papyrus Supplies`,
    questions: [
      {
        difficulty: "normal",
        question: "Why is the price increasing?",
        answers: ["Paper is harder to find.", "The company has new products.", "Mr. Patel orders less paper.", "Transport has become more expensive."], correct_index: 3,
        justification: "\"Due to higher transport costs.\"",
      },
      {
        difficulty: "hard",
        question: "How can Mr. Patel avoid the higher price?",
        answers: ["By ordering before the end of August", "By picking up his order himself", "By paying in advance for a year", "By ordering online"], correct_index: 0,
        justification: "\"Keep the current price on any order placed before 31 August.\"",
      },
      {
        difficulty: "extreme",
        question: "What does Ms. Lam suggest Mr. Patel might do?",
        answers: ["Find a new supplier", "Order a large quantity soon", "Ask for faster delivery", "Change the type of paper he buys"], correct_index: 1,
        justification: "\"Contact me if you would like to place a large order before the change.\"",
      },
    ],
  },
  {
    text: `Local Firm Gives Staff Time to Volunteer

Starting this year, employees at Kendall Engineering can take two paid days off each year to volunteer for a charity of their choice. The idea came from a staff survey in which many employees said they wanted to help their community but did not have the time.

So far, more than 80 employees have signed up, and most have chosen to help at local schools or food banks.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the article mainly about?",
        answers: ["A new local school", "A charity that needs money", "A company program that lets staff volunteer", "An engineering competition"], correct_index: 2,
        justification: "Employees can take two paid days off to volunteer.",
      },
      {
        difficulty: "hard",
        question: "Where did the idea for the program come from?",
        answers: ["A local food bank", "The company's director", "A school project", "A survey of employees"], correct_index: 3,
        justification: "\"The idea came from a staff survey.\"",
      },
      {
        difficulty: "extreme",
        question: "What is NOT stated about the program?",
        answers: ["It is only for managers.", "The volunteering days are paid.", "Employees choose the charity.", "Many participants help at schools."], correct_index: 0,
        justification: "Paid days, charity of their choice, schools: all stated. Nothing says it is only for managers.",
      },
    ],
  },
  {
    text: `Taste of Italy Cooking Classes

Learn to make fresh pasta, sauces, and desserts with Chef Marco Bellini. Classes are held every Thursday evening from 6:30 to 9:00 P.M. at the Community Kitchen on Mill Road.

All ingredients and equipment are provided, and participants eat what they cook at the end of each class. Groups are limited to ten people.

Price: $55 per class, or $200 for a four-class package.`,
    questions: [
      {
        difficulty: "normal",
        question: "When do the classes take place?",
        answers: ["On weekend mornings", "On Thursday evenings", "Every day at lunchtime", "On Monday evenings"], correct_index: 1,
        justification: "\"Every Thursday evening from 6:30 to 9:00 P.M.\"",
      },
      {
        difficulty: "hard",
        question: "What is included in the price?",
        answers: ["A cookbook", "Transportation", "The ingredients", "A bottle of wine"], correct_index: 2,
        justification: "\"All ingredients and equipment are provided.\"",
      },
      {
        difficulty: "extreme",
        question: "How much does a participant save with the four-class package?",
        answers: ["$55", "$15", "$45", "$20"], correct_index: 3,
        justification: "4 x $55 = $220. The package costs $200, so $20 is saved.",
      },
    ],
  },
  {
    text: `Dear Mr. Fischer,

Thank you for your message about your recent stay at the Seaview Hotel. I am very sorry that the air conditioning in your room was not working and that it took so long for our staff to respond. We have since replaced the system on the entire fourth floor.

To apologize, we would like to offer you a free night on your next visit. Please mention this e-mail when you book.

Best regards,
Anita Rao, Guest Relations Manager`,
    questions: [
      {
        difficulty: "normal",
        question: "Why did Ms. Rao write to Mr. Fischer?",
        answers: ["To respond to a complaint", "To confirm a booking", "To advertise a special offer", "To ask for a review"], correct_index: 0,
        justification: "She answers his message about a problem and apologizes.",
      },
      {
        difficulty: "hard",
        question: "What problem did Mr. Fischer have?",
        answers: ["His room was not clean.", "A machine in his room did not work.", "He was charged twice.", "His room was too noisy."], correct_index: 1,
        justification: "\"The air conditioning in your room was not working.\"",
      },
      {
        difficulty: "extreme",
        question: "What is most likely true about Mr. Fischer's room?",
        answers: ["It had a sea view.", "It has been closed.", "It was on the fourth floor.", "It was booked by his company."], correct_index: 2,
        justification: "They replaced the system \"on the entire fourth floor\" after his problem.",
      },
    ],
  },
  {
    text: `Study Rooms at Elmwood Library

The library has six study rooms that can be reserved for up to two hours per day. Rooms can be booked online or at the information desk up to one week in advance. Each room has a whiteboard and space for four people.

If you are more than fifteen minutes late, your reservation may be given to someone else. Food is not allowed in the study rooms, but drinks in closed containers are.`,
    questions: [
      {
        difficulty: "normal",
        question: "How long can a room be reserved each day?",
        answers: ["One hour", "Four hours", "Fifteen minutes", "Two hours"], correct_index: 3,
        justification: "\"Up to two hours per day.\"",
      },
      {
        difficulty: "hard",
        question: "What may happen to a person who arrives 20 minutes late?",
        answers: ["They may lose their room.", "They will have to pay a fee.", "They will get a smaller room.", "They cannot book again for a week."], correct_index: 0,
        justification: "More than fifteen minutes late: the room \"may be given to someone else\".",
      },
      {
        difficulty: "extreme",
        question: "Which of the following is allowed in the study rooms?",
        answers: ["A sandwich", "A bottle of water with a lid", "A group of six people", "A three-hour session"], correct_index: 1,
        justification: "\"Drinks in closed containers\" are allowed. No food, four people maximum, two hours maximum.",
      },
    ],
  },
  {
    text: `SkyWest Adds Direct Flights to Lisbon

Starting in June, SkyWest Airlines will offer direct flights from Manchester to Lisbon three times a week. Until now, passengers had to change planes in London, which added about three hours to the journey.

The flights will leave Manchester on Mondays, Wednesdays, and Fridays. Introductory fares start at £89 for tickets bought before 31 March.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the article about?",
        answers: ["A new airport in Lisbon", "Lower prices for flights to London", "A new flight route", "A new airline"], correct_index: 2,
        justification: "Direct flights from Manchester to Lisbon, starting in June.",
      },
      {
        difficulty: "hard",
        question: "How did passengers travel from Manchester to Lisbon before?",
        answers: ["By train", "Only on weekends", "Through Madrid", "With a stop in London"], correct_index: 3,
        justification: "\"Passengers had to change planes in London.\"",
      },
      {
        difficulty: "extreme",
        question: "What is suggested about the new flights?",
        answers: ["They will make the trip shorter.", "They will run every day.", "They will be cheaper after March.", "They will leave from London."], correct_index: 0,
        justification: "The stop in London added about three hours: a direct flight saves that time.",
      },
    ],
  },
  {
    text: `Maria Lopez (2:03 P.M.): The projector in Room B isn't working. My presentation starts at 2:30.
Tom Becker (2:05 P.M.): Have you tried a different cable?
Maria Lopez (2:06 P.M.): Yes, two of them.
Tom Becker (2:07 P.M.): Room D is free all afternoon. It has a new projector.
Maria Lopez (2:08 P.M.): Great. I'll tell everyone to go there instead.
Tom Becker (2:09 P.M.): I'll report the problem to IT.`,
    questions: [
      {
        difficulty: "normal",
        question: "What problem does Ms. Lopez have?",
        answers: ["She is late for a meeting.", "Some equipment is not working.", "She lost her presentation.", "A room is already booked."], correct_index: 1,
        justification: "\"The projector in Room B isn't working.\"",
      },
      {
        difficulty: "hard",
        question: "At 2:06 P.M., what does Ms. Lopez mean when she writes, \"Yes, two of them\"?",
        answers: ["She needs two new cables.", "Two people will attend.", "She has already tried his suggestion.", "She has two presentations."], correct_index: 2,
        justification: "She already tried different cables (two of them), and it didn't help.",
      },
      {
        difficulty: "extreme",
        question: "What will Ms. Lopez most likely do next?",
        answers: ["Call the IT department", "Cancel her presentation", "Buy a new cable", "Tell the participants about a new room"], correct_index: 3,
        justification: "\"I'll tell everyone to go there instead.\" Mr. Becker is the one who will contact IT.",
      },
    ],
  },
  {
    text: `Position: Part-Time Bookkeeper

Hanford Builders, a construction company with 40 employees, is looking for a part-time bookkeeper to work 20 hours per week. Duties include paying bills, preparing invoices, and keeping financial records up to date.

Applicants should have at least two years of bookkeeping experience and be familiar with standard accounting software. Working hours are flexible. Please send a résumé and two references to jobs@hanfordbuilders.com.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the main job of the bookkeeper?",
        answers: ["Managing financial records", "Building houses", "Hiring new employees", "Selling construction materials"], correct_index: 0,
        justification: "Paying bills, preparing invoices, keeping financial records.",
      },
      {
        difficulty: "hard",
        question: "What is a requirement for the position?",
        answers: ["A university degree", "Experience in bookkeeping", "Knowledge of construction", "The ability to work weekends"], correct_index: 1,
        justification: "\"At least two years of bookkeeping experience.\"",
      },
      {
        difficulty: "extreme",
        question: "What is NOT mentioned in the advertisement?",
        answers: ["The number of hours per week", "The need for references", "The salary", "The flexibility of the hours"], correct_index: 2,
        justification: "20 hours, two references and flexible hours are mentioned. The salary is not.",
      },
    ],
  },
  {
    text: `Dear Ms. Grant,

This e-mail confirms your registration for the Public Speaking Workshop on Saturday, 9 November, from 10 A.M. to 3 P.M. at the Lakeside Conference Center, Room 12. Lunch will be provided.

Participants are asked to prepare a two-minute talk on any topic to present during the afternoon session. Parking is available behind the building.

Best regards,
Workshop Team`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the purpose of the e-mail?",
        answers: ["To cancel a workshop", "To ask for payment", "To change a room", "To confirm a registration"], correct_index: 3,
        justification: "\"This e-mail confirms your registration.\"",
      },
      {
        difficulty: "hard",
        question: "What are participants asked to do before the workshop?",
        answers: ["Prepare a short speech", "Bring their own lunch", "Read a book", "Choose a topic from a list"], correct_index: 0,
        justification: "\"Prepare a two-minute talk on any topic.\" Lunch is provided.",
      },
      {
        difficulty: "extreme",
        question: "When will Ms. Grant most likely give her talk?",
        answers: ["At 10 A.M.", "After lunch", "Before the workshop starts", "On another day"], correct_index: 1,
        justification: "The talks are \"during the afternoon session\", so after lunch.",
      },
    ],
  },
  {
    text: `Changes to Recycling Collection

From 1 March, glass bottles and jars must no longer be placed in the blue recycling bin. Instead, they should be taken to one of the glass collection points located at supermarkets around town.

Paper, cardboard, and plastic can still go in the blue bin, which will be collected every two weeks as usual. A map of glass collection points is available on the town's website.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is changing?",
        answers: ["The color of the bins", "The price of recycling", "How glass is recycled", "The location of supermarkets"], correct_index: 2,
        justification: "Glass no longer goes in the blue bin.",
      },
      {
        difficulty: "hard",
        question: "Where should residents take glass?",
        answers: ["To the town hall", "To the blue bin", "To a recycling center outside town", "To collection points at supermarkets"], correct_index: 3,
        justification: "\"Glass collection points located at supermarkets around town.\"",
      },
      {
        difficulty: "extreme",
        question: "What is indicated about the blue bin?",
        answers: ["Its collection schedule will stay the same.", "It will be collected every week.", "It will be replaced by a new bin.", "It can no longer be used for plastic."], correct_index: 0,
        justification: "\"Collected every two weeks as usual.\"",
      },
    ],
  },
  {
    text: `Small Bookstore Thrives

While many independent bookstores have closed in recent years, Page Turner Books on Main Street has doubled its sales since 2020. Owner Grace Liu credits the shop's success to its events: author talks, children's story hours, and a monthly book club.

"People can buy books anywhere," she says. "They come here for the community." The store recently hired two new employees to help run its growing events program.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the article mainly about?",
        answers: ["The closing of a bookstore", "A successful local business", "A new book by a local author", "A children's library"], correct_index: 1,
        justification: "Page Turner Books has doubled its sales.",
      },
      {
        difficulty: "hard",
        question: "What does Ms. Liu think is the reason for the store's success?",
        answers: ["Its low prices", "Its large selection", "The events it organizes", "Its online shop"], correct_index: 2,
        justification: "\"Credits the shop's success to its events.\"",
      },
      {
        difficulty: "extreme",
        question: "What does Ms. Liu imply when she says, \"People can buy books anywhere\"?",
        answers: ["Her store sells books in many cities.", "Books are cheaper online.", "Her customers live far from the store.", "Selling books alone is not enough to attract customers."], correct_index: 3,
        justification: "Books are available everywhere, so people come for something else: the community.",
      },
    ],
  },
  {
    text: `Brightwater Utilities — Account Notice

Account number: 55-2049
Amount due: $84.20
Due date: 15 October

Our records show that your payment for September has not yet been received. If you have already paid, please ignore this notice. To avoid a late fee of $10, please pay by the due date.

You can pay online, by phone, or at any post office. Customers who sign up for automatic payments receive a $2 discount each month.`,
    questions: [
      {
        difficulty: "normal",
        question: "Why was the notice sent?",
        answers: ["A payment has not been received.", "The price of water has increased.", "The account number has changed.", "A refund is available."], correct_index: 0,
        justification: "\"Your payment for September has not yet been received.\"",
      },
      {
        difficulty: "hard",
        question: "How much will the customer pay after 15 October?",
        answers: ["$84.20", "$94.20", "$82.20", "$10.00"], correct_index: 1,
        justification: "$84.20 + a late fee of $10 = $94.20.",
      },
      {
        difficulty: "extreme",
        question: "How can customers lower their monthly bill?",
        answers: ["By paying at a post office", "By paying early", "By setting up automatic payments", "By calling customer service"], correct_index: 2,
        justification: "\"Customers who sign up for automatic payments receive a $2 discount each month.\"",
      },
    ],
  },
  {
    text: `Hi everyone,

Thank you for signing up to help at the charity run on Sunday. Please arrive at the park entrance by 7:30 A.M. to collect your volunteer T-shirt.

Most of you will be placed at water stations along the route, but we still need two people to help with registration. If you are interested, please reply to this e-mail. The event should end by noon.

Thanks,
Rosa`,
    questions: [
      {
        difficulty: "normal",
        question: "Who is the e-mail for?",
        answers: ["Runners in a race", "Park employees", "Sponsors of a charity", "Volunteers at an event"], correct_index: 3,
        justification: "\"Thank you for signing up to help ... your volunteer T-shirt.\"",
      },
      {
        difficulty: "hard",
        question: "What will volunteers receive when they arrive?",
        answers: ["A shirt", "A bottle of water", "A map of the route", "A meal"], correct_index: 0,
        justification: "\"To collect your volunteer T-shirt.\"",
      },
      {
        difficulty: "extreme",
        question: "What does Rosa ask some readers to do?",
        answers: ["Bring their own water", "Offer to help at the registration desk", "Arrive before 7 A.M.", "Find more volunteers"], correct_index: 1,
        justification: "\"We still need two people to help with registration. If you are interested, please reply.\"",
      },
    ],
  },
  {
    text: `Review: Aquaflow Water Bottle

I bought the Aquaflow bottle for my daily bike ride to work. It keeps water cold for over twelve hours, even on hot days, and it fits perfectly in my bike's bottle holder.

My only complaint is the lid, which is a little difficult to open with one hand. At $25, it is more expensive than most bottles, but I think the quality justifies the price.

— Daniel K.`,
    questions: [
      {
        difficulty: "normal",
        question: "Why did Daniel buy the bottle?",
        answers: ["To use at the gym", "As a gift", "To use while cycling", "For hiking trips"], correct_index: 2,
        justification: "\"For my daily bike ride to work.\"",
      },
      {
        difficulty: "hard",
        question: "What does Daniel dislike about the bottle?",
        answers: ["Its size", "Its color", "How long it keeps water cold", "The lid"], correct_index: 3,
        justification: "\"My only complaint is the lid.\"",
      },
      {
        difficulty: "extreme",
        question: "What does Daniel think about the price?",
        answers: ["It is high but worth it.", "It is too high for what you get.", "It is cheaper than other bottles.", "It should include a bike holder."], correct_index: 0,
        justification: "\"More expensive than most bottles, but I think the quality justifies the price.\"",
      },
    ],
  },
  {
    text: `Office Move Schedule

The finance department will move to the fifth floor on Friday, 22 March. Please pack your desk items in the boxes provided by Thursday at 5 P.M. Label each box with your name and new desk number.

Movers will transport furniture and computers on Friday morning, and the IT team will reconnect all computers by Friday afternoon. Employees should work from home on Friday.`,
    questions: [
      {
        difficulty: "normal",
        question: "Who is the notice for?",
        answers: ["The IT team", "Finance department employees", "The movers", "Visitors to the building"], correct_index: 1,
        justification: "\"The finance department will move to the fifth floor.\"",
      },
      {
        difficulty: "hard",
        question: "What should employees do by Thursday at 5 P.M.?",
        answers: ["Move their computers", "Choose a new desk", "Pack their desk items", "Contact the IT team"], correct_index: 2,
        justification: "\"Pack your desk items in the boxes provided by Thursday at 5 P.M.\"",
      },
      {
        difficulty: "extreme",
        question: "Why should employees most likely work from home on Friday?",
        answers: ["The building will be closed for cleaning.", "There will be a holiday.", "The fifth floor is not ready.", "Their office computers will not be available."], correct_index: 3,
        justification: "On Friday, the computers are moved in the morning and reconnected only in the afternoon.",
      },
    ],
  },
  {
    text: `Farmers Market Moves Indoors for Winter

The Greenfield Farmers Market, usually held outdoors in Central Square, will move inside the Town Hall from November to March. The market will keep its regular Saturday hours, from 8 A.M. to 1 P.M.

About 25 of the market's 40 sellers will take part during the winter months, offering vegetables, cheese, honey, and baked goods. Organizers hope the indoor location will attract more shoppers during the cold season.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is changing about the market in winter?",
        answers: ["Its location", "Its opening hours", "The day it takes place", "Its name"], correct_index: 0,
        justification: "It moves inside the Town Hall. The Saturday hours stay the same.",
      },
      {
        difficulty: "hard",
        question: "How many sellers will take part in winter?",
        answers: ["40", "About 25", "About 15", "Over 50"], correct_index: 1,
        justification: "\"About 25 of the market's 40 sellers.\"",
      },
      {
        difficulty: "extreme",
        question: "What is suggested about the market?",
        answers: ["It is open every day in summer.", "It will stay in the Town Hall permanently.", "Some sellers do not take part in winter.", "It sells only vegetables in winter."], correct_index: 2,
        justification: "Only 25 of the 40 sellers come in winter, so 15 do not.",
      },
    ],
  },
  {
    text: `Dear Mr. Kowalski,

Our records show that your 2019 Corvo sedan is due for its annual service. A standard service includes an oil change, a brake check, and a tire rotation, and takes about two hours.

You can book an appointment online or by calling us. Customers who book before the end of the month will receive a free car wash. If you have recently had your car serviced elsewhere, please let us know so we can update our records.

Kind regards,
Mendez Auto Care`,
    questions: [
      {
        difficulty: "normal",
        question: "Why did Mendez Auto Care write to Mr. Kowalski?",
        answers: ["To sell him a new car", "To confirm an appointment", "To report a problem with his brakes", "To remind him about a car service"], correct_index: 3,
        justification: "\"Your ... sedan is due for its annual service.\"",
      },
      {
        difficulty: "hard",
        question: "What is NOT part of a standard service?",
        answers: ["A car wash", "An oil change", "A brake check", "A tire rotation"], correct_index: 0,
        justification: "The car wash is a free extra for early booking, not part of the standard service.",
      },
      {
        difficulty: "extreme",
        question: "Why might Mr. Kowalski contact the company?",
        answers: ["He wants a free car wash next month.", "He already had his car serviced at another garage.", "He sold his car last year.", "He wants to complain about the price."], correct_index: 1,
        justification: "\"If you have recently had your car serviced elsewhere, please let us know.\"",
      },
    ],
  },
  {
    text: `Pool Rules — Oakdale Leisure Center

Children under 8 must be accompanied by an adult in the water at all times.

Lane swimming is available from 6 to 9 A.M. and from 6 to 8 P.M. At other times, the pool is open for general use.

Swimming caps are required for anyone with long hair.

Lockers require a $1 coin, which is returned when the locker is opened.`,
    questions: [
      {
        difficulty: "normal",
        question: "When is lane swimming available?",
        answers: ["All day", "Only on weekends", "Early in the morning and in the evening", "In the afternoon"], correct_index: 2,
        justification: "From 6 to 9 A.M. and from 6 to 8 P.M.",
      },
      {
        difficulty: "hard",
        question: "Who must wear a swimming cap?",
        answers: ["Children under 8", "Everyone", "Lane swimmers", "People with long hair"], correct_index: 3,
        justification: "\"Swimming caps are required for anyone with long hair.\"",
      },
      {
        difficulty: "extreme",
        question: "What is indicated about the lockers?",
        answers: ["In the end, they cost nothing to use.", "They cost $1 per hour.", "They are only for members.", "They must be booked in advance."], correct_index: 0,
        justification: "The $1 coin \"is returned when the locker is opened\".",
      },
    ],
  },
  {
    text: `Startup Raises $5 Million

Greenroute, a company that makes software to help delivery firms plan shorter routes, has raised $5 million from investors. The company was founded three years ago by two former delivery drivers.

Its software is now used by more than 200 businesses, which say it has reduced their fuel costs by an average of 15%. Greenroute plans to use the money to open an office in Spain and hire 30 engineers.`,
    questions: [
      {
        difficulty: "normal",
        question: "What does Greenroute make?",
        answers: ["Delivery trucks", "Software for planning delivery routes", "Fuel for vehicles", "Maps for tourists"], correct_index: 1,
        justification: "\"Software to help delivery firms plan shorter routes.\"",
      },
      {
        difficulty: "hard",
        question: "What is mentioned about the company's founders?",
        answers: ["They are engineers from Spain.", "They started the company ten years ago.", "They used to work as delivery drivers.", "They are also investors."], correct_index: 2,
        justification: "\"Founded ... by two former delivery drivers.\"",
      },
      {
        difficulty: "extreme",
        question: "What does Greenroute plan to do with the money?",
        answers: ["Buy a fleet of trucks", "Lower its prices by 15%", "Move its headquarters", "Expand into another country"], correct_index: 3,
        justification: "\"Open an office in Spain and hire 30 engineers.\"",
      },
    ],
  },
  {
    text: `Hi Priya,

I missed yesterday's budget meeting because my flight was delayed. Could you send me the minutes when they are ready? I'd especially like to know whether the marketing budget for next year was approved.

Also, if any tasks were given to me during the meeting, please let me know so I can start on them this week.

Thanks,
Jonas`,
    questions: [
      {
        difficulty: "normal",
        question: "Why did Jonas miss the meeting?",
        answers: ["He was traveling.", "He was sick.", "He forgot about it.", "He was in another meeting."], correct_index: 0,
        justification: "\"Because my flight was delayed.\"",
      },
      {
        difficulty: "hard",
        question: "What does Jonas especially want to know?",
        answers: ["When the next meeting is", "Whether a budget was approved", "Who attended the meeting", "How long the meeting lasted"], correct_index: 1,
        justification: "\"Whether the marketing budget for next year was approved.\"",
      },
      {
        difficulty: "extreme",
        question: "What does Jonas say he is ready to do?",
        answers: ["Organize the next meeting", "Present the budget", "Start any work he was given", "Write the minutes himself"], correct_index: 2,
        justification: "\"If any tasks were given to me ... I can start on them this week.\"",
      },
    ],
  },
  {
    text: `WorkHub Coworking

Need a quiet place to work? WorkHub offers desks, private offices, and meeting rooms in the heart of the city.

A day pass costs $25 and includes coffee, Wi-Fi, and printing. Monthly members pay $250 and get 24-hour access, a personal locker, and four hours of free meeting room use each month.

Visit us for a free trial day!`,
    questions: [
      {
        difficulty: "normal",
        question: "What is being advertised?",
        answers: ["A coffee shop", "A printing company", "An office furniture store", "A shared workspace"], correct_index: 3,
        justification: "Desks, private offices and meeting rooms: coworking.",
      },
      {
        difficulty: "hard",
        question: "What do monthly members get that day-pass users do not?",
        answers: ["Access at any time of day", "Free coffee", "Wi-Fi", "Printing"], correct_index: 0,
        justification: "24-hour access is for monthly members. Coffee, Wi-Fi and printing come with the day pass too.",
      },
      {
        difficulty: "extreme",
        question: "What can new visitors do?",
        answers: ["Get a free locker", "Use the space for one day without paying", "Rent a meeting room for free for four hours", "Pay $25 for a month"], correct_index: 1,
        justification: "\"Visit us for a free trial day!\"",
      },
    ],
  },
  {
    text: `Dear Guests,

Due to renovation work in our restaurant, breakfast will be served in the Garden Lounge on the ground floor from 10 to 24 February. Breakfast hours will remain the same (6:30–10:00 A.M.).

Please note that the hot breakfast menu will be limited during this time. We apologize for any inconvenience. Guests who prefer can request free breakfast delivery to their room.`,
    questions: [
      {
        difficulty: "normal",
        question: "Why is breakfast being served in a different place?",
        answers: ["The restaurant is too small.", "There is a private event.", "The restaurant is being renovated.", "The kitchen is closed."], correct_index: 2,
        justification: "\"Due to renovation work in our restaurant.\"",
      },
      {
        difficulty: "hard",
        question: "What will NOT change during this period?",
        answers: ["The place of breakfast", "The hot breakfast menu", "The restaurant", "The breakfast hours"], correct_index: 3,
        justification: "\"Breakfast hours will remain the same.\"",
      },
      {
        difficulty: "extreme",
        question: "What does the hotel offer guests?",
        answers: ["Breakfast in their room at no extra cost", "A discount on their stay", "A free dinner", "A larger room"], correct_index: 0,
        justification: "\"Guests ... can request free breakfast delivery to their room.\"",
      },
    ],
  },
  {
    text: `Residents Want More Park Benches

A recent survey of 1,200 residents found that most people are happy with the city's parks, but many would like more benches and public restrooms. Seventy percent of those surveyed visit a park at least once a week.

The city's parks department said it would add 50 new benches this year and build two new restroom facilities by next summer. The survey also showed that residents want more evening events in parks.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the article mainly about?",
        answers: ["The opening of a new park", "The results of a survey", "A concert in the park", "The cost of public restrooms"], correct_index: 1,
        justification: "\"A recent survey of 1,200 residents found that ...\"",
      },
      {
        difficulty: "hard",
        question: "According to the survey, how often do most residents visit a park?",
        answers: ["Every day", "Once a month", "At least once a week", "Only in summer"], correct_index: 2,
        justification: "\"Seventy percent ... visit a park at least once a week.\"",
      },
      {
        difficulty: "extreme",
        question: "Which request has the city NOT yet promised to address?",
        answers: ["More benches", "More public restrooms", "None of them", "More evening events"], correct_index: 3,
        justification: "Benches and restrooms are planned. Evening events are only mentioned as a wish.",
      },
    ],
  },
  {
    text: `Dear Ms. Romano,

I am the purchasing manager at Bella Restaurants, a group of five Italian restaurants in Chicago. We are looking for a new supplier of olive oil and would be interested in your extra virgin oil.

Could you send us a sample, together with your price list for large orders? We currently use about 400 liters per month across our restaurants.

Best regards,
Marco Ferri`,
    questions: [
      {
        difficulty: "normal",
        question: "Why did Mr. Ferri write?",
        answers: ["To ask for a sample and prices", "To complain about an order", "To offer a job", "To book a table"], correct_index: 0,
        justification: "\"Could you send us a sample, together with your price list?\"",
      },
      {
        difficulty: "hard",
        question: "What does Mr. Ferri say about Bella Restaurants?",
        answers: ["It is opening in Italy.", "It has several locations.", "It makes its own olive oil.", "It is a new company."], correct_index: 1,
        justification: "\"A group of five Italian restaurants.\"",
      },
      {
        difficulty: "extreme",
        question: "What is suggested about Bella Restaurants?",
        answers: ["It is unhappy with Ms. Romano's oil.", "It wants to buy a restaurant.", "It could become a large customer.", "It uses very little olive oil."], correct_index: 2,
        justification: "It uses about 400 liters per month and asks for prices for large orders.",
      },
    ],
  },
  {
    text: `Using the Coffee Machine

1. Place a cup under the spout.
2. Choose your drink on the touch screen.
3. Press "Start." Your drink will be ready in about 40 seconds.

Please empty the drip tray at the end of the day. If the screen shows "Descale," contact the office manager; do not try to clean the machine yourself. Milk must be kept in the refrigerator, not left next to the machine.`,
    questions: [
      {
        difficulty: "normal",
        question: "Where would these instructions most likely be found?",
        answers: ["In a coffee shop menu", "In a supermarket", "In a hotel room", "In an office kitchen"], correct_index: 3,
        justification: "It mentions the office manager and shared rules.",
      },
      {
        difficulty: "hard",
        question: "What should users do if the screen shows \"Descale\"?",
        answers: ["Inform the office manager", "Clean the machine", "Empty the drip tray", "Turn off the machine"], correct_index: 0,
        justification: "\"Contact the office manager; do not try to clean the machine yourself.\"",
      },
      {
        difficulty: "extreme",
        question: "What is NOT mentioned in the instructions?",
        answers: ["Where to keep the milk", "How to order more coffee beans", "How long a drink takes", "When to empty the drip tray"], correct_index: 1,
        justification: "Milk, 40 seconds and the end of the day are all mentioned. Ordering beans is not.",
      },
    ],
  },
  {
    text: `Rail Fares to Rise in January

Train fares across the country will increase by an average of 3% from 2 January, the National Rail Association announced on Tuesday. The association said the extra money will be used to buy new trains and improve stations.

Passenger groups criticized the increase, pointing out that many trains were late last year. Season ticket holders who renew before 31 December will pay the current price.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the article about?",
        answers: ["A new train station", "A strike by train drivers", "An increase in train fares", "A new season ticket"], correct_index: 2,
        justification: "\"Train fares ... will increase by an average of 3%.\"",
      },
      {
        difficulty: "hard",
        question: "How will the extra money be used?",
        answers: ["To pay train drivers more", "To lower season ticket prices", "To build new railway lines", "To modernize trains and stations"], correct_index: 3,
        justification: "\"To buy new trains and improve stations.\"",
      },
      {
        difficulty: "extreme",
        question: "What can be inferred about passenger groups?",
        answers: ["They are unhappy with the quality of the service.", "They asked for the increase.", "They will buy new trains.", "They want more season tickets."], correct_index: 0,
        justification: "They criticized the increase, pointing out that many trains were late.",
      },
    ],
  },
  {
    text: `Dear Dr. Okafor,

On behalf of the Greenfield Business Association, I would like to invite you to speak at our annual dinner on 18 April. Your recent book on small business finance has been very popular among our members, and we believe your talk would be of great interest.

The talk should last about 30 minutes, followed by questions. We would of course cover your travel expenses and provide a hotel room.

Sincerely,
Helen Ward, Events Coordinator`,
    questions: [
      {
        difficulty: "normal",
        question: "Why did Ms. Ward write?",
        answers: ["To order copies of a book", "To invite someone to give a talk", "To ask for financial advice", "To join an association"], correct_index: 1,
        justification: "\"I would like to invite you to speak at our annual dinner.\"",
      },
      {
        difficulty: "hard",
        question: "Why was Dr. Okafor chosen?",
        answers: ["Because she is a member", "Because she organized last year's dinner", "Because of a book she wrote", "Because she lives nearby"], correct_index: 2,
        justification: "\"Your recent book ... has been very popular among our members.\"",
      },
      {
        difficulty: "extreme",
        question: "What will the association pay for?",
        answers: ["Copies of her book for all members", "A speaking fee only", "Nothing", "Dr. Okafor's trip and accommodation"], correct_index: 3,
        justification: "\"We would ... cover your travel expenses and provide a hotel room.\"",
      },
    ],
  },
  {
    text: `Schedule Change — Yoga Classes

Starting next week, the Tuesday evening yoga class will move from 7 P.M. to 6 P.M. The Thursday class will stay at 7 P.M.

Because of high demand, we are also adding a new Saturday morning class at 9 A.M. Members must book all classes through our app, as walk-ins can no longer be accepted.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is changing?",
        answers: ["A class schedule", "The price of classes", "The yoga teacher", "The gym's address"], correct_index: 0,
        justification: "The Tuesday class moves to 6 P.M. and a Saturday class is added.",
      },
      {
        difficulty: "hard",
        question: "Why is a Saturday class being added?",
        answers: ["The Tuesday class is canceled.", "Many members want to do yoga.", "The teacher is free on Saturdays.", "The gym opens later on weekdays."], correct_index: 1,
        justification: "\"Because of high demand.\"",
      },
      {
        difficulty: "extreme",
        question: "What will happen to a member who comes to a class without booking?",
        answers: ["They will pay a higher price.", "They will be put on a waiting list.", "They will not be able to join.", "They can join the Thursday class instead."], correct_index: 2,
        justification: "\"Walk-ins can no longer be accepted.\"",
      },
    ],
  },
  {
    text: `Ana Silva (11:20 A.M.): Did the shipment from Lumex arrive?
Paul Wright (11:22 A.M.): Part of it. We got the lamps, but not the shades.
Ana Silva (11:23 A.M.): The customer wants the full order by Friday.
Paul Wright (11:25 A.M.): I'll call Lumex now and ask them to send the rest by express.
Ana Silva (11:26 A.M.): Good idea. Let me know what they say.`,
    questions: [
      {
        difficulty: "normal",
        question: "What are the writers discussing?",
        answers: ["A new customer", "A price increase", "A meeting", "A delivery"], correct_index: 3,
        justification: "\"Did the shipment from Lumex arrive?\"",
      },
      {
        difficulty: "hard",
        question: "What problem does Mr. Wright mention?",
        answers: ["Some items are missing.", "Some lamps are broken.", "The shipment is too large.", "The invoice is wrong."], correct_index: 0,
        justification: "\"We got the lamps, but not the shades.\"",
      },
      {
        difficulty: "extreme",
        question: "At 11:23 A.M., why does Ms. Silva write, \"The customer wants the full order by Friday\"?",
        answers: ["To change the delivery date", "To show that the missing items are needed soon", "To cancel the order", "To ask Mr. Wright to call the customer"], correct_index: 1,
        justification: "She stresses the deadline; Mr. Wright then decides to ask for express delivery.",
      },
    ],
  },
  {
    text: `LinguaGo — Learn on the Go

LinguaGo offers short daily lessons in 12 languages that you can complete in just ten minutes. The app adapts to your level and reminds you to practice every day.

The basic version is free. LinguaGo Plus, which costs $7.99 per month, adds offline lessons, speaking practice with a teacher once a month, and no advertisements. Try LinguaGo Plus free for 14 days.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is being advertised?",
        answers: ["A language school", "A translation service", "A language-learning app", "A travel guide"], correct_index: 2,
        justification: "Short daily lessons in 12 languages on an app.",
      },
      {
        difficulty: "hard",
        question: "What is included only in LinguaGo Plus?",
        answers: ["Daily reminders", "Lessons in 12 languages", "Lessons adapted to your level", "Lessons without an internet connection"], correct_index: 3,
        justification: "Plus \"adds offline lessons\". Reminders, 12 languages and adaptation are in the basic app.",
      },
      {
        difficulty: "extreme",
        question: "What is suggested about the basic version?",
        answers: ["It shows advertisements.", "It costs $7.99.", "It offers speaking practice.", "It is only available for 14 days."], correct_index: 0,
        justification: "Plus adds \"no advertisements\", so the free version has them.",
      },
    ],
  },
  {
    text: `Weekend Access

From this Saturday, the office building will be locked on weekends. Employees who need to work on a Saturday or Sunday must use their security badge at the side entrance on Pine Street. The main entrance will remain closed.

Please note that heating is turned down on weekends, so the building may be cold. Security staff are on duty 24 hours a day.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the purpose of the notice?",
        answers: ["To announce a new security team", "To explain new rules for entering on weekends", "To ask staff to work on weekends", "To report a heating problem"], correct_index: 1,
        justification: "The building will be locked; use your badge at the side entrance.",
      },
      {
        difficulty: "hard",
        question: "How can employees enter the building on weekends?",
        answers: ["Through the main entrance", "By calling security", "With their badge at the side door", "With a special key"], correct_index: 2,
        justification: "\"Use their security badge at the side entrance on Pine Street.\"",
      },
      {
        difficulty: "extreme",
        question: "What is suggested about the building on weekends?",
        answers: ["It has no security staff.", "It is open to visitors.", "Its elevators do not work.", "It may be less warm than usual."], correct_index: 3,
        justification: "\"Heating is turned down on weekends, so the building may be cold.\"",
      },
    ],
  },
  {
    text: `New Restaurant Brings Korean Food to Harbor District

Seoul Kitchen opened last Friday in the Harbor District, offering traditional Korean dishes such as bibimbap and kimchi stew. The restaurant is run by chef Min-jun Park, who previously worked at a well-known restaurant in Seoul for ten years.

Lunch specials start at $12. The restaurant does not take reservations, so diners are advised to arrive early on weekends.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the article about?",
        answers: ["A new restaurant", "A cooking competition", "A trip to Korea", "A food delivery service"], correct_index: 0,
        justification: "\"Seoul Kitchen opened last Friday.\"",
      },
      {
        difficulty: "hard",
        question: "What is mentioned about the chef?",
        answers: ["He owns several restaurants.", "He worked in Seoul for many years.", "He won a cooking prize.", "He teaches cooking classes."], correct_index: 1,
        justification: "\"Previously worked at a well-known restaurant in Seoul for ten years.\"",
      },
      {
        difficulty: "extreme",
        question: "Why are diners advised to arrive early on weekends?",
        answers: ["The restaurant closes early.", "Lunch specials end at noon.", "Tables cannot be booked in advance.", "There is limited parking."], correct_index: 2,
        justification: "\"The restaurant does not take reservations, so ...\"",
      },
    ],
  },
  {
    text: `Hi Carla,

I'm sorry, but the quarterly sales report will be a day late. The figures from the Denver office arrived only this morning, and I need time to check them. I'll send you the full report by Thursday afternoon.

In the meantime, I've attached a summary of the other regions' results.

Best,
Owen`,
    questions: [
      {
        difficulty: "normal",
        question: "Why did Owen write?",
        answers: ["To ask for sales figures", "To cancel a meeting", "To introduce a colleague", "To explain a delay"], correct_index: 3,
        justification: "\"The quarterly sales report will be a day late.\"",
      },
      {
        difficulty: "hard",
        question: "What caused the problem?",
        answers: ["Information from another office arrived late.", "Owen was sick.", "The Denver office closed.", "The computer system failed."], correct_index: 0,
        justification: "\"The figures from the Denver office arrived only this morning.\"",
      },
      {
        difficulty: "extreme",
        question: "What did Owen send with the e-mail?",
        answers: ["The full report", "Part of the results", "The Denver figures", "A meeting agenda"], correct_index: 1,
        justification: "\"A summary of the other regions' results\": not Denver, so only part.",
      },
    ],
  },
  {
    text: `Free Shuttle Bus to the Exhibition Center

During the Home and Garden Show (14–17 May), a free shuttle bus will run every 15 minutes between Central Station and the Exhibition Center. The first bus leaves the station at 8:30 A.M., and the last bus leaves the center at 7:00 P.M.

Show visitors are strongly encouraged to use the shuttle, as parking at the center is very limited.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the notice about?",
        answers: ["A new train station", "A garden competition", "A free bus service", "A parking fee"], correct_index: 2,
        justification: "\"A free shuttle bus will run ...\"",
      },
      {
        difficulty: "hard",
        question: "How often does the shuttle run?",
        answers: ["Every hour", "Twice a day", "Every 30 minutes", "Every 15 minutes"], correct_index: 3,
        justification: "\"Every 15 minutes.\"",
      },
      {
        difficulty: "extreme",
        question: "Why are visitors encouraged to use the shuttle?",
        answers: ["There are few parking spaces at the center.", "Taxis are expensive.", "The center is far from any road.", "The show is crowded in the morning."], correct_index: 0,
        justification: "\"As parking at the center is very limited.\"",
      },
    ],
  },
  {
    text: `Dear Tenant,

As permitted by your lease, your monthly rent will increase from $1,150 to $1,190 starting 1 August. This change reflects higher maintenance and insurance costs.

We have recently replaced the building's heating system and repainted all hallways, and we plan to renovate the laundry room this autumn. Thank you for being a valued tenant.

Sincerely,
Parkview Property Management`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the purpose of the letter?",
        answers: ["To welcome a new tenant", "To announce a rent increase", "To ask for a late payment", "To announce that the building is for sale"], correct_index: 1,
        justification: "\"Your monthly rent will increase.\"",
      },
      {
        difficulty: "hard",
        question: "By how much will the rent increase?",
        answers: ["$150", "$1,190", "$40", "$4"], correct_index: 2,
        justification: "$1,190 - $1,150 = $40.",
      },
      {
        difficulty: "extreme",
        question: "What work is planned for later this year?",
        answers: ["Replacing the heating system", "Painting the hallways", "Building a parking lot", "Renovating the laundry room"], correct_index: 3,
        justification: "Heating and hallways are already done. The laundry room is planned for autumn.",
      },
    ],
  },
  {
    text: `Chocolate Factory Opens Doors to Visitors

Visitors can now tour the Brennan Chocolate factory, which has produced chocolate in the town of Ashby since 1921. The 90-minute tours show how cocoa beans are turned into chocolate bars and include a tasting session.

Tours run Tuesday to Saturday and cost $15 for adults and $8 for children. Because the factory is still working, visitors must wear the hairnets provided and may not take photos inside.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the article about?",
        answers: ["Tours of a factory", "A new chocolate shop", "A cooking class", "A food festival"], correct_index: 0,
        justification: "\"Visitors can now tour the Brennan Chocolate factory.\"",
      },
      {
        difficulty: "hard",
        question: "What is included in the tour?",
        answers: ["A free box of chocolates", "Tasting chocolate", "Lunch", "A photo session"], correct_index: 1,
        justification: "\"Include a tasting session.\" Photos are not allowed.",
      },
      {
        difficulty: "extreme",
        question: "What is suggested about Brennan Chocolate?",
        answers: ["It is closed on Saturdays.", "It no longer produces chocolate.", "It has been in business for over 100 years.", "It was founded by a cocoa farmer."], correct_index: 2,
        justification: "It has produced chocolate in Ashby since 1921.",
      },
    ],
  },
];
