import { ChatCompletionMessageParam } from "openai/resources";
import { createCompletionWorkaround, parseJsonString } from "./ai-helper";
import {
  addUniqueTags,
  captureTab,
  navigateWithClick,
  inputText,
  scrollPage,
  openUrl,
  CommandResult,
  ImageCommandResult,
} from "./extension-helper";

interface runControllerProps {
  initialTask: string;
  initialMessages?: ChatCompletionMessageParam[];
  onMessageUpdate: (data: ChatCompletionMessageParam) => void;
  onToolUpdate: (data: CommandResult) => void;
}

export async function runController(input: runControllerProps) {
  const { initialTask, initialMessages, onMessageUpdate, onToolUpdate } = input;
  const messages: ChatCompletionMessageParam[] = initialMessages
    ? initialMessages
    : [
        {
          role: "user",
          content: initialTask,
        },
      ];
  await addUniqueTags();
  const imageState = await captureTab();
  messages.push({
    role: "user",
    content: [
      {
        type: "image_url",
        image_url: {
          url: imageState.image ?? "",
          detail: "auto",
        },
      },
      {
        type: "text",
        text: "Here is the initial state of the page.",
      },
    ],
  });
  onMessageUpdate(messages[messages.length - 1]);
  while (messages.length < 10) {
    const response = await createCompletionWorkaround(messages);
    console.log(response);
    if (response.choices[0].message.content === "done") {
      break;
    }
    const input = response.choices[0].message.content;
    messages.push(response.choices[0].message);
    onMessageUpdate(messages[messages.length - 1]);
    let toolResponse;
    try {
      toolResponse = await runTools(input ?? "", onToolUpdate);
      if (toolResponse === null) {
        break;
      } else {
        messages.push(toolResponse);
        onMessageUpdate(messages[messages.length - 1]);
      }
    } catch (e: any) {
      console.log({ error: e });
      //   messages.push({
      //     role: "user",
      //     content: e.message,
      //   });
      onToolUpdate({
        status: "Error",
        message: e,
      });
      break;
    }
  }
  if (messages.length >= 10) {
    console.log("Max messages reached");
    onMessageUpdate({
      role: "user",
      content: "Max messages reached",
    });
  }
}

async function runTools(
  input: string,
  onToolUpdate: (data: CommandResult | ImageCommandResult) => void
): Promise<ChatCompletionMessageParam | null> {
  const commands = parseJsonString(input);
  if (commands === null) {
    throw new Error("Invalid tool input");
  }
  console.log(commands);
  for (const command of commands) {
    if ("clickElementByTag" in command) {
      const result = await handleNavigateWithClick(command.clickElementByTag);
      onToolUpdate(result);
    } else if ("inputElementByTag" in command) {
      const result = await handleInputText(
        command.inputElementByTag,
        command.value
      );
      onToolUpdate(result);
    } else if ("scrollDown" in command) {
      const result = await handleScrollPage();
      onToolUpdate(result);
    } else if ("openUrlInCurrentTab" in command) {
      const result = await handleOpenUrl(command.openUrlInCurrentTab);
      onToolUpdate(result);
    } else if ("logAnswer" in command) {
      console.log(command.logAnswer);
      onToolUpdate({
        status: "Success",
        message: command.logAnswer,
      });
    } else if ("taskDone" in command) {
      console.log("Task done!");
      onToolUpdate({
        status: "Success",
        message: "Task done!",
      });
      return null;
    }
  }
  await new Promise((resolve) => setTimeout(resolve, 1000));
  await addUniqueTags();
  const imageState = await captureTab();
  onToolUpdate(imageState);

  return {
    role: "user",
    content: [
      {
        type: "image_url",
        image_url: {
          url: imageState.image ?? "",
          detail: "auto",
        },
      },
      {
        type: "text",
        text: "Here is the updated state of the page.",
      },
    ],
  };
}

async function handleNavigateWithClick(tag: string): Promise<CommandResult> {
  const response = await navigateWithClick(tag);
  await wait(1000); // wait for page to load in case of redirect
  await addUniqueTags();
  return response;
}

async function handleInputText(
  tag: string,
  text: string
): Promise<CommandResult> {
  const response = await inputText(tag, text);
  return response;
}

async function handleScrollPage(): Promise<CommandResult> {
  const response = await scrollPage();
  return response;
}

async function handleOpenUrl(url: string): Promise<CommandResult> {
  const response = await openUrl(url);
  await addUniqueTags();
  return response;
}

async function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
