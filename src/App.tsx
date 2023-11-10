import React, { useEffect } from "react";
import {
  getChromeStorage,
} from "./extension-helper";
import { useAI } from "./useAI";
import { ChatCompletionMessageParam } from "openai/resources";
import { ToolResult } from "./tool-controller";
import { ChatBubble } from "./ChatBubble";

export const App: React.FC = () => {
  const [input, setInput] = React.useState<string>("");
  const [hasPreviousState, setHasPreviousState] = React.useState<boolean>(false);

  useEffect(() => {
    getChromeStorage("chatData").then((chatData) => {
      setHasPreviousState(Boolean(chatData));
    });
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = (e.currentTarget.elements[0] as HTMLInputElement).value;
    setInput(input);
  };

  return (
    <div className="flex flex-col gap-4 p-3 w-96">
      <h1 className="text-2xl font-bold">GPT4-Vision Assistant</h1>
      <form className="flex flex-col" onSubmit={handleSubmit}>
        {(input || hasPreviousState) && <AIChat input={input} />}
        <div className="flex gap-2">
          <textarea
            className="textarea textarea-bordered h-24 leading-3"
            placeholder="Enter task description"
          />
          <button className="btn btn-primary flex-grow" type="submit">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}

const AIChat = ({ input }: { input: string }) => {
  const data = useAI(input);

  React.useEffect(() => {
    if (data.length === 0) return;
    let element = document.getElementById("list-end");
    element?.scrollIntoView({
      behavior: "smooth",
      block: "end",
      inline: "nearest",
    });
  }, [data]);

  return (
    <div className="flex flex-col gap-4">
      {data?.map((message: ChatCompletionMessageParam | ToolResult | null, index: number) => (
        <ChatBubble key={index} message={message} role={message ? ('role' in message ? message.role : "") : ""} />
      ))}
      <div id="list-end" className="h-8" />
    </div>
  );
};

