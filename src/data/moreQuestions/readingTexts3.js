// More long-text questions (reading comprehension): one document + its questions.
// Same fields as createQuestion (questions.js), without "section", "text" and "category" (added there).

export const READING_TEXTS_3 = [
  {
    text: `Office Plants — Please Read

Green Office Services will now water and care for the plants in our offices every Tuesday morning. Please do not water the plants yourself, as too much water can damage them.

If a plant near your desk looks unhealthy, write a note on the board in the kitchen, and the service will check it during its next visit. Employees who would like a plant for their desk can request one from the office manager.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the notice about?",
        answers: ["A new service that cares for office plants", "A plant sale", "A gardening course", "A new kitchen"], correct_index: 0,
        justification: "\"Green Office Services will now water and care for the plants.\"",
      },
      {
        difficulty: "hard",
        question: "What are employees asked NOT to do?",
        answers: ["Move their desks", "Water the plants", "Buy new plants", "Use the kitchen"], correct_index: 1,
        justification: "\"Please do not water the plants yourself.\"",
      },
      {
        difficulty: "extreme",
        question: "What should employees do if a plant looks sick?",
        answers: ["Throw it away", "Call Green Office Services", "Leave a message on a board", "Give it more water"], correct_index: 2,
        justification: "\"Write a note on the board in the kitchen.\"",
      },
    ],
  },
  {
    text: `Hi everyone,

This month's book club meeting will take place on Thursday, 15 May, instead of our usual Wednesday, because the library is closed on the 14th for a staff training day. We will meet at the same time (6:30 P.M.) in the same room.

We will be discussing "The Lighthouse Keeper" by Anna Ford. If you haven't finished it yet, don't worry — everyone is welcome!

See you there,
Paula`,
    questions: [
      {
        difficulty: "normal",
        question: "What has changed about the book club meeting?",
        answers: ["The time", "The room", "The book", "The day"], correct_index: 3,
        justification: "Thursday instead of Wednesday; same time, same room.",
      },
      {
        difficulty: "hard",
        question: "Why was the change made?",
        answers: ["The library will be closed.", "Paula is busy on Wednesday.", "The author will visit.", "The room is too small."], correct_index: 0,
        justification: "\"The library is closed on the 14th for a staff training day.\"",
      },
      {
        difficulty: "extreme",
        question: "What does Paula say about people who have not finished the book?",
        answers: ["They should read it before the meeting.", "They can still come.", "They should join next month.", "They can borrow another copy."], correct_index: 1,
        justification: "\"If you haven't finished it yet, don't worry — everyone is welcome!\"",
      },
    ],
  },
  {
    text: `Crystal Clear Window Cleaning

Professional window cleaning for homes and businesses. Our team uses environmentally friendly products and can safely clean windows up to the tenth floor.

Regular customers can choose a monthly or quarterly plan. First-time customers receive 20% off their first cleaning. All work is fully insured, and if you are not happy with the result, we will come back and clean again for free.`,
    questions: [
      {
        difficulty: "normal",
        question: "What service is being advertised?",
        answers: ["House painting", "Office cleaning products", "Window cleaning", "Building insurance"], correct_index: 2,
        justification: "\"Professional window cleaning for homes and businesses.\"",
      },
      {
        difficulty: "hard",
        question: "Who can get a 20% discount?",
        answers: ["Customers with a monthly plan", "Businesses", "Customers on the tenth floor", "New customers"], correct_index: 3,
        justification: "\"First-time customers receive 20% off their first cleaning.\"",
      },
      {
        difficulty: "extreme",
        question: "What does the company promise unhappy customers?",
        answers: ["A second cleaning at no cost", "A full refund", "A free monthly plan", "A discount on their insurance"], correct_index: 0,
        justification: "\"We will come back and clean again for free.\"",
      },
    ],
  },
  {
    text: `Hospital Opens New Children's Wing

St. Mary's Hospital opened its new children's wing on Monday. The wing has 40 beds, a play area, and rooms where parents can stay overnight with their children.

The $25 million project was funded mainly by donations from local residents and businesses. Hospital director Dr. Amina Bello said the new wing will reduce waiting times for young patients, who previously had to be treated in the general wards.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the article about?",
        answers: ["A new school", "A new part of a hospital", "A charity concert", "A doctor's award"], correct_index: 1,
        justification: "\"St. Mary's Hospital opened its new children's wing.\"",
      },
      {
        difficulty: "hard",
        question: "How was the project mainly paid for?",
        answers: ["By the national government", "By patients' fees", "With gifts from the local community", "By a bank loan"], correct_index: 2,
        justification: "\"Funded mainly by donations from local residents and businesses.\"",
      },
      {
        difficulty: "extreme",
        question: "Where were young patients treated before?",
        answers: ["In another city", "At home", "In a temporary building", "In the general wards"], correct_index: 3,
        justification: "\"Who previously had to be treated in the general wards.\"",
      },
    ],
  },
  {
    text: `Nadia Haddad (1:05 P.M.): Can you book a car for tomorrow? I'm driving the client to the factory.
Ben Lowe (1:07 P.M.): Sure. What time do you need it?
Nadia Haddad (1:08 P.M.): From 8 A.M. We should be back by 4.
Ben Lowe (1:12 P.M.): All the company cars are taken tomorrow. I can rent one from City Rentals.
Nadia Haddad (1:13 P.M.): That's fine. Please ask for something with a big trunk. The client is bringing samples.`,
    questions: [
      {
        difficulty: "normal",
        question: "What does Ms. Haddad ask Mr. Lowe to do?",
        answers: ["Arrange a car", "Drive a client", "Visit a factory", "Prepare some samples"], correct_index: 0,
        justification: "\"Can you book a car for tomorrow?\"",
      },
      {
        difficulty: "hard",
        question: "What problem does Mr. Lowe mention?",
        answers: ["The factory is closed.", "No company cars are available.", "City Rentals is too expensive.", "The client canceled."], correct_index: 1,
        justification: "\"All the company cars are taken tomorrow.\"",
      },
      {
        difficulty: "extreme",
        question: "Why does Ms. Haddad want a car with a big trunk?",
        answers: ["She is moving furniture.", "Several people are coming.", "The client will bring some products.", "She needs to carry factory tools."], correct_index: 2,
        justification: "\"The client is bringing samples.\"",
      },
    ],
  },
  {
    text: `MEMO
To: All warehouse staff
From: Safety Manager
Subject: Forklift training

From 1 October, only employees with a valid forklift certificate will be allowed to drive forklifts in the warehouse. Free training courses will be held on 10, 17, and 24 September.

Each course lasts one full day and ends with a short practical test. Please sign up with your supervisor by 5 September. Employees who already have a certificate from another employer must show it to the safety manager.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the memo about?",
        answers: ["A new warehouse", "A safety accident", "A change in working hours", "A new rule for driving forklifts"], correct_index: 3,
        justification: "Only certified employees will be allowed to drive forklifts.",
      },
      {
        difficulty: "hard",
        question: "What happens at the end of each course?",
        answers: ["Participants take a test.", "Participants get a new forklift.", "Participants receive a bonus.", "Participants visit another warehouse."], correct_index: 0,
        justification: "\"Ends with a short practical test.\"",
      },
      {
        difficulty: "extreme",
        question: "What should an employee with a certificate from a previous job do?",
        answers: ["Take the course anyway", "Show it to the safety manager", "Sign up by 5 September", "Give it to the supervisor"], correct_index: 1,
        justification: "\"Must show it to the safety manager.\"",
      },
    ],
  },
  {
    text: `Island Ferries — Winter Schedule

From 1 November to 31 March, ferries between Port Calder and Marrow Island will run four times a day instead of eight. The first ferry leaves Port Calder at 7 A.M. and the last returns from Marrow Island at 6 P.M.

Bookings are recommended for cars. Foot passengers can buy tickets on board. Sailings may be canceled in bad weather; please check our website before traveling.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the main change in winter?",
        answers: ["Ferries are more expensive.", "Ferries leave from a different port.", "There are fewer ferries each day.", "Ferries no longer carry cars."], correct_index: 2,
        justification: "\"Four times a day instead of eight.\"",
      },
      {
        difficulty: "hard",
        question: "Who should book in advance?",
        answers: ["All passengers", "Foot passengers", "Island residents", "People traveling with a car"], correct_index: 3,
        justification: "\"Bookings are recommended for cars.\"",
      },
      {
        difficulty: "extreme",
        question: "Why should travelers check the website before leaving?",
        answers: ["A trip may be canceled because of weather.", "Tickets are only sold online.", "The schedule changes every day.", "The port may be closed for repairs."], correct_index: 0,
        justification: "\"Sailings may be canceled in bad weather.\"",
      },
    ],
  },
  {
    text: `Dear team,

Our monthly call with the Singapore office will take place on Tuesday at 4 P.M. our time, which is 10 P.M. in Singapore. I know this is late for our colleagues there, so let's try to finish within 45 minutes.

Please join using the link in the calendar invitation. Before the call, read the attached sales report and prepare one question for the Singapore team.

Thanks,
Victor`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the e-mail about?",
        answers: ["A trip to Singapore", "A regular call with another office", "A new sales manager", "A change in sales targets"], correct_index: 1,
        justification: "\"Our monthly call with the Singapore office.\"",
      },
      {
        difficulty: "hard",
        question: "Why does Victor want to keep the call short?",
        answers: ["He has another meeting at 5 P.M.", "The internet connection is slow.", "It will be late at night for the Singapore team.", "There is little to discuss."], correct_index: 2,
        justification: "\"This is late for our colleagues there\" (10 P.M.).",
      },
      {
        difficulty: "extreme",
        question: "What should team members do before the call?",
        answers: ["Send their sales figures", "Book a meeting room", "Call the Singapore office", "Read a document and think of a question"], correct_index: 3,
        justification: "\"Read the attached sales report and prepare one question.\"",
      },
    ],
  },
  {
    text: `OfficeFlex Furniture Rental

Starting a new business or opening a temporary office? Rent everything you need from OfficeFlex: desks, chairs, filing cabinets, and meeting tables.

Rentals start from one month, and we deliver and set up everything within 48 hours. When your rental ends, we pick up the furniture at no extra cost. Customers who decide to keep the furniture can buy it at a reduced price.`,
    questions: [
      {
        difficulty: "normal",
        question: "What does OfficeFlex offer?",
        answers: ["Office furniture for rent", "Office space for rent", "Moving services for homes", "Furniture repairs"], correct_index: 0,
        justification: "\"Rent everything you need from OfficeFlex: desks, chairs ...\"",
      },
      {
        difficulty: "hard",
        question: "What is the shortest rental period?",
        answers: ["48 hours", "One month", "One week", "One year"], correct_index: 1,
        justification: "\"Rentals start from one month.\"",
      },
      {
        difficulty: "extreme",
        question: "What can customers do at the end of their rental?",
        answers: ["Return the furniture to a store", "Rent it for free for one more month", "Purchase the furniture for less", "Exchange it for new furniture"], correct_index: 2,
        justification: "\"Customers who decide to keep the furniture can buy it at a reduced price.\"",
      },
    ],
  },
  {
    text: `Local Brewery to Double Production

Hopwood Brewery, which started in a small garage in 2015, will double its production after moving to a larger site on the edge of town next year. The new site will also include a restaurant and a visitor center where guests can tour the brewery.

Owner Sam Hopwood said demand for the brewery's drinks has grown quickly since a large supermarket chain began selling them last year.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the article mainly about?",
        answers: ["A new supermarket", "A restaurant review", "A brewing competition", "A business growing"], correct_index: 3,
        justification: "The brewery will double its production.",
      },
      {
        difficulty: "hard",
        question: "What will the new site include?",
        answers: ["A restaurant", "A supermarket", "A hotel", "A garage"], correct_index: 0,
        justification: "\"Will also include a restaurant and a visitor center.\"",
      },
      {
        difficulty: "extreme",
        question: "According to Mr. Hopwood, why has demand increased?",
        answers: ["The brewery lowered its prices.", "A big store chain started selling the drinks.", "Tourists visit the brewery.", "The brewery won an award."], correct_index: 1,
        justification: "\"Since a large supermarket chain began selling them last year.\"",
      },
    ],
  },
  {
    text: `Changes to Late Fees

From 1 January, Ashton Public Library will no longer charge late fees for overdue books. Instead, borrowers will not be able to check out new items until all overdue items are returned.

Fees for lost or damaged books will still apply. The library hopes that this change will encourage people who stopped visiting because of unpaid fees to come back.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is changing?",
        answers: ["The library will close earlier.", "Books can be borrowed for longer.", "The library will stop charging for late books.", "The library will charge more for lost books."], correct_index: 2,
        justification: "\"Will no longer charge late fees for overdue books.\"",
      },
      {
        difficulty: "hard",
        question: "What will happen to people with overdue books?",
        answers: ["They must pay double.", "Their card will be canceled.", "They will receive a phone call.", "They cannot borrow more items until they return them."], correct_index: 3,
        justification: "\"Borrowers will not be able to check out new items until all overdue items are returned.\"",
      },
      {
        difficulty: "extreme",
        question: "What does the library hope will happen?",
        answers: ["Some former users will return to the library.", "Fewer books will be lost.", "The library will earn more money.", "People will read faster."], correct_index: 0,
        justification: "It hopes people \"who stopped visiting because of unpaid fees\" will come back.",
      },
    ],
  },
  {
    text: `Dear Customer Service,

I bought a Brio coffee grinder from your website eight months ago, and it has stopped working. The motor makes a noise, but the blades do not turn.

According to the product information, the grinder has a two-year warranty. Could you tell me how to send it for repair? I still have the original box and my order confirmation.

Thank you,
Helen Park`,
    questions: [
      {
        difficulty: "normal",
        question: "Why did Ms. Park write?",
        answers: ["To order a new grinder", "To ask about repairing a product", "To complain about late delivery", "To ask for a discount"], correct_index: 1,
        justification: "\"Could you tell me how to send it for repair?\"",
      },
      {
        difficulty: "hard",
        question: "What is wrong with the grinder?",
        answers: ["It makes no noise.", "It arrived without a box.", "The blades do not move.", "It is the wrong color."], correct_index: 2,
        justification: "\"The motor makes a noise, but the blades do not turn.\"",
      },
      {
        difficulty: "extreme",
        question: "Why does Ms. Park believe the repair should be covered?",
        answers: ["She paid for an extra service.", "The grinder was a gift.", "She bought it last week.", "The grinder is still under warranty."], correct_index: 3,
        justification: "She bought it eight months ago, and it has a two-year warranty.",
      },
    ],
  },
  {
    text: `About Us — Golden Crust Bakery

Golden Crust was founded in 1987 by Maria and Luis Ortega, who brought family recipes from Spain. Today, their daughter Elena runs the bakery, which has grown from one small shop to four locations across the city.

We still bake everything by hand each morning, using flour from a local mill. In 2020, we started offering gluten-free bread, which is now one of our best sellers.`,
    questions: [
      {
        difficulty: "normal",
        question: "Who runs Golden Crust Bakery today?",
        answers: ["The founders' daughter", "Maria and Luis Ortega", "A local mill", "A large company"], correct_index: 0,
        justification: "\"Today, their daughter Elena runs the bakery.\"",
      },
      {
        difficulty: "hard",
        question: "Where does the bakery get its flour?",
        answers: ["From Spain", "From a nearby mill", "From a supermarket", "From its own farm"], correct_index: 1,
        justification: "\"Using flour from a local mill.\"",
      },
      {
        difficulty: "extreme",
        question: "What is suggested about the gluten-free bread?",
        answers: ["It is only sold in one shop.", "It was made in 1987.", "It has become very popular.", "It is imported from Spain."], correct_index: 2,
        justification: "It \"is now one of our best sellers\".",
      },
    ],
  },
  {
    text: `Survey: Most Workers Want to Keep Working from Home

A survey of 2,500 office workers found that 65% want to continue working from home at least two days a week. Workers said they save time and money by not traveling to the office every day.

However, many also said they miss talking to colleagues in person. Managers were less positive: only 40% believed working from home made their teams more productive.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the article about?",
        answers: ["A new office building", "The cost of public transport", "A company hiring managers", "Opinions about working from home"], correct_index: 3,
        justification: "A survey about working from home.",
      },
      {
        difficulty: "hard",
        question: "What is a disadvantage mentioned by workers?",
        answers: ["They miss face-to-face contact.", "They spend more money.", "They work longer hours.", "Their internet is slow."], correct_index: 0,
        justification: "\"Many also said they miss talking to colleagues in person.\"",
      },
      {
        difficulty: "extreme",
        question: "What does the survey suggest about managers?",
        answers: ["Most want to work from home every day.", "Many are not sure that working from home helps productivity.", "They save more time than workers.", "They were not included in the survey."], correct_index: 1,
        justification: "\"Only 40% believed working from home made their teams more productive.\"",
      },
    ],
  },
  {
    text: `Dear Mr. Duval,

Your company's lease for Suite 400 at Harbor Plaza will end on 30 June. We would be happy to renew it for another three years at the current monthly rent of $4,800.

If you would like to renew, please sign the enclosed agreement and return it by 31 March. If we do not hear from you by then, the suite may be offered to other businesses.

Sincerely,
Harbor Plaza Leasing Office`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the purpose of the letter?",
        answers: ["To announce a rent increase", "To ask a company to leave", "To offer to renew a lease", "To advertise a new office"], correct_index: 2,
        justification: "\"We would be happy to renew it for another three years.\"",
      },
      {
        difficulty: "hard",
        question: "What is true about the rent?",
        answers: ["It will increase.", "It will be paid yearly.", "It will be lower.", "It will not change."], correct_index: 3,
        justification: "\"At the current monthly rent of $4,800.\"",
      },
      {
        difficulty: "extreme",
        question: "What might happen if Mr. Duval does not reply by 31 March?",
        answers: ["Another company could rent the office.", "His rent will increase.", "His lease will end immediately.", "He will have to pay a fee."], correct_index: 0,
        justification: "\"The suite may be offered to other businesses.\"",
      },
    ],
  },
  {
    text: `Notice to All Residents

The building's heating system will be tested on Friday, 4 October, between 10 A.M. and 2 P.M. During the test, radiators may become very hot and make noise. This is normal.

Please make sure nothing is placed on or directly in front of your radiators. If you notice a leak or any other problem after the test, please contact the building manager immediately.`,
    questions: [
      {
        difficulty: "normal",
        question: "What will happen on 4 October?",
        answers: ["The radiators will be replaced.", "The heating will be tested.", "The building will be painted.", "The water will be turned off."], correct_index: 1,
        justification: "\"The building's heating system will be tested.\"",
      },
      {
        difficulty: "hard",
        question: "What are residents asked to do?",
        answers: ["Leave their apartments", "Turn off their heating", "Keep their radiators clear", "Call the building manager before the test"], correct_index: 2,
        justification: "\"Make sure nothing is placed on or directly in front of your radiators.\"",
      },
      {
        difficulty: "extreme",
        question: "What does the notice say about noise from the radiators?",
        answers: ["It should be reported immediately.", "It will last all day.", "It means the test has failed.", "It is not a sign of a problem."], correct_index: 3,
        justification: "\"Radiators may become very hot and make noise. This is normal.\"",
      },
    ],
  },
  {
    text: `TaxEase — Tax Help for Individuals and Small Businesses

Don't spend your weekend struggling with tax forms. Our qualified accountants will prepare and submit your tax return quickly and correctly.

Personal tax returns start at $90. Small business returns start at $250. Book an appointment before 28 February and get 15% off. Can't come to our office? Send us your documents online, and we will do the rest.`,
    questions: [
      {
        difficulty: "normal",
        question: "What does TaxEase offer?",
        answers: ["Help with tax returns", "Accounting courses", "Business loans", "Office cleaning"], correct_index: 0,
        justification: "\"Our qualified accountants will prepare and submit your tax return.\"",
      },
      {
        difficulty: "hard",
        question: "How much would a personal tax return cost with the early discount?",
        answers: ["From $90", "From $76.50", "From $250", "From $212.50"], correct_index: 1,
        justification: "$90 - 15% ($13.50) = $76.50.",
      },
      {
        difficulty: "extreme",
        question: "What can customers who cannot visit the office do?",
        answers: ["Call an accountant at home", "Wait until March", "Send their documents online", "Fill in the forms themselves"], correct_index: 2,
        justification: "\"Send us your documents online, and we will do the rest.\"",
      },
    ],
  },
  {
    text: `Chris Evans (6:12 P.M.): Has anyone seen a set of keys with a blue key ring? I think I left them in the meeting room.
Lin Zhou (6:15 P.M.): I'm still at the office. Let me check.
Lin Zhou (6:18 P.M.): Found them, next to the coffee machine.
Chris Evans (6:19 P.M.): Thank you! I'm already at the station. Could you leave them at reception?
Lin Zhou (6:20 P.M.): Reception is closed now. I'll keep them and give them to you tomorrow morning.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is Mr. Evans looking for?",
        answers: ["His phone", "A meeting room", "A coffee machine", "His keys"], correct_index: 3,
        justification: "\"Has anyone seen a set of keys with a blue key ring?\"",
      },
      {
        difficulty: "hard",
        question: "Where were the keys found?",
        answers: ["Next to the coffee machine", "In the meeting room", "At reception", "At the station"], correct_index: 0,
        justification: "\"Found them, next to the coffee machine.\"",
      },
      {
        difficulty: "extreme",
        question: "Why does Ms. Zhou NOT leave the keys at reception?",
        answers: ["She is in a hurry.", "Reception is closed.", "Mr. Evans asked her to keep them.", "She does not know where reception is."], correct_index: 1,
        justification: "\"Reception is closed now.\"",
      },
    ],
  },
  {
    text: `Improved Access at Central Station

Central Station now has new elevators to all platforms, making the station fully accessible for wheelchair users and passengers with heavy luggage or strollers. The work, which took eight months, also included new tactile paving to help passengers with poor eyesight.

Passengers who need help can still book assistance at least two hours before their journey through the rail company's website.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the notice about?",
        answers: ["A new train line", "Higher ticket prices", "Improvements to a train station", "A station closing"], correct_index: 2,
        justification: "New elevators and tactile paving at Central Station.",
      },
      {
        difficulty: "hard",
        question: "Who will benefit from the new elevators?",
        answers: ["Only station employees", "Taxi drivers", "Shop owners", "People with wheelchairs or heavy bags"], correct_index: 3,
        justification: "\"Wheelchair users and passengers with heavy luggage or strollers.\"",
      },
      {
        difficulty: "extreme",
        question: "How can passengers get personal help?",
        answers: ["By booking it online in advance", "By pressing a button on the platform", "By calling the station on the day", "By asking a train driver"], correct_index: 0,
        justification: "\"Book assistance at least two hours before their journey through the ... website.\"",
      },
    ],
  },
  {
    text: `Dear Mr. Fontaine,

Thank you for agreeing to photograph our company's anniversary dinner on Saturday, 19 October. The event will start at 7 P.M. at the Belmont Hotel, and we would like you to arrive by 6:30 P.M. to take group photos before the guests sit down.

As agreed, your fee is $600 for four hours. Please send the edited photos within two weeks of the event.

Best regards,
Rachel Kim, Events Team`,
    questions: [
      {
        difficulty: "normal",
        question: "Who is Mr. Fontaine?",
        answers: ["A hotel manager", "A photographer", "A guest at a dinner", "A chef"], correct_index: 1,
        justification: "\"Thank you for agreeing to photograph our company's anniversary dinner.\"",
      },
      {
        difficulty: "hard",
        question: "Why should Mr. Fontaine arrive early?",
        answers: ["To set up the room", "To meet the hotel manager", "To take group photos", "To eat before the guests"], correct_index: 2,
        justification: "\"To take group photos before the guests sit down.\"",
      },
      {
        difficulty: "extreme",
        question: "When should the photos be delivered?",
        answers: ["On the night of the event", "Before 19 October", "After four hours", "Within two weeks after the dinner"], correct_index: 3,
        justification: "\"Please send the edited photos within two weeks of the event.\"",
      },
    ],
  },
  {
    text: `Harbor Bridge Reopens

The Harbor Bridge reopened to traffic on Saturday after six months of repairs. Engineers replaced the bridge's road surface and strengthened its supports, which had been damaged by heavy trucks.

To protect the bridge, vehicles over 12 tons are no longer allowed to cross it. Trucks must now use the ring road, which adds about ten minutes to their journey. A new bicycle lane has also been added.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the article about?",
        answers: ["A bridge reopening after repairs", "A new harbor", "A truck accident", "A cycling race"], correct_index: 0,
        justification: "\"The Harbor Bridge reopened to traffic on Saturday.\"",
      },
      {
        difficulty: "hard",
        question: "What caused the damage to the bridge?",
        answers: ["A storm", "Heavy trucks", "An earthquake", "A ship"], correct_index: 1,
        justification: "\"Its supports, which had been damaged by heavy trucks.\"",
      },
      {
        difficulty: "extreme",
        question: "What is suggested about heavy trucks?",
        answers: ["They can use the new bicycle lane.", "They must pay to cross the bridge.", "Their trips will now take longer.", "They can cross only at night."], correct_index: 2,
        justification: "They must use the ring road, \"which adds about ten minutes\".",
      },
    ],
  },
  {
    text: `Happy Paws Dog Walking

Busy at work? Let Happy Paws take your dog for a walk! Our friendly walkers will pick up your dog from your home and take it for a 45-minute walk in the park.

Walks are available Monday to Friday between 10 A.M. and 4 P.M. Single walks cost $18, or buy a pack of ten walks for $150. All our walkers are trained in animal first aid.`,
    questions: [
      {
        difficulty: "normal",
        question: "What does Happy Paws offer?",
        answers: ["Dog training classes", "Pet food delivery", "Animal medical care", "Walks for dogs"], correct_index: 3,
        justification: "\"Let Happy Paws take your dog for a walk!\"",
      },
      {
        difficulty: "hard",
        question: "How much does one walk cost with the ten-walk pack?",
        answers: ["$15", "$18", "$10", "$150"], correct_index: 0,
        justification: "$150 / 10 = $15 per walk.",
      },
      {
        difficulty: "extreme",
        question: "What is mentioned about the walkers?",
        answers: ["They own dogs themselves.", "They know how to give first aid to animals.", "They work on weekends.", "They are veterinarians."], correct_index: 1,
        justification: "\"Trained in animal first aid.\"",
      },
    ],
  },
  {
    text: `New Payment Cards for the Cafeteria

From 1 September, the staff cafeteria will no longer accept cash. Employees can pay with a bank card or with their staff ID card, which can now be loaded with money at the machine next to the cafeteria entrance.

Employees who pay with their staff ID card will receive a 5% discount on all meals. Visitors can pay by bank card only.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is changing in the cafeteria?",
        answers: ["Meals will be more expensive.", "The cafeteria will close earlier.", "Cash will no longer be accepted.", "Visitors can no longer eat there."], correct_index: 2,
        justification: "\"Will no longer accept cash.\"",
      },
      {
        difficulty: "hard",
        question: "Where can employees add money to their ID card?",
        answers: ["At the bank", "At reception", "Online", "At a machine near the cafeteria"], correct_index: 3,
        justification: "\"At the machine next to the cafeteria entrance.\"",
      },
      {
        difficulty: "extreme",
        question: "How can employees get a lower price?",
        answers: ["By paying with their staff ID card", "By paying in cash", "By paying with a bank card", "By bringing a visitor"], correct_index: 0,
        justification: "\"Employees who pay with their staff ID card will receive a 5% discount.\"",
      },
    ],
  },
  {
    text: `Dear participants,

Please note that the Digital Health Conference on 6–7 May has been moved from the Westside Hotel to the larger Meridian Convention Center, because registrations exceeded our expectations.

The program and times will not change. Your hotel bookings at the Westside Hotel remain valid; a free shuttle will run between the hotel and the convention center every 30 minutes.

Conference Organizing Committee`,
    questions: [
      {
        difficulty: "normal",
        question: "What has changed about the conference?",
        answers: ["Its dates", "Its location", "Its program", "Its name"], correct_index: 1,
        justification: "Moved from the Westside Hotel to the Meridian Convention Center.",
      },
      {
        difficulty: "hard",
        question: "Why was the change made?",
        answers: ["The hotel was closed.", "A speaker canceled.", "More people registered than expected.", "The hotel was too expensive."], correct_index: 2,
        justification: "\"Because registrations exceeded our expectations.\"",
      },
      {
        difficulty: "extreme",
        question: "What will help participants staying at the Westside Hotel?",
        answers: ["A discount on their room", "A new booking", "A parking space", "A free bus service"], correct_index: 3,
        justification: "\"A free shuttle will run between the hotel and the convention center.\"",
      },
    ],
  },
  {
    text: `Review: Bella Vista Restaurant ★★☆☆☆

I had high hopes for Bella Vista after reading good reviews, but my visit last Saturday was disappointing. We waited 40 minutes for our main courses, and the pasta was cold when it arrived.

To be fair, the waiter apologized and offered us free desserts, which were delicious. The view of the lake is also beautiful. However, at these prices, I expect better service.

— Tom W.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is Tom's general opinion of the restaurant?",
        answers: ["He was disappointed.", "He loved it.", "He thought it was cheap.", "He has not been there yet."], correct_index: 0,
        justification: "\"My visit last Saturday was disappointing.\"",
      },
      {
        difficulty: "hard",
        question: "What did Tom like?",
        answers: ["The speed of the service", "The desserts and the view", "The hot pasta", "The low prices"], correct_index: 1,
        justification: "The desserts \"were delicious\" and the view \"is beautiful\".",
      },
      {
        difficulty: "extreme",
        question: "What does Tom suggest about Bella Vista's prices?",
        answers: ["They are reasonable.", "They are lower than other restaurants.", "They are high.", "They include dessert."], correct_index: 2,
        justification: "\"At these prices, I expect better service\": the prices are high.",
      },
    ],
  },
  {
    text: `Department Store to Close After 80 Years

Hallam's, the department store on Market Street, will close its doors in January after 80 years in business. The owners said that fewer people shop in the city center since a large shopping mall opened outside town.

All 65 employees have been offered jobs at the company's other two stores. A closing sale with discounts of up to 70% will begin next week.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the article about?",
        answers: ["A new shopping mall", "A sale at a supermarket", "A store hiring staff", "A store closing"], correct_index: 3,
        justification: "\"Hallam's ... will close its doors in January.\"",
      },
      {
        difficulty: "hard",
        question: "Why is Hallam's closing?",
        answers: ["Fewer people shop downtown.", "The owners are retiring.", "The building is too old.", "The rent has increased."], correct_index: 0,
        justification: "\"Fewer people shop in the city center since a large shopping mall opened.\"",
      },
      {
        difficulty: "extreme",
        question: "What is indicated about the store's employees?",
        answers: ["They will all lose their jobs.", "They can work at other Hallam's stores.", "They will work at the new mall.", "They will run the closing sale online."], correct_index: 1,
        justification: "\"All 65 employees have been offered jobs at the company's other two stores.\"",
      },
    ],
  },
  {
    text: `Free Museum Day

On Sunday, 18 May, International Museum Day, entry to the City Museum of Art will be free for all visitors. In addition to our permanent collection, visitors can see the special exhibition "Colors of the Sea," which normally costs $10.

Free guided tours will start every hour from 10 A.M. Because large crowds are expected, visitors are advised to come early and to use public transport.`,
    questions: [
      {
        difficulty: "normal",
        question: "What will happen on 18 May?",
        answers: ["The museum will be closed.", "A new museum will open.", "Visitors will not pay to enter the museum.", "The museum will sell paintings."], correct_index: 2,
        justification: "\"Entry to the City Museum of Art will be free for all visitors.\"",
      },
      {
        difficulty: "hard",
        question: "How much does the special exhibition usually cost?",
        answers: ["Nothing", "$18", "$1", "$10"], correct_index: 3,
        justification: "\"Which normally costs $10.\"",
      },
      {
        difficulty: "extreme",
        question: "Why are visitors advised to arrive early?",
        answers: ["Many people are expected to come.", "The museum closes at noon.", "Tours are only in the morning.", "The exhibition ends that day."], correct_index: 0,
        justification: "\"Because large crowds are expected.\"",
      },
    ],
  },
  {
    text: `Dear Professor Lang,

I hope you are well. I am applying for a master's program in environmental engineering at Delft University, and I would be very grateful if you could write a letter of recommendation for me.

You taught me in your Water Management course last year, where I received the top grade for my final project. The application deadline is 15 March. I have attached my CV and a short description of the program.

Best regards,
Sara Ahmed`,
    questions: [
      {
        difficulty: "normal",
        question: "What does Ms. Ahmed ask Professor Lang to do?",
        answers: ["Teach a new course", "Write a recommendation letter", "Give her a better grade", "Review her final project"], correct_index: 1,
        justification: "\"Could you write a letter of recommendation for me?\"",
      },
      {
        difficulty: "hard",
        question: "How does Professor Lang know Ms. Ahmed?",
        answers: ["She works in his department.", "She is his colleague at Delft.", "She was his student.", "They met at a conference."], correct_index: 2,
        justification: "\"You taught me in your Water Management course last year.\"",
      },
      {
        difficulty: "extreme",
        question: "What did Ms. Ahmed include with her e-mail?",
        answers: ["Her final project", "A recommendation from another teacher", "Her application form", "Her CV and information about the program"], correct_index: 3,
        justification: "\"I have attached my CV and a short description of the program.\"",
      },
    ],
  },
  {
    text: `Weekend Escape at the Lakeside Lodge

Treat yourself to a relaxing weekend! Our package includes two nights in a double room with a lake view, breakfast each morning, and dinner on Saturday evening at our award-winning restaurant.

Guests also enjoy free use of our spa and bicycles. Price: $380 per couple. Available from Friday to Sunday until the end of October. Book directly on our website for a free late check-out.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is being advertised?",
        answers: ["A hotel weekend package", "A new restaurant", "A bicycle shop", "A spa membership"], correct_index: 0,
        justification: "\"Our package includes two nights in a double room ...\"",
      },
      {
        difficulty: "hard",
        question: "Which meal is NOT included every day?",
        answers: ["Breakfast", "Dinner", "Both breakfast and dinner", "None of them"], correct_index: 1,
        justification: "Breakfast each morning, but dinner only on Saturday evening.",
      },
      {
        difficulty: "extreme",
        question: "How can guests get a late check-out?",
        answers: ["By paying an extra fee", "By staying three nights", "By booking on the hotel's website", "By booking before October"], correct_index: 2,
        justification: "\"Book directly on our website for a free late check-out.\"",
      },
    ],
  },
  {
    text: `University Launches Course in Data Science

Northfield University will offer a new two-year master's degree in data science starting in September. The program was created together with several local technology companies, which will offer paid internships to students in their second year.

Classes will be held in the evenings so that working professionals can attend. Applications open on 1 February.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the article about?",
        answers: ["A technology company opening", "A university closing", "A job fair", "A new university program"], correct_index: 3,
        justification: "\"A new two-year master's degree in data science.\"",
      },
      {
        difficulty: "hard",
        question: "What will students do in their second year?",
        answers: ["Paid internships at companies", "Study abroad", "Teach first-year students", "Write a book"], correct_index: 0,
        justification: "Local companies \"will offer paid internships to students in their second year\".",
      },
      {
        difficulty: "extreme",
        question: "Why will classes take place in the evening?",
        answers: ["Because the rooms are busy during the day", "So that people with jobs can take part", "Because the teachers work at companies", "To save money"], correct_index: 1,
        justification: "\"So that working professionals can attend.\"",
      },
    ],
  },
  {
    text: `Office Recycling Challenge

This month, each floor will compete to see who can recycle the most. The cleaning team will weigh the paper, plastic, and cans collected on each floor every Friday.

The floor with the highest total at the end of the month will win a free breakfast. Remember: only clean items can be recycled, so please rinse bottles and cans before putting them in the bins.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the purpose of the notice?",
        answers: ["To introduce a new cleaning team", "To invite staff to breakfast", "To announce a recycling competition", "To change the location of the bins"], correct_index: 2,
        justification: "\"Each floor will compete to see who can recycle the most.\"",
      },
      {
        difficulty: "hard",
        question: "How will the winner be decided?",
        answers: ["By a vote", "By the number of bins", "By the cleaning team's opinion", "By the weight of recycled items"], correct_index: 3,
        justification: "\"The cleaning team will weigh the paper, plastic, and cans collected on each floor.\"",
      },
      {
        difficulty: "extreme",
        question: "What are employees asked to do?",
        answers: ["Wash containers before recycling them", "Bring items from home", "Weigh their own recycling", "Empty the bins every Friday"], correct_index: 0,
        justification: "\"Please rinse bottles and cans before putting them in the bins.\"",
      },
    ],
  },
  {
    text: `Dear journalist,

Vantage Audio invites you to the launch of our new wireless headphones, the Vantage Air 2, on Tuesday, 9 April, at 11 A.M. at the Science Museum's main hall.

Our head of design will present the product and answer questions, and guests will be able to test the headphones. Each journalist will receive a free pair to review. Lunch will be served after the presentation. Please confirm your attendance by 2 April.

Vantage Audio Press Office`,
    questions: [
      {
        difficulty: "normal",
        question: "Who is the e-mail for?",
        answers: ["Store managers", "Journalists", "Museum visitors", "Vantage Audio employees"], correct_index: 1,
        justification: "\"Dear journalist.\"",
      },
      {
        difficulty: "hard",
        question: "What will guests be able to do at the event?",
        answers: ["Buy headphones at a discount", "Tour the factory", "Try the new product", "Meet the CEO"], correct_index: 2,
        justification: "\"Guests will be able to test the headphones.\"",
      },
      {
        difficulty: "extreme",
        question: "What will each journalist receive?",
        answers: ["A museum ticket", "A discount code", "A copy of the presentation", "A pair of headphones"], correct_index: 3,
        justification: "\"Each journalist will receive a free pair to review.\"",
      },
    ],
  },
  {
    text: `Marta Cruz (11:30 A.M.): It's Daniel's birthday on Friday. Should we take him out for lunch?
Kevin Shaw (11:32 A.M.): Great idea. How about that new Thai place across the street?
Marta Cruz (11:33 A.M.): He doesn't like spicy food.
Kevin Shaw (11:35 A.M.): Good point. The Italian place on 5th Avenue, then?
Marta Cruz (11:36 A.M.): Perfect. I'll book a table for eight. Don't tell him!`,
    questions: [
      {
        difficulty: "normal",
        question: "What are the writers planning?",
        answers: ["A birthday lunch for a colleague", "A business meeting", "A trip to Thailand", "A team dinner on 5th Avenue"], correct_index: 0,
        justification: "\"It's Daniel's birthday on Friday. Should we take him out for lunch?\"",
      },
      {
        difficulty: "hard",
        question: "At 11:33 A.M., why does Ms. Cruz write, \"He doesn't like spicy food\"?",
        answers: ["To ask Mr. Shaw to cook", "To suggest that the Thai restaurant is not a good choice", "To explain why Daniel is not coming", "To order a special meal"], correct_index: 1,
        justification: "Thai food is often spicy; Mr. Shaw then proposes another restaurant.",
      },
      {
        difficulty: "extreme",
        question: "What is suggested about the lunch?",
        answers: ["Daniel chose the restaurant.", "It will take place on 5th Avenue on Monday.", "It is a surprise for Daniel.", "Only two people will go."], correct_index: 2,
        justification: "\"Don't tell him!\"",
      },
    ],
  },
  {
    text: `Water Quality Information

The city's annual water report shows that our tap water meets all national safety standards. The water is tested more than 200 times a month at different points across the city.

Some residents have reported that their water sometimes looks cloudy. This is caused by tiny air bubbles and is harmless; the water will become clear if left to stand for a few minutes.`,
    questions: [
      {
        difficulty: "normal",
        question: "What does the annual report show?",
        answers: ["The water price will rise.", "The water is not safe to drink.", "Residents use too much water.", "The tap water is safe."], correct_index: 3,
        justification: "\"Our tap water meets all national safety standards.\"",
      },
      {
        difficulty: "hard",
        question: "How often is the water tested?",
        answers: ["More than 200 times a month", "Once a year", "Once a day", "200 times a year"], correct_index: 0,
        justification: "\"Tested more than 200 times a month.\"",
      },
      {
        difficulty: "extreme",
        question: "What does the notice say about cloudy water?",
        answers: ["It should be reported to the city.", "It is not dangerous.", "It should be boiled before drinking.", "It is caused by old pipes."], correct_index: 1,
        justification: "\"This is caused by tiny air bubbles and is harmless.\"",
      },
    ],
  },
  {
    text: `Sparkle Car Wash

Basic wash (outside only): $10
Deluxe wash (outside and inside): $25
Premium wash (deluxe + wax and polish): $40

Open daily, 8 A.M. to 8 P.M. Buy a monthly pass for $45 and wash your car as often as you like (basic wash only). Every tenth deluxe wash is free with our loyalty card.`,
    questions: [
      {
        difficulty: "normal",
        question: "What does the basic wash include?",
        answers: ["Cleaning the inside of the car", "Wax and polish", "Cleaning the outside of the car", "A free coffee"], correct_index: 2,
        justification: "\"Basic wash (outside only).\"",
      },
      {
        difficulty: "hard",
        question: "What does the monthly pass offer?",
        answers: ["Unlimited premium washes", "One free deluxe wash", "A 10% discount", "Unlimited basic washes"], correct_index: 3,
        justification: "\"Wash your car as often as you like (basic wash only).\"",
      },
      {
        difficulty: "extreme",
        question: "For a customer who wants only basic washes, when does the monthly pass become cheaper?",
        answers: ["From the fifth wash in a month", "From the second wash", "From the tenth wash", "It is never cheaper"], correct_index: 0,
        justification: "4 basic washes = $40 (less than $45); 5 washes = $50 (more than $45).",
      },
    ],
  },
  {
    text: `To: Claims Department, SafeShip Insurance
From: Omar Farouk, Lumina Ceramics
Subject: Claim for damaged shipment

I am writing to claim compensation for a shipment of 120 ceramic vases that arrived broken at our customer's store in Rotterdam on 3 June. The shipment was insured with your company under policy number SS-4471.

I have attached photos of the damage, the delivery receipt signed by our customer, and the original invoice showing a value of €3,600.`,
    questions: [
      {
        difficulty: "normal",
        question: "Why did Mr. Farouk write?",
        answers: ["To order new vases", "To ask for money for damaged goods", "To buy insurance", "To complain about a late delivery"], correct_index: 1,
        justification: "\"I am writing to claim compensation for a shipment ... that arrived broken.\"",
      },
      {
        difficulty: "hard",
        question: "Where was the shipment delivered?",
        answers: ["To Lumina Ceramics", "To the insurance company", "To a store in Rotterdam", "To a warehouse"], correct_index: 2,
        justification: "\"Arrived broken at our customer's store in Rotterdam.\"",
      },
      {
        difficulty: "extreme",
        question: "What is NOT included with the e-mail?",
        answers: ["Photos of the damage", "A signed delivery receipt", "An invoice", "A report from the delivery driver"], correct_index: 3,
        justification: "Photos, the signed receipt and the invoice are attached. No driver's report.",
      },
    ],
  },
  {
    text: `App Helps Drivers Find Parking

A new smartphone app called ParkNow shows drivers in real time where free parking spaces are in the city center. The app uses sensors installed in 3,000 parking spaces by the city last year.

Drivers can also pay for parking directly in the app and receive a reminder ten minutes before their time runs out. The city says the app could reduce traffic, as up to 30% of cars in the center are looking for parking.`,
    questions: [
      {
        difficulty: "normal",
        question: "What does the ParkNow app do?",
        answers: ["It shows available parking spaces.", "It sells cars.", "It gives directions to the city center.", "It rents bicycles."], correct_index: 0,
        justification: "\"Shows drivers in real time where free parking spaces are.\"",
      },
      {
        difficulty: "hard",
        question: "How does the app know which spaces are free?",
        answers: ["With information from other drivers", "With sensors in the parking spaces", "With satellite photos", "With cameras on buses"], correct_index: 1,
        justification: "\"The app uses sensors installed in 3,000 parking spaces.\"",
      },
      {
        difficulty: "extreme",
        question: "Why does the city think the app could reduce traffic?",
        answers: ["Parking will become free.", "Fewer people will drive to the center.", "Many cars in the center are searching for a parking space.", "Buses will be faster."], correct_index: 2,
        justification: "\"Up to 30% of cars in the center are looking for parking.\"",
      },
    ],
  },
  {
    text: `Elevator Inspection Certificate

This elevator was inspected on 14 February and meets all safety requirements. The next inspection is due within twelve months.

Maximum load: 8 persons / 630 kg

In case of emergency, press the alarm button and wait for help. Do not try to open the doors. Our 24-hour service team will respond within 30 minutes.

Atlas Elevator Services`,
    questions: [
      {
        difficulty: "normal",
        question: "Where would this notice most likely be found?",
        answers: ["In a car park", "On a train", "On a website", "Inside an elevator"], correct_index: 3,
        justification: "It gives the elevator's inspection date and emergency instructions.",
      },
      {
        difficulty: "hard",
        question: "What should people do in an emergency?",
        answers: ["Press the alarm button", "Open the doors", "Call the building manager", "Use the stairs"], correct_index: 0,
        justification: "\"Press the alarm button and wait for help.\"",
      },
      {
        difficulty: "extreme",
        question: "By when must the elevator be inspected again?",
        answers: ["Within 30 minutes", "Before the following February", "Every month", "Before 14 March"], correct_index: 1,
        justification: "Inspected on 14 February; the next one is due within twelve months.",
      },
    ],
  },
  {
    text: `Hi Daniel,

This is a reminder that the second module of your online course, "Leading Remote Teams," must be completed by Sunday, 23 June. You have completed 3 of the 8 lessons so far.

Each lesson takes about 20 minutes and ends with a short quiz. Once you finish the module, you will be able to download your certificate of completion.

Best regards,
LearnWell Support`,
    questions: [
      {
        difficulty: "normal",
        question: "Why was the e-mail sent?",
        answers: ["To sell Daniel a new course", "To send Daniel his certificate", "To remind Daniel to finish part of a course", "To change a deadline"], correct_index: 2,
        justification: "\"This is a reminder that the second module ... must be completed by Sunday.\"",
      },
      {
        difficulty: "hard",
        question: "How many lessons does Daniel still need to complete?",
        answers: ["Three", "Eight", "Two", "Five"], correct_index: 3,
        justification: "8 lessons - 3 completed = 5.",
      },
      {
        difficulty: "extreme",
        question: "About how much time does Daniel still need to finish the module?",
        answers: ["About 100 minutes", "About 60 minutes", "About 160 minutes", "About 20 minutes"], correct_index: 0,
        justification: "5 lessons x 20 minutes = about 100 minutes.",
      },
    ],
  },
  {
    text: `Gift Cards — Riverside Shopping Center

Our gift cards can be used in all 85 shops and restaurants at Riverside Shopping Center. Cards can be bought at the information desk or online, in amounts from $10 to $500.

Gift cards are valid for two years from the date of purchase. They cannot be exchanged for cash. Lost cards can be replaced if you have kept the receipt.`,
    questions: [
      {
        difficulty: "normal",
        question: "Where can the gift cards be used?",
        answers: ["Only in restaurants", "In any shop or restaurant in the center", "In any shopping center", "Only at the information desk"], correct_index: 1,
        justification: "\"In all 85 shops and restaurants at Riverside Shopping Center.\"",
      },
      {
        difficulty: "hard",
        question: "How long can a gift card be used?",
        answers: ["One year", "Six months", "Two years", "As long as you want"], correct_index: 2,
        justification: "\"Valid for two years from the date of purchase.\"",
      },
      {
        difficulty: "extreme",
        question: "What do customers need to replace a lost card?",
        answers: ["A photo ID", "A new purchase", "A $10 fee", "The receipt"], correct_index: 3,
        justification: "\"Lost cards can be replaced if you have kept the receipt.\"",
      },
    ],
  },
  {
    text: `Wind Farm Approved Off the Coast

The government has approved the construction of a wind farm 20 kilometers off the coast of Dunmore. The 60 wind turbines will produce enough electricity for about 400,000 homes.

Construction is expected to begin next year and take three years. Local fishing groups had raised concerns, and the company building the farm has agreed to pay for a study on how the project affects fish.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the article about?",
        answers: ["A plan to build a wind farm", "A new fishing port", "A power cut in Dunmore", "A rise in electricity prices"], correct_index: 0,
        justification: "\"The government has approved the construction of a wind farm.\"",
      },
      {
        difficulty: "hard",
        question: "When will the wind farm most likely be finished?",
        answers: ["Next year", "In about four years", "In 20 years", "It is already finished."], correct_index: 1,
        justification: "Construction begins next year and takes three years: about four years from now.",
      },
      {
        difficulty: "extreme",
        question: "Why will a study be done?",
        answers: ["To choose the location", "To count the homes", "To respond to the worries of fishing groups", "To measure the wind"], correct_index: 2,
        justification: "Fishing groups raised concerns, so the company will study the effect on fish.",
      },
    ],
  },
  {
    text: `Courier Pickup Times

Packages to be sent by courier must be brought to the mailroom on the ground floor. Our courier picks up packages twice a day, at 11 A.M. and at 4 P.M.

Packages brought after 4 P.M. will be sent the next working day. International packages must include a completed customs form, available in the mailroom. For urgent same-day deliveries within the city, please contact the mailroom manager.`,
    questions: [
      {
        difficulty: "normal",
        question: "Where should packages be taken?",
        answers: ["To reception", "To the post office", "To the manager's office", "To the mailroom"], correct_index: 3,
        justification: "\"Must be brought to the mailroom on the ground floor.\"",
      },
      {
        difficulty: "hard",
        question: "What happens to a package brought to the mailroom at 5 P.M.?",
        answers: ["It will be sent the next working day.", "It will be picked up at 11 P.M.", "It will be returned to the sender.", "It will be sent by urgent delivery."], correct_index: 0,
        justification: "\"Packages brought after 4 P.M. will be sent the next working day.\"",
      },
      {
        difficulty: "extreme",
        question: "What is required for packages going to another country?",
        answers: ["A manager's signature", "A customs form", "Extra payment", "A pickup at 11 A.M. only"], correct_index: 1,
        justification: "\"International packages must include a completed customs form.\"",
      },
    ],
  },
  {
    text: `Dear Mr. and Mrs. Torres,

On behalf of everyone at Hillside Primary School, thank you for your generous donation of $2,000 to our library. With your gift, we were able to buy more than 150 new books and two comfortable reading chairs.

The children have already started enjoying the books. We would love to invite you to visit the library and see the results for yourselves at any time.

Warm regards,
Janet Price, Head Teacher`,
    questions: [
      {
        difficulty: "normal",
        question: "Why did Ms. Price write?",
        answers: ["To ask for a donation", "To announce a new library", "To thank someone for a gift", "To invite parents to a meeting"], correct_index: 2,
        justification: "\"Thank you for your generous donation.\"",
      },
      {
        difficulty: "hard",
        question: "What was bought with the money?",
        answers: ["Computers", "School uniforms", "A new building", "Books and furniture"], correct_index: 3,
        justification: "\"More than 150 new books and two comfortable reading chairs.\"",
      },
      {
        difficulty: "extreme",
        question: "What does Ms. Price offer Mr. and Mrs. Torres?",
        answers: ["A chance to visit the library", "Free books", "A place on the school board", "A refund"], correct_index: 0,
        justification: "\"We would love to invite you to visit the library.\"",
      },
    ],
  },
  {
    text: `Golden Crust Catering

Planning a meeting or a party? Golden Crust Bakery now offers catering! Choose from sandwich platters, mini pastries, fruit trays, and fresh coffee.

Orders must be placed at least 48 hours in advance. Delivery is free within the city for orders over $100. Ask about our vegan and gluten-free options. Call 555-0177 or order online.`,
    questions: [
      {
        difficulty: "normal",
        question: "What new service is the bakery offering?",
        answers: ["Baking classes", "Catering for events", "Coffee machines", "Party planning"], correct_index: 1,
        justification: "\"Golden Crust Bakery now offers catering!\"",
      },
      {
        difficulty: "hard",
        question: "How far in advance must orders be placed?",
        answers: ["At least one week", "The same day", "At least two days", "At least one month"], correct_index: 2,
        justification: "\"At least 48 hours in advance.\"",
      },
      {
        difficulty: "extreme",
        question: "Which order would be delivered for free?",
        answers: ["A $50 order in the city", "Any order outside the city", "A $90 order with coffee", "A $150 order in the city"], correct_index: 3,
        justification: "Free delivery \"within the city for orders over $100\".",
      },
    ],
  },
  {
    text: `Dear Ms. Bauer,

Our records show that the book "Modern Architecture" was due on 2 May and has not yet been returned. Please return it as soon as possible to any branch of the Eastwood Library.

If you have lost the book, please contact us to arrange a replacement. Until the book is returned or replaced, you will not be able to borrow other items or renew your current loans.

Eastwood Library`,
    questions: [
      {
        difficulty: "normal",
        question: "Why did the library write to Ms. Bauer?",
        answers: ["A book she borrowed is late.", "Her card has expired.", "A book she reserved has arrived.", "The library is closing."], correct_index: 0,
        justification: "\"Was due on 2 May and has not yet been returned.\"",
      },
      {
        difficulty: "hard",
        question: "Where can Ms. Bauer return the book?",
        answers: ["Only at the main library", "At any Eastwood Library branch", "By mail only", "At a bookstore"], correct_index: 1,
        justification: "\"Return it ... to any branch of the Eastwood Library.\"",
      },
      {
        difficulty: "extreme",
        question: "What can Ms. Bauer NOT do until the problem is solved?",
        answers: ["Visit the library", "Read in the library", "Borrow new items", "Call the library"], correct_index: 2,
        justification: "\"You will not be able to borrow other items or renew your current loans.\"",
      },
    ],
  },
];
