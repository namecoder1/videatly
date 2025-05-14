import { openai } from "@ai-sdk/openai";
import { convertToCoreMessages, generateText } from "ai";

export async function POST(req: Request) {
  const { scriptData, ideaData } = await req.json();

  const sysMessage = ``

  const result = await generateText({
    model: openai('gpt-3.5-turbo'),
    system: sysMessage
  });
}