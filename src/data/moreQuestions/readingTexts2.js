// More long-text questions (reading comprehension): one document + its questions.
// Same fields as createQuestion (questions.js), without "section", "text" and "category" (added there).

export const READING_TEXTS_2 = [
  {
    text: `Give Blood — Save Lives

The City Hospital blood bank will hold a blood drive in our building's main lobby on Wednesday, 12 June, from 9 A.M. to 3 P.M. Giving blood takes about 45 minutes, including a short health check.

Donors must be between 18 and 65 years old and weigh at least 50 kilograms. Please eat a good meal before you come. Employees may take the time to donate during working hours with their manager's approval.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the notice about?",
        answers: ["An event where people can give blood", "A new hospital opening", "A health insurance plan", "A first-aid course"], correct_index: 0,
        justification: "\"The City Hospital blood bank will hold a blood drive.\"",
      },
      {
        difficulty: "hard",
        question: "What are donors asked to do before coming?",
        answers: ["Make an appointment online", "Eat a meal", "Bring a doctor's letter", "Drink nothing"], correct_index: 1,
        justification: "\"Please eat a good meal before you come.\"",
      },
      {
        difficulty: "extreme",
        question: "What is indicated about employees who want to donate?",
        answers: ["They must donate after 3 P.M.", "They will receive a paid day off.", "They need permission from their manager to go during work hours.", "They must be over 50 years old."], correct_index: 2,
        justification: "\"Employees may take the time ... during working hours with their manager's approval.\"",
      },
    ],
  },
  {
    text: `Dear valued customer,

Please note that your account manager at Fenwick Packaging, Mr. Simon Hale, has retired. From 1 May, your new contact will be Ms. Laura Chen. Ms. Chen has worked in our sales department for eight years and knows your account well.

You can reach her at l.chen@fenwickpack.com or at 555-0192. Your prices and delivery schedule will not change.

Sincerely,
Fenwick Packaging`,
    questions: [
      {
        difficulty: "normal",
        question: "Why was this letter sent?",
        answers: ["To announce new prices", "To advertise a product", "To confirm a delivery", "To introduce a new contact person"], correct_index: 3,
        justification: "Mr. Hale has retired; Ms. Chen is the new contact.",
      },
      {
        difficulty: "hard",
        question: "What is mentioned about Ms. Chen?",
        answers: ["She has experience at the company.", "She is new to the company.", "She will change the delivery schedule.", "She used to work for the customer."], correct_index: 0,
        justification: "\"Has worked in our sales department for eight years.\"",
      },
      {
        difficulty: "extreme",
        question: "What is suggested about Mr. Hale?",
        answers: ["He will become a manager.", "He no longer works at Fenwick Packaging.", "He will work with Ms. Chen.", "He is moving to another department."], correct_index: 1,
        justification: "He \"has retired\": he has stopped working.",
      },
    ],
  },
  {
    text: `Swift Movers — Moving Made Easy

Whether you are moving across town or across the country, Swift Movers can help. Our trained team will pack, load, and transport your belongings safely. We also offer storage for up to six months at our secure warehouse.

Get a free quote by sending us photos of your rooms through our website. Book before 30 June and receive free packing boxes.`,
    questions: [
      {
        difficulty: "normal",
        question: "What kind of business is Swift Movers?",
        answers: ["A furniture store", "A cleaning service", "A moving company", "A real estate agency"], correct_index: 2,
        justification: "Pack, load and transport your belongings.",
      },
      {
        difficulty: "hard",
        question: "How can customers get a price estimate?",
        answers: ["By visiting the warehouse", "By calling a manager", "By filling in a form at the office", "By sending photos online"], correct_index: 3,
        justification: "\"Get a free quote by sending us photos of your rooms through our website.\"",
      },
      {
        difficulty: "extreme",
        question: "What is NOT offered by Swift Movers?",
        answers: ["Cleaning the new home", "Packing services", "Storage", "Free boxes for early bookings"], correct_index: 0,
        justification: "Packing, storage and free boxes are mentioned. Cleaning is not.",
      },
    ],
  },
  {
    text: `Airport Approves New Terminal

Westford Airport has approved plans to build a second terminal, which is expected to open in four years. The new terminal will allow the airport to handle 12 million passengers a year, compared with 7 million today.

Airport director Ruth Allen said the project will create about 2,000 construction jobs. Some local residents have raised concerns about noise from additional flights, and the airport has promised to limit night flights.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the article mainly about?",
        answers: ["A new airline", "A plan to expand an airport", "A rise in ticket prices", "Night flights being canceled"], correct_index: 1,
        justification: "\"Plans to build a second terminal.\"",
      },
      {
        difficulty: "hard",
        question: "How many passengers can the airport handle now?",
        answers: ["12 million per year", "2,000 per day", "7 million per year", "5 million per year"], correct_index: 2,
        justification: "\"12 million passengers a year, compared with 7 million today.\"",
      },
      {
        difficulty: "extreme",
        question: "Why did the airport promise to limit night flights?",
        answers: ["To save fuel", "Because of a lack of staff", "Because the terminal will be closed at night", "To respond to residents' worries about noise"], correct_index: 3,
        justification: "Residents \"raised concerns about noise\"; the promise answers those concerns.",
      },
    ],
  },
  {
    text: `Hana Sato (10:02 A.M.): I'm ordering lunch for the 12:30 training session. How many people are coming?
David Ross (10:05 A.M.): Fourteen, plus the trainer.
Hana Sato (10:06 A.M.): Any special requests?
David Ross (10:08 A.M.): Two vegetarians. Oh, and the trainer can't eat nuts.
Hana Sato (10:09 A.M.): Got it. I'll order from Green Leaf Deli. They label everything clearly.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is Ms. Sato doing?",
        answers: ["Ordering food for an event", "Planning a training course", "Booking a restaurant", "Inviting a trainer"], correct_index: 0,
        justification: "\"I'm ordering lunch for the 12:30 training session.\"",
      },
      {
        difficulty: "hard",
        question: "How many people will need lunch in total?",
        answers: ["Fourteen", "Fifteen", "Twelve", "Two"], correct_index: 1,
        justification: "Fourteen participants plus the trainer = fifteen.",
      },
      {
        difficulty: "extreme",
        question: "Why does Ms. Sato most likely choose Green Leaf Deli?",
        answers: ["It is the cheapest option.", "It is close to the office.", "It makes it easy to see what is in the food.", "It only serves vegetarian food."], correct_index: 2,
        justification: "\"They label everything clearly\": important for the person who can't eat nuts.",
      },
    ],
  },
  {
    text: `MEMO
To: All employees
From: Accounting
Subject: Expense reports

Please submit all expense reports for the second quarter by Friday, 5 July. Reports must include original receipts for every item over $20. Reports received after the deadline will be paid in the following month.

From now on, expense reports must be submitted through the online system. Paper forms will no longer be accepted.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the main purpose of the memo?",
        answers: ["To announce a new accounting manager", "To explain a new salary system", "To ask staff to reduce costs", "To give a deadline for expense reports"], correct_index: 3,
        justification: "\"Please submit all expense reports ... by Friday, 5 July.\"",
      },
      {
        difficulty: "hard",
        question: "What must be included with expense reports?",
        answers: ["Receipts for items costing more than $20", "A manager's signature", "A paper copy", "A list of all meetings"], correct_index: 0,
        justification: "\"Original receipts for every item over $20.\"",
      },
      {
        difficulty: "extreme",
        question: "What will happen to a report submitted on 8 July?",
        answers: ["It will be refused.", "It will be paid later than usual.", "It must be sent on paper.", "It will be paid the same day."], correct_index: 1,
        justification: "After the deadline: \"paid in the following month\".",
      },
    ],
  },
  {
    text: `Dear Guests,

The hotel swimming pool will be closed from Monday to Wednesday this week for cleaning and maintenance. We expect it to reopen on Thursday morning.

During this time, guests are welcome to use the pool at the Riverside Sports Club, two blocks from the hotel, free of charge. Please show your room key at the club's reception. We apologize for the inconvenience.

The Management`,
    questions: [
      {
        difficulty: "normal",
        question: "Why is the pool closed?",
        answers: ["Because of a private event", "Because of bad weather", "For maintenance", "Because of a lack of staff"], correct_index: 2,
        justification: "\"Closed ... for cleaning and maintenance.\"",
      },
      {
        difficulty: "hard",
        question: "What can guests do while the pool is closed?",
        answers: ["Get a discount on their room", "Use the hotel gym for free", "Book a swimming lesson", "Swim at a nearby club for free"], correct_index: 3,
        justification: "\"Use the pool at the Riverside Sports Club ... free of charge.\"",
      },
      {
        difficulty: "extreme",
        question: "What must guests bring to the Riverside Sports Club?",
        answers: ["Their room key", "A membership card", "A swimming cap", "A letter from the hotel"], correct_index: 0,
        justification: "\"Please show your room key at the club's reception.\"",
      },
    ],
  },
  {
    text: `Dear Mr. Whitman,

Thank you for taking the time to meet with me yesterday about the marketing assistant position. I enjoyed learning more about your team and the new product launch you are planning for the autumn.

As we discussed, I have attached examples of the social media campaigns I managed at my previous company. Please let me know if you need any further information.

Best regards,
Clara Mendes`,
    questions: [
      {
        difficulty: "normal",
        question: "Why did Ms. Mendes write the e-mail?",
        answers: ["To apply for a different job", "To thank someone for a job interview", "To cancel a meeting", "To launch a new product"], correct_index: 1,
        justification: "\"Thank you for taking the time to meet with me ... about the marketing assistant position.\"",
      },
      {
        difficulty: "hard",
        question: "What did Ms. Mendes send with the e-mail?",
        answers: ["Her university diploma", "A list of references", "Examples of her past work", "A product description"], correct_index: 2,
        justification: "\"Examples of the social media campaigns I managed.\"",
      },
      {
        difficulty: "extreme",
        question: "What is suggested about Mr. Whitman's company?",
        answers: ["It has no social media accounts.", "It is closing its marketing team.", "It hired Ms. Mendes last year.", "It will introduce a new product soon."], correct_index: 3,
        justification: "\"The new product launch you are planning for the autumn.\"",
      },
    ],
  },
  {
    text: `Peak Fitness — New Year Offer

Join Peak Fitness in January and pay no joining fee (normally $50). Membership includes unlimited use of the gym, the swimming pool, and more than 40 group classes each week.

Members who sign up for a full year also receive two free sessions with a personal trainer. Our new location on Bridge Street opens on 3 January, with free parking for members.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is special about joining in January?",
        answers: ["There is no joining fee.", "Membership is half price.", "Classes are free for a month.", "Parking is free only in January."], correct_index: 0,
        justification: "\"Join ... in January and pay no joining fee.\"",
      },
      {
        difficulty: "hard",
        question: "Who will receive sessions with a personal trainer?",
        answers: ["All new members", "People who join for a whole year", "Members who take classes", "Members of the Bridge Street location"], correct_index: 1,
        justification: "\"Members who sign up for a full year also receive two free sessions.\"",
      },
      {
        difficulty: "extreme",
        question: "How much does a new member save by joining in January?",
        answers: ["$40", "The cost of a year", "$50", "The cost of two classes"], correct_index: 2,
        justification: "The joining fee is normally $50, and it is free in January.",
      },
    ],
  },
  {
    text: `City Switches to Electric Buses

By the end of next year, all 120 buses in the city of Norbridge will be electric. The city has already replaced 45 of its diesel buses, and passengers say the new buses are quieter and more comfortable.

The project costs $60 million, two-thirds of which is paid by the national government. City officials expect fuel and repair costs to fall by about 30% once all buses are electric.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the article about?",
        answers: ["A new bus station", "A rise in bus fares", "A shortage of bus drivers", "A city changing to electric buses"], correct_index: 3,
        justification: "\"All 120 buses ... will be electric.\"",
      },
      {
        difficulty: "hard",
        question: "How many diesel buses still need to be replaced?",
        answers: ["75", "45", "120", "30"], correct_index: 0,
        justification: "120 buses in total - 45 already replaced = 75.",
      },
      {
        difficulty: "extreme",
        question: "How much of the project is paid by the national government?",
        answers: ["$20 million", "$40 million", "$60 million", "$30 million"], correct_index: 1,
        justification: "Two-thirds of $60 million = $40 million.",
      },
    ],
  },
  {
    text: `Meet the Author!

Ellis Bookshop is pleased to welcome Nadia Brooks, author of the bestselling novel "The Quiet Harbor," on Saturday, 21 September, at 2 P.M. Ms. Brooks will read from her new book and answer questions from the audience.

Copies of her books will be available for purchase and signing. The event is free, but seating is limited, so please reserve a seat at the front counter or by phone.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the notice about?",
        answers: ["A new bookshop", "A book sale", "A visit by a writer", "A writing class"], correct_index: 2,
        justification: "\"Ellis Bookshop is pleased to welcome Nadia Brooks, author of ...\"",
      },
      {
        difficulty: "hard",
        question: "What will Ms. Brooks do at the event?",
        answers: ["Teach a writing course", "Sell her old books", "Present an award", "Read from a book"], correct_index: 3,
        justification: "\"Will read from her new book and answer questions.\"",
      },
      {
        difficulty: "extreme",
        question: "Why should people reserve a seat?",
        answers: ["There are not many seats.", "The event is expensive.", "The author wants to know who is coming.", "Books must be ordered in advance."], correct_index: 0,
        justification: "\"Seating is limited, so please reserve a seat.\"",
      },
    ],
  },
  {
    text: `Dear Accounts Department,

I received invoice #3381 for our order of office chairs today. However, the invoice shows 25 chairs at $120 each, while we ordered and received only 20.

Could you please send a corrected invoice? We will pay as soon as we receive it. I have attached a copy of our original order for your reference.

Kind regards,
Martin Cole, Office Manager`,
    questions: [
      {
        difficulty: "normal",
        question: "Why did Mr. Cole write?",
        answers: ["To order more chairs", "To report a mistake on an invoice", "To return some chairs", "To complain about late delivery"], correct_index: 1,
        justification: "The invoice shows 25 chairs, but they received only 20.",
      },
      {
        difficulty: "hard",
        question: "What did Mr. Cole attach?",
        answers: ["A photo of the chairs", "A payment receipt", "A copy of the order", "A new invoice"], correct_index: 2,
        justification: "\"I have attached a copy of our original order.\"",
      },
      {
        difficulty: "extreme",
        question: "How much should the corrected invoice most likely be?",
        answers: ["$3,000", "$600", "$120", "$2,400"], correct_index: 3,
        justification: "20 chairs x $120 = $2,400 (not 25 x $120 = $3,000).",
      },
    ],
  },
  {
    text: `Return Policy — Corner Electronics

Most items can be returned within 30 days of purchase for a full refund, as long as they are in their original packaging and come with the receipt.

Opened software and headphones cannot be returned for hygiene and copyright reasons. Items bought on sale can be exchanged but not refunded. Online orders can be returned by mail or at any of our stores.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the main topic of the text?",
        answers: ["The rules for returning products", "A sale on electronics", "How to order online", "The store's opening hours"], correct_index: 0,
        justification: "\"Return Policy\": it explains when items can be returned.",
      },
      {
        difficulty: "hard",
        question: "Which item can NOT be returned?",
        answers: ["An unopened laptop with its receipt", "Opened headphones", "A camera bought online", "A phone in its original box"], correct_index: 1,
        justification: "\"Opened software and headphones cannot be returned.\"",
      },
      {
        difficulty: "extreme",
        question: "What happens to an item bought on sale?",
        answers: ["It can be refunded within 30 days.", "It cannot be returned at all.", "It can only be exchanged for another item.", "It can be returned only by mail."], correct_index: 2,
        justification: "\"Items bought on sale can be exchanged but not refunded.\"",
      },
    ],
  },
  {
    text: `Coffee Prices Expected to Rise

Coffee drinkers may soon pay more for their morning cup. Poor weather in several major growing regions has reduced this year's harvest, and the price of coffee beans has risen by 25% since January.

Several large café chains have said they will raise prices next month. However, some smaller cafés say they will try to keep prices the same by buying directly from farmers.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the article mainly about?",
        answers: ["A new café chain", "How coffee is grown", "Farmers opening cafés", "The rising price of coffee"], correct_index: 3,
        justification: "\"Coffee drinkers may soon pay more.\"",
      },
      {
        difficulty: "hard",
        question: "Why has the price of coffee beans risen?",
        answers: ["Bad weather reduced the harvest.", "More people are drinking coffee.", "Transport costs increased.", "Farmers asked for higher pay."], correct_index: 0,
        justification: "\"Poor weather ... has reduced this year's harvest.\"",
      },
      {
        difficulty: "extreme",
        question: "How do some small cafés hope to avoid raising prices?",
        answers: ["By serving smaller cups", "By buying coffee directly from growers", "By closing earlier", "By using cheaper milk"], correct_index: 1,
        justification: "\"By buying directly from farmers.\"",
      },
    ],
  },
  {
    text: `To: Product Design Team
From: Erica Lane
Subject: Welcome, Tomás!

Hi everyone,

Please join me in welcoming Tomás Rivera, who starts today as a senior designer. Tomás has spent the last six years designing kitchen appliances at Vela Home, and he will lead the redesign of our coffee machine range.

His desk is next to the window on the third floor. Please stop by and introduce yourselves!

Erica`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the purpose of the e-mail?",
        answers: ["To announce a new product", "To change desk locations", "To introduce a new employee", "To invite staff to a party"], correct_index: 2,
        justification: "\"Please join me in welcoming Tomás Rivera, who starts today.\"",
      },
      {
        difficulty: "hard",
        question: "What will Mr. Rivera be responsible for?",
        answers: ["Managing the third floor", "Selling kitchen appliances", "Hiring new designers", "Redesigning a line of coffee machines"], correct_index: 3,
        justification: "\"He will lead the redesign of our coffee machine range.\"",
      },
      {
        difficulty: "extreme",
        question: "What is suggested about Mr. Rivera?",
        answers: ["He has experience with similar products.", "He used to work on the third floor.", "He is Erica's manager.", "He has just finished university."], correct_index: 0,
        justification: "He designed kitchen appliances for six years, and will now work on coffee machines.",
      },
    ],
  },
  {
    text: `Lost Item — Annual Sales Conference

A black laptop bag was found in Meeting Room C after the afternoon session on Thursday. The bag contains a laptop, a notebook, and a train ticket to Leeds dated Friday.

The owner can collect it from the conference reception desk on the ground floor, which is open until 6 P.M. today. After that, the bag will be taken to the hotel's lost-and-found office.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the notice about?",
        answers: ["A change of meeting room", "An item someone left behind", "A train delay", "A new conference session"], correct_index: 1,
        justification: "\"A black laptop bag was found in Meeting Room C.\"",
      },
      {
        difficulty: "hard",
        question: "Where can the owner collect the bag today?",
        answers: ["In Meeting Room C", "At the train station", "At the conference reception desk", "In the hotel's lost-and-found office"], correct_index: 2,
        justification: "\"From the conference reception desk on the ground floor ... until 6 P.M. today.\"",
      },
      {
        difficulty: "extreme",
        question: "What is suggested about the owner of the bag?",
        answers: ["He or she works at the hotel.", "He or she gave a talk on Thursday.", "He or she lives in Meeting Room C's building.", "He or she plans to travel to Leeds on Friday."], correct_index: 3,
        justification: "The bag contains \"a train ticket to Leeds dated Friday\".",
      },
    ],
  },
  {
    text: `Learn Photography with a Pro!

Join award-winning photographer Lena Holt for a six-week evening course for beginners. You will learn how to use your camera's manual settings, work with natural light, and edit your photos on a computer.

Classes are held on Wednesdays from 7 to 9 P.M. at the Arts Center. Participants need their own digital camera; laptops are provided. The course fee of $180 includes a weekend photo walk in the old town.`,
    questions: [
      {
        difficulty: "normal",
        question: "Who is the course for?",
        answers: ["People new to photography", "Professional photographers", "Art teachers", "Computer engineers"], correct_index: 0,
        justification: "\"A six-week evening course for beginners.\"",
      },
      {
        difficulty: "hard",
        question: "What must participants bring?",
        answers: ["A laptop", "A digital camera", "Photo editing software", "Printed photos"], correct_index: 1,
        justification: "\"Participants need their own digital camera; laptops are provided.\"",
      },
      {
        difficulty: "extreme",
        question: "What is included in the course fee?",
        answers: ["A new camera", "An exhibition of participants' work", "A photography activity outside the Arts Center", "Private lessons"], correct_index: 2,
        justification: "\"Includes a weekend photo walk in the old town.\"",
      },
    ],
  },
  {
    text: `Raj Patel (8:41 A.M.): My train is stopped outside Hamford. They say there's a signal problem.
Emma Ward (8:43 A.M.): Oh no. The client meeting is at 10. Will you make it?
Raj Patel (8:44 A.M.): Hard to say. They haven't given us any time estimate.
Emma Ward (8:46 A.M.): I'll start the presentation without you, then. You can join by video if needed.
Raj Patel (8:47 A.M.): Thanks. I'll send you my slides now.`,
    questions: [
      {
        difficulty: "normal",
        question: "What problem does Mr. Patel have?",
        answers: ["He lost his slides.", "He missed his meeting.", "His video call failed.", "His train is delayed."], correct_index: 3,
        justification: "\"My train is stopped ... a signal problem.\"",
      },
      {
        difficulty: "hard",
        question: "At 8:44 A.M., what does Mr. Patel mean when he writes, \"Hard to say\"?",
        answers: ["He does not know if he will arrive on time.", "He cannot speak on the phone.", "The presentation is difficult.", "He did not understand the question."], correct_index: 0,
        justification: "Emma asks if he will make it; no time estimate has been given.",
      },
      {
        difficulty: "extreme",
        question: "What will Mr. Patel most likely do next?",
        answers: ["Take a taxi", "Send Ms. Ward his presentation", "Cancel the meeting", "Call the client"], correct_index: 1,
        justification: "\"I'll send you my slides now.\"",
      },
    ],
  },
  {
    text: `Notice to Residents of Maple Court

The outside of our building will be painted from 2 to 20 September. During this time, workers will need access to all balconies between 8 A.M. and 5 P.M.

Please remove plants, furniture, and other items from your balcony before 1 September. Windows should be kept closed while painting takes place near your apartment. Thank you for your cooperation.

Maple Court Management`,
    questions: [
      {
        difficulty: "normal",
        question: "What work will be done?",
        answers: ["Replacing the windows", "Repairing the balconies", "Painting the outside of the building", "Cleaning the apartments"], correct_index: 2,
        justification: "\"The outside of our building will be painted.\"",
      },
      {
        difficulty: "hard",
        question: "What are residents asked to do before the work starts?",
        answers: ["Leave their apartments", "Open their windows", "Paint their doors", "Clear their balconies"], correct_index: 3,
        justification: "\"Please remove plants, furniture, and other items from your balcony.\"",
      },
      {
        difficulty: "extreme",
        question: "Why will workers need access to balconies?",
        answers: ["To paint the outside walls", "To install new lights", "To check the windows", "To remove furniture"], correct_index: 0,
        justification: "The outside of the building is painted, so workers must go on the balconies.",
      },
    ],
  },
  {
    text: `To: All sales staff
From: Training Coordinator
Subject: Workshop canceled

Unfortunately, the negotiation skills workshop planned for Thursday has been canceled because the trainer is ill. We hope to reschedule it for later this month and will send a new date as soon as possible.

If you had booked a hotel room for the workshop, please cancel it and keep a copy of the cancellation for our records.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the e-mail mainly about?",
        answers: ["A new sales target", "The cancellation of a training event", "A hotel booking", "A new trainer"], correct_index: 1,
        justification: "\"The negotiation skills workshop ... has been canceled.\"",
      },
      {
        difficulty: "hard",
        question: "Why was the event canceled?",
        answers: ["Too few people registered.", "The hotel is full.", "The trainer is sick.", "The room is not available."], correct_index: 2,
        justification: "\"Because the trainer is ill.\"",
      },
      {
        difficulty: "extreme",
        question: "What are some staff members asked to do?",
        answers: ["Find a new trainer", "Attend a different workshop", "Pay for their hotel room", "Cancel a reservation and keep proof of it"], correct_index: 3,
        justification: "\"If you had booked a hotel room ... cancel it and keep a copy of the cancellation.\"",
      },
    ],
  },
  {
    text: `Grand Theater to Reopen After Renovation

The Grand Theater on King Street will reopen on 1 October after an 18-month renovation. The 100-year-old building now has new seats, a larger stage, and an elevator that makes all floors accessible to wheelchair users.

The first show will be a performance of the musical "City Lights." Tickets go on sale on 1 August, and theater members can buy them one week earlier.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the article about?",
        answers: ["A theater reopening after renovation", "A new musical", "A theater closing down", "An acting competition"], correct_index: 0,
        justification: "\"Will reopen on 1 October after an 18-month renovation.\"",
      },
      {
        difficulty: "hard",
        question: "What improvement was made to the building?",
        answers: ["A restaurant was added.", "An elevator was installed.", "The building was made smaller.", "A parking lot was built."], correct_index: 1,
        justification: "\"An elevator that makes all floors accessible.\"",
      },
      {
        difficulty: "extreme",
        question: "When can theater members buy tickets?",
        answers: ["From 1 August", "From 1 October", "From late July", "Only on the day of the show"], correct_index: 2,
        justification: "Sales start on 1 August, and members can buy one week earlier: late July.",
      },
    ],
  },
  {
    text: `Spokes Bike Repair

Is your bike making strange noises? Bring it to Spokes! Our mechanics can fix everything from flat tires to broken gears, usually on the same day.

Basic tune-up: $35
Full service: $70
Flat tire repair: $12

Students receive 10% off all services with a valid ID. Open Tuesday to Sunday, 9 A.M. to 6 P.M. Closed Mondays.`,
    questions: [
      {
        difficulty: "normal",
        question: "What does Spokes offer?",
        answers: ["Bicycle rentals", "Cycling lessons", "Car repairs", "Bicycle repairs"], correct_index: 3,
        justification: "\"Our mechanics can fix everything from flat tires to broken gears.\"",
      },
      {
        difficulty: "hard",
        question: "How much would a student pay for a full service?",
        answers: ["$63", "$70", "$60", "$35"], correct_index: 0,
        justification: "$70 - 10% ($7) = $63.",
      },
      {
        difficulty: "extreme",
        question: "When would a customer NOT be able to visit the shop?",
        answers: ["On a Sunday morning", "On a Monday", "On a Tuesday at 5 P.M.", "On a Saturday at noon"], correct_index: 1,
        justification: "\"Closed Mondays.\"",
      },
    ],
  },
  {
    text: `Important: Change to Payday

Starting in March, salaries will be paid on the last working day of each month instead of on the 25th. This change will allow the payroll team to include overtime from the whole month in a single payment.

Employees who need an advance in March because of this change can contact the payroll office before 10 March. Pay slips will continue to be available on the employee website.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is changing?",
        answers: ["The amount of salaries", "The payroll office's location", "The day salaries are paid", "The overtime rate"], correct_index: 2,
        justification: "\"Salaries will be paid on the last working day of each month instead of on the 25th.\"",
      },
      {
        difficulty: "hard",
        question: "Why is the change being made?",
        answers: ["To save money", "Because of a new bank", "Because employees asked for it", "So overtime can be paid with the monthly salary"], correct_index: 3,
        justification: "\"To include overtime from the whole month in a single payment.\"",
      },
      {
        difficulty: "extreme",
        question: "What is suggested about March?",
        answers: ["Employees will be paid a few days later than usual.", "Employees will receive two salaries.", "Overtime will not be paid.", "Pay slips will be sent by mail."], correct_index: 0,
        justification: "Payday moves from the 25th to the end of the month, so some may need an advance.",
      },
    ],
  },
  {
    text: `Hi Monica,

I would like to request five days of vacation from 14 to 18 October to attend my sister's wedding in Portugal. I have checked the team calendar, and no major deadlines are planned that week.

Kevin has kindly agreed to answer my client e-mails while I am away. Please let me know if this is acceptable.

Thanks,
Leo`,
    questions: [
      {
        difficulty: "normal",
        question: "Why did Leo write to Monica?",
        answers: ["To invite her to a wedding", "To ask for time off", "To complain about Kevin", "To change a deadline"], correct_index: 1,
        justification: "\"I would like to request five days of vacation.\"",
      },
      {
        difficulty: "hard",
        question: "Why does Leo want to travel?",
        answers: ["To meet a client", "To attend a conference", "To go to a family event", "To visit an office in Portugal"], correct_index: 2,
        justification: "\"To attend my sister's wedding in Portugal.\"",
      },
      {
        difficulty: "extreme",
        question: "What has Leo already done?",
        answers: ["Booked his flights", "Finished all his projects", "Changed the team calendar", "Arranged for a colleague to cover his work"], correct_index: 3,
        justification: "\"Kevin has kindly agreed to answer my client e-mails while I am away.\"",
      },
    ],
  },
  {
    text: `Review: Harborside Inn ★★★★☆

We stayed at the Harborside Inn for three nights in July. Our room was clean and had a lovely view of the boats. The staff were friendly, and the breakfast, which included fresh fruit and local cheese, was excellent.

The only problem was the noise from the bar downstairs, which stayed open until midnight. Next time, I will ask for a room on a higher floor.

— Jane P.`,
    questions: [
      {
        difficulty: "normal",
        question: "What does Jane say about her room?",
        answers: ["It was clean and had a nice view.", "It was too small.", "It was very expensive.", "It was far from the harbor."], correct_index: 0,
        justification: "\"Our room was clean and had a lovely view of the boats.\"",
      },
      {
        difficulty: "hard",
        question: "What did Jane NOT like?",
        answers: ["The breakfast", "The noise at night", "The staff", "The view"], correct_index: 1,
        justification: "\"The only problem was the noise from the bar downstairs.\"",
      },
      {
        difficulty: "extreme",
        question: "What can be inferred about Jane's room?",
        answers: ["It was next to the kitchen.", "It had no windows.", "It was on a low floor.", "It was in another building."], correct_index: 2,
        justification: "Next time she wants \"a room on a higher floor\", away from the bar's noise.",
      },
    ],
  },
  {
    text: `Supermarket Ends Free Plastic Bags

From 1 April, FreshMart supermarkets will stop giving away plastic bags at the checkout. Customers who need a bag can buy a reusable one for 50 cents, and the money will go to a local environmental charity.

FreshMart says it currently gives out about 3 million plastic bags a year. A spokesperson added that customers who bring their own bags will receive extra points on their loyalty card.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is FreshMart changing?",
        answers: ["It will close some stores.", "It will lower its prices.", "It will start a delivery service.", "It will no longer give free plastic bags."], correct_index: 3,
        justification: "\"Will stop giving away plastic bags at the checkout.\"",
      },
      {
        difficulty: "hard",
        question: "What will happen to the money from bag sales?",
        answers: ["It will be given to a charity.", "It will pay for new stores.", "It will be returned to customers.", "It will be used for loyalty cards."], correct_index: 0,
        justification: "\"The money will go to a local environmental charity.\"",
      },
      {
        difficulty: "extreme",
        question: "How can customers get extra loyalty points?",
        answers: ["By buying reusable bags", "By bringing their own bags", "By shopping on 1 April", "By giving money to charity"], correct_index: 1,
        justification: "\"Customers who bring their own bags will receive extra points.\"",
      },
    ],
  },
  {
    text: `Visitor Parking

Visitors to Delmont Laboratories may park in the spaces marked "Visitor" in front of the main entrance. Parking is free for up to three hours.

Visitors staying longer must ask for a full-day permit at reception. Please do not park in the spaces reserved for employees or for deliveries, as cars parked there may be towed away.`,
    questions: [
      {
        difficulty: "normal",
        question: "Who is the notice for?",
        answers: ["New employees", "Delivery drivers", "People visiting the laboratory", "Parking attendants"], correct_index: 2,
        justification: "\"Visitors to Delmont Laboratories may park ...\"",
      },
      {
        difficulty: "hard",
        question: "What should a visitor staying all day do?",
        answers: ["Park in an employee space", "Pay at a machine", "Park on the street", "Get a permit at reception"], correct_index: 3,
        justification: "\"Visitors staying longer must ask for a full-day permit at reception.\"",
      },
      {
        difficulty: "extreme",
        question: "What may happen to a car parked in a delivery space?",
        answers: ["It may be removed.", "It may get a free permit.", "Its owner will be called.", "It will be moved to a visitor space."], correct_index: 0,
        justification: "\"Cars parked there may be towed away\" (= taken away by a truck).",
      },
    ],
  },
  {
    text: `Dear Ms. Albright,

Thank you for choosing Gourmet Box Catering. This e-mail confirms your order for 40 sandwich lunches and 2 fruit platters, to be delivered to Hartley Consulting, 5th floor, on Tuesday, 8 April, at 11:45 A.M.

The total cost is $520, which will be charged to your company account. Please let us know of any changes by Monday at noon. Changes made after that time may not be possible.

Best regards,
Gourmet Box Catering`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the purpose of the e-mail?",
        answers: ["To offer a new menu", "To confirm a food order", "To ask for payment by cash", "To change a delivery address"], correct_index: 1,
        justification: "\"This e-mail confirms your order.\"",
      },
      {
        difficulty: "hard",
        question: "How will the order be paid?",
        answers: ["In cash on delivery", "By credit card in advance", "It will be charged to a company account.", "By bank transfer after the event"], correct_index: 2,
        justification: "\"Will be charged to your company account.\"",
      },
      {
        difficulty: "extreme",
        question: "What would most likely happen if Ms. Albright asked for 10 more lunches on Tuesday morning?",
        answers: ["The lunches would be free.", "The delivery would be moved to Monday.", "The order would be canceled.", "The change might not be accepted."], correct_index: 3,
        justification: "Changes must be made by Monday at noon; later changes \"may not be possible\".",
      },
    ],
  },
  {
    text: `Ledgerly — Accounting Made Simple

Ledgerly is online accounting software designed for small businesses. Send invoices, track expenses, and see how your business is doing, all from one easy screen.

Ledgerly connects automatically to most banks, so you no longer need to type in your transactions. Plans start at $15 per month, and there is no long-term contract. Try it free for 30 days; no credit card is needed.`,
    questions: [
      {
        difficulty: "normal",
        question: "Who is Ledgerly designed for?",
        answers: ["Small businesses", "Large banks", "Accounting students", "Tax offices"], correct_index: 0,
        justification: "\"Online accounting software designed for small businesses.\"",
      },
      {
        difficulty: "hard",
        question: "What is an advantage of Ledgerly mentioned in the advertisement?",
        answers: ["It is completely free.", "It gets bank information automatically.", "It includes a personal accountant.", "It works without the internet."], correct_index: 1,
        justification: "\"Connects automatically to most banks, so you no longer need to type in your transactions.\"",
      },
      {
        difficulty: "extreme",
        question: "What is true about the free trial?",
        answers: ["It lasts 15 days.", "It requires a long-term contract.", "Users do not have to give card details.", "It is only for banks."], correct_index: 2,
        justification: "\"Try it free for 30 days; no credit card is needed.\"",
      },
    ],
  },
  {
    text: `Record Year for Tourism

The region of Valmora welcomed a record 4.2 million visitors last year, an increase of 12% compared with the previous year. Most visitors came from neighboring countries, but the number of travelers from Asia doubled.

The tourism office believes new direct flights and a popular television series filmed in the region helped attract visitors. Hotels reported that rooms were almost fully booked throughout the summer.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the article mainly about?",
        answers: ["A new television series", "A shortage of hotels", "A new airport", "An increase in tourism"], correct_index: 3,
        justification: "\"A record 4.2 million visitors.\"",
      },
      {
        difficulty: "hard",
        question: "Where did most visitors come from?",
        answers: ["Nearby countries", "Asia", "Valmora itself", "North America"], correct_index: 0,
        justification: "\"Most visitors came from neighboring countries.\" (The number from Asia doubled, but they were not the majority.)",
      },
      {
        difficulty: "extreme",
        question: "According to the tourism office, what is one reason for the increase?",
        answers: ["Lower hotel prices", "A TV show made in the region", "A new hotel chain", "A large sports event"], correct_index: 1,
        justification: "\"A popular television series filmed in the region.\"",
      },
    ],
  },
  {
    text: `Laboratory Safety Rules

All staff and visitors must wear safety glasses at all times inside the laboratory. Lab coats must be worn when working with chemicals and must not be taken into the cafeteria.

Eating and drinking are not allowed in the laboratory. Any accident, even a small one, must be reported to the safety officer on the same day. Fire exits must never be blocked.`,
    questions: [
      {
        difficulty: "normal",
        question: "What must everyone wear inside the laboratory?",
        answers: ["Gloves", "Lab coats", "Safety glasses", "Safety shoes"], correct_index: 2,
        justification: "\"All staff and visitors must wear safety glasses at all times.\"",
      },
      {
        difficulty: "hard",
        question: "What must be done after a small accident?",
        answers: ["It must be written in a weekly report.", "Nothing, if no one is hurt.", "The laboratory must be closed.", "It must be reported on the same day."], correct_index: 3,
        justification: "\"Any accident, even a small one, must be reported ... on the same day.\"",
      },
      {
        difficulty: "extreme",
        question: "Where are lab coats NOT allowed?",
        answers: ["In the cafeteria", "In the laboratory", "Near the fire exits", "In the safety officer's office"], correct_index: 0,
        justification: "\"Must not be taken into the cafeteria.\"",
      },
    ],
  },
  {
    text: `Dear Ms. Yamada,

I am delighted to inform you that you have been nominated for the Regional Business Award in the category "Best New Company." Your company, Bloom Cosmetics, was chosen from more than 150 businesses that opened in the past two years.

The winners will be announced at a dinner on 22 November at the Grand Hotel. Two tickets have been reserved for you. Please confirm your attendance by 1 November.

Sincerely,
Mark Delaney, Award Committee`,
    questions: [
      {
        difficulty: "normal",
        question: "Why did Mr. Delaney write to Ms. Yamada?",
        answers: ["To tell her that she won an award", "To tell her that her company is a candidate for an award", "To invite her to give a speech", "To sell her tickets"], correct_index: 1,
        justification: "\"You have been nominated\" = you are a candidate. The winners will be announced later.",
      },
      {
        difficulty: "hard",
        question: "What is indicated about Bloom Cosmetics?",
        answers: ["It has 150 employees.", "It is located in the Grand Hotel.", "It started less than three years ago.", "It won the award last year."], correct_index: 2,
        justification: "It was chosen from businesses \"that opened in the past two years\".",
      },
      {
        difficulty: "extreme",
        question: "What is Ms. Yamada asked to do?",
        answers: ["Pay for two tickets", "Send information about her company", "Choose a category", "Say if she will attend the dinner"], correct_index: 3,
        justification: "\"Please confirm your attendance by 1 November.\"",
      },
    ],
  },
  {
    text: `Greg Lind (3:15 P.M.): The printer on the 4th floor says the toner is empty.
Sofia Marin (3:17 P.M.): There should be a spare one in the supply cabinet.
Greg Lind (3:20 P.M.): I looked. There are only paper and staples.
Sofia Marin (3:21 P.M.): Then I'll order some today. In the meantime, can you use the printer on the 3rd floor?
Greg Lind (3:22 P.M.): Sure, I'm only printing a few pages.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the problem?",
        answers: ["A printer has run out of toner.", "A printer is broken.", "There is no paper.", "The supply cabinet is locked."], correct_index: 0,
        justification: "\"The toner is empty.\"",
      },
      {
        difficulty: "hard",
        question: "At 3:20 P.M., what does Mr. Lind mean when he writes, \"I looked\"?",
        answers: ["He saw the spare toner.", "He already checked the cabinet and found no toner.", "He is going to look later.", "He found the problem with the printer."], correct_index: 1,
        justification: "He checked; there are only paper and staples, no toner.",
      },
      {
        difficulty: "extreme",
        question: "What will Mr. Lind most likely do next?",
        answers: ["Order toner", "Wait until tomorrow", "Print on another floor", "Buy a new printer"], correct_index: 2,
        justification: "He agrees to use the printer on the 3rd floor. Ms. Marin will order the toner.",
      },
    ],
  },
  {
    text: `Holiday Office Closure

Our offices will be closed from 24 December to 1 January. We will reopen on Thursday, 2 January, at 9 A.M.

During the closure, orders can still be placed on our website, but they will not be shipped until 2 January. For urgent technical problems, customers with a premium support contract can call our emergency line. We wish all our customers a happy holiday season.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the notice about?",
        answers: ["A holiday sale", "A new website", "A change of address", "When the offices will be closed"], correct_index: 3,
        justification: "\"Our offices will be closed from 24 December to 1 January.\"",
      },
      {
        difficulty: "hard",
        question: "What will happen to orders placed on 28 December?",
        answers: ["They will be shipped in January.", "They will be canceled.", "They will be shipped the same day.", "They cannot be placed."], correct_index: 0,
        justification: "Orders can be placed, but \"will not be shipped until 2 January\".",
      },
      {
        difficulty: "extreme",
        question: "Who can get help during the closure?",
        answers: ["All customers who call", "Customers with a premium support contract", "Customers who order online", "Only new customers"], correct_index: 1,
        justification: "\"Customers with a premium support contract can call our emergency line.\"",
      },
    ],
  },
  {
    text: `Camp Discovery — Summer Science Camp

Camp Discovery offers week-long science camps for children aged 8 to 12, from 1 July to 23 August. Each day, campers do hands-on experiments, build robots, and explore nature in the park next to our center.

Camp runs Monday to Friday from 9 A.M. to 4 P.M. Early drop-off from 8 A.M. is available for an extra $20 per week. Register before 1 May to save 15%.`,
    questions: [
      {
        difficulty: "normal",
        question: "Who is the camp for?",
        answers: ["High school students", "Science teachers", "Children aged 8 to 12", "Families with babies"], correct_index: 2,
        justification: "\"For children aged 8 to 12.\"",
      },
      {
        difficulty: "hard",
        question: "What can parents pay extra for?",
        answers: ["A robot kit", "Weekend activities", "Lunch", "Bringing their child earlier in the morning"], correct_index: 3,
        justification: "\"Early drop-off from 8 A.M. is available for an extra $20 per week.\"",
      },
      {
        difficulty: "extreme",
        question: "What is NOT mentioned as a camp activity?",
        answers: ["Swimming", "Doing experiments", "Building robots", "Exploring nature"], correct_index: 0,
        justification: "Experiments, robots and nature are mentioned. Swimming is not.",
      },
    ],
  },
  {
    text: `Dear Mr. Grant,

We are sorry to hear that you lost your library card. A replacement card can be issued at any of our branches. Please bring a photo ID and proof of your current address, such as a recent utility bill.

There is a $3 fee for replacement cards. Your borrowing history and any books currently checked out will be transferred to the new card, and your old card will be blocked immediately.

Westbrook Public Library`,
    questions: [
      {
        difficulty: "normal",
        question: "Why did the library write to Mr. Grant?",
        answers: ["To ask him to return books", "To explain how to replace a lost card", "To announce a new branch", "To charge a late fee"], correct_index: 1,
        justification: "\"A replacement card can be issued at any of our branches.\"",
      },
      {
        difficulty: "hard",
        question: "What does Mr. Grant need to bring?",
        answers: ["His old library card", "The books he borrowed", "Identification and proof of address", "A letter from his employer"], correct_index: 2,
        justification: "\"A photo ID and proof of your current address.\"",
      },
      {
        difficulty: "extreme",
        question: "What will happen to Mr. Grant's old card?",
        answers: ["It will be sent back to him.", "It will work for one more month.", "It will be given a new number.", "It will stop working."], correct_index: 3,
        justification: "\"Your old card will be blocked immediately.\"",
      },
    ],
  },
  {
    text: `Robots Help Local Factory Grow

Ardent Metalworks, which makes parts for farm machines, has installed ten new robots in its factory. The robots do the heaviest and most repetitive tasks, such as lifting metal sheets.

Rather than reducing its workforce, the company has hired 15 new employees to program and maintain the robots. Production has increased by 40% since the robots arrived, and the company is now selling its parts in three new countries.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the article about?",
        answers: ["A factory using new robots", "A new farm machine", "A factory closing", "A robot competition"], correct_index: 0,
        justification: "\"Has installed ten new robots in its factory.\"",
      },
      {
        difficulty: "hard",
        question: "What kind of tasks do the robots do?",
        answers: ["Selling parts", "Heavy and repetitive tasks", "Designing new products", "Training employees"], correct_index: 1,
        justification: "\"The heaviest and most repetitive tasks.\"",
      },
      {
        difficulty: "extreme",
        question: "What is suggested about the robots' effect on jobs at the company?",
        answers: ["Many workers lost their jobs.", "The number of workers did not change.", "The company now employs more people.", "The workers moved to other countries."], correct_index: 2,
        justification: "\"Rather than reducing its workforce, the company has hired 15 new employees.\"",
      },
    ],
  },
  {
    text: `Bus Route 22 — Temporary Change

Because of construction on Station Road, Route 22 buses will not stop at the Station Road and Library stops from 5 to 30 May. During this time, buses will follow Mill Street, with a temporary stop in front of the post office.

Passengers going to the library can use the post office stop, which is a five-minute walk away. All other stops on the route will not change.`,
    questions: [
      {
        difficulty: "normal",
        question: "Why is the bus route changing?",
        answers: ["Because of a new library", "Because of a festival", "Because of a lack of drivers", "Because of road work"], correct_index: 3,
        justification: "\"Because of construction on Station Road.\"",
      },
      {
        difficulty: "hard",
        question: "Where will the temporary stop be?",
        answers: ["In front of the post office", "In front of the library", "At the train station", "On Station Road"], correct_index: 0,
        justification: "\"A temporary stop in front of the post office.\"",
      },
      {
        difficulty: "extreme",
        question: "What is suggested about passengers going to the library?",
        answers: ["They must take a different bus.", "They will have to walk a short distance.", "The library will be closed in May.", "They will arrive earlier than usual."], correct_index: 1,
        justification: "The post office stop \"is a five-minute walk away\" from the library.",
      },
    ],
  },
  {
    text: `Dear Ms. Navarro,

Thank you for your interest in our printing services. As requested, here is our quote for 2,000 color brochures (A4, folded, printed on both sides):

Printing: $780
Design check: $50
Delivery: free

The total is $830. Printing will take five working days after you approve the final design. This quote is valid for 30 days.

Best regards,
Sharp Print Studio`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the purpose of the e-mail?",
        answers: ["To confirm a delivery", "To ask for a design", "To give a price estimate", "To advertise a new printer"], correct_index: 2,
        justification: "\"Here is our quote.\"",
      },
      {
        difficulty: "hard",
        question: "How much does delivery cost?",
        answers: ["$50", "$780", "$830", "Nothing"], correct_index: 3,
        justification: "\"Delivery: free.\"",
      },
      {
        difficulty: "extreme",
        question: "When will printing start?",
        answers: ["After Ms. Navarro approves the final design", "Immediately", "In 30 days", "After the delivery"], correct_index: 0,
        justification: "\"Five working days after you approve the final design.\"",
      },
    ],
  },
  {
    text: `Delivery FAQ — Greenbox Organic Foods

How often do you deliver?
We deliver once a week, on the day you choose when you sign up.

Can I skip a week?
Yes. Simply log in and click "Skip delivery" at least 48 hours before your delivery day.

What if I am not at home?
Our drivers will leave your box in a shaded place. If you prefer, you can choose a pickup point instead.`,
    questions: [
      {
        difficulty: "normal",
        question: "How often does Greenbox deliver?",
        answers: ["Every day", "Once a week", "Twice a week", "Once a month"], correct_index: 1,
        justification: "\"We deliver once a week.\"",
      },
      {
        difficulty: "hard",
        question: "How can a customer skip a delivery?",
        answers: ["By calling the driver", "By not opening the door", "By clicking a button online in advance", "By sending an e-mail on the delivery day"], correct_index: 2,
        justification: "\"Log in and click 'Skip delivery' at least 48 hours before.\"",
      },
      {
        difficulty: "extreme",
        question: "What happens if a customer is not at home?",
        answers: ["The box is taken back to the warehouse.", "The customer pays a fee.", "The delivery is moved to the next day.", "The box is left outside in a protected place."], correct_index: 3,
        justification: "\"Our drivers will leave your box in a shaded place.\"",
      },
    ],
  },
  {
    text: `Record Number of Runners at City Marathon

More than 18,000 runners took part in the 25th City Marathon on Sunday, the largest number in the event's history. The race was won by Kenyan runner Joseph Kiplagat in 2 hours and 9 minutes.

The marathon raised over $1.2 million for local charities. Organizers thanked the 2,000 volunteers who helped at water stations and the finish line.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the article mainly about?",
        answers: ["A marathon", "A charity dinner", "A new sports stadium", "A volunteer program"], correct_index: 0,
        justification: "\"The 25th City Marathon on Sunday.\"",
      },
      {
        difficulty: "hard",
        question: "What is mentioned about this year's race?",
        answers: ["It was the first marathon in the city.", "It had more runners than any previous year.", "It was canceled because of rain.", "It had no volunteers."], correct_index: 1,
        justification: "\"The largest number in the event's history.\"",
      },
      {
        difficulty: "extreme",
        question: "What is suggested about the City Marathon?",
        answers: ["It is only for professional runners.", "It loses money every year.", "It has taken place for many years.", "It is held twice a year."], correct_index: 2,
        justification: "This was the 25th edition.",
      },
    ],
  },
  {
    text: `New Opening Hours — Lakeview Medical Clinic

From 1 June, the clinic will be open from 7:30 A.M. to 7 P.M. on weekdays, so that patients can see a doctor before or after work. On Saturdays, the clinic will be open from 9 A.M. to 1 P.M. for urgent appointments only.

Appointments can be booked by phone or through our new online booking system. Prescriptions can now also be renewed online.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is changing at the clinic?",
        answers: ["Its location", "Its doctors", "Its prices", "Its opening hours"], correct_index: 3,
        justification: "\"New Opening Hours.\"",
      },
      {
        difficulty: "hard",
        question: "Why is the clinic changing its weekday hours?",
        answers: ["To help patients who work", "To reduce costs", "Because of a new doctor", "Because of the online system"], correct_index: 0,
        justification: "\"So that patients can see a doctor before or after work.\"",
      },
      {
        difficulty: "extreme",
        question: "What is true about Saturday appointments?",
        answers: ["They must be booked online.", "They are only for urgent cases.", "They last all day.", "They are for prescriptions only."], correct_index: 1,
        justification: "\"On Saturdays ... for urgent appointments only.\"",
      },
    ],
  },
  {
    text: `To: All staff
From: Human Resources
Subject: Employee survey results

Thank you to the 340 employees who completed this year's survey. Overall, 78% said they are satisfied with their job, up from 71% last year.

The most common request was for more flexible working hours. In response, we will start a trial of flexible hours in two departments in September. Full results are available on the intranet.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is the e-mail about?",
        answers: ["A new HR manager", "A change of salary", "The results of a staff survey", "A company party"], correct_index: 2,
        justification: "\"Employee survey results.\"",
      },
      {
        difficulty: "hard",
        question: "What did employees ask for most often?",
        answers: ["Higher salaries", "A new cafeteria", "More training", "More flexible working hours"], correct_index: 3,
        justification: "\"The most common request was for more flexible working hours.\"",
      },
      {
        difficulty: "extreme",
        question: "What is suggested about job satisfaction?",
        answers: ["It has improved since last year.", "It has fallen since last year.", "It was not measured last year.", "It is the same in all departments."], correct_index: 0,
        justification: "78% this year, up from 71% last year.",
      },
    ],
  },
  {
    text: `Summer Evenings at the Park

Enjoy free outdoor concerts every Friday in July and August at Riverside Park. Concerts start at 7 P.M. and feature local jazz, folk, and pop bands.

Bring a blanket or a folding chair. Food trucks will be on site, but alcohol is not permitted. In case of rain, concerts will move to the Community Hall on Oak Street.`,
    questions: [
      {
        difficulty: "normal",
        question: "What is being advertised?",
        answers: ["A food truck festival", "A series of free concerts", "A music school", "A new park"], correct_index: 1,
        justification: "\"Free outdoor concerts every Friday in July and August.\"",
      },
      {
        difficulty: "hard",
        question: "What are people encouraged to bring?",
        answers: ["Their own food", "Musical instruments", "Something to sit on", "Tickets"], correct_index: 2,
        justification: "\"Bring a blanket or a folding chair.\"",
      },
      {
        difficulty: "extreme",
        question: "What will happen if it rains?",
        answers: ["The concert will be canceled.", "The concert will start later.", "Tickets will be refunded.", "The concert will take place indoors."], correct_index: 3,
        justification: "\"In case of rain, concerts will move to the Community Hall.\"",
      },
    ],
  },
  {
    text: `Dear Mr. Osei,

Congratulations! We are pleased to inform you that you have been awarded the Hartwell Foundation Scholarship for the coming academic year. The scholarship will cover your full tuition fees and includes $2,000 for books and study materials.

To accept the scholarship, please sign the attached form and return it by 15 July. Scholarship students are also invited to a welcome reception on 3 September.

Sincerely,
Hartwell Foundation`,
    questions: [
      {
        difficulty: "normal",
        question: "Why was the letter sent?",
        answers: ["To announce that Mr. Osei won a scholarship", "To ask Mr. Osei to pay his fees", "To offer Mr. Osei a job", "To invite Mr. Osei to apply"], correct_index: 0,
        justification: "\"You have been awarded the Hartwell Foundation Scholarship.\"",
      },
      {
        difficulty: "hard",
        question: "What does the scholarship pay for besides tuition?",
        answers: ["Housing", "Books and study materials", "Travel", "A computer"], correct_index: 1,
        justification: "\"Includes $2,000 for books and study materials.\"",
      },
      {
        difficulty: "extreme",
        question: "What must Mr. Osei do to accept the scholarship?",
        answers: ["Attend the reception", "Pay a fee", "Return a signed form by a deadline", "Write an essay"], correct_index: 2,
        justification: "\"Please sign the attached form and return it by 15 July.\"",
      },
    ],
  },
];
