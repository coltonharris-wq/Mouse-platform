// LLM Provider Abstraction Layer
// Switches between free (Ollama) and paid (Moonshot/Kimi) LLMs based on customer tier

import { TierManager, getTierManager, LLMProvider, TierName } from './tier-system';

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMRequest {
  messages: LLMMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface LLMResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  costUsd: number;
  provider: LLMProvider;
  model: string;
}

export interface LLMStreamChunk {
  content: string;
  done: boolean;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// Cost per 1K tokens (approximate)
const LLM_PRICING: Record<string, { input: number; output: number }> = {
  'qwen2.5:0.5b': { input: 0, output: 0 }, // Free local model
  'qwen2.5:1.5b': { input: 0, output: 0 }, // Free local model
  'qwen2.5:7b': { input: 0, output: 0 }, // Free local model
  'llama3.2:1b': { input: 0, output: 0 }, // Free local model
  'llama3.2:3b': { input: 0, output: 0 }, // Free local model
  'kimi-k2.5': { input: 0.002, output: 0.008 }, // Moonshot pricing
  'claude-3-opus': { input: 0.015, output: 0.075 }, // Anthropic pricing
  'claude-3-sonnet': { input: 0.003, output: 0.015 },
  'claude-3-haiku': { input: 0.00025, output: 0.00125 },
  'gpt-4': { input: 0.03, output: 0.06 },
  'gpt-4-turbo': { input: 0.01, output: 0.03 },
  'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
};

// Free tier model options (Ollama)
const FREE_TIER_MODELS = [
  'qwen2.5:0.5b',  // Fastest, lowest quality
  'qwen2.5:1.5b',  // Balanced
  'llama3.2:1b',   // Alternative small model
];

// Default model per tier
const DEFAULT_MODELS: Record<TierName, string> = {
  free: 'qwen2.5:0.5b',
  pro: 'kimi-k2.5',
  enterprise: 'kimi-k2.5',
};

export class LLMProviderManager {
  private tierManager: TierManager;
  private ollamaUrl: string;
  private moonshotApiKey: string;
  private moonshotBaseUrl: string;

  constructor() {
    this.tierManager = getTierManager();
    this.ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
    this.moonshotApiKey = process.env.MOONSHOT_API_KEY || '';
    this.moonshotBaseUrl = process.env.MOONSHOT_BASE_URL || 'https://api.moonshot.ai/v1';
  }

  /**
   * Send a chat completion request
   * Automatically selects provider based on customer tier
   */
  async chat(
    customerId: string,
    employeeId: string | null,
    request: LLMRequest
  ): Promise<{ success: boolean; response?: LLMResponse; error?: string; upgradePrompt?: any }> {
    // Check if customer can send message
    const checkResult = await this.tierManager.checkMessageAllowed(customerId);
    
    if (!checkResult.allowed) {
      // Record upgrade prompt
      if (checkResult.upgradePrompt) {
        await this.tierManager.recordUpgradePrompt(
          customerId,
          checkResult.upgradePrompt.type,
          { reason: checkResult.reason }
        );
      }

      return {
        success: false,
        error: checkResult.reason,
        upgradePrompt: checkResult.upgradePrompt,
      };
    }

    // Get appropriate provider for customer
    const providerConfig = await this.tierManager.getLLMProviderForCustomer(customerId);
    
    let response: LLMResponse;
    let isPaidLlm = false;

    try {
      if (providerConfig.provider === 'ollama') {
        response = await this.callOllama(request, providerConfig.model);
        isPaidLlm = false;
      } else if (providerConfig.provider === 'moonshot') {
        response = await this.callMoonshot(request, providerConfig.model);
        isPaidLlm = true;
      } else {
        // Fallback to Ollama for unknown providers
        response = await this.callOllama(request, 'qwen2.5:0.5b');
        isPaidLlm = false;
      }

      // Record usage
      await this.tierManager.recordMessageUsage(
        customerId,
        employeeId,
        providerConfig.provider,
        isPaidLlm,
        response.costUsd
      );

      return { success: true, response };
    } catch (error) {
      console.error('LLM call failed:', error);
      
      // If paid LLM failed, try fallback to free Ollama for free tier users
      if (providerConfig.provider !== 'ollama') {
        try {
          console.log('Falling back to Ollama for customer:', customerId);
          response = await this.callOllama(request, 'qwen2.5:0.5b');
          
          await this.tierManager.recordMessageUsage(
            customerId,
            employeeId,
            'ollama',
            false,
            0
          );

          return { success: true, response };
        } catch (fallbackError) {
          console.error('Fallback LLM call also failed:', fallbackError);
        }
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'LLM request failed',
      };
    }
  }

  /**
   * Stream a chat completion
   */
  async *streamChat(
    customerId: string,
    employeeId: string | null,
    request: LLMRequest
  ): AsyncGenerator<LLMStreamChunk, void, unknown> {
    // Check if customer can send message
    const checkResult = await this.tierManager.checkMessageAllowed(customerId);
    
    if (!checkResult.allowed) {
      yield {
        content: checkResult.upgradePrompt?.message || 'Message limit reached. Please upgrade to continue.',
        done: true,
      };
      return;
    }

    // Get appropriate provider
    const providerConfig = await this.tierManager.getLLMProviderForCustomer(customerId);
    
    let totalTokens = 0;
    let promptTokens = 0;
    let fullContent = '';

    try {
      if (providerConfig.provider === 'ollama') {
        for await (const chunk of this.streamOllama(request, providerConfig.model)) {
          fullContent += chunk.content;
          yield chunk;
          if (chunk.done && chunk.usage) {
            totalTokens = chunk.usage.totalTokens;
            promptTokens = chunk.usage.promptTokens;
          }
        }
      } else if (providerConfig.provider === 'moonshot') {
        for await (const chunk of this.streamMoonshot(request, providerConfig.model)) {
          fullContent += chunk.content;
          yield chunk;
          if (chunk.done && chunk.usage) {
            totalTokens = chunk.usage.totalTokens;
            promptTokens = chunk.usage.promptTokens;
          }
        }
      }

      // Calculate cost
      const costUsd = this.calculateCost(providerConfig.model, promptTokens, totalTokens - promptTokens);

      // Record usage
      await this.tierManager.recordMessageUsage(
        customerId,
        employeeId,
        providerConfig.provider,
        providerConfig.provider !== 'ollama',
        costUsd
      );
    } catch (error) {
      console.error('Streaming LLM call failed:', error);
      yield {
        content: 'Sorry, I encountered an error. Please try again.',
        done: true,
      };
    }
  }

  /**
   * Call Ollama (free local LLM)
   */
  private async callOllama(request: LLMRequest, model: string): Promise<LLMResponse> {
    const response = await fetch(`${this.ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: request.messages,
        stream: false,
        options: {
          temperature: request.temperature ?? 0.7,
          num_predict: request.maxTokens ?? 1024,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Estimate token count (Ollama doesn't return exact counts)
    const promptTokens = this.estimateTokens(
      request.messages.map(m => m.content).join(' ')
    );
    const completionTokens = this.estimateTokens(data.message?.content || '');

    return {
      content: data.message?.content || '',
      usage: {
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
      },
      costUsd: 0, // Free
      provider: 'ollama',
      model,
    };
  }

  /**
   * Stream from Ollama
   */
  private async *streamOllama(
    request: LLMRequest,
    model: string
  ): AsyncGenerator<LLMStreamChunk, void, unknown> {
    const response = await fetch(`${this.ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: request.messages,
        stream: true,
        options: {
          temperature: request.temperature ?? 0.7,
          num_predict: request.maxTokens ?? 1024,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama stream error: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    let fullContent = '';
    const promptText = request.messages.map(m => m.content).join(' ');
    const promptTokens = this.estimateTokens(promptText);

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.message?.content) {
              fullContent += data.message.content;
              yield {
                content: data.message.content,
                done: false,
              };
            }
            if (data.done) {
              const completionTokens = this.estimateTokens(fullContent);
              yield {
                content: '',
                done: true,
                usage: {
                  promptTokens,
                  completionTokens,
                  totalTokens: promptTokens + completionTokens,
                },
              };
              return;
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    // Final chunk with usage
    const completionTokens = this.estimateTokens(fullContent);
    yield {
      content: '',
      done: true,
      usage: {
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
      },
    };
  }

  /**
   * Call Moonshot API (Kimi K2.5)
   */
  private async callMoonshot(request: LLMRequest, model: string): Promise<LLMResponse> {
    const response = await fetch(`${this.moonshotBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.moonshotApiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: request.messages,
        // kimi-k2.5 is a reasoning model — only temperature=1 allowed
        max_tokens: request.maxTokens ?? 1024,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Moonshot error: ${error}`);
    }

    const data = await response.json();
    const usage = data.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
    
    const costUsd = this.calculateCost(
      model,
      usage.prompt_tokens,
      usage.completion_tokens
    );

    return {
      content: data.choices?.[0]?.message?.content || '',
      usage: {
        promptTokens: usage.prompt_tokens,
        completionTokens: usage.completion_tokens,
        totalTokens: usage.total_tokens,
      },
      costUsd,
      provider: 'moonshot',
      model,
    };
  }

  /**
   * Stream from Moonshot API
   */
  private async *streamMoonshot(
    request: LLMRequest,
    model: string
  ): AsyncGenerator<LLMStreamChunk, void, unknown> {
    const response = await fetch(`${this.moonshotBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.moonshotApiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: request.messages,
        // kimi-k2.5 is a reasoning model — only temperature=1 allowed
        max_tokens: request.maxTokens ?? 1024,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Moonshot stream error: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    let fullContent = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6);
            if (dataStr === '[DONE]') continue;

            try {
              const data = JSON.parse(dataStr);
              const delta = data.choices?.[0]?.delta?.content || '';
              if (delta) {
                fullContent += delta;
                yield {
                  content: delta,
                  done: false,
                };
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    yield {
      content: '',
      done: true,
    };
  }

  /**
   * Calculate cost based on model and token usage
   */
  private calculateCost(model: string, promptTokens: number, completionTokens: number): number {
    const pricing = LLM_PRICING[model] || { input: 0, output: 0 };
    const inputCost = (promptTokens / 1000) * pricing.input;
    const outputCost = (completionTokens / 1000) * pricing.output;
    return Number((inputCost + outputCost).toFixed(6));
  }

  /**
   * Estimate token count (rough approximation)
   * 1 token ≈ 4 characters for English text
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  /**
   * Get available models for a tier
   */
  async getAvailableModels(tier: TierName): Promise<string[]> {
    if (tier === 'free') {
      return FREE_TIER_MODELS;
    }
    return ['kimi-k2.5', 'claude-3-sonnet', 'gpt-4-turbo'];
  }

  /**
   * Check if Ollama is available
   */
  async isOllamaAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.ollamaUrl}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get recommended model for task complexity
   */
  getRecommendedModel(tier: TierName, complexity: 'simple' | 'medium' | 'complex'): string {
    if (tier === 'free') {
      switch (complexity) {
        case 'simple':
          return 'qwen2.5:0.5b';
        case 'medium':
          return 'qwen2.5:1.5b';
        case 'complex':
          return 'qwen2.5:1.5b'; // Best available on free tier
      }
    }
    return 'kimi-k2.5'; // Default to best for paid tiers
  }
}

// Singleton instance
let llmProviderManager: LLMProviderManager | null = null;

export function getLLMProviderManager(): LLMProviderManager {
  if (!llmProviderManager) {
    llmProviderManager = new LLMProviderManager();
  }
  return llmProviderManager;
}

// Quick chat helper for employees
export async function employeeChat(
  customerId: string,
  employeeId: string,
  message: string,
  context?: string
): Promise<{ success: boolean; response?: string; error?: string }> {
  const manager = getLLMProviderManager();
  
  const messages: LLMMessage[] = [
    {
      role: 'system',
      content: context || 'You are a helpful AI employee. Be concise and professional.',
    },
    {
      role: 'user',
      content: message,
    },
  ];

  const result = await manager.chat(customerId, employeeId, {
    messages,
    temperature: 0.7,
    maxTokens: 1024,
  });

  if (result.success && result.response) {
    return {
      success: true,
      response: result.response.content,
    };
  }

  return {
    success: false,
    error: result.error || 'Chat failed',
  };
}
