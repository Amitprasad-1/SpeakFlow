import { ListeningExercise } from '../types/index.js';

export const LISTENING_EXERCISES_CATALOG: ListeningExercise[] = [
  {
    id: 'listening_exercise_1',
    title: 'Cross-Functional Sprint Retrospective Debate',
    scenario: 'Two engineering and product leads discuss trade-offs between speed and code architecture.',
    durationSeconds: 65,
    speakers: [
      { name: 'Elena', accent: 'General American' },
      { name: 'Liam', accent: 'British English' }
    ],
    dialogueTranscript:
      "Elena: Thanks for staying back, Liam. Looking over our sprint velocity, I'm concerned that rushing out the payment gateway refactor introduced subtle edge-case errors.\n\nLiam: I hear you, Elena. However, if we hadn't met the Q2 compliance deadline, our enterprise clients in Europe would have faced regulatory audits. It was a calculated trade-off between architectural purity and contractual obligations.\n\nElena: True, but now our customer support desk is handling a thirty percent increase in checkout drop-offs. If we allocate the entire upcoming sprint to technical stabilization rather than new customer features, can we permanently resolve the root causes?\n\nLiam: Absolutely. If we isolate the concurrency bottlenecks in the webhook handler, we can guarantee ninety-nine point nine percent reliability before launching the mobile campaign next month.",
    questions: [
      {
        id: 'listen_q1',
        question: 'Why did Liam prioritize meeting the Q2 compliance deadline over code purity?',
        options: [
          'To avoid a regulatory audit for enterprise clients in Europe',
          'Because the team had surplus time and resources',
          'To increase the customer checkout drop-off rate',
          'Because Elena requested immediate feature expansion'
        ],
        correctIndex: 0,
        explanation:
          'Liam explicitly notes: "if we hadn\'t met the Q2 compliance deadline, our enterprise clients in Europe would have faced regulatory audits."'
      },
      {
        id: 'listen_q2',
        question: 'What does Elena propose doing for the upcoming sprint?',
        options: [
          'Launching the mobile marketing campaign early',
          'Allocating the sprint to technical stabilization and root cause fixes',
          'Hiring external contractors to audit the webhook handler',
          'Canceling European enterprise contracts'
        ],
        correctIndex: 1,
        explanation:
          'Elena proposes allocating the entire upcoming sprint to technical stabilization to resolve the root causes of the checkout drop-offs.'
      },
      {
        id: 'listen_q3',
        question: 'What specific component does Liam identify as the concurrency bottleneck?',
        options: [
          'The customer support helpdesk portal',
          'The European compliance reporting tool',
          'The webhook handler',
          'The mobile app user interface'
        ],
        correctIndex: 2,
        explanation:
          'Liam says: "If we isolate the concurrency bottlenecks in the webhook handler, we can guarantee 99.9% reliability."'
      }
    ]
  },
  {
    id: 'listening_exercise_2',
    title: 'Enterprise Client Solution Briefing',
    scenario: 'An account executive and a technical architect align on resolving an enterprise onboarding delay.',
    durationSeconds: 60,
    speakers: [
      { name: 'Sarah', accent: 'General American' },
      { name: 'Marcus', accent: 'Australian English' }
    ],
    dialogueTranscript:
      "Sarah: Good morning Marcus. I just got off a call with the Meridian team. They are concerned that their custom single-sign-on integration is taking longer than estimated in the statement of work.\n\nMarcus: I understand their urgency, Sarah. The delay stems from their legacy identity provider using an older SAML protocol that requires custom token translation on our gateway.\n\nSarah: If we provide our dedicated sandbox credentials by this afternoon, will their internal IT team be able to test the endpoints before Friday's executive review?\n\nMarcus: Yes, definitely. I have already staged the translation middleware in staging. If they verify the token signatures today, we can push to production ahead of schedule.",
    questions: [
      {
        id: 'listen_2_q1',
        question: 'What is causing the onboarding delay with the Meridian team?',
        options: [
          'A dispute regarding pricing and billing statements',
          'A legacy identity provider requiring custom SAML token translation',
          'Unresponsive customer service managers',
          'Hardware server downtime in Europe'
        ],
        correctIndex: 1,
        explanation: 'Marcus explains the delay is due to an older SAML protocol requiring custom token translation.'
      },
      {
        id: 'listen_2_q2',
        question: 'What does Sarah propose delivering by this afternoon?',
        options: [
          'A full invoice cancellation',
          'Dedicated sandbox credentials for endpoint testing',
          'A revised statement of work',
          'A new mobile application'
        ],
        correctIndex: 1,
        explanation: 'Sarah asks if providing dedicated sandbox credentials by this afternoon will allow endpoint testing.'
      },
      {
        id: 'listen_2_q3',
        question: 'Where has Marcus already staged the translation middleware?',
        options: [
          'In staging',
          'On the client\'s on-premise hardware',
          'Directly in production',
          'In an archived backup repository'
        ],
        correctIndex: 0,
        explanation: 'Marcus states: "I have already staged the translation middleware in staging."'
      }
    ]
  },
  {
    id: 'listening_exercise_3',
    title: 'Airport Transit & Flight Connection Logistics',
    scenario: 'A gate supervisor assists an international traveler navigating a tight flight connection in London.',
    durationSeconds: 55,
    speakers: [
      { name: 'Agent Davies', accent: 'British English' },
      { name: 'David', accent: 'General American' }
    ],
    dialogueTranscript:
      "Agent Davies: Good afternoon, sir. How may I assist you with your onward travel today?\n\nDavid: Hello! My inbound flight from Chicago arrived forty minutes late due to headwinds. I have only twenty-five minutes to catch my connecting flight to Frankfurt departing from Gate B42.\n\nAgent Davies: Don't panic, Mr. Chen. Gate B42 is in the satellite concourse, but there is an underground automated transit shuttle right past security that takes under three minutes. I will notify the gate supervisor that you are already through passport control.\n\nDavid: That is a tremendous relief. Will my checked luggage transfer automatically, or must I collect it here?\n\nAgent Davies: Your luggage is checked all the way through to Frankfurt. Proceed straight down the escalator to the shuttle platform.",
    questions: [
      {
        id: 'listen_3_q1',
        question: 'Why did David\'s inbound flight arrive late?',
        options: [
          'Mechanical engine maintenance',
          'Headwinds during the Chicago flight',
          'Severe thunderstorms over London',
          'Security screening delays'
        ],
        correctIndex: 1,
        explanation: 'David mentions his flight from Chicago arrived forty minutes late due to headwinds.'
      },
      {
        id: 'listen_3_q2',
        question: 'How does Agent Davies recommend reaching the satellite concourse?',
        options: [
          'Taking a taxi outside the terminal',
          'Walking across the outdoor tarmac',
          'Taking the underground automated transit shuttle',
          'Waiting for an electric golf cart'
        ],
        correctIndex: 2,
        explanation: 'The agent explains there is an underground automated transit shuttle right past security.'
      },
      {
        id: 'listen_3_q3',
        question: 'What happens with David\'s checked luggage?',
        options: [
          'He must retrieve it from baggage claim 4',
          'It has been lost and needs a claim ticket',
          'It is checked all the way through to Frankfurt automatically',
          'It must be re-scanned at the satellite gate'
        ],
        correctIndex: 2,
        explanation: 'Agent Davies confirms: "Your luggage is checked all the way through to Frankfurt."'
      }
    ]
  }
];

