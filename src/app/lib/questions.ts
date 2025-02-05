const Scenarios = [
  // Written Communication Assessment
  {
      topic: "Written Communication Assessment",
      heading: "Email Persuasion",
      question: "Write an email to a dissatisfied customer who has complained about poor service. Your goal is to acknowledge their concerns and convince them to continue using your services.",
      timing: 15
  },
  {
      topic: "Written Communication Assessment",
      heading: "Concise Explanation",
      question: "Explain the concept of 'Artificial Intelligence' to a 10-year-old in under 100 words.",
      timing: 10
  },
  {
      topic: "Written Communication Assessment",
      heading: "Instructional Writing",
      question: "Write step-by-step instructions for making a cup of tea, ensuring even someone unfamiliar with the process can follow along easily.",
      timing: 10
  },
  {
      topic: "Written Communication Assessment",
      heading: "Press Release Writing",
      question: "You are launching a new product that helps businesses automate recruitment. Write a short press release announcing the launch.",
      timing: 20
  },
  {
      topic: "Written Communication Assessment",
      heading: "Tone Adaptation",
      question: "Rephrase this message into a formal, friendly, and apologetic tone: 'We can't process your request because you missed the deadline.'",
      timing: 5
  },
  {
      topic: "Written Communication Assessment",
      heading: "Problem-Solving Email",
      question: "A client has requested a service that your company does not currently offer. Write a professional response that provides an alternative solution.",
      timing: 15
  },
  {
      topic: "Written Communication Assessment",
      heading: "Persuasive Pitch",
      question: "Write a LinkedIn post persuading people to adopt a new work-from-home policy, highlighting its benefits.",
      timing: 15
  },
  {
      topic: "Written Communication Assessment",
      heading: "Grammar & Clarity Test",
      question: "Rewrite this sentence to improve clarity and correctness: 'Due to the situation, we are thinking that maybe it's better to postpone the event for later.'",
      timing: 5
  },
  {
      topic: "Written Communication Assessment",
      heading: "Customer Communication",
      question: "Draft a professional response to a customer asking for a discount on your product, balancing goodwill with maintaining company revenue.",
      timing: 15
  },
  
  // Innovation & Innovative Mindset Assessment
  {
      topic: "Innovation & Innovative Mindset Assessment",
      heading: "Creative Problem-Solving",
      question: "How would you design a wallet that ensures people never lose their cash or cards?",
      timing: 15
  },
  {
      topic: "Innovation & Innovative Mindset Assessment",
      heading: "Alternative Solutions",
      question: "How can restaurants reduce food waste while improving profitability? Provide an innovative approach.",
      timing: 20
  },
  {
      topic: "Innovation & Innovative Mindset Assessment",
      heading: "Resourceful Thinking",
      question: "If you had only $100 and needed to start a profitable business in 30 days, what would you do?",
      timing: 15
  },
  {
      topic: "Innovation & Innovative Mindset Assessment",
      heading: "Reimagining Daily Objects",
      question: "How would you redesign the traditional shopping cart to make it more user-friendly and efficient?",
      timing: 15
  },
  {
      topic: "Innovation & Innovative Mindset Assessment",
      heading: "Unique Marketing Strategy",
      question: "If social media platforms disappeared overnight, how would you market a new fitness app?",
      timing: 20
  },
  {
      topic: "Innovation & Innovative Mindset Assessment",
      heading: "Sustainability Challenge",
      question: "What creative solution would you propose to reduce plastic waste globally?",
      timing: 20
  },
  {
      topic: "Innovation & Innovative Mindset Assessment",
      heading: "Efficiency Boosting",
      question: "How would you redesign the office workspace to make employees more productive and engaged?",
      timing: 15
  },
  {
      topic: "Innovation & Innovative Mindset Assessment",
      heading: "New Revenue Stream Creation",
      question: "Think of an everyday object (like a pen or a backpack) and suggest a way to make it more innovative while creating a new revenue model.",
      timing: 20
  },
  {
      topic: "Innovation & Innovative Mindset Assessment",
      heading: "Tech-Driven Change",
      question: "How could AI be used to make public transport more efficient without adding more buses or trains?",
      timing: 20
  },
  {
      topic: "Innovation & Innovative Mindset Assessment",
      heading: "Gamification in Work",
      question: "How would you apply gaming concepts to improve employee productivity in a corporate setting?",
      timing: 15
  },
  
  // Fire in the Belly Assessment
  {
      topic: "Fire in the Belly Assessment",
      heading: "Taking Initiative",
      question: "Describe a time when you identified a problem before anyone else and took steps to solve it. What was the outcome?",
      timing: 15
  },
  {
      topic: "Fire in the Belly Assessment",
      heading: "Handling Failure",
      question: "Tell us about a major failure in your life. How did you react, and what did you do afterward?",
      timing: 15
  },
  {
      topic: "Fire in the Belly Assessment",
      heading: "Pushing Beyond Comfort Zone",
      question: "When was the last time you did something outside your comfort zone? What motivated you?",
      timing: 15
  },
  {
      topic: "Fire in the Belly Assessment",
      heading: "Personal Drive",
      question: "If you were given unlimited time and resources, what problem in the world would you dedicate yourself to solving, and why?",
      timing: 20
  },
  {
      topic: "Fire in the Belly Assessment",
      heading: "Proactive Thinking",
      question: "Have you ever taken up additional responsibilities at work or school without being asked? What drove you to do it?",
      timing: 15
  },
  {
      topic: "Fire in the Belly Assessment",
      heading: "Long-Term Vision",
      question: "Where do you see yourself in five years, and what are you actively doing now to reach that goal?",
      timing: 15
  },
  {
      topic: "Fire in the Belly Assessment",
      heading: "Surpassing Expectations",
      question: "Tell us about a time you delivered results that went beyond what was expected of you. How did you achieve it?",
      timing: 15
  },
  {
      topic: "Fire in the Belly Assessment",
      heading: "Passion & Work Ethic",
      question: "Describe a time when you worked tirelessly on something because you were deeply passionate about it.",
      timing: 15
  },
  {
      topic: "Fire in the Belly Assessment",
      heading: "Resourcefulness",
      question: "If you were given an important task with almost no resources, how would you complete it?",
      timing: 15
  },
  {
      topic: "Fire in the Belly Assessment",
      heading: "Grit Test",
      question: "Tell us about a situation where you kept going despite facing multiple rejections or failures. What did you learn from it?",
      timing: 15
  }
];

const getRandomScenarios = () => {
  // Helper function to get random items from array
  const getRandomItems = (arr, count) => {
      let shuffled = [...arr].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
  };

  // Group scenarios by topic
  const groupedScenarios = Scenarios.reduce((acc, scenario) => {
      if (!acc[scenario.topic]) {
          acc[scenario.topic] = [];
      }
      acc[scenario.topic].push(scenario);
      return acc;
  }, {});

  // Get 2 random questions from each topic
  const randomScenarios = Object.keys(groupedScenarios).reduce((acc, topic) => {
      const topicScenarios = getRandomItems(groupedScenarios[topic], 2);
      return [...acc, ...topicScenarios];
  }, []);

  return randomScenarios;
};

// Get and export random scenarios
export const selectedScenarios = getRandomScenarios();
