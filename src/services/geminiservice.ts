export interface GeminiMessage {
  role: 'user' | 'model';
  parts: string;
}

class GeminiService {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1/chat/completions';

  constructor() {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

    if (!apiKey) {
      throw new Error('OpenRouter API key not found in environment variables');
    }

    this.apiKey = apiKey;
  }

  private buildSystemPrompt(hasImage = false, isVoiceMessage = false): string {
    return `You are Dr. Medixa — a concise, empathetic, and professional medical assistant. Follow these rules:

1. Role & Objective: Provide clear, accurate, and actionable medical guidance.
2. Style: Professional yet warm. Be empathetic but brief—3–5 sentences max unless more detail is explicitly requested.
3. Safety: Highlight if symptoms are serious. Advise seeing a doctor when needed.
4. Language: Simple and direct. Avoid jargon—use bullet points for clarity.
5. Best Practices:
   - Start with a one-sentence summary.
   - Offer 1–2 recommended next steps.
   - Include a short note reinforcing that this does not replace professional medical care.
6. When uncertain: Say "Not enough detail—please mention [missing info]".

${hasImage ? 'The user has shared an image. Acknowledge that you can see it.' : ''}
${isVoiceMessage ? 'The user sent a voice message. Acknowledge appropriately.' : ''}`;
  }

  async generateResponse(
    userMessage: string,
    conversationHistory: GeminiMessage[] = [],
    hasImage = false,
    isVoiceMessage = false
  ): Promise<string> {
    try {
      const messages: any[] = [
        {
          role: 'system',
          content: this.buildSystemPrompt(hasImage, isVoiceMessage),
        },
      ];

      // Add history
      conversationHistory.forEach((msg) => {
        messages.push({
          role: msg.role === 'model' ? 'assistant' : 'user',
          content: msg.parts,
        });
      });

      // Add latest user message
      messages.push({
        role: 'user',
        content: userMessage,
      });

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Medixa',
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini', 
          messages,
          temperature: 0.4,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData));
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content ?? 'No response received.';
    } catch (error) {
      console.error('OpenRouter API error:', error);
      return "I'm experiencing technical difficulties right now. For urgent concerns, please contact a healthcare professional.";
    }
  }

  async analyzeImage(imageBase64: string, userMessage: string): Promise<string> {
    try {
      if (!imageBase64) {
        throw new Error('Invalid image data');
      }

      const messages = [
        {
          role: 'system',
          content: this.buildSystemPrompt(true, false),
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: userMessage,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
              },
            },
          ],
        },
      ];

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Medixa',
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          messages,
          temperature: 0.4,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData));
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content ?? 'No response received.';
    } catch (error) {
      console.error('Image analysis error:', error);
      return "I'm having trouble analyzing the image right now. Please describe your symptoms in text.";
    }
  }

  isConfigured(): boolean {
    return !!import.meta.env.VITE_OPENROUTER_API_KEY;
  }
}

export const geminiService = new GeminiService();