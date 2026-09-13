import {
  ConversationMode,
  ConversationSession,
  ConversationMessage,
  PostConversationReview,
  SpeakingScenario
} from '../types/index.js';
import { SPEAKING_SCENARIOS_CATALOG } from '../domain/speakingScenarios.js';

export class ConversationEngine {
  /**
   * Initializes a dedicated conversation session for a given mode.
   */
  public static startSession(
    mode: ConversationMode = 'practice',
    customScenarioId?: string
  ): ConversationSession {
    let scenario: SpeakingScenario;

    if (customScenarioId) {
      scenario = SPEAKING_SCENARIOS_CATALOG.find(s => s.id === customScenarioId) || SPEAKING_SCENARIOS_CATALOG[0];
    } else {
      // Pick appropriate scenario matching the mode
      switch (mode) {
        case 'interview':
          scenario = SPEAKING_SCENARIOS_CATALOG.find(s => s.category === 'job_interview') || SPEAKING_SCENARIOS_CATALOG[0];
          break;
        case 'workplace':
          scenario = SPEAKING_SCENARIOS_CATALOG.find(s => s.category === 'workplace_conversation' || s.category === 'meeting_discussion') || SPEAKING_SCENARIOS_CATALOG[2];
          break;
        case 'free':
          scenario = SPEAKING_SCENARIOS_CATALOG.find(s => s.category === 'daily_conversation') || SPEAKING_SCENARIOS_CATALOG[10];
          break;
        case 'practice':
        default:
          scenario = SPEAKING_SCENARIOS_CATALOG.find(s => s.category === 'talking_to_colleague') || SPEAKING_SCENARIOS_CATALOG[3];
          break;
      }
    }

    const initialAiMessage: ConversationMessage = {
      id: `msg_ai_0_${Date.now()}`,
      sender: 'ai',
      text: scenario.initialMessage,
      timestamp: new Date().toISOString()
    };

    return {
      id: `conv_${Date.now()}`,
      mode,
      scenario,
      messages: [initialAiMessage],
      startedAt: new Date().toISOString(),
      isCompleted: false
    };
  }

  /**
   * Processes a user turn, analyzes speech, and generates the next natural AI reply.
   * Follows the rule: asks 1 conversational question at a time, corrects only major recurring patterns without interrupting.
   */
  public static processUserTurn(
    session: ConversationSession,
    userText: string
  ): { updatedSession: ConversationSession; replyMessage: ConversationMessage } {
    const userMsg: ConversationMessage = {
      id: `msg_user_${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toISOString()
    };

    const currentHistory = [...session.messages, userMsg];
    const userTurnCount = currentHistory.filter(m => m.sender === 'user').length;

    // Generate contextual AI partner response
    const aiReplyText = this.generatePartnerReply(session.scenario, userText, userTurnCount);

    // Optional lightweight non-interruptive phrasing tip
    let feedback: any = undefined;
    if (/\b(i am agree)\b/i.test(userText)) {
      feedback = {
        naturalAlternative: 'Native tip: Use "I agree" rather than "I am agree".'
      };
    } else if (/\b(doubt)\b/i.test(userText)) {
      feedback = {
        naturalAlternative: 'Native tip: In business contexts, "question" or "point" is preferred over "doubt".'
      };
    }

    const aiMsg: ConversationMessage = {
      id: `msg_ai_${Date.now()}`,
      sender: 'ai',
      text: aiReplyText,
      timestamp: new Date().toISOString(),
      feedback
    };

    const updatedSession: ConversationSession = {
      ...session,
      messages: [...currentHistory, aiMsg]
    };

    return {
      updatedSession,
      replyMessage: aiMsg
    };
  }

  /**
   * Generates natural partner replies that advance the dialogue with 1 clear follow-up question.
   */
  private static generatePartnerReply(scenario: SpeakingScenario, lastUserText: string, turnIndex: number): string {
    const isInterview = scenario.category === 'job_interview' || scenario.category === 'hr_interview';
    const isWorkplace = scenario.category === 'workplace_conversation' || scenario.category === 'meeting_discussion';

    if (turnIndex === 1) {
      if (isInterview) {
        return "Thank you for that context. Could you elaborate on a specific challenge you navigated with your team during that process, and what the final measurable outcome was?";
      }
      if (isWorkplace) {
        return "That makes practical sense. Looking at the upcoming sprint timeline, what would you say is the biggest technical dependency we need to unblock first?";
      }
      return "That sounds really interesting! How did you first get involved with that, and what was your favorite part of the experience?";
    }

    if (turnIndex === 2) {
      if (isInterview) {
        return "Excellent example of cross-functional ownership. If you had to tackle that same problem today with what you know now, what is one thing you would do differently?";
      }
      if (isWorkplace) {
        return "Understood. If I align with the product stakeholders on moving the delivery date back by two days, will that give your team enough breathing room for thorough testing?";
      }
      return "I can definitely appreciate that perspective. What are your main goals or plans around that over the coming months?";
    }

    // Wrap up dialogue gracefully after 3 turns
    return "Thank you for sharing that so clearly! That gave me a great understanding of your approach and communication style. Would you like to review our conversation insights now?";
  }

  /**
   * Generates a concise PostConversationReview report.
   */
  public static generateReviewReport(session: ConversationSession): PostConversationReview {
    const userMessages = session.messages.filter(m => m.sender === 'user');
    const totalWords = userMessages.reduce((sum, m) => sum + m.text.trim().split(/\s+/).filter(Boolean).length, 0);

    const keyStrengths: string[] = [
      'You maintained smooth conversational turn-taking and responded directly to each question.',
      totalWords >= 40
        ? 'You gave descriptive, comprehensive explanations with good supporting context.'
        : 'Your responses were concise and directly answered the primary inquiry.'
    ];

    const patternsToImprove: string[] = [
      'Practice expanding your answers with clear discourse connectors (e.g. "Specifically, ...", "As a result, ...").',
      'Take a comfortable breath before answering rather than beginning immediately.'
    ];

    const usefulPhrases: string[] = [
      'To put that into context...',
      'Our primary objective was to...',
      'From a collaboration perspective...'
    ];

    return {
      sessionId: session.id,
      mode: session.mode,
      turnsCount: userMessages.length,
      durationSeconds: Math.max(30, userMessages.length * 25),
      keyStrengths,
      patternsToImprove,
      usefulPhrases,
      vocabularyEncountered: ['collaboration', 'perspective', 'objective'],
      nextStepRecommendation: 'Try practicing in Workplace Mode next to continue building spontaneous professional confidence.',
      timestamp: new Date().toISOString()
    };
  }
}
