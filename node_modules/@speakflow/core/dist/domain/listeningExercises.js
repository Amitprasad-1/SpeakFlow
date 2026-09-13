"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LISTENING_EXERCISES_CATALOG = void 0;
exports.LISTENING_EXERCISES_CATALOG = [
    {
        id: 'listening_exercise_1',
        title: 'Cross-Functional Sprint Retrospective Debate',
        scenario: 'Two engineering and product leads discuss trade-offs between speed and code architecture.',
        durationSeconds: 65,
        speakers: [
            { name: 'Elena', accent: 'General American' },
            { name: 'Liam', accent: 'British English' }
        ],
        dialogueTranscript: "Elena: Thanks for staying back, Liam. Looking over our sprint velocity, I'm concerned that rushing out the payment gateway refactor introduced subtle edge-case errors.\n\nLiam: I hear you, Elena. However, if we hadn't met the Q2 compliance deadline, our enterprise clients in Europe would have faced regulatory audits. It was a calculated trade-off between architectural purity and contractual obligations.\n\nElena: True, but now our customer support desk is handling a thirty percent increase in checkout drop-offs. If we allocate the entire upcoming sprint to technical stabilization rather than new customer features, can we permanently resolve the root causes?\n\nLiam: Absolutely. If we isolate the concurrency bottlenecks in the webhook handler, we can guarantee ninety-nine point nine percent reliability before launching the mobile campaign next month.",
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
                explanation: 'Liam explicitly notes: "if we hadn\'t met the Q2 compliance deadline, our enterprise clients in Europe would have faced regulatory audits."'
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
                explanation: 'Elena proposes allocating the entire upcoming sprint to technical stabilization to resolve the root causes of the checkout drop-offs.'
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
                explanation: 'Liam says: "If we isolate the concurrency bottlenecks in the webhook handler, we can guarantee 99.9% reliability."'
            }
        ]
    }
];
//# sourceMappingURL=listeningExercises.js.map