import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY,
});

export interface GeneratedCode {
  files: Record<string, string>;
  framework: string;
  language: string;
  deploymentInstructions: string;
}

/**
 * توليد مشروع كامل (متوافق مع OpenAI SDK v6)
 */
export async function generateProjectCode(
  prompt: string,
  framework?: string,
  language?: string
): Promise<GeneratedCode> {
  if (!prompt?.trim()) {
    throw new Error("Prompt cannot be empty");
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert full-stack developer who generates complete project structures.

Return JSON ONLY:

{
  "files": { "file/path": "content" },
  "framework": "react|vue|angular|vanilla|nodejs|python|php",
  "language": "javascript|typescript|python|php",
  "deploymentInstructions": "steps..."
}`,
        },
        {
          role: "user",
          content: `Generate a complete project for: ${prompt}
${framework ? `Preferred framework: ${framework}` : ""}
${language ? `Preferred language: ${language}` : ""}
Include all configs and source code.`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const text = response.choices[0]?.message?.content;
    if (!text) throw new Error("No JSON returned");

    const result = JSON.parse(text);

    return {
      files: result.files ?? {},
      framework: result.framework ?? "react",
      language: result.language ?? "javascript",
      deploymentInstructions: result.deploymentInstructions ?? "",
    };
  } catch (err) {
    console.error("Error generating project:", err);
    throw new Error("Failed to generate project code");
  }
}

/**
 * تنظيف الكود من fences
 */
function sanitizeCodeOutput(rawOutput: string): string {
  let cleaned = rawOutput.trim();
  cleaned = cleaned.replace(/^```.*$/gm, "").replace(/^~~~.*$/gm, "").trim();
  return cleaned || "";
}

/**
 * تحسين الكود
 */
export async function improveCode(
  code: string,
  improvements: string
): Promise<string> {
  if (!code?.trim()) throw new Error("Invalid code input");
  if (!improvements?.trim()) throw new Error("Invalid improvements input");

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an expert developer. Return ONLY the improved code with no markdown or explanation.",
        },
        {
          role: "user",
          content: `Improve this code according to:
${improvements}

Original code:
${code}

Return ONLY the code:`,
        },
      ],
    });

    const text = response.choices[0]?.message?.content;
    if (!text) throw new Error("No response received");

    return sanitizeCodeOutput(text);
  } catch (err) {
    console.error("Error improving code:", err);
    throw new Error("Failed to improve code");
  }
}
