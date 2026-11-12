// More RC 8 texts (text completion): a short text with blanks ___(1)___, and one question per blank.
// Same fields as createQuestion (questions.js), without "section" and "text" (added there).

export const RC8_TEXTS_1 = [
  {
    text: `To: All staff
From: Facilities Department
Subject: Third-floor renovation

Starting on Monday, 3 June, the third floor will be ___(1)___ for two weeks. During this time, the marketing team will work from the meeting rooms on the first floor. ___(2)___

Please take all personal items home ___(3)___ Friday afternoon. We apologize for the ___(4)___ and thank you for your patience.`,
    questions: [
      {
        difficulty: "hard", category: "passive",
        question: "Blank (1)",
        answers: ["closed", "close", "closing", "closes"], correct_index: 0,
        justification: "\"Will be\" + past participle (passive): will be closed.",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (2): which sentence fits best?",
        answers: ["The cafeteria menu will change next month.", "Desks and computers will be moved by our staff over the weekend.", "Our new sales director starts in July.", "Parking fees will increase in August."], correct_index: 1,
        justification: "It continues the practical details of the move.",
      },
      {
        difficulty: "normal", category: "prepositions",
        question: "Blank (3)",
        answers: ["since", "until", "by", "during"], correct_index: 2,
        justification: "\"By\" = not later than (a deadline).",
      },
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (4)",
        answers: ["convenience", "comfort", "reservation", "inconvenience"], correct_index: 3,
        justification: "We apologize for the problems it causes: the inconvenience.",
      },
    ],
  },
  {
    text: `Dear Ms. Alvarez,

Thank you for applying for the position of sales assistant at Norland Electronics. We were very ___(1)___ by your experience, and we would like to invite you to an interview on Thursday at 10 A.M. ___(2)___

The interview ___(3)___ about forty-five minutes. Please bring a copy of your ID. If this time is not ___(4)___, please let us know by Tuesday.

Kind regards,
Paul Grant, Human Resources`,
    questions: [
      {
        difficulty: "normal", category: "wordForms",
        question: "Blank (1)",
        answers: ["impressed", "impress", "impressive", "impression"], correct_index: 0,
        justification: "A feeling of the subject (we), with \"by\": impressed.",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (2): which sentence fits best?",
        answers: ["Our store is closed on public holidays.", "It will take place at our main office on Kerr Street.", "We have sold more televisions than ever this year.", "Thank you for your recent purchase."], correct_index: 1,
        justification: "It gives the place of the interview, just after its date and time.",
      },
      {
        difficulty: "normal", category: "subjectVerb",
        question: "Blank (3)",
        answers: ["last", "lasting", "lasts", "are lasting"], correct_index: 2,
        justification: "Singular subject (the interview), a general fact: lasts.",
      },
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (4)",
        answers: ["confident", "constant", "considerate", "convenient"], correct_index: 3,
        justification: "A time that suits you: convenient.",
      },
    ],
  },
  {
    text: `Fitwell Gym — Holiday Opening Hours

Please note that the gym will have ___(1)___ opening hours during the holiday period, from 23 December to 2 January. We will open at 8 A.M. and close at 4 P.M. ___(2)___

All group classes ___(3)___ during this time, but personal trainers will still be available. Normal hours will ___(4)___ on 3 January. Happy holidays!`,
    questions: [
      {
        difficulty: "normal", category: "wordForms",
        question: "Blank (1)",
        answers: ["reduced", "reducing", "reduction", "reduce"], correct_index: 0,
        justification: "Before a noun (opening hours): an adjective, reduced.",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (2): which sentence fits best?",
        answers: ["Membership fees are paid every month.", "The gym will be completely closed on 25 December and 1 January.", "Our swimming pool is the largest in the city.", "Please bring your own towel to every class."], correct_index: 1,
        justification: "It continues the special holiday hours.",
      },
      {
        difficulty: "hard", category: "passive",
        question: "Blank (3)",
        answers: ["cancel", "will cancel", "will be canceled", "canceling"], correct_index: 2,
        justification: "Classes don't cancel themselves: will be canceled.",
      },
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (4)",
        answers: ["assume", "consume", "presume", "resume"], correct_index: 3,
        justification: "Start again after a break: resume.",
      },
    ],
  },
  {
    text: `Speak with Confidence!

Lingua Center offers English courses for professionals ___(1)___ want to improve their communication skills. Our classes are small, ___(2)___ every student gets personal attention. ___(3)___

Courses start every month, and you can choose between morning and evening sessions. Sign up before 31 March and ___(4)___ 15% off your first course!`,
    questions: [
      {
        difficulty: "normal", category: "pronouns",
        question: "Blank (1)",
        answers: ["who", "which", "whose", "whom"], correct_index: 0,
        justification: "People (professionals), subject of \"want\": who.",
      },
      {
        difficulty: "normal", category: "connectors",
        question: "Blank (2)",
        answers: ["but", "so", "although", "because"], correct_index: 1,
        justification: "A consequence (small classes -> personal attention): so.",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (3): which sentence fits best?",
        answers: ["Our restaurant serves lunch until 3 P.M.", "The museum is closed on Mondays.", "All our teachers are experienced business trainers.", "Please return your books on time."], correct_index: 2,
        justification: "It adds another advantage of the courses.",
      },
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (4)",
        answers: ["keep", "spend", "earn", "get"], correct_index: 3,
        justification: "Fixed expression: get 15% off (= a discount).",
      },
    ],
  },
  {
    text: `To: Hannah Brooks
From: Oakline Furniture
Subject: Your order #4471

Dear Ms. Brooks,

Your dining table will arrive later than ___(1)___. Our supplier has had problems with a machine at its factory. ___(2)___ We now expect to deliver your table on 14 May.

___(3)___ the delay, we will give you a free set of chair cushions. We are very sorry and thank you for your ___(4)___.`,
    questions: [
      {
        difficulty: "normal", category: "wordForms",
        question: "Blank (1)",
        answers: ["planned", "plan", "planning", "plans"], correct_index: 0,
        justification: "Fixed expression: later than planned.",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (2): which sentence fits best?",
        answers: ["Our new catalog is now available.", "As a result, production stopped for a week.", "We are open seven days a week.", "Delivery is free for orders over $500."], correct_index: 1,
        justification: "It explains the consequence of the machine problem.",
      },
      {
        difficulty: "hard", category: "connectors",
        question: "Blank (3)",
        answers: ["Although", "Despite", "Because of", "Unless"], correct_index: 2,
        justification: "Cause + a noun (the delay): because of. It's why they offer a gift.",
      },
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (4)",
        answers: ["agreement", "knowledge", "attention", "understanding"], correct_index: 3,
        justification: "A polite formula: thank you for your understanding.",
      },
    ],
  },
  {
    text: `Business News

Brightway Foods, a family-owned company based in Leeds, ___(1)___ a second factory next year. The new site, located near the airport, will ___(2)___ around 150 jobs. ___(3)___

The company's sales have grown ___(4)___ since it started selling its products online in 2019.`,
    questions: [
      {
        difficulty: "normal", category: "verbTenses",
        question: "Blank (1)",
        answers: ["will open", "opened", "has opened", "was opening"], correct_index: 0,
        justification: "\"Next year\": the future, will open.",
      },
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (2)",
        answers: ["invent", "create", "build up", "grow"], correct_index: 1,
        justification: "Fixed expression: create jobs.",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (3): which sentence fits best?",
        answers: ["The airport will close for repairs in June.", "Customers can now pay by mobile phone.", "Construction is expected to begin in March.", "Leeds has many beautiful parks."], correct_index: 2,
        justification: "It continues the information about the new factory.",
      },
      {
        difficulty: "normal", category: "wordForms",
        question: "Blank (4)",
        answers: ["rapid", "rapidity", "rapids", "rapidly"], correct_index: 3,
        justification: "It describes a verb (have grown): an adverb, rapidly.",
      },
    ],
  },
  {
    text: `Notice to All Employees

The east parking lot will be ___(1)___ on Saturday, 12 October, so that the lines can be repainted. ___(2)___

Employees who work on that day should park in the west lot ___(3)___. We expect the work ___(4)___ by Sunday morning.`,
    questions: [
      {
        difficulty: "hard", category: "passive",
        question: "Blank (1)",
        answers: ["closed", "closing", "close", "closes"], correct_index: 0,
        justification: "\"Will be\" + past participle: will be closed.",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (2): which sentence fits best?",
        answers: ["Our company was founded in 1985.", "The west lot has enough space for everyone.", "The cafeteria will serve a special lunch on Friday.", "Please submit your expense reports by Monday."], correct_index: 1,
        justification: "It reassures employees before telling them where to park.",
      },
      {
        difficulty: "normal", category: "connectors",
        question: "Blank (3)",
        answers: ["rather", "besides", "instead", "anyway"], correct_index: 2,
        justification: "In place of the east lot: instead.",
      },
      {
        difficulty: "hard", category: "passive",
        question: "Blank (4)",
        answers: ["completing", "to complete", "completed", "to be completed"], correct_index: 3,
        justification: "The work is done by someone: expect + to be + past participle.",
      },
    ],
  },
  {
    text: `Dear Mr. Okoro,

We are pleased to confirm your ___(1)___ at the Harbor View Hotel from 8 to 11 April. Your room has a sea view and a private balcony. ___(2)___

Check-in is from 3 P.M. If you arrive ___(3)___, you can leave your luggage at the front desk. We look forward to ___(4)___ you.

Best regards,
Front Desk Team`,
    questions: [
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (1)",
        answers: ["reservation", "registration", "recommendation", "reputation"], correct_index: 0,
        justification: "A booked room: a reservation.",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (2): which sentence fits best?",
        answers: ["Our chef has won several awards.", "Breakfast is included in the price.", "The city has two train stations.", "We are hiring new receptionists."], correct_index: 1,
        justification: "It continues the details of the booking.",
      },
      {
        difficulty: "normal", category: "comparatives",
        question: "Blank (3)",
        answers: ["early", "earliest", "earlier", "more early"], correct_index: 2,
        justification: "Before 3 P.M.: earlier (than check-in time).",
      },
      {
        difficulty: "normal", category: "gerunds",
        question: "Blank (4)",
        answers: ["welcome", "welcomed", "to welcome", "welcoming"], correct_index: 3,
        justification: "\"Look forward to\" + -ing: welcoming.",
      },
    ],
  },
  {
    text: `Kitchen Rules — Please Read

To keep our shared kitchen clean, all employees are asked to wash ___(1)___ own cups and plates after use. Food left in the refrigerator ___(2)___ every Friday at 5 P.M. ___(3)___

This rule ___(4)___ in place since January. Thank you for your help in keeping this space pleasant for everyone.`,
    questions: [
      {
        difficulty: "normal", category: "pronouns",
        question: "Blank (1)",
        answers: ["their", "them", "theirs", "they"], correct_index: 0,
        justification: "Before \"own\" + a noun: their own.",
      },
      {
        difficulty: "hard", category: "passive",
        question: "Blank (2)",
        answers: ["throws away", "is thrown away", "throwing away", "has thrown away"], correct_index: 1,
        justification: "Food doesn't throw itself away: passive, is thrown away.",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (3): which sentence fits best?",
        answers: ["The kitchen was painted last year.", "Our offices are open from 8 A.M.", "Please write your name on any food you want to keep.", "Coffee is our most popular drink."], correct_index: 2,
        justification: "It gives a practical rule linked to the Friday cleaning.",
      },
      {
        difficulty: "normal", category: "verbTenses",
        question: "Blank (4)",
        answers: ["is", "was", "will be", "has been"], correct_index: 3,
        justification: "\"Since January\" (until now): present perfect, has been.",
      },
    ],
  },
  {
    text: `New at Riverside Library!

Starting in May, the library ___(1)___ free computer classes for adults every Tuesday evening. The classes are designed for people ___(2)___ have little experience with technology. ___(3)___

Places are limited, so please register at the front desk ___(4)___ possible.`,
    questions: [
      {
        difficulty: "normal", category: "verbTenses",
        question: "Blank (1)",
        answers: ["will offer", "offered", "has offered", "was offering"], correct_index: 0,
        justification: "\"Starting in May\" (the future): will offer.",
      },
      {
        difficulty: "normal", category: "pronouns",
        question: "Blank (2)",
        answers: ["which", "who", "whose", "what"], correct_index: 1,
        justification: "People, subject of \"have\": who.",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (3): which sentence fits best?",
        answers: ["The library was built in 1902.", "Children's books are on the second floor.", "Topics include sending e-mails and shopping safely online.", "Late fees have increased this year."], correct_index: 2,
        justification: "It describes the content of the classes.",
      },
      {
        difficulty: "hard", category: "connectors",
        question: "Blank (4)",
        answers: ["as long as", "as well as", "as far as", "as soon as"], correct_index: 3,
        justification: "Fixed expression: as soon as possible.",
      },
    ],
  },
  {
    text: `To: Sales Team
From: Dana Whitfield
Subject: Monthly results

Hi everyone,

I am happy to report that our sales in June were ___(1)___ than in May. This is mainly ___(2)___ the success of our summer promotion. ___(3)___

Let's keep up the good work. Our next team meeting ___(4)___ on Monday at 9 A.M.

Dana`,
    questions: [
      {
        difficulty: "normal", category: "comparatives",
        question: "Blank (1)",
        answers: ["higher", "high", "highest", "more high"], correct_index: 0,
        justification: "\"Than\" -> comparative: higher.",
      },
      {
        difficulty: "hard", category: "connectors",
        question: "Blank (2)",
        answers: ["because", "due to", "so that", "although"], correct_index: 1,
        justification: "Cause + a noun (the success): due to.",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (3): which sentence fits best?",
        answers: ["The office will be closed next Friday.", "My vacation starts in August.", "Thank you all for your hard work.", "Our printer needs new ink."], correct_index: 2,
        justification: "After good results, the manager thanks the team.",
      },
      {
        difficulty: "hard", category: "passive",
        question: "Blank (4)",
        answers: ["will hold", "holds", "is holding", "will be held"], correct_index: 3,
        justification: "A meeting is organized by people: will be held.",
      },
    ],
  },
  {
    text: `Greenway Car Rental

Thank you for choosing Greenway. Please return the car with a full tank of gas. If the tank is not full, a ___(1)___ fee will be added to your bill. ___(2)___

Cars must be returned ___(3)___ 6 P.M. on the last day of your rental. Late returns may be charged for an extra day. Please contact us if you need to ___(4)___ your rental.`,
    questions: [
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (1)",
        answers: ["refueling", "reviewing", "refunding", "relocating"], correct_index: 0,
        justification: "Filling the tank again: a refueling fee.",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (2): which sentence fits best?",
        answers: ["Our cars are cleaned after every rental.", "This fee is higher than the price at a normal gas station.", "We have offices in twelve cities.", "Children's seats are available on request."], correct_index: 1,
        justification: "It gives information about the fee just mentioned.",
      },
      {
        difficulty: "normal", category: "prepositions",
        question: "Blank (3)",
        answers: ["since", "at", "by", "during"], correct_index: 2,
        justification: "A deadline (not later than 6 P.M.): by.",
      },
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (4)",
        answers: ["expand", "expect", "explain", "extend"], correct_index: 3,
        justification: "Make it last longer: extend your rental.",
      },
    ],
  },
  {
    text: `Dear Customer,

We are writing to let you know that our prices ___(1)___ on 1 March. This is the first price increase in three years. ___(2)___

Customers who renew their subscription ___(3)___ the end of February will keep the current price for another twelve months. We thank you for your ___(4)___ and look forward to serving you.`,
    questions: [
      {
        difficulty: "normal", category: "verbTenses",
        question: "Blank (1)",
        answers: ["will increase", "increased", "have increased", "were increasing"], correct_index: 0,
        justification: "1 March is in the future: will increase.",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (2): which sentence fits best?",
        answers: ["Our office is closed on Sundays.", "It is necessary because our costs have risen.", "We have a new logo.", "Many customers live in the city center."], correct_index: 1,
        justification: "It explains the reason for the increase.",
      },
      {
        difficulty: "normal", category: "prepositions",
        question: "Blank (3)",
        answers: ["since", "during", "before", "among"], correct_index: 2,
        justification: "Earlier than the end of February: before.",
      },
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (4)",
        answers: ["royalty", "quality", "reality", "loyalty"], correct_index: 3,
        justification: "Staying with a company: loyalty.",
      },
    ],
  },
  {
    text: `Volunteers Wanted!

The Clearwater Music Festival is looking for volunteers to help ___(1)___ the event on 20–22 July. Tasks include selling tickets, giving directions, and helping with ___(2)___ the stage. ___(3)___

Volunteers will receive a free festival T-shirt and a meal each day. If you are ___(4)___, please fill out the form on our website.`,
    questions: [
      {
        difficulty: "normal", category: "prepositions",
        question: "Blank (1)",
        answers: ["during", "since", "among", "until"], correct_index: 0,
        justification: "While the event takes place: during.",
      },
      {
        difficulty: "normal", category: "gerunds",
        question: "Blank (2)",
        answers: ["set up", "setting up", "to set up", "sets up"], correct_index: 1,
        justification: "After a preposition (with): -ing, setting up.",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (3): which sentence fits best?",
        answers: ["Tickets for the festival are already sold out.", "The stage was built by a local company.", "No previous experience is needed.", "The festival started in 1998."], correct_index: 2,
        justification: "It gives information for people who want to volunteer.",
      },
      {
        difficulty: "normal", category: "wordForms",
        question: "Blank (4)",
        answers: ["interest", "interesting", "interestingly", "interested"], correct_index: 3,
        justification: "A feeling of the person (you): interested.",
      },
    ],
  },
  {
    text: `From: IT Support
To: All employees
Subject: Password change

For security reasons, all employees ___(1)___ to change their passwords by Friday. Your new password should contain at least ten characters. ___(2)___

To change your password, ___(3)___ on "Settings" and then "Security." If you have any problems, please contact the IT help desk. We ___(4)___ your cooperation.`,
    questions: [
      {
        difficulty: "normal", category: "subjectVerb",
        question: "Blank (1)",
        answers: ["need", "needs", "is needing", "has needed"], correct_index: 0,
        justification: "Plural subject (all employees): need.",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (2): which sentence fits best?",
        answers: ["Our new laptops arrive next month.", "It should also include at least one number.", "The cafeteria is on the ground floor.", "Please turn off your monitor at night."], correct_index: 1,
        justification: "It continues the rules for the new password.",
      },
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (3)",
        answers: ["press", "push", "click", "touch"], correct_index: 2,
        justification: "On a computer menu: click on.",
      },
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (4)",
        answers: ["approve", "appear", "apply", "appreciate"], correct_index: 3,
        justification: "A polite formula: we appreciate your cooperation (= thank you).",
      },
    ],
  },
  {
    text: `Community Newsletter

The town of Ashford ___(1)___ a new bicycle path along the river. The path, which is 8 kilometers long, connects the train station to the city park. ___(2)___

The project took two years ___(3)___ and cost about €3 million. The mayor said the path would make cycling ___(4)___ for families.`,
    questions: [
      {
        difficulty: "normal", category: "verbTenses",
        question: "Blank (1)",
        answers: ["has just opened", "opens just", "will just open", "is just opening"], correct_index: 0,
        justification: "A recent action with \"just\": present perfect, has just opened.",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (2): which sentence fits best?",
        answers: ["The train station was renovated in 2010.", "Along the way, there are benches and several picnic areas.", "Ashford is famous for its cheese.", "The mayor was elected last year."], correct_index: 1,
        justification: "It continues the description of the path.",
      },
      {
        difficulty: "normal", category: "gerunds",
        question: "Blank (3)",
        answers: ["completing", "complete", "to complete", "completed"], correct_index: 2,
        justification: "It took (time) + to + verb: took two years to complete.",
      },
      {
        difficulty: "normal", category: "comparatives",
        question: "Blank (4)",
        answers: ["safe", "safest", "more safe", "safer"], correct_index: 3,
        justification: "Make something + comparative (than before): safer.",
      },
    ],
  },
  {
    text: `Dear Ms. Lambert,

Thank you for your order. ___(1)___, the blue sofa you ordered is currently out of stock. We expect to receive new stock in about three weeks. ___(2)___

If you prefer, we can offer you the same sofa in gray, which can be ___(3)___ this week. Please let us know which option you ___(4)___.

Sincerely,
Casa Interiors`,
    questions: [
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (1)",
        answers: ["Unfortunately", "Fortunately", "Hopefully", "Finally"], correct_index: 0,
        justification: "Bad news follows (out of stock): unfortunately.",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (2): which sentence fits best?",
        answers: ["Our store opened in 2005.", "We will deliver it as soon as it arrives.", "Gray is a popular color this year.", "All our products are made in Italy."], correct_index: 1,
        justification: "It continues the information about the delay.",
      },
      {
        difficulty: "hard", category: "passive",
        question: "Blank (3)",
        answers: ["deliver", "delivering", "delivered", "delivers"], correct_index: 2,
        justification: "\"Can be\" + past participle: can be delivered.",
      },
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (4)",
        answers: ["propose", "provide", "pretend", "prefer"], correct_index: 3,
        justification: "Which one you like better: prefer.",
      },
    ],
  },
  {
    text: `Staff Announcement

We are pleased to announce that Ms. Rachel Moore ___(1)___ as our new Head of Customer Service. Ms. Moore has worked in the industry for fifteen years. ___(2)___

She will start on 1 September. Please join us ___(3)___ her at a small reception in the main hall on her first day at 4 P.M. Refreshments will ___(4)___.`,
    questions: [
      {
        difficulty: "hard", category: "passive",
        question: "Blank (1)",
        answers: ["has been appointed", "appointed", "has appointed", "is appointing"], correct_index: 0,
        justification: "Someone chose her: passive, has been appointed.",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (2): which sentence fits best?",
        answers: ["The main hall can hold 200 people.", "Before joining us, she managed a team of forty at Delta Airlines.", "Customer service is open from 8 A.M.", "Please update your contact details."], correct_index: 1,
        justification: "It continues her professional background.",
      },
      {
        difficulty: "normal", category: "gerunds",
        question: "Blank (3)",
        answers: ["welcoming", "welcome", "to welcome", "welcomed"], correct_index: 2,
        justification: "Purpose (in order to): to welcome.",
      },
      {
        difficulty: "hard", category: "passive",
        question: "Blank (4)",
        answers: ["serve", "be serving", "served", "be served"], correct_index: 3,
        justification: "Refreshments are served by someone: will be served.",
      },
    ],
  },
  {
    text: `Tip of the Week: Saving Energy at the Office

Small actions can make a big difference. ___(1)___, switch off your computer screen when you leave your desk for more than ten minutes. ___(2)___

You can also save energy by using the stairs ___(3)___ of the elevator. Last year, our office reduced its electricity use by 12% thanks to simple changes ___(4)___ these.`,
    questions: [
      {
        difficulty: "normal", category: "connectors",
        question: "Blank (1)",
        answers: ["For example", "However", "Otherwise", "In contrast"], correct_index: 0,
        justification: "An example of a small action: for example.",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (2): which sentence fits best?",
        answers: ["Our elevator was installed in 1995.", "At the end of the day, turn it off completely.", "Many employees bring their own lunch.", "The building has six floors."], correct_index: 1,
        justification: "It continues the advice about the computer.",
      },
      {
        difficulty: "hard", category: "connectors",
        question: "Blank (3)",
        answers: ["because", "despite", "instead", "rather"], correct_index: 2,
        justification: "Fixed expression: instead of (= in place of).",
      },
      {
        difficulty: "normal", category: "prepositions",
        question: "Blank (4)",
        answers: ["as", "to", "about", "like"], correct_index: 3,
        justification: "\"Like\" + noun = such as, similar to: changes like these.",
      },
    ],
  },
  {
    text: `To: Mr. Daniel Fisher
From: Brookline Dental Clinic
Subject: Appointment reminder

Dear Mr. Fisher,

This is a reminder that you have an appointment with Dr. Patel on Tuesday, 9 May, ___(1)___ 2:30 P.M. ___(2)___

If you cannot come, please call us at least 24 hours ___(3)___ advance. Otherwise, a fee of $30 may ___(4)___.`,
    questions: [
      {
        difficulty: "normal", category: "prepositions",
        question: "Blank (1)",
        answers: ["at", "on", "in", "by"], correct_index: 0,
        justification: "\"At\" + a precise time.",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (2): which sentence fits best?",
        answers: ["Dr. Patel studied in London.", "Please arrive ten minutes early to complete a form.", "Our clinic has free parking.", "We are hiring a new nurse."], correct_index: 1,
        justification: "Practical instructions for the appointment.",
      },
      {
        difficulty: "normal", category: "prepositions",
        question: "Blank (3)",
        answers: ["on", "at", "in", "by"], correct_index: 2,
        justification: "Fixed expression: in advance.",
      },
      {
        difficulty: "hard", category: "passive",
        question: "Blank (4)",
        answers: ["charge", "charging", "have charged", "be charged"], correct_index: 3,
        justification: "The fee is charged by the clinic: may be charged.",
      },
    ],
  },
  {
    text: `Welcome to Pinecrest Apartments!

We hope you enjoy your new home. Garbage ___(1)___ collected every Monday and Thursday morning. Please put your bags in the containers behind the building. ___(2)___

If anything in your apartment is broken, please ___(3)___ the building manager. Repairs are usually made ___(4)___ 48 hours.`,
    questions: [
      {
        difficulty: "normal", category: "subjectVerb",
        question: "Blank (1)",
        answers: ["is", "are", "were", "be"], correct_index: 0,
        justification: "\"Garbage\" is uncountable (singular), a regular event: is.",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (2): which sentence fits best?",
        answers: ["The building was painted last year.", "Recycling should be placed in the separate blue bins.", "Rent can be paid online.", "Pets are welcome in the garden."], correct_index: 1,
        justification: "It continues the information about garbage.",
      },
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (3)",
        answers: ["contract", "connect", "contact", "construct"], correct_index: 2,
        justification: "Call or write to someone: contact.",
      },
      {
        difficulty: "normal", category: "prepositions",
        question: "Blank (4)",
        answers: ["since", "among", "along", "within"], correct_index: 3,
        justification: "Before the end of a period: within 48 hours.",
      },
    ],
  },
  {
    text: `Product Update

Our popular Zento coffee machine now comes in three new colors. The new models are also ___(1)___ than the previous ones, so they fit easily in small kitchens. ___(2)___

The machines ___(3)___ in our stores from 15 November. Customers who order online before that date ___(4)___ a free bag of coffee.`,
    questions: [
      {
        difficulty: "normal", category: "comparatives",
        question: "Blank (1)",
        answers: ["smaller", "small", "smallest", "more small"], correct_index: 0,
        justification: "\"Than\" -> comparative: smaller.",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (2): which sentence fits best?",
        answers: ["Our stores are closed on public holidays.", "However, they make just as much coffee.", "Coffee prices have risen worldwide.", "The company was founded in Milan."], correct_index: 1,
        justification: "Smaller, BUT the same performance: a logical contrast.",
      },
      {
        difficulty: "normal", category: "verbTenses",
        question: "Blank (3)",
        answers: ["were", "have been", "will be available", "was available"], correct_index: 2,
        justification: "From 15 November (future): will be available.",
      },
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (4)",
        answers: ["accept", "achieve", "obtain to", "receive"], correct_index: 3,
        justification: "Be given something: receive.",
      },
    ],
  },
  {
    text: `Dear Team,

As you know, the annual company picnic ___(1)___ next Saturday at Lakeside Park. ___(2)___ Lunch ___(3)___ provided, but please bring your own drinks.

There will be games for children and a volleyball match in the afternoon. Family members are ___(4)___ to join.

See you there!
Laura`,
    questions: [
      {
        difficulty: "normal", category: "verbTenses",
        question: "Blank (1)",
        answers: ["will take place", "took place", "has taken place", "was taking place"], correct_index: 0,
        justification: "Next Saturday: will take place.",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (2): which sentence fits best?",
        answers: ["Our sales grew by 5% last year.", "The park is a short walk from Elm Street station.", "The new office opens in May.", "Please submit your report on time."], correct_index: 1,
        justification: "It gives practical information about the place.",
      },
      {
        difficulty: "normal", category: "verbTenses",
        question: "Blank (3)",
        answers: ["was", "had been", "will be", "were"], correct_index: 2,
        justification: "The picnic is next Saturday (the future): will be provided.",
      },
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (4)",
        answers: ["welcoming", "welcomes", "welcomed by", "welcome"], correct_index: 3,
        justification: "Fixed expression: you are welcome to join.",
      },
    ],
  },
  {
    text: `Notice: Water Supply Interruption

Please be advised that the water supply to the building will be ___(1)___ on Wednesday from 9 A.M. to 1 P.M. ___(2)___

During this time, the restrooms on all floors will be closed. We recommend ___(3)___ some bottled water with you. We apologize for any inconvenience this may ___(4)___.

Building Management`,
    questions: [
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (1)",
        answers: ["turned off", "turned up", "turned over", "turned in"], correct_index: 0,
        justification: "Stopped: turned off.",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (2): which sentence fits best?",
        answers: ["The building has a new security guard.", "This is necessary to repair a broken pipe.", "The elevator was inspected last month.", "Please use the recycling bins."], correct_index: 1,
        justification: "It explains the reason for the interruption.",
      },
      {
        difficulty: "normal", category: "gerunds",
        question: "Blank (3)",
        answers: ["bring", "to bring", "bringing", "brought"], correct_index: 2,
        justification: "\"Recommend\" + -ing: recommend bringing.",
      },
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (4)",
        answers: ["make up", "create up", "result", "cause"], correct_index: 3,
        justification: "Fixed formula: any inconvenience this may cause.",
      },
    ],
  },
  {
    text: `Job Opening: Delivery Driver

Fresh Basket, a local grocery delivery service, is looking for a part-time driver. The ___(1)___ candidate will have a clean driving record and good knowledge of the city. ___(2)___

Working hours are flexible, ___(3)___ drivers must be available on weekends. To apply, send your résumé to jobs@freshbasket.com ___(4)___ 30 June.`,
    questions: [
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (1)",
        answers: ["ideal", "idle", "identical", "idealistic"], correct_index: 0,
        justification: "The perfect candidate: ideal.",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (2): which sentence fits best?",
        answers: ["Our vegetables come from local farms.", "Experience in customer service is also an advantage.", "The city has a new bus line.", "Our store is open every day."], correct_index: 1,
        justification: "It continues the profile of the candidate.",
      },
      {
        difficulty: "normal", category: "connectors",
        question: "Blank (3)",
        answers: ["so", "or", "but", "because"], correct_index: 2,
        justification: "A contrast (flexible / must be available): but.",
      },
      {
        difficulty: "normal", category: "prepositions",
        question: "Blank (4)",
        answers: ["since", "on", "for", "by"], correct_index: 3,
        justification: "A deadline: by 30 June.",
      },
    ],
  },
  {
    text: `To: All Department Heads
From: Finance Office
Subject: Budget requests

Budget requests for next year must be submitted ___(1)___ the end of this month. Please use the new form, ___(2)___ can be downloaded from the intranet. ___(3)___

Requests that are not complete ___(4)___ to the department for correction.`,
    questions: [
      {
        difficulty: "normal", category: "prepositions",
        question: "Blank (1)",
        answers: ["by", "since", "for", "during"], correct_index: 0,
        justification: "A deadline: by the end of this month.",
      },
      {
        difficulty: "normal", category: "pronouns",
        question: "Blank (2)",
        answers: ["who", "which", "what", "whose"], correct_index: 1,
        justification: "A thing (the form), after a comma: which.",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (3): which sentence fits best?",
        answers: ["Our cafeteria serves lunch from noon.", "The company was founded in 1974.", "The old form will no longer be accepted.", "Next year's holiday calendar is attached."], correct_index: 2,
        justification: "It continues the information about the forms.",
      },
      {
        difficulty: "hard", category: "passive",
        question: "Blank (4)",
        answers: ["will return", "returning", "have returned", "will be returned"], correct_index: 3,
        justification: "Requests are sent back by the office: passive, will be returned.",
      },
    ],
  },
  {
    text: `Grand Opening!

Sunny Side Café ___(1)___ its doors on Saturday, 5 April, on Market Street. To celebrate, all drinks will be half price on opening day. ___(2)___

Our menu includes freshly ___(3)___ bread, homemade cakes, and a wide range of teas. We look forward to ___(4)___ you!`,
    questions: [
      {
        difficulty: "normal", category: "verbTenses",
        question: "Blank (1)",
        answers: ["will open", "opened", "has opened", "was opening"], correct_index: 0,
        justification: "A future date: will open.",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (2): which sentence fits best?",
        answers: ["Market Street is closed to cars.", "The first fifty customers will also receive a free muffin.", "Coffee was first grown in Ethiopia.", "We are closed on Mondays."], correct_index: 1,
        justification: "It adds another opening-day offer.",
      },
      {
        difficulty: "normal", category: "wordForms",
        question: "Blank (3)",
        answers: ["bake", "baking", "baked", "baker"], correct_index: 2,
        justification: "Bread that someone has baked: baked (past participle used as adjective).",
      },
      {
        difficulty: "normal", category: "gerunds",
        question: "Blank (4)",
        answers: ["see", "to see", "seen", "seeing"], correct_index: 3,
        justification: "\"Look forward to\" + -ing.",
      },
    ],
  },
  {
    text: `Dear Mr. Haddad,

Thank you for attending our workshop on digital marketing last week. We hope you found it ___(1)___. ___(2)___

We would be grateful if you could take five minutes ___(3)___ our short online survey. Your answers will help us ___(4)___ our future workshops.

Best regards,
Elena Ruiz, Training Coordinator`,
    questions: [
      {
        difficulty: "normal", category: "wordForms",
        question: "Blank (1)",
        answers: ["useful", "use", "usefully", "usefulness"], correct_index: 0,
        justification: "Find something + adjective: found it useful.",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (2): which sentence fits best?",
        answers: ["Our office will move next year.", "The slides from the presentation are attached to this e-mail.", "Digital marketing is a new field.", "Please pay your invoice by Friday."], correct_index: 1,
        justification: "It follows naturally after the workshop.",
      },
      {
        difficulty: "normal", category: "gerunds",
        question: "Blank (3)",
        answers: ["complete", "completing", "to complete", "completed"], correct_index: 2,
        justification: "Take (time) + to + verb: take five minutes to complete.",
      },
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (4)",
        answers: ["approve", "prove", "remove", "improve"], correct_index: 3,
        justification: "Make better: improve.",
      },
    ],
  },
  {
    text: `Library Book Sale

The Westfield Public Library will hold ___(1)___ annual book sale on 14 and 15 June. More than 5,000 books, DVDs, and magazines will be for sale. ___(2)___

All money ___(3)___ from the sale will be used to buy new books for the children's section. Volunteers are still needed to help sort the books, so please contact us if you are ___(4)___.`,
    questions: [
      {
        difficulty: "normal", category: "pronouns",
        question: "Blank (1)",
        answers: ["its", "it's", "their", "his"], correct_index: 0,
        justification: "The library (a thing): its. (\"It's\" = it is.)",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (2): which sentence fits best?",
        answers: ["The library was closed last winter.", "Most items will cost less than $2.", "Children love reading comics.", "Parking is not allowed on Main Street."], correct_index: 1,
        justification: "It continues the information about the items for sale.",
      },
      {
        difficulty: "hard", category: "wordForms",
        question: "Blank (3)",
        answers: ["raise", "raising", "raised", "raises"], correct_index: 2,
        justification: "Money that is raised (collected): past participle, raised.",
      },
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (4)",
        answers: ["valuable", "capable", "reliable", "available"], correct_index: 3,
        justification: "Free to help: available.",
      },
    ],
  },
  {
    text: `To: Customer Service
From: Karen Liu
Subject: Damaged item

Hello,

I received my order yesterday, but the lamp was ___(1)___ during delivery. The glass shade is broken. ___(2)___

Could you please send me a replacement ___(3)___ possible? I would also like to know ___(4)___ I need to return the broken lamp.

Thank you,
Karen Liu`,
    questions: [
      {
        difficulty: "hard", category: "passive",
        question: "Blank (1)",
        answers: ["damaged", "damage", "damaging", "damages"], correct_index: 0,
        justification: "\"Was\" + past participle: was damaged.",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (2): which sentence fits best?",
        answers: ["I bought a new sofa last month.", "I have attached a photo of the damage.", "Your website is very easy to use.", "The weather has been very cold."], correct_index: 1,
        justification: "It gives proof of the problem she describes.",
      },
      {
        difficulty: "normal", category: "connectors",
        question: "Blank (3)",
        answers: ["as long as", "as far as", "as soon as", "as well as"], correct_index: 2,
        justification: "Fixed expression: as soon as possible.",
      },
      {
        difficulty: "hard", category: "connectors",
        question: "Blank (4)",
        answers: ["weather", "unless", "although", "whether"], correct_index: 3,
        justification: "\"Know whether\" = know if.",
      },
    ],
  },
  {
    text: `Travel Policy Update

From 1 January, all business trips must be ___(1)___ by your manager before you book. ___(2)___

Employees ___(3)___ travel by train for trips under 500 kilometers, as it is cheaper and better for the environment. Receipts must be submitted ___(4)___ two weeks of your return.`,
    questions: [
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (1)",
        answers: ["approved", "improved", "proved", "removed"], correct_index: 0,
        justification: "Accepted officially: approved.",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (2): which sentence fits best?",
        answers: ["Our office is near the train station.", "Requests should be sent at least ten days in advance.", "Many employees enjoy traveling.", "The company was founded in 1990."], correct_index: 1,
        justification: "It continues the booking rules.",
      },
      {
        difficulty: "hard", category: "verbTenses",
        question: "Blank (3)",
        answers: ["had", "were", "should", "have been"], correct_index: 2,
        justification: "A rule / recommendation: should + verb.",
      },
      {
        difficulty: "normal", category: "prepositions",
        question: "Blank (4)",
        answers: ["since", "among", "until", "within"], correct_index: 3,
        justification: "Before the end of a period: within two weeks.",
      },
    ],
  },
  {
    text: `Dear Members,

We are excited to announce that our new swimming pool is now open. The pool is ___(1)___ than the old one and has six lanes. ___(2)___

Swimming lessons for children ___(3)___ every Saturday morning. Please book your place at the front desk, ___(4)___ classes fill up quickly.

Oakwood Sports Club`,
    questions: [
      {
        difficulty: "normal", category: "comparatives",
        question: "Blank (1)",
        answers: ["larger", "large", "largest", "more large"], correct_index: 0,
        justification: "\"Than\" -> comparative: larger.",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (2): which sentence fits best?",
        answers: ["Our tennis courts need repairs.", "It is also heated all year round.", "The club was founded in 1952.", "Membership fees are paid in January."], correct_index: 1,
        justification: "It adds another feature of the new pool.",
      },
      {
        difficulty: "hard", category: "passive",
        question: "Blank (3)",
        answers: ["offer", "offering", "are offered", "have offered"], correct_index: 2,
        justification: "Lessons are offered by the club: passive, are offered.",
      },
      {
        difficulty: "normal", category: "connectors",
        question: "Blank (4)",
        answers: ["although", "unless", "so that", "because"], correct_index: 3,
        justification: "A reason (classes fill up quickly): because.",
      },
    ],
  },
  {
    text: `Seminar Announcement

The Chamber of Commerce invites local business owners to a free seminar on ___(1)___ a small business. The seminar will take place on 18 March at the Civic Center. ___(2)___

Topics will include finding customers, managing money, and hiring staff. Space is limited, ___(3)___ early registration is ___(4)___ recommended.`,
    questions: [
      {
        difficulty: "normal", category: "gerunds",
        question: "Blank (1)",
        answers: ["growing", "grow", "to grow", "grown"], correct_index: 0,
        justification: "After a preposition (on): -ing, growing.",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (2): which sentence fits best?",
        answers: ["The Civic Center was renovated in 2018.", "It will be led by three successful local entrepreneurs.", "Many shops close on Sundays.", "The city has a population of 80,000."], correct_index: 1,
        justification: "It gives information about the seminar itself.",
      },
      {
        difficulty: "normal", category: "connectors",
        question: "Blank (3)",
        answers: ["but", "or", "so", "because"], correct_index: 2,
        justification: "A consequence (limited space -> register early): so.",
      },
      {
        difficulty: "normal", category: "wordForms",
        question: "Blank (4)",
        answers: ["strong", "strength", "strengthen", "strongly"], correct_index: 3,
        justification: "It describes a verb (is recommended): an adverb, strongly.",
      },
    ],
  },
  {
    text: `To: Mr. Alan Brooks
From: Metro Bank
Subject: Your new card

Dear Mr. Brooks,

Your new bank card ___(1)___ to your home address last week. ___(2)___

For your security, the card must be activated ___(3)___ it can be used. You can do this ___(4)___ at any of our cash machines or by calling our help line.`,
    questions: [
      {
        difficulty: "hard", category: "passive",
        question: "Blank (1)",
        answers: ["was sent", "sent", "has sent", "sends"], correct_index: 0,
        justification: "Last week + the card receives the action: was sent.",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (2): which sentence fits best?",
        answers: ["Our bank was founded in 1890.", "If you have not received it, please contact us immediately.", "Interest rates may change next year.", "Our branches are open on Saturdays."], correct_index: 1,
        justification: "It follows logically after \"sent last week\".",
      },
      {
        difficulty: "normal", category: "connectors",
        question: "Blank (3)",
        answers: ["after", "unless", "before", "since"], correct_index: 2,
        justification: "Activation comes first: before it can be used.",
      },
      {
        difficulty: "normal", category: "wordForms",
        question: "Blank (4)",
        answers: ["easy", "ease", "easier", "easily"], correct_index: 3,
        justification: "It describes a verb (do): an adverb, easily.",
      },
    ],
  },
  {
    text: `Community Garden Project

The city has ___(1)___ approved a plan to turn an empty lot on Pine Street into a community garden. Residents will be able to rent small plots to grow vegetables and flowers. ___(2)___

The garden is expected ___(3)___ next spring. Anyone ___(4)___ in renting a plot should contact the Parks Department.`,
    questions: [
      {
        difficulty: "normal", category: "wordForms",
        question: "Blank (1)",
        answers: ["recently", "recent", "recentness", "recency"], correct_index: 0,
        justification: "Between \"has\" and the participle, describing the verb: an adverb, recently.",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (2): which sentence fits best?",
        answers: ["Pine Street has many restaurants.", "Tools and water will be provided free of charge.", "The city council meets every month.", "Vegetables are expensive in winter."], correct_index: 1,
        justification: "It continues the description of the garden.",
      },
      {
        difficulty: "hard", category: "gerunds",
        question: "Blank (3)",
        answers: ["opening", "open", "to open", "opened"], correct_index: 2,
        justification: "\"Be expected\" + to + verb: expected to open.",
      },
      {
        difficulty: "normal", category: "wordForms",
        question: "Blank (4)",
        answers: ["interest", "interesting", "interests", "interested"], correct_index: 3,
        justification: "A person who wants to: interested in.",
      },
    ],
  },
  {
    text: `Dear Valued Customer,

Thank you for shopping with Brightmart. Our records show that you have ___(1)___ 500 reward points. You can use these points to get a $10 discount on your next purchase. ___(2)___

Points ___(3)___ after twelve months, so be sure to use them soon!`,
    questions: [
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (1)",
        answers: ["collected", "corrected", "connected", "conducted"], correct_index: 0,
        justification: "Gathered over time: collected points.",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (2): which sentence fits best?",
        answers: ["Our store opened in 2001.", "Simply show your membership card at the checkout.", "We sell fresh fruit every day.", "Our employees wear blue uniforms."], correct_index: 1,
        justification: "It explains how to use the points.",
      },
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (3)",
        answers: ["inspire", "require", "expire", "admire"], correct_index: 2,
        justification: "Stop being valid: expire.",
      },
    ],
  },
  {
    text: `Notice

Due to the national holiday on Monday, garbage will ___(1)___ on Tuesday this week. ___(2)___

Please make sure your bins are ___(3)___ the street by 7 A.M. Thank you for your cooperation.`,
    questions: [
      {
        difficulty: "hard", category: "passive",
        question: "Blank (1)",
        answers: ["collect", "collecting", "have collected", "be collected"], correct_index: 3,
        justification: "Garbage is collected by workers: will be collected.",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (2): which sentence fits best?",
        answers: ["All other collection days will stay the same.", "The holiday celebrates the end of the war.", "New bins can be bought online.", "The city has 200,000 residents."], correct_index: 0,
        justification: "It continues the schedule information.",
      },
      {
        difficulty: "normal", category: "prepositions",
        question: "Blank (3)",
        answers: ["among", "next to", "between", "within"], correct_index: 1,
        justification: "Beside the street: next to.",
      },
    ],
  },
  {
    text: `To: All Staff
From: Human Resources
Subject: Flu vaccinations

Free flu vaccinations will be available in the medical room on 10 and 11 November. No ___(1)___ is required, but you must sign up in advance. ___(2)___

Employees who ___(3)___ a vaccination should register on the HR page of the intranet. Last year, more than 200 employees ___(4)___ part.`,
    questions: [
      {
        difficulty: "normal", category: "wordForms",
        question: "Blank (1)",
        answers: ["paid", "paying", "payment", "payable"], correct_index: 2,
        justification: "After \"no\", subject of \"is required\": a noun, payment.",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (2): which sentence fits best?",
        answers: ["The medical room was painted last summer.", "Our company has 1,500 employees.", "Flu is common in winter in many countries.", "Each appointment will take about ten minutes."], correct_index: 3,
        justification: "It gives a practical detail about the vaccination.",
      },
      {
        difficulty: "hard", category: "subjectVerb",
        question: "Blank (3)",
        answers: ["want", "wants", "wanting", "has wanted"], correct_index: 0,
        justification: "\"Who\" refers to \"employees\" (plural): who want.",
      },
      {
        difficulty: "normal", category: "verbTenses",
        question: "Blank (4)",
        answers: ["take", "took", "have taken", "will take"], correct_index: 1,
        justification: "Last year: past simple, took (part).",
      },
    ],
  },
];
