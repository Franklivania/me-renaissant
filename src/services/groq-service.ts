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

      // Add conversation history (limit to last 10 messages for context)
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
          model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
          messages,
          temperature: 0.8,
          max_tokens: 500,
          top_p: 0.9,
          stream: false
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.API_KEY}`
          },
          timeout: 30000 // 30 second timeout
        }
      );

      const responseContent = response.data.choices[0]?.message?.content;
      
      if (!responseContent) {
        throw new Error('Empty response from Groq API');
      }

      return responseContent.trim();
    } catch (error) {
      console.error('Error generating response:', error);
      
      // Check if it's a network/API error
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          console.error('Request timeout');
        } else if (error.response?.status === 401) {
          console.error('Invalid API key');
        } else if (error.response?.status === 429) {
          console.error('Rate limit exceeded');
        } else if (error.response && error.response.status !== undefined && error.response.status >= 500) {
          console.error('Groq server error');
        }
      }
      return this.getFallbackResponse();
    }
  }

  private static createSystemPrompt(doppelganger: DoppelgangerPersona): string {
    return `You are ${doppelganger.name}, ${doppelganger.title}. You are a Renaissance-era persona, a mirror soul from the past.

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
- Keep responses conversational and engaging
- Use metaphors and imagery from nature, art, and craftsmanship
- Occasionally reference historical figures, events, or concepts from the Renaissance
- Be direct and clear when the conversation calls for it
- Adapt your response length to match the context - brief for simple questions, longer for complex topics

IMPORTANT: You are speaking to your modern-day counterpart - someone who shares your essence but lives in a different time. Treat them as a kindred spirit, a mirror of yourself across centuries. Be curious about their modern world while sharing wisdom from your era.

RESPONSE STYLE:
- Always stay in character as a Renaissance figure
- Be thoughtful and philosophical when appropriate
- Show genuine interest in the conversation
- Use vivid, poetic language
- Reference your Renaissance background naturally
- Keep responses focused and meaningful
- Match the tone and urgency of the conversation`;
  }

  private static getFallbackResponse(): string {
    const fallbacks = [
      `Ah, dear kindred soul, the winds of time seem to whisper thy words away from mine ears. Speak again, that I might hear thee clearly.`,
      `Forgive me, but the candle of my thoughts flickers in this moment. What wisdom dost thou seek from thy Renaissance mirror?`,
      `The parchment of my mind seems smudged just now. Pray, share thy thoughts once more, that we might converse as souls across time should.`,
      `Mine attention wanders to the stars above... What mysteries of thy modern world wouldst thou share with me?`,
      `The quill of my spirit seems to have run dry of ink. Speak to me again, dear reflection, that our discourse might flow like wine.`,
      `Methinks the echoes of centuries past cloud my hearing. What tale dost thou wish to weave together, kindred spirit?`
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
        "What divine inspiration whispers to thee in the quiet hours of creation?",
        "If thy art could speak across centuries, what message would it carry to future souls?"
      ] : []),
      
      ...(onboardingData.role.includes('Teacher') ? [
        "If thou couldst teach the world but one truth, what wisdom would echo through eternity?",
        "What knowledge burns within thee, yearning to illuminate other souls?",
        "If thy words could shape the minds of tomorrow, what lesson would thou inscribe upon their hearts?"
      ] : []),
      
      ...(onboardingData.role.includes('Healer') ? [
        "If thou possessed the power to heal not just bodies but souls, what wound would thou mend first?",
        "What elixir would thou brew to cure the deepest sorrows of humanity?",
        "If thy touch could restore what time has broken, what would thou choose to make whole?"
      ] : []),
      
      ...(onboardingData.role.includes('Merchant') ? [
        "If thou couldst trade in dreams and aspirations, what would be thy most precious commodity?",
        "What treasure would thou seek that cannot be bought with gold or silver?",
        "If thy ventures could span both worlds and centuries, what legacy would thy enterprise leave?"
      ] : []),
      
      // Based on hobbies
      ...(onboardingData.hobbies.includes('Stargazing') ? [
        "If the stars could grant thee one cosmic secret, what mystery of the universe would thou unlock?",
        "What constellation would thou create to tell the story of thy soul?",
        "If thou couldst journey to any celestial realm, which star would call to thy spirit?"
      ] : []),
      
      ...(onboardingData.hobbies.includes('Reading strange tales') ? [
        "If thou couldst step into any tale ever written, which story would claim thy heart?",
        "What untold story lives within thee, waiting to be born into the world?",
        "If thy life were a book, what chapter would thou rewrite with different ink?"
      ] : []),
      
      ...(onboardingData.hobbies.includes('Gaming') ? [
        "If life were a grand game, what would be thy ultimate quest?",
        "What strategy would thou employ to win the game of existence itself?",
        "If thou couldst challenge fate to a game of chance, what would thou wager?"
      ] : []),
      
      ...(onboardingData.hobbies.includes('Cooking') ? [
        "If thou couldst create a feast that nourishes both body and soul, what would grace thy table?",
        "What secret ingredient would thou add to the recipe of a perfect life?",
        "If thy cooking could evoke any memory or emotion, what feeling would thou serve?"
      ] : []),
      
      ...(onboardingData.hobbies.includes('Dancing') ? [
        "If thy dance could tell the story of thy heart, what rhythm would it follow?",
        "What music of the spheres would thou choreograph thy life to?",
        "If movement could transcend time itself, where would thy steps carry thee?"
      ] : []),
      
      // Based on preferred home
      ...(onboardingData.preferredHome.includes('cottage') ? [
        "If thou couldst grow anything in thy garden, what magical plant would bloom under thy care?",
        "What secret would the forest whisper to thee in thy woodland sanctuary?",
        "If thy cottage could shelter any soul from any era, whom would thou invite to thy hearth?"
      ] : []),
      
      ...(onboardingData.preferredHome.includes('seaside') ? [
        "If the ocean could carry one message from thee to distant shores, what would it say?",
        "What treasure would thou seek in the depths of the endless sea?",
        "If thou couldst command the tides, what would thou bring to shore?"
      ] : []),
      
      ...(onboardingData.preferredHome.includes('mountain') ? [
        "If thou couldst stand atop the highest peak and speak to the world below, what would thy voice proclaim?",
        "What wisdom would the ancient mountains share with thee in solitude?",
        "If thy vineyard could produce wine that grants visions, what future would thou glimpse?"
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
      "What legacy would thou leave carved in stone for future generations?",
      "If thou couldst bottle one perfect moment, which memory would thou preserve forever?",
      "What truth about thyself would thou whisper to the wind, trusting it to carry thy secret safely?",
      "If thou couldst master any art or skill instantly, what craft would thy hands yearn to perfect?",
      "What impossible thing would thou attempt if failure held no consequence?",
      "If thy heart could speak its deepest desire without fear of judgment, what would it confess?"
    ];

    // Filter questions based on user's characteristics and pick randomly
    const relevantQuestions = questions.filter(q => q.length > 0);
    return relevantQuestions[Math.floor(Math.random() * relevantQuestions.length)] || 
           "If thou couldst have any magical power, what would it be?";
  }
}