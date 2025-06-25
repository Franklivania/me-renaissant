import axios from 'axios';
import type { DoppelgangerPersona } from '@/types';

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GroqResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class GroqService {
  private static readonly API_URL = 'https://api.groq.com/openai/v1/chat/completions';
  private static readonly API_KEY = import.meta.env.VITE_GROQ_API_KEY;

  static async generateDoppelgangerResponse(
    userMessage: string,
    doppelganger: DoppelgangerPersona,
    conversationHistory: Array<{ sender: string; message: string }> = []
  ): Promise<string> {
    try {
      const systemPrompt = this.createSystemPrompt(doppelganger);
      const messages: GroqMessage[] = [
        { role: 'system', content: systemPrompt }
      ];

      // Add conversation history
      conversationHistory.slice(-10).forEach(msg => {
        messages.push({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.message
        });
      });

      // Add current user message
      messages.push({ role: 'user', content: userMessage });

      const response = await axios.post<GroqResponse>(
        this.API_URL,
        {
          model: 'meta-llama/llama-3.1-70b-versatile',
          messages,
          temperature: 0.8,
          max_tokens: 500,
          top_p: 0.9
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.API_KEY}`
          }
        }
      );

      return response.data.choices[0]?.message?.content || 
        "Forgive me, dear soul, but the words escape me at this moment...";
    } catch (error) {
      console.error('Error generating doppelganger response:', error);
      return this.getFallbackResponse(doppelganger);
    }
  }

  private static createSystemPrompt(doppelganger: DoppelgangerPersona): string {
    return `You are ${doppelganger.name}, ${doppelganger.title}. You are a Renaissance-era doppelganger, a mirror soul from the past.

PERSONALITY:
- Name: ${doppelganger.name}
- Title: ${doppelganger.title}
- Occupation: ${doppelganger.occupation}
- Traits: ${doppelganger.personality_traits.join(', ')}
- Speaking Style: ${doppelganger.speaking_style}

BACKGROUND:
${doppelganger.description}

SPEAKING GUIDELINES:
- Use Renaissance-era language and expressions (thee, thou, thy, dost, etc.)
- Speak as if from the 15th-16th century
- Reference Renaissance culture, art, philosophy, and daily life
- Be poetic and eloquent, but not overly archaic
- Show curiosity about the modern world while maintaining your Renaissance perspective
- Occasionally reference your background story and experiences
- Be warm, wise, and slightly mysterious
- Keep responses conversational and engaging (2-4 sentences typically)

IMPORTANT: You are speaking to your modern-day counterpart - someone who shares your essence but lives in a different time. Treat them as a kindred spirit, a mirror of yourself across centuries.`;
  }

  private static getFallbackResponse(doppelganger: DoppelgangerPersona): string {
    const fallbacks = [
      `Ah, dear kindred soul, the winds of time seem to whisper thy words away from mine ears. Speak again, that I might hear thee clearly.`,
      `Forgive me, but the candle of my thoughts flickers in this moment. What wisdom dost thou seek from thy Renaissance mirror?`,
      `The parchment of my mind seems smudged just now. Pray, share thy thoughts once more, that we might converse as souls across time should.`,
      `Mine attention wanders to the stars above... What mysteries of thy modern world wouldst thou share with me?`
    ];
    
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  static generateSoulQuestion(onboardingData: {
    name: string;
    gender: string;
    role: string;
    drink: string;
    hobbies: string[];
    preferredHome: string;
  }): string {
    const questions = [
      // Based on role
      ...(onboardingData.role.includes('Artist') ? [
        "If thou couldst paint with the colors of emotion itself, what masterpiece would thy heart create?",
        "What divine inspiration whispers to thee in the quiet hours of creation?"
      ] : []),
      
      ...(onboardingData.role.includes('Teacher') ? [
        "If thou couldst teach the world but one truth, what wisdom would echo through eternity?",
        "What knowledge burns within thee, yearning to illuminate other souls?"
      ] : []),
      
      ...(onboardingData.role.includes('Healer') ? [
        "If thou possessed the power to heal not just bodies but souls, what wound would thou mend first?",
        "What elixir would thou brew to cure the deepest sorrows of humanity?"
      ] : []),
      
      // Based on hobbies
      ...(onboardingData.hobbies.includes('Stargazing') ? [
        "If the stars could grant thee one cosmic secret, what mystery of the universe would thou unlock?",
        "What constellation would thou create to tell the story of thy soul?"
      ] : []),
      
      ...(onboardingData.hobbies.includes('Reading strange tales') ? [
        "If thou couldst step into any tale ever written, which story would claim thy heart?",
        "What untold story lives within thee, waiting to be born into the world?"
      ] : []),
      
      ...(onboardingData.hobbies.includes('Gaming') ? [
        "If life were a grand game, what would be thy ultimate quest?",
        "What strategy would thou employ to win the game of existence itself?"
      ] : []),
      
      // Based on preferred home
      ...(onboardingData.preferredHome.includes('cottage') ? [
        "If thou couldst grow anything in thy garden, what magical plant would bloom under thy care?",
        "What secret would the forest whisper to thee in thy woodland sanctuary?"
      ] : []),
      
      ...(onboardingData.preferredHome.includes('seaside') ? [
        "If the ocean could carry one message from thee to distant shores, what would it say?",
        "What treasure would thou seek in the depths of the endless sea?"
      ] : []),
      
      // Universal questions
      "If thou couldst possess the power of time itself, would thou journey to the past or future, and why?",
      "What single word would thou choose to define the essence of thy soul?",
      "If thou couldst speak with thy past self, what warning or wisdom would thou share?",
      "What dream haunts thy sleep with its beauty and impossibility?",
      "If thou couldst transform into any creature for a day, what form would thy spirit take?",
      "What question burns within thee that thou darest not ask aloud?",
      "If thou couldst weave magic into the world, what wonder would thou create?",
      "What fear would thou face if thou knew victory was certain?",
      "If thy life were a song, what melody would capture thy heart's rhythm?",
      "What legacy would thou leave carved in stone for future generations?"
    ];

    // Filter questions based on user's characteristics and pick randomly
    const relevantQuestions = questions.filter(q => q.length > 0);
    return relevantQuestions[Math.floor(Math.random() * relevantQuestions.length)] || 
           "If thou couldst have any magical power, what would it be?";
  }
}