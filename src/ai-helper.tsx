import OpenAI from "openai";

// import { RunnableToolFunction } from 'openai/lib/RunnableFunction';
import { ChatCompletionMessageParam } from "openai/resources";

export type Command =
  | { clickElementByTag: string; reason: string }
  | { inputElementByTag: string; value: string; reason: string }
  | { scrollDown: boolean; reason: string }
  | { openUrlInCurrentTab: string; reason: string }
  | { logAnswer: string; reason: string }
  | { taskDone: boolean; reason: string };

export type Commands = Command[];

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

// note: this is a workaround for the fact that the chat API does not support function calling or respect system prompts (2023-11-09)
// note: for production, you should move this logic to a backend server and manage the task state from background.js
export async function createCompletionWorkaround(
  inputMessages: ChatCompletionMessageParam[]
) {
  const systemPrompt = `You are given a text interface to a web browser. 
    You can ONLY use JSON array of commands to respond and navigate the web page in the image:

    - clickElementByTag: Clicks any button or link element marked with a yellow tag name.
    - inputElementByTag: Inputs text into any input element marked with an orange tag name.
    - scrollDown: Scrolls down the page.
    - openUrlInCurrentTab: Opens a URL in the current tab.
    - logAnser: Logs the answer to the console.
    - taskDone: Ends the task.

    Response can ONLY be a well-formed JSON array of commands.

    Example response for the task "Send feedback saying that website is broken":

    [
        {
            "clickElementByTag": "4269",
            "reason": "clicked feedback button"
        },
        {
            "inputElementByTag": "5140",
            "value": "I would like to notify you that your website seems to be broken.",
            "reason": "input feedback text",
        },
        {
            "clickElementByTag": "8813",
            "reason": "clicked submit button"
        },
        {
            "logAnswer": "feedback sent",
            "reason": "log completion of the task"
        }
    ]
    `;
  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: systemPrompt,
    },
    ...inputMessages,
  ];

  const result = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    messages,
    max_tokens: 4096,
  });
  console.log(result);
  return result;
}

export function parseJsonString(jsonString: string): Commands | null {
  // Use regex to remove the 'json' prefix and backticks if they exist
  const regex = /.*```json\n([\s\S]*?)\n```.*/;

  // Replace the matched parts with just the JSON part
  const trimmedString = jsonString.replace(regex, "$1");

  try {
    const parsed = JSON.parse(trimmedString) satisfies Commands;
    return parsed;
  } catch (error) {
    console.error("Invalid JSON string", error);
    return null;
  }
}
