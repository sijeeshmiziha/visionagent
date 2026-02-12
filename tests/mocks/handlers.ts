import { http, HttpResponse } from 'msw';

export const handlers = [
  // OpenAI Chat Completions
  http.post('https://api.openai.com/v1/chat/completions', async ({ request }) => {
    const body = (await request.json()) as {
      tools?: { function: { name: string } }[];
    };
    const hasTools = body.tools && body.tools.length > 0;

    if (hasTools) {
      return HttpResponse.json({
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: '',
              tool_calls: [
                {
                  id: 'call_mock123',
                  type: 'function',
                  function: {
                    name: body.tools?.[0]?.function.name ?? 'unknown',
                    arguments: JSON.stringify({ test: true }),
                  },
                },
              ],
            },
            finish_reason: 'tool_calls',
          },
        ],
        usage: { prompt_tokens: 50, completion_tokens: 20, total_tokens: 70 },
      });
    }

    return HttpResponse.json({
      choices: [
        {
          index: 0,
          message: { role: 'assistant', content: 'Mocked OpenAI response' },
          finish_reason: 'stop',
        },
      ],
      usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
    });
  }),

  // Anthropic Messages
  http.post('https://api.anthropic.com/v1/messages', async () => {
    return HttpResponse.json({
      id: 'msg_mock123',
      type: 'message',
      role: 'assistant',
      content: [{ type: 'text', text: 'Mocked Anthropic response' }],
      model: 'claude-3-haiku-20240307',
      stop_reason: 'end_turn',
      usage: { input_tokens: 12, output_tokens: 8 },
    });
  }),

  // Google Gemini (uses different API structure)
  http.post(/generativelanguage\.googleapis\.com/, async () => {
    return HttpResponse.json({
      candidates: [
        {
          content: {
            parts: [{ text: 'Mocked Gemini response' }],
            role: 'model',
          },
          finishReason: 'STOP',
        },
      ],
      usageMetadata: {
        promptTokenCount: 10,
        candidatesTokenCount: 5,
        totalTokenCount: 15,
      },
    });
  }),

  // Figma API - GET /v1/me
  http.get('https://api.figma.com/v1/me', () => {
    return HttpResponse.json({
      id: 'figma-user-123',
      email: 'test@example.com',
      handle: 'testuser',
    });
  }),
];
