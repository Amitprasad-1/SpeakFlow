import { SpeakingScenario, SpeakingScenarioCategory } from '../types/index.js';

export const SPEAKING_SCENARIOS_CATALOG: SpeakingScenario[] = [
  {
    id: 'scenario_job_interview',
    category: 'job_interview',
    title: 'Senior Professional Job Interview',
    roleAi: 'Executive Hiring Manager',
    roleUser: 'Job Candidate',
    contextDescription:
      'You are in the final round interview for a senior role. The hiring manager is assessing your leadership, past problem-solving, and communication under pressure.',
    goal: 'Demonstrate structured thinking (STAR method: Situation, Task, Action, Result) with calm, confident enunciation.',
    sampleStarterPrompt: 'Tell me about a complex project where priorities changed unexpectedly and how you led your team through it.',
    initialMessage:
      'Welcome! Thank you for taking the time to speak with me today. To get started, could you walk me through a challenging project where unexpected obstacles arose, and how you navigated your team to a successful outcome?'
  },
  {
    id: 'scenario_hr_interview',
    category: 'hr_interview',
    title: 'HR Screening & Cultural Alignment',
    roleAi: 'Senior HR Business Partner',
    roleUser: 'Prospective Employee',
    contextDescription:
      'An HR initial screen exploring your career motivations, conflict resolution style, and why you are excited about joining the company.',
    goal: 'Communicate genuine enthusiasm, emotional intelligence, and natural conversational cadence.',
    sampleStarterPrompt: 'Why are you looking to make a transition at this stage in your career?',
    initialMessage:
      'Hello and thank you for joining! I have been reviewing your background and was very impressed. To start off our discussion, what motivated you to apply for this position, and what kind of team culture helps you do your best work?'
  },
  {
    id: 'scenario_workplace_conversation',
    category: 'workplace_conversation',
    title: 'Strategic Alignment with Department Lead',
    roleAi: 'Department Director',
    roleUser: 'Lead Specialist',
    contextDescription:
      'Discussing resource allocation and Q3 priorities with your director to ensure cross-functional alignment.',
    goal: 'Articulate trade-offs concisely and propose pragmatic solutions.',
    sampleStarterPrompt: 'We need to discuss whether to prioritize feature delivery or technical debt reduction.',
    initialMessage:
      'Thanks for making time to sync today. We have received conflicting requests from sales and engineering regarding the upcoming release. How do you propose we balance new feature delivery against resolving our technical backlog?'
  },
  {
    id: 'scenario_talking_to_colleague',
    category: 'talking_to_colleague',
    title: 'Casual Catchup & Collaboration with a Peer',
    roleAi: 'Peer Colleague (Alex)',
    roleUser: 'Teammate',
    contextDescription:
      'A casual 1-on-1 coffee chat with a cross-functional teammate to coordinate on a joint initiative.',
    goal: 'Practice relaxed, natural colloquial English with warmth and smooth turn-taking.',
    sampleStarterPrompt: 'Hey! How was your weekend? Did you get a chance to look over the draft proposal?',
    initialMessage:
      'Hey there! Good to catch up. Before we jump into the shared spreadsheet, how was your weekend? Did you manage to unplug for a bit?'
  },
  {
    id: 'scenario_asking_for_help',
    category: 'asking_for_help',
    title: 'Requesting Technical Assistance & Unblocking',
    roleAi: 'Principal Architect (Maya)',
    roleUser: 'Project Contributor',
    contextDescription:
      'You have encountered an unexpected blocker in your task and need guidance from a senior team member without sounding helpless.',
    goal: 'Clearly describe what you tried, where you are stuck, and formulate a specific request.',
    sampleStarterPrompt: 'I hit a snag with the database migration script and could use your eyes on the concurrency lock.',
    initialMessage:
      'Hi! I saw your message on Slack about the deployment pipeline blocker. What specific issue are you running into, and what approaches have you already tested?'
  },
  {
    id: 'scenario_giving_project_update',
    category: 'giving_project_update',
    title: 'Executive Stakeholder Status Briefing',
    roleAi: 'VP of Product (David)',
    roleUser: 'Project Lead',
    contextDescription:
      'Delivering a 2-minute verbal executive summary of project status, key milestones achieved, and upcoming risks.',
    goal: 'Deliver structured, punchy updates without filler words (um, uh, like).',
    sampleStarterPrompt: 'Here is the 2-minute status update on Project Titan for this sprint.',
    initialMessage:
      'Hi everyone. David here. We have five minutes allocated for your project update. Whenever you are ready, please give us the top-line summary of where we stand on the Q3 milestones.'
  },
  {
    id: 'scenario_meeting_discussion',
    category: 'meeting_discussion',
    title: 'Cross-Functional Strategy Brainstorm',
    roleAi: 'Meeting Facilitator (Sarah)',
    roleUser: 'Active Participant',
    contextDescription:
      'Participating in an open discussion regarding customer retention strategies, disagreeing politely, and building upon ideas.',
    goal: 'Use polite interruption markers ("If I may chime in...", "I see your point, however...") and articulate persuasive arguments.',
    sampleStarterPrompt: 'I agree with the pricing change in principle, but I think our onboarding experience is the bigger lever.',
    initialMessage:
      'We are currently debating whether lowering our onboarding pricing or investing in dedicated customer success managers will improve 90-day retention. I would love to hear your perspective on this.'
  },
  {
    id: 'scenario_presentation',
    category: 'presentation',
    title: 'Product Pitch & Q&A Defense',
    roleAi: 'Keynote Attendee / Investor',
    roleUser: 'Presenter',
    contextDescription:
      'Presenting the core value proposition of a new product initiative and handling tough questions from skeptical stakeholders.',
    goal: 'Maintain vocal projection, address objections calmly, and steer back to core strengths.',
    sampleStarterPrompt: 'Thank you for that question. Let me explain how our unit economics mitigate that risk.',
    initialMessage:
      'Thank you for the overview. My primary concern is that competing platforms already have substantial market share in this exact vertical. What is your defensible differentiator that convinces customers to switch?'
  },
  {
    id: 'scenario_customer_interaction',
    category: 'customer_interaction',
    title: 'Enterprise Customer Success Resolution',
    roleAi: 'Frustrated Enterprise Client (Marcus)',
    roleUser: 'Senior Customer Success Manager',
    contextDescription:
      'Handling a critical enterprise client whose team experienced service downtime during peak hours.',
    goal: 'Demonstrate deep empathy, de-escalate tension, and clearly outline corrective actions.',
    sampleStarterPrompt: 'Marcus, I completely understand your frustration and apologize for the impact on your operations.',
    initialMessage:
      'Honestly, our entire regional sales team was blocked for nearly two hours this morning because the sync failed. This is the second time this month. Why should we continue trusting your infrastructure?'
  },
  {
    id: 'scenario_phone_conversation',
    category: 'phone_conversation',
    title: 'Professional Phone Inquiries & Scheduling',
    roleAi: 'Executive Assistant (Rachel)',
    roleUser: 'Caller',
    contextDescription:
      'Calling an external partner’s office to schedule a confidential briefing and coordinate logistical details over voice.',
    goal: 'Clarity over audio, spelling out names/emails phonetically, confirming dates and action items.',
    sampleStarterPrompt: 'Hello Rachel, I am calling on behalf of the operations team to finalize the briefing agenda.',
    initialMessage:
      'Good morning, Director Vance’s office, this is Rachel speaking. How may I assist you today?'
  },
  {
    id: 'scenario_daily_conversation',
    category: 'daily_conversation',
    title: 'Everyday Social & Community Dialogue',
    roleAi: 'Friendly Neighbor / Local Acquaintance (Sam)',
    roleUser: 'Community Member',
    contextDescription:
      'An engaging, natural neighborhood chat about local events, dining recommendations, and upcoming community plans.',
    goal: 'Speak with expressive intonation, natural idiomatic expressions, and spontaneous conversational ease.',
    sampleStarterPrompt: 'Hey Sam! Have you checked out the new farmers market that opened downtown?',
    initialMessage:
      'Hey there! What a beautiful afternoon. I was just heading over toward the new cafe on 4th Street. Have you had a chance to try their coffee yet?'
  }
];
