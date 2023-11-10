import React from "react";

import { ChatCompletionMessageParam } from "openai/resources";
import { ToolResult } from "./tool-controller";

export const ChatBubble = ({ message, role = "none" }: { message: ChatCompletionMessageParam | ToolResult | null, role?: string }) => {
    if (message === null) {
      return <div className="chat-bubble chat-bubble-info">Done</div>;
    }
    if ("role" in message) {
      return (
        <div className={`chat ${role === "user" ? "chat-start" : "chat-end"}`}>
          <div className={`chat-bubble  ${role === "user" ? "chat-bubble-primary" : "chat-bubble-secondary"}`}>
            {Array.isArray(message.content) ? (
              message.content.map((contentPart, index) => {
                if ("text" in contentPart) {
                  return <p key={index}>{contentPart.text}</p>;
                } else if ("image_url" in contentPart) {
                  return <img key={index} src={contentPart.image_url.url} alt="content part" />;
                }
              })
            ) : typeof message.content === "string" ? (
              <p>{message.content}</p>
            ) : null}
          </div>
        </div>
      );
    }
    if ("status" in message) {
      return (
        <div className="chat chat-end">
          <div className="chat-bubble chat-bubble-accent">
            {(message as ToolResult).message}:{(message as ToolResult).reason}:{message.status === "Success" ? "✅" : "❌"}
          </div>
        </div>
      );
    }
    if ("image" in message) {
      return (
        <div className="chat chat-start">
          <div className="chat-bubble chat-bubble-info">
            <img src={(message as ToolResult).image} alt="page preview" />
          </div>
        </div>
      );
    }
  };