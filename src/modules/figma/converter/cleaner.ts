import type { Model } from '../../../lib/types/model';
import { createModel } from '../../../lib/models/create-model';
import type { ModelConfig } from '../../../lib/types/model';
import { CLEANUP_SYSTEM_PROMPT } from './cleanup-prompt';

export async function cleanupGeneratedCode(
  code: string,
  modelOrConfig?: Model | ModelConfig
): Promise<string> {
  try {
    const model =
      modelOrConfig && 'invoke' in modelOrConfig
        ? modelOrConfig
        : createModel(
            (modelOrConfig as ModelConfig) ?? {
              provider: 'google',
              model: 'gemini-2.0-flash',
            }
          );

    const response = await model.invoke([
      { role: 'system', content: CLEANUP_SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Here is the code to clean:\n\n<vibe-code>\n${code}\n</vibe-code>`,
      },
    ]);

    const codeMatch = response.text.match(/<vibe-code>([\s\S]*?)<\/vibe-code>/);

    if (!codeMatch?.[1]) {
      return code;
    }

    return codeMatch[1].trim();
  } catch {
    return code;
  }
}
