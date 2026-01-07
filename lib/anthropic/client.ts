import Anthropic from '@anthropic-ai/sdk';

let anthropicClient: Anthropic | null = null;

export const getAnthropicClient = (): Anthropic => {
  if (!anthropicClient) {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set');
    }

    anthropicClient = new Anthropic({
      apiKey,
    });
  }

  return anthropicClient;
};

export const getModelName = (): string => {
  return process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5-20250929';
};
