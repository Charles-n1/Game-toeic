// More RC 8 texts (text completion): a short text with blanks ___(1)___, and one question per blank.
// Same fields as createQuestion (questions.js), without "section" and "text" (added there).

export const RC8_TEXTS_2 = [
  {
    text: `To: Conference participants
From: TechForward Events
Subject: Registration details

Thank you for registering for TechForward 2025. Your badge will be ready for ___(1)___ at the main entrance from 8 A.M. ___(2)___

The opening speech begins at 9 A.M., ___(3)___ please arrive early. Lunch and coffee breaks are ___(4)___ in the registration fee.`,
    questions: [
      {
        difficulty: "normal", category: "wordForms",
        question: "Blank (1)",
        answers: ["collection", "collect", "collective", "collected"], correct_index: 0,
        justification: "After a preposition (for): a noun, collection.",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (2): which sentence fits best?",
        answers: ["Our company makes software for hospitals.", "Please bring a photo ID to pick it up.", "The weather in May is usually mild.", "Lunch was delicious last year."], correct_index: 1,
        justification: "It continues the information about the badge.",
      },
      {
        difficulty: "normal", category: "connectors",
        question: "Blank (3)",
        answers: ["but", "because", "so", "although"], correct_index: 2,
        justification: "A consequence (it begins at 9 -> arrive early): so.",
      },
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (4)",
        answers: ["involved", "inclined", "invited", "included"], correct_index: 3,
        justification: "Part of the price: included in.",
      },
    ],
  },
  {
    text: `Notice to Customers

Our store on Baker Street ___(1)___ for renovation from 2 to 16 August. ___(2)___

During this time, customers can shop at our branch on Hill Road, which is only a five-minute ___(3)___ away. We apologize for any inconvenience and thank you for your ___(4)___ support.`,
    questions: [
      {
        difficulty: "normal", category: "verbTenses",
        question: "Blank (1)",
        answers: ["will close", "closed", "has closed", "was closing"], correct_index: 0,
        justification: "Dates in the future: will close.",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (2): which sentence fits best?",
        answers: ["Baker Street was named after a famous writer.", "When we reopen, the store will have a larger fresh food section.", "We sell more bread than any other shop.", "Our employees wear green uniforms."], correct_index: 1,
        justification: "It explains the result of the renovation.",
      },
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (3)",
        answers: ["travel", "voyage", "walk", "tour"], correct_index: 2,
        justification: "Fixed expression: a five-minute walk away.",
      },
      {
        difficulty: "hard", category: "wordForms",
        question: "Blank (4)",
        answers: ["continue", "continuation", "continuously", "continued"], correct_index: 3,
        justification: "Before a noun (support): an adjective, continued.",
      },
    ],
  },
  {
    text: `Restaurant Review: The Olive Tree

The Olive Tree, a small Greek restaurant on Canal Street, has become very popular ___(1)___ it opened last spring. The menu is short, but every dish is ___(2)___ with fresh ingredients. ___(3)___

Prices are ___(4)___, and the staff are friendly and helpful.`,
    questions: [
      {
        difficulty: "hard", category: "connectors",
        question: "Blank (1)",
        answers: ["since", "for", "during", "while"], correct_index: 0,
        justification: "\"Since\" + a starting point (it opened last spring), with the present perfect.",
      },
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (2)",
        answers: ["repaired", "prepared", "compared", "declared"], correct_index: 1,
        justification: "Cooked: prepared.",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (3): which sentence fits best?",
        answers: ["Canal Street was repaved in 2010.", "Greece has many islands.", "The grilled fish is especially good.", "The restaurant is now closed for good."], correct_index: 2,
        justification: "It continues the review of the food.",
      },
      {
        difficulty: "normal", category: "wordForms",
        question: "Blank (4)",
        answers: ["reason", "reasonably", "reasoning", "reasonable"], correct_index: 3,
        justification: "After \"are\": an adjective, reasonable (= not too expensive).",
      },
    ],
  },
  {
    text: `To: New employees
From: Training Department
Subject: Orientation week

Welcome to Calder Systems! Your orientation week ___(1)___ on Monday at 9 A.M. in Room 204. ___(2)___

On the first day, you will meet your team and receive your laptop. ___(3)___ you have any questions before Monday, please do not ___(4)___ to contact us.`,
    questions: [
      {
        difficulty: "normal", category: "verbTenses",
        question: "Blank (1)",
        answers: ["will begin", "began", "has begun", "was beginning"], correct_index: 0,
        justification: "Next Monday (the future): will begin.",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (2): which sentence fits best?",
        answers: ["Our company was founded in Dublin.", "A detailed schedule is attached to this e-mail.", "Laptops are expensive these days.", "Room 204 has large windows."], correct_index: 1,
        justification: "It gives more practical information about the week.",
      },
      {
        difficulty: "normal", category: "connectors",
        question: "Blank (3)",
        answers: ["Unless", "Although", "If", "Because"], correct_index: 2,
        justification: "A condition: if.",
      },
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (4)",
        answers: ["hesitation", "delay", "refuse", "hesitate"], correct_index: 3,
        justification: "Fixed formula: please do not hesitate to contact us.",
      },
    ],
  },
  {
    text: `Important Safety Notice

Kidsafe Toys has ___(1)___ recalled its Model 12 toy car. Small parts can come off the wheels ___(2)___ the car is used roughly. ___(3)___

Customers who bought this toy should stop using it and return it to any store for a full ___(4)___.`,
    questions: [
      {
        difficulty: "hard", category: "wordForms",
        question: "Blank (1)",
        answers: ["voluntarily", "voluntary", "volunteer", "volunteering"], correct_index: 0,
        justification: "Between \"has\" and the participle, describing the verb: an adverb, voluntarily.",
      },
      {
        difficulty: "normal", category: "connectors",
        question: "Blank (2)",
        answers: ["unless", "if", "so", "but"], correct_index: 1,
        justification: "A condition: if.",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (3): which sentence fits best?",
        answers: ["The company also makes dolls.", "Toy cars were invented in the 1900s.", "No injuries have been reported so far.", "Our stores open at 9 A.M."], correct_index: 2,
        justification: "It continues the safety information.",
      },
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (4)",
        answers: ["return", "receipt", "reward", "refund"], correct_index: 3,
        justification: "Money given back: a full refund.",
      },
    ],
  },
  {
    text: `Apartment for Rent

A ___(1)___ furnished two-bedroom apartment is available in the city center from 1 September. The owner ___(2)___ the apartment last year, so it has a modern kitchen and bathroom. ___(3)___

Rent is €1,200 per month, and the ___(4)___ is one month's rent.`,
    questions: [
      {
        difficulty: "normal", category: "wordForms",
        question: "Blank (1)",
        answers: ["fully", "full", "fullness", "fill"], correct_index: 0,
        justification: "It describes an adjective (furnished): an adverb, fully.",
      },
      {
        difficulty: "normal", category: "verbTenses",
        question: "Blank (2)",
        answers: ["renovates", "renovated", "has renovated", "will renovate"], correct_index: 1,
        justification: "Last year: past simple, renovated.",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (3): which sentence fits best?",
        answers: ["The city was founded in the 12th century.", "Many students live in dormitories.", "It is also close to two bus stops and a supermarket.", "Kitchens are the most expensive room to build."], correct_index: 2,
        justification: "It continues the description of the apartment.",
      },
      {
        difficulty: "hard", category: "vocabulary",
        question: "Blank (4)",
        answers: ["deposition", "depot", "deport", "deposit"], correct_index: 3,
        justification: "Money paid at the start and given back later: a deposit.",
      },
    ],
  },
  {
    text: `Dear Passenger,

Your flight LX 204 to Geneva has been delayed ___(1)___ bad weather. The new departure time is 6:40 P.M. ___(2)___

We ___(3)___ for the delay and thank you for your patience. Please check the departure screens ___(4)___ your gate number.`,
    questions: [
      {
        difficulty: "hard", category: "connectors",
        question: "Blank (1)",
        answers: ["due to", "because", "although", "so"], correct_index: 0,
        justification: "Cause + a noun (bad weather): due to.",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (2): which sentence fits best?",
        answers: ["Geneva has a population of about 200,000.", "Meal vouchers can be collected at the information desk.", "Our airline has won several awards.", "Weather forecasts are not always correct."], correct_index: 1,
        justification: "It offers practical help to waiting passengers.",
      },
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (3)",
        answers: ["apology", "excuse", "apologize", "regret"], correct_index: 2,
        justification: "\"Apologize for\" = say sorry. (\"Regret\" doesn't take \"for\".)",
      },
      {
        difficulty: "normal", category: "prepositions",
        question: "Blank (4)",
        answers: ["of", "at", "in", "for"], correct_index: 3,
        justification: "Check (look) for information: check the screens for your gate number.",
      },
    ],
  },
  {
    text: `To: All staff
From: Office Manager
Subject: Office supplies

From now on, office supplies can be ordered ___(1)___ through our new online system. ___(2)___

Orders placed before noon will be delivered the same day; ___(3)___, orders placed after noon will arrive the next morning. Please do not ___(4)___ more than you need.`,
    questions: [
      {
        difficulty: "normal", category: "wordForms",
        question: "Blank (1)",
        answers: ["directly", "direct", "direction", "director"], correct_index: 0,
        justification: "It describes a verb (be ordered): an adverb, directly.",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (2): which sentence fits best?",
        answers: ["Our office has three printers.", "Simply log in with your usual password.", "Paper is made from wood.", "The cafeteria closes at 3 P.M."], correct_index: 1,
        justification: "It explains how to use the new system.",
      },
      {
        difficulty: "hard", category: "connectors",
        question: "Blank (3)",
        answers: ["otherwise", "therefore", "however", "moreover"], correct_index: 2,
        justification: "A contrast (same day / next morning): however.",
      },
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (4)",
        answers: ["offer", "owe", "obey", "order"], correct_index: 3,
        justification: "Ask for supplies: order.",
      },
    ],
  },
  {
    text: `Local Bakery Wins National Prize

Sweet Crumb Bakery in Dunmore ___(1)___ the National Bread Award last Saturday. The bakery's sourdough bread was chosen from more than 300 ___(2)___. ___(3)___

Owner Lisa Grant says she is very ___(4)___ to her whole team.`,
    questions: [
      {
        difficulty: "normal", category: "verbTenses",
        question: "Blank (1)",
        answers: ["won", "wins", "has won", "will win"], correct_index: 0,
        justification: "Last Saturday: past simple, won.",
      },
      {
        difficulty: "hard", category: "vocabulary",
        question: "Blank (2)",
        answers: ["entrances", "entries", "entertainments", "enterprises"], correct_index: 1,
        justification: "Things submitted to a competition: entries.",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (3): which sentence fits best?",
        answers: ["Bread prices have risen this year.", "Dunmore has a large train station.", "She started the bakery in her garage twelve years ago.", "The competition was canceled."], correct_index: 2,
        justification: "It introduces the owner, who is mentioned next.",
      },
      {
        difficulty: "normal", category: "wordForms",
        question: "Blank (4)",
        answers: ["grate", "gratefully", "gratitude", "grateful"], correct_index: 3,
        justification: "After \"is very\": an adjective, grateful.",
      },
    ],
  },
  {
    text: `Become a Member!

As a member of the City Art Museum, you can visit all our exhibitions for free. ___(1)___, you will receive a 10% discount in the museum shop. ___(2)___

Members also enjoy ___(3)___ invitations to special evening events. To join, simply ___(4)___ the form at the ticket desk.`,
    questions: [
      {
        difficulty: "normal", category: "connectors",
        question: "Blank (1)",
        answers: ["In addition", "However", "Instead", "Otherwise"], correct_index: 0,
        justification: "Another advantage is added: in addition.",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (2): which sentence fits best?",
        answers: ["The museum was designed by a famous architect.", "Membership costs only €40 per year.", "Paintings must be kept at a stable temperature.", "The building has four floors."], correct_index: 1,
        justification: "It continues the information about membership.",
      },
      {
        difficulty: "normal", category: "gerunds",
        question: "Blank (3)",
        answers: ["receive", "to receive", "receiving", "received"], correct_index: 2,
        justification: "\"Enjoy\" + -ing: enjoy receiving.",
      },
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (4)",
        answers: ["fill up", "fall in", "feel in", "fill in"], correct_index: 3,
        justification: "Complete a form: fill in.",
      },
    ],
  },
  {
    text: `To: Mark Evans
From: Julia Santos
Subject: Project update

Hi Mark,

The design team ___(1)___ the new home page to the client yesterday, and the client was very ___(2)___ with it. ___(3)___ We are now ___(4)___ on schedule to launch the site on 1 June.

Julia`,
    questions: [
      {
        difficulty: "normal", category: "verbTenses",
        question: "Blank (1)",
        answers: ["presented", "presents", "has presented", "will present"], correct_index: 0,
        justification: "Yesterday: past simple, presented.",
      },
      {
        difficulty: "normal", category: "wordForms",
        question: "Blank (2)",
        answers: ["please", "pleased", "pleasant", "pleasure"], correct_index: 1,
        justification: "A feeling of a person (the client): pleased with.",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (3): which sentence fits best?",
        answers: ["Our office is very quiet today.", "Websites are important for every business.", "They asked for only two small changes.", "I will be on vacation in December."], correct_index: 2,
        justification: "It continues the client's reaction.",
      },
      {
        difficulty: "hard", category: "vocabulary",
        question: "Blank (4)",
        answers: ["yet", "ever", "already", "still"], correct_index: 3,
        justification: "Continuing as before: still on schedule.",
      },
    ],
  },
  {
    text: `New Self-Checkout Machines

The library has installed three self-checkout machines near the main entrance. ___(1)___ these machines, you can borrow books without waiting in line. The machines are very easy to use, and staff are ___(2)___ to help if needed. ___(3)___

We hope this new service makes your visit more ___(4)___.`,
    questions: [
      {
        difficulty: "hard", category: "connectors",
        question: "Blank (1)",
        answers: ["Thanks to", "Because", "Although", "Despite"], correct_index: 0,
        justification: "A positive cause + a noun: thanks to.",
      },
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (2)",
        answers: ["valuable", "available", "avoidable", "variable"], correct_index: 1,
        justification: "Ready and free to help: available.",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (3): which sentence fits best?",
        answers: ["The library was built in 1895.", "Books are heavy to carry.", "Simply scan your library card and then each book.", "We are closed on Sundays."], correct_index: 2,
        justification: "It explains how to use the machines.",
      },
      {
        difficulty: "normal", category: "wordForms",
        question: "Blank (4)",
        answers: ["convenience", "conveniently", "convene", "convenient"], correct_index: 3,
        justification: "Make something + adjective: more convenient.",
      },
    ],
  },
  {
    text: `Online Banking Maintenance

Our online banking service ___(1)___ unavailable on Sunday, 3 March, from 1 A.M. to 5 A.M. ___(2)___

This work is necessary ___(3)___ we can improve the security of our system. We ___(4)___ for any inconvenience.`,
    questions: [
      {
        difficulty: "normal", category: "verbTenses",
        question: "Blank (1)",
        answers: ["will be", "was", "has been", "is being"], correct_index: 0,
        justification: "A future date: will be.",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (2): which sentence fits best?",
        answers: ["Our bank has branches in 40 countries.", "During this time, you can still use our cash machines.", "Interest rates are set by the central bank.", "Many people prefer to pay by card."], correct_index: 1,
        justification: "It tells customers what they can still do during the maintenance.",
      },
      {
        difficulty: "normal", category: "connectors",
        question: "Blank (3)",
        answers: ["because of", "although", "so that", "unless"], correct_index: 2,
        justification: "A goal + subject + verb: so that.",
      },
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (4)",
        answers: ["regret", "excuse", "sorry", "apologize"], correct_index: 3,
        justification: "Say sorry: apologize for.",
      },
    ],
  },
  {
    text: `Cafeteria News

Starting next week, the cafeteria will offer a ___(1)___ vegetarian dish every day. The menu for the week will be posted ___(2)___ the notice board every Monday morning. ___(3)___

We welcome your ___(4)___ on our new menu.`,
    questions: [
      {
        difficulty: "normal", category: "wordForms",
        question: "Blank (1)",
        answers: ["different", "differ", "difference", "differently"], correct_index: 0,
        justification: "Before a noun (dish): an adjective, different.",
      },
      {
        difficulty: "normal", category: "prepositions",
        question: "Blank (2)",
        answers: ["in", "on", "at", "of"], correct_index: 1,
        justification: "On a surface: on the notice board.",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (3): which sentence fits best?",
        answers: ["Vegetables are rich in vitamins.", "The cafeteria was built in 2001.", "It will also be available on the intranet.", "The kitchen staff start work at 6 A.M."], correct_index: 2,
        justification: "It continues the information about where to find the menu.",
      },
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (4)",
        answers: ["backup", "setback", "comeback", "feedback"], correct_index: 3,
        justification: "Opinions and comments: feedback.",
      },
    ],
  },
  {
    text: `Dear Mr. Ito,

I am afraid I need to change the time of our meeting on Thursday. ___(1)___ an urgent problem at our factory, I will be away until Thursday afternoon. ___(2)___

Would 4 P.M. be convenient for you? If not, I ___(3)___ happy to meet on Friday morning instead. I am sorry for the ___(4)___.

Best regards,
Clara Nunes`,
    questions: [
      {
        difficulty: "hard", category: "connectors",
        question: "Blank (1)",
        answers: ["Because of", "Because", "Although", "Despite"], correct_index: 0,
        justification: "Cause + a noun (an urgent problem): because of.",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (2): which sentence fits best?",
        answers: ["Our factory produces car parts.", "I should be back in the office by 2 P.M.", "Thursday is usually a busy day.", "I enjoyed our last lunch together."], correct_index: 1,
        justification: "It explains why 4 P.M. is possible.",
      },
      {
        difficulty: "normal", category: "verbTenses",
        question: "Blank (3)",
        answers: ["was", "had been", "will be", "have been"], correct_index: 2,
        justification: "A future possibility: will be.",
      },
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (4)",
        answers: ["charge", "chance", "choice", "change"], correct_index: 3,
        justification: "The new time = a change.",
      },
    ],
  },
  {
    text: `New Train Line Opens

A new train line between Northgate and the airport ___(1)___ by the mayor on Monday. Trains run every ten minutes, and the trip takes only 18 minutes. ___(2)___

The line is expected to be ___(3)___ popular with business travelers. Tickets can be bought at stations or ___(4)___.`,
    questions: [
      {
        difficulty: "hard", category: "passive",
        question: "Blank (1)",
        answers: ["was opened", "opened", "has opened", "opens"], correct_index: 0,
        justification: "\"By the mayor\" + Monday: past passive, was opened.",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (2): which sentence fits best?",
        answers: ["The mayor was born in Northgate.", "Before, the same trip took almost an hour by bus.", "Airports are often far from city centers.", "Trains were invented in England."], correct_index: 1,
        justification: "It shows the advantage of the new line.",
      },
      {
        difficulty: "normal", category: "wordForms",
        question: "Blank (3)",
        answers: ["especial", "specialty", "especially", "special"], correct_index: 2,
        justification: "It describes an adjective (popular): an adverb, especially.",
      },
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (4)",
        answers: ["inline", "offline", "outline", "online"], correct_index: 3,
        justification: "On the internet: online.",
      },
    ],
  },
  {
    text: `Dear Guests,

The hotel spa is open daily from 7 A.M. to 9 P.M. ___(1)___ Guests are asked to avoid ___(2)___ their phones in the spa area.

___(3)___ you would like a massage, please book at least one day in advance at the front desk. Towels are ___(4)___ free of charge.`,
    questions: [
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (1): which sentence fits best?",
        answers: ["Access is free for all hotel guests.", "The hotel has 120 rooms.", "Our restaurant serves Italian food.", "The city is famous for its museums."], correct_index: 0,
        justification: "It continues the information about the spa.",
      },
      {
        difficulty: "normal", category: "gerunds",
        question: "Blank (2)",
        answers: ["use", "using", "to use", "used"], correct_index: 1,
        justification: "\"Avoid\" + -ing: avoid using.",
      },
      {
        difficulty: "normal", category: "connectors",
        question: "Blank (3)",
        answers: ["Unless", "Although", "If", "Despite"], correct_index: 2,
        justification: "A condition: if.",
      },
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (4)",
        answers: ["proved", "produced", "promised", "provided"], correct_index: 3,
        justification: "Given to guests: provided.",
      },
    ],
  },
  {
    text: `Receptionist Wanted

Bayview Dental Clinic is looking for a friendly receptionist to join our team. The ___(1)___ person will answer phone calls and schedule appointments. ___(2)___

Previous experience is ___(3)___ but not required. Please send your CV to hr@bayviewdental.com before 15 May. Only ___(4)___ candidates will be contacted.`,
    questions: [
      {
        difficulty: "normal", category: "wordForms",
        question: "Blank (1)",
        answers: ["successful", "success", "succeeded", "succession"], correct_index: 0,
        justification: "Before a noun (person): an adjective, successful (= the one who gets the job).",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (2): which sentence fits best?",
        answers: ["Our clinic opened in 1998.", "Good computer skills are also important.", "Teeth should be cleaned twice a year.", "Bayview is a quiet town."], correct_index: 1,
        justification: "It continues the description of the job.",
      },
      {
        difficulty: "hard", category: "vocabulary",
        question: "Blank (3)",
        answers: ["prepared", "prevented", "preferred", "presented"], correct_index: 2,
        justification: "Nice to have, but not necessary: preferred.",
      },
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (4)",
        answers: ["elected", "collected", "rejected", "selected"], correct_index: 3,
        justification: "Chosen: selected candidates.",
      },
    ],
  },
  {
    text: `To: Warehouse staff
From: Operations Manager
Subject: Annual inventory

Our annual inventory will take place on Saturday, 30 November. All staff are ___(1)___ to attend. ___(2)___

The warehouse will be closed to deliveries that day, ___(3)___ please inform your suppliers. Staff who work on Saturday will receive an extra day ___(4)___.`,
    questions: [
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (1)",
        answers: ["required", "acquired", "inquired", "retired"], correct_index: 0,
        justification: "They must attend: required to.",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (2): which sentence fits best?",
        answers: ["Our warehouse is the largest in the region.", "Work will start at 7 A.M. and finish by 3 P.M.", "Inventory software is very expensive.", "Many suppliers are based abroad."], correct_index: 1,
        justification: "It gives the schedule of the day.",
      },
      {
        difficulty: "normal", category: "connectors",
        question: "Blank (3)",
        answers: ["but", "because", "so", "unless"], correct_index: 2,
        justification: "A consequence (closed -> inform suppliers): so.",
      },
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (4)",
        answers: ["out", "away", "over", "off"], correct_index: 3,
        justification: "A day without work: a day off.",
      },
    ],
  },
  {
    text: `Dear Mr. Novak,

Thank you for your inquiry. I am happy to confirm that the Garden Room ___(1)___ available for your meeting on 12 June from 10 A.M. to 4 P.M. The room can ___(2)___ up to thirty people. ___(3)___

Lunch can be served in the room for an additional ___(4)___ of €18 per person.

Kind regards,
Nora Price, Events Manager`,
    questions: [
      {
        difficulty: "normal", category: "verbTenses",
        question: "Blank (1)",
        answers: ["is", "was", "had been", "were"], correct_index: 0,
        justification: "A present fact (I confirm that ...): is.",
      },
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (2)",
        answers: ["keep", "hold", "take on", "bring"], correct_index: 1,
        justification: "Have space for: hold up to thirty people.",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (3): which sentence fits best?",
        answers: ["The hotel was renovated in 2015.", "June is our busiest month.", "It has a projector, a large screen, and free Wi-Fi.", "Thirty people work in our kitchen."], correct_index: 2,
        justification: "It continues the description of the room.",
      },
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (4)",
        answers: ["change", "chance", "charm", "charge"], correct_index: 3,
        justification: "Money asked for a service: a charge.",
      },
    ],
  },
  {
    text: `Lost and Found

Items left on our buses are kept at the Central Station office for 30 days. ___(1)___

To ___(2)___ an item, please bring a photo ID and describe the item ___(3)___. Items that are not collected after 30 days are ___(4)___ to charity.`,
    questions: [
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (1): which sentence fits best?",
        answers: ["The office is open Monday to Friday from 9 A.M. to 5 P.M.", "Buses are cleaned every night.", "Central Station was built in 1912.", "Many passengers use monthly passes."], correct_index: 0,
        justification: "It tells you when you can go to the office.",
      },
      {
        difficulty: "hard", category: "vocabulary",
        question: "Blank (2)",
        answers: ["complain", "claim", "clean", "clear"], correct_index: 1,
        justification: "Ask for something that is yours: claim.",
      },
      {
        difficulty: "normal", category: "wordForms",
        question: "Blank (3)",
        answers: ["accurate", "accuracy", "accurately", "accurateness"], correct_index: 2,
        justification: "It describes a verb (describe): an adverb, accurately.",
      },
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (4)",
        answers: ["dominated", "delegated", "deducted", "donated"], correct_index: 3,
        justification: "Given for free: donated to charity.",
      },
    ],
  },
  {
    text: `Employee of the Month

Congratulations to Sam Fletcher from the shipping department, who has been ___(1)___ Employee of the Month for October. ___(2)___

Sam always finishes his work on time, ___(3)___ he is always ready to help his colleagues. As a ___(4)___, he will receive a $100 gift card.`,
    questions: [
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (1)",
        answers: ["named", "called on", "told", "said"], correct_index: 0,
        justification: "Officially chosen as: named.",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (2): which sentence fits best?",
        answers: ["The shipping department has twelve employees.", "His team leader described him as reliable and hard-working.", "October was a rainy month.", "Gift cards can be used online."], correct_index: 1,
        justification: "It explains why Sam was chosen.",
      },
      {
        difficulty: "normal", category: "connectors",
        question: "Blank (3)",
        answers: ["but", "so", "and", "or"], correct_index: 2,
        justification: "Two good qualities together: and.",
      },
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (4)",
        answers: ["return", "refund", "review", "reward"], correct_index: 3,
        justification: "Something you get for good work: a reward.",
      },
    ],
  },
  {
    text: `Fire Drill

A fire drill will be held ___(1)___ Wednesday at 11 A.M. When the alarm sounds, please ___(2)___ the building by the nearest exit. ___(3)___

Do not use the elevators. Please wait in the parking lot until you are told it is safe to ___(4)___.`,
    questions: [
      {
        difficulty: "normal", category: "prepositions",
        question: "Blank (1)",
        answers: ["on", "in", "at", "by"], correct_index: 0,
        justification: "\"On\" + a day: on Wednesday.",
      },
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (2)",
        answers: ["live", "leave", "let", "lead"], correct_index: 1,
        justification: "Go out of: leave the building.",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (3): which sentence fits best?",
        answers: ["The building has twelve floors.", "Fire trucks are red in most countries.", "The drill will last about fifteen minutes.", "Our company sells insurance."], correct_index: 2,
        justification: "It continues the practical information about the drill.",
      },
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (4)",
        answers: ["retire", "remain", "recover", "return"], correct_index: 3,
        justification: "Go back inside: return.",
      },
    ],
  },
  {
    text: `Dear Reader,

Thank you for ___(1)___ to the Green Living newsletter. Every month, you will receive tips on saving energy and reducing waste. ___(2)___

If you no longer wish to receive our e-mails, you can ___(3)___ at any time by clicking the link below. We hope you find our newsletter ___(4)___.`,
    questions: [
      {
        difficulty: "hard", category: "vocabulary",
        question: "Blank (1)",
        answers: ["subscribing", "subtracting", "substituting", "submitting"], correct_index: 0,
        justification: "Sign up to receive regularly: subscribe (to).",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (2): which sentence fits best?",
        answers: ["Energy prices rose last winter.", "Each issue also includes a short interview with an expert.", "Our office uses solar panels.", "Many people read newspapers online."], correct_index: 1,
        justification: "It continues the description of the newsletter.",
      },
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (3)",
        answers: ["unload", "unpack", "unsubscribe", "unlock"], correct_index: 2,
        justification: "Stop receiving the e-mails: unsubscribe.",
      },
      {
        difficulty: "normal", category: "wordForms",
        question: "Blank (4)",
        answers: ["inform", "information", "informatively", "informative"], correct_index: 3,
        justification: "Find something + adjective: find it informative.",
      },
    ],
  },
  {
    text: `City Bikes Now Available

Residents and visitors can now rent bikes at twenty stations around the city. Bikes cost €2 for the first half hour, ___(1)___ the first ride is free for new users. ___(2)___

To rent a bike, users must download the CityBike app and ___(3)___ an account. The city hopes the program will ___(4)___ traffic in the center.`,
    questions: [
      {
        difficulty: "normal", category: "connectors",
        question: "Blank (1)",
        answers: ["but", "so", "or", "because"], correct_index: 0,
        justification: "A contrast (it costs €2 / it's free): but.",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (2): which sentence fits best?",
        answers: ["Cars are expensive to park.", "Bikes can be returned to any station.", "The city was founded in 1200.", "Many tourists visit in summer."], correct_index: 1,
        justification: "It continues the practical information about renting.",
      },
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (3)",
        answers: ["invent", "build", "create", "form"], correct_index: 2,
        justification: "Fixed expression: create an account.",
      },
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (4)",
        answers: ["produce", "induce", "deduce", "reduce"], correct_index: 3,
        justification: "Make less: reduce traffic.",
      },
    ],
  },
  {
    text: `Dear Ms. Clarke,

Good news! Your order #8823 ___(1)___ our warehouse this morning and should arrive within three working days. ___(2)___

You can ___(3)___ your package at any time using the tracking number below. If you are not at home, the driver will leave a ___(4)___ with instructions.

Thank you for shopping with us!`,
    questions: [
      {
        difficulty: "normal", category: "verbTenses",
        question: "Blank (1)",
        answers: ["left", "leaves", "has been leaving", "will leave"], correct_index: 0,
        justification: "This morning (finished): past simple, left.",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (2): which sentence fits best?",
        answers: ["Our warehouse is in Ohio.", "Delivery is free because your order was over $50.", "Packages are delivered by truck.", "We also sell clothes for children."], correct_index: 1,
        justification: "It gives useful information about this delivery.",
      },
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (3)",
        answers: ["trick", "truck", "track", "trek"], correct_index: 2,
        justification: "Follow where it is: track.",
      },
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (4)",
        answers: ["noise", "nod", "need", "note"], correct_index: 3,
        justification: "A short written message: a note.",
      },
    ],
  },
  {
    text: `Tips for Job Interviews

Before an interview, it is a good idea to learn as much as possible about the company. ___(1)___ On the day of the interview, avoid ___(2)___ late: plan to arrive at least ten minutes early.

Dress ___(3)___ for the job, and bring extra copies of your résumé. After the interview, send a short e-mail to ___(4)___ the interviewer for their time.`,
    questions: [
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (1): which sentence fits best?",
        answers: ["Read its website and recent news articles.", "Interviews usually take place in offices.", "Many people feel nervous on Mondays.", "Résumés should be printed in color."], correct_index: 0,
        justification: "It explains how to learn about the company.",
      },
      {
        difficulty: "normal", category: "gerunds",
        question: "Blank (2)",
        answers: ["arrive", "arriving", "to arrive", "arrived"], correct_index: 1,
        justification: "\"Avoid\" + -ing: avoid arriving.",
      },
      {
        difficulty: "hard", category: "vocabulary",
        question: "Blank (3)",
        answers: ["approximately", "apparently", "appropriately", "appreciably"], correct_index: 2,
        justification: "In the right way for the situation: appropriately.",
      },
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (4)",
        answers: ["think", "thought", "thanks", "thank"], correct_index: 3,
        justification: "Say thank you: to thank (to + base verb).",
      },
    ],
  },
  {
    text: `Elevator Maintenance

The elevator in Building B will be out of ___(1)___ from Monday to Wednesday next week for regular maintenance. ___(2)___

We apologize to staff and visitors for any ___(3)___. If you need ___(4)___ with heavy items, please contact security.`,
    questions: [
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (1)",
        answers: ["service", "surface", "sense", "season"], correct_index: 0,
        justification: "Not working: out of service.",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (2): which sentence fits best?",
        answers: ["Building B was built in 1990.", "Visitors with mobility needs should use the elevator in Building A.", "Elevators are safer than stairs.", "Our company has 300 employees."], correct_index: 1,
        justification: "It offers a solution during the maintenance.",
      },
      {
        difficulty: "normal", category: "wordForms",
        question: "Blank (3)",
        answers: ["inconvenient", "inconveniently", "inconvenience", "convenient"], correct_index: 2,
        justification: "After \"any\": a noun, inconvenience.",
      },
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (4)",
        answers: ["existence", "resistance", "insistence", "assistance"], correct_index: 3,
        justification: "Help: assistance.",
      },
    ],
  },
  {
    text: `Hi Tom,

Thanks for the presentation yesterday. The sales figures were very clear, ___(1)___ the charts were easy to understand. ___(2)___

My only ___(3)___ is to add a short summary at the end. Could you send me the final ___(4)___ by Friday?

Thanks,
Anna`,
    questions: [
      {
        difficulty: "normal", category: "connectors",
        question: "Blank (1)",
        answers: ["and", "but", "unless", "so"], correct_index: 0,
        justification: "Two positive points together: and.",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (2): which sentence fits best?",
        answers: ["Our office is on the fifth floor.", "The client especially liked the section on new markets.", "Presentations are usually given on Mondays.", "Charts are made with special software."], correct_index: 1,
        justification: "It continues the feedback on the presentation.",
      },
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (3)",
        answers: ["suggest", "digestion", "suggestion", "question"], correct_index: 2,
        justification: "An idea to improve something: a suggestion.",
      },
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (4)",
        answers: ["vision", "verse", "venture", "version"], correct_index: 3,
        justification: "One form of a document: the final version.",
      },
    ],
  },
  {
    text: `Course Registration

Registration for autumn courses ___(1)___ on 1 August and closes on 20 August. ___(2)___

Students must ___(3)___ their choices online. Popular courses fill up quickly, so early registration is ___(4)___.`,
    questions: [
      {
        difficulty: "hard", category: "verbTenses",
        question: "Blank (1)",
        answers: ["opens", "opened", "has opened", "was opening"], correct_index: 0,
        justification: "A timetable (like \"closes\"): present simple, opens.",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (2): which sentence fits best?",
        answers: ["The university was founded in 1850.", "Late registrations will not be accepted.", "Autumn is a beautiful season.", "Many students live off campus."], correct_index: 1,
        justification: "It continues the rules about the dates.",
      },
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (3)",
        answers: ["admit", "commit", "submit", "permit"], correct_index: 2,
        justification: "Send officially: submit.",
      },
      {
        difficulty: "hard", category: "vocabulary",
        question: "Blank (4)",
        answers: ["advertised", "adjusted", "advanced", "advised"], correct_index: 3,
        justification: "Recommended: advised.",
      },
    ],
  },
  {
    text: `Dear Ms. Bennett,

On behalf of the whole team, I would like to thank you for ___(1)___ generous donation to our children's hospital. ___(2)___

Your gift will be used to buy new ___(3)___ for our play room. We are truly ___(4)___ for your support.

Sincerely,
Dr. Henry Cole`,
    questions: [
      {
        difficulty: "normal", category: "pronouns",
        question: "Blank (1)",
        answers: ["your", "you", "yours", "yourself"], correct_index: 0,
        justification: "Before a noun (donation): your.",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (2): which sentence fits best?",
        answers: ["Our hospital has 300 beds.", "It will make a real difference to our young patients.", "Many doctors work at night.", "Visiting hours end at 8 P.M."], correct_index: 1,
        justification: "It continues the thanks for the donation.",
      },
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (3)",
        answers: ["equation", "equality", "equipment", "equator"], correct_index: 2,
        justification: "Things needed for an activity: equipment.",
      },
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (4)",
        answers: ["graceful", "gracious", "gradual", "grateful"], correct_index: 3,
        justification: "Thankful: grateful for.",
      },
    ],
  },
  {
    text: `New Security Badges

From 1 May, all employees will need a new security badge to enter the building. ___(1)___ Badges can be ___(2)___ from the security office on the ground floor. Please bring a photo ID.

Old badges will stop working ___(3)___ on 1 May, so please do not ___(4)___ to collect your new badge.`,
    questions: [
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (1): which sentence fits best?",
        answers: ["The new badges are more difficult to copy.", "The building has two entrances.", "Security guards work in shifts.", "Badges are made of plastic."], correct_index: 0,
        justification: "It explains why there are new badges.",
      },
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (2)",
        answers: ["corrected", "collected", "connected", "collapsed"], correct_index: 1,
        justification: "Picked up: collected.",
      },
      {
        difficulty: "normal", category: "wordForms",
        question: "Blank (3)",
        answers: ["automatic", "automate", "automatically", "automation"], correct_index: 2,
        justification: "It describes a verb (stop working): an adverb, automatically.",
      },
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (4)",
        answers: ["forgive", "forbid", "forge", "forget"], correct_index: 3,
        justification: "Don't forget to do something.",
      },
    ],
  },
  {
    text: `Thank you for your e-mail. I am currently out of the office ___(1)___ I am attending a conference in Madrid. I will return on Monday, 14 October. ___(2)___

For ___(3)___ matters, please contact my assistant, Ben Clark, at b.clark@norvel.com. Otherwise, I will ___(4)___ to your message when I return.`,
    questions: [
      {
        difficulty: "normal", category: "connectors",
        question: "Blank (1)",
        answers: ["because", "because of", "despite", "although"], correct_index: 0,
        justification: "Cause + subject + verb: because.",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (2): which sentence fits best?",
        answers: ["Madrid is the capital of Spain.", "I will have limited access to e-mail during this time.", "Conferences are often expensive.", "Our office is closed on Sundays."], correct_index: 1,
        justification: "It explains why the reply will be late.",
      },
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (3)",
        answers: ["ancient", "frequent", "urgent", "absent"], correct_index: 2,
        justification: "Things that cannot wait: urgent matters.",
      },
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (4)",
        answers: ["apply", "supply", "imply", "reply"], correct_index: 3,
        justification: "Answer: reply to.",
      },
    ],
  },
  {
    text: `Switch to FiberNet!

FiberNet's new home internet is up to ten times ___(1)___ than standard internet. ___(2)___

Sign up before 31 December and get the first three months at half ___(3)___. Installation is free, and there is no long-term ___(4)___.`,
    questions: [
      {
        difficulty: "normal", category: "comparatives",
        question: "Blank (1)",
        answers: ["faster", "fast", "fastest", "more fast"], correct_index: 0,
        justification: "\"Than\" -> comparative: faster.",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (2): which sentence fits best?",
        answers: ["The internet was invented in the 1960s.", "You can stream movies and join video calls without delays.", "December is a cold month.", "Our offices are in Dublin."], correct_index: 1,
        justification: "It shows the benefit of a faster connection.",
      },
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (3)",
        answers: ["prize", "praise", "price", "piece"], correct_index: 2,
        justification: "Fixed expression: at half price.",
      },
      {
        difficulty: "hard", category: "vocabulary",
        question: "Blank (4)",
        answers: ["contact", "contrast", "context", "contract"], correct_index: 3,
        justification: "A legal agreement: a contract.",
      },
    ],
  },
  {
    text: `Dear Ben,

Your annual performance review ___(1)___ on Tuesday, 5 March, at 2 P.M. in my office. ___(2)___

Please ___(3)___ a short list of your main achievements this year. We will also discuss your goals for next year. Let me know if this time does not ___(4)___ you.

Best,
Martha`,
    questions: [
      {
        difficulty: "normal", category: "verbTenses",
        question: "Blank (1)",
        answers: ["will take place", "took place", "has taken place", "was taking place"], correct_index: 0,
        justification: "A future date: will take place.",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (2): which sentence fits best?",
        answers: ["My office is next to the kitchen.", "It should take about forty-five minutes.", "Reviews were introduced in 2005.", "Tuesday is usually busy."], correct_index: 1,
        justification: "It gives practical information about the review.",
      },
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (3)",
        answers: ["repair", "compare", "prepare", "despair"], correct_index: 2,
        justification: "Get ready in advance: prepare.",
      },
      {
        difficulty: "hard", category: "vocabulary",
        question: "Blank (4)",
        answers: ["suite", "sweet", "seat", "suit"], correct_index: 3,
        justification: "Be convenient for: suit.",
      },
    ],
  },
  {
    text: `New Opening Hours

Starting in September, the library will stay open ___(1)___ 9 P.M. on weekdays. ___(2)___

This change was made in ___(3)___ to requests from students. We hope the longer hours will be ___(4)___ for everyone.`,
    questions: [
      {
        difficulty: "normal", category: "prepositions",
        question: "Blank (1)",
        answers: ["until", "by", "since", "for"], correct_index: 0,
        justification: "Continuing up to a time: stay open until 9 P.M.",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (2): which sentence fits best?",
        answers: ["The library has 50,000 books.", "Weekend hours will remain the same.", "Students often study in groups.", "Many students drink coffee."], correct_index: 1,
        justification: "It completes the information about opening hours.",
      },
      {
        difficulty: "hard", category: "vocabulary",
        question: "Blank (3)",
        answers: ["responsibility", "respect", "response", "resort"], correct_index: 2,
        justification: "Fixed expression: in response to (= as an answer to).",
      },
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (4)",
        answers: ["beneficiary", "benefited", "benevolent", "beneficial"], correct_index: 3,
        justification: "Useful, good for: beneficial.",
      },
    ],
  },
  {
    text: `Printer Notice

The printer on the second floor is not working ___(1)___. A technician will come to repair it tomorrow morning. ___(2)___

We apologize for the ___(3)___.`,
    questions: [
      {
        difficulty: "normal", category: "wordForms",
        question: "Blank (1)",
        answers: ["properly", "proper", "property", "propriety"], correct_index: 0,
        justification: "It describes a verb (working): an adverb, properly.",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (2): which sentence fits best?",
        answers: ["Printers use a lot of paper.", "Until then, please use the printer on the third floor.", "The technician lives nearby.", "Our office opened in 2010."], correct_index: 1,
        justification: "It gives a solution until the repair.",
      },
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (3)",
        answers: ["incidence", "insistence", "inconvenience", "innocence"], correct_index: 2,
        justification: "Trouble caused: inconvenience.",
      },
    ],
  },
  {
    text: `Hi Lucy,

The client meeting has been moved to Thursday ___(1)___ the client's flight was canceled. ___(2)___

Could you please ___(3)___ the conference room for Thursday at 10 A.M.?

Thanks,
Omar`,
    questions: [
      {
        difficulty: "normal", category: "connectors",
        question: "Blank (1)",
        answers: ["because of", "so", "although", "because"], correct_index: 3,
        justification: "Cause + subject + verb: because.",
      },
      {
        difficulty: "extreme", category: "vocabulary",
        question: "Blank (2): which sentence fits best?",
        answers: ["Everything else about the meeting stays the same.", "Flights are often canceled in winter.", "The client works for a bank.", "Thursday is my favorite day."], correct_index: 0,
        justification: "It continues the information about the meeting.",
      },
      {
        difficulty: "normal", category: "vocabulary",
        question: "Blank (3)",
        answers: ["look", "book", "cook", "hook"], correct_index: 1,
        justification: "Reserve: book a room.",
      },
    ],
  },
];
