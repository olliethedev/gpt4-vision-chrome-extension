import React, { useEffect } from "react";
import { CommandResult, ImageCommandResult, getChromeStorage } from "./extension-helper";
import { useAI } from "./useAI";
import { ChatCompletionMessageParam } from "openai/resources";

export function App() {

    const [input, setInput] = React.useState("");

    const [hasPreviousState, setHasPreviousState] = React.useState(false);

    useEffect(() => {
        getChromeStorage("chatData").then((value) => {
            console.log({prevState:value});
            setHasPreviousState(value);
        });
    },[]);

  return (
    <div className="flex flex-col gap-4 p-3 w-96">
      <h1 className="text-2xl font-bold">GPT4-Vision Assistant</h1>
      <form
        className="flex flex-col"
        onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          //get the value of the input
          const input = (e.currentTarget.elements[0] as HTMLInputElement).value;
          setInput(input);
        }}
      >
        <div className="flex gap-2">
        <textarea className="textarea textarea-bordered h-24" placeholder="Enter task description" />
        <button className="btn btn-primary" type="submit" >Submit</button>
        </div>
      </form>
      {(input||hasPreviousState) && (<AIChat input={input} />)}

      
    </div>
  );
}

const AIChat = ({input}: {input:string}) => {
    const data = useAI(input); 
    return (
        <div className="flex flex-col gap-4">
            {data?.map((message:ChatCompletionMessageParam | CommandResult | ImageCommandResult | null) => {
                if(message === null){
                    return <div className="chat-bubble chat-bubble-info">Done</div>
                }
                if("role" in message){
                    return (
                        <div className="chat-bubble">
                            {Array.isArray(message.content) ? message.content.map((contentPart, index) => {
                                if ('text' in contentPart) {
                                    return <p key={index}>{contentPart.text}</p>;
                                } else if ('image_url' in contentPart) {
                                    return <img key={index} src={contentPart.image_url.url} alt="content part" />;
                                }
                            }) : typeof message.content === 'string' ? <p>{message.content}</p> : null}
                        </div>
                    );
                }
                if("status" in message){
                    return <div className="chat-bubble chat-bubble-accent">{(message as CommandResult).status}:{(message as CommandResult).message}</div>
                }
                if("image" in message){
                    return <div className="chat-bubble"><img src={(message as ImageCommandResult).image} alt="command result"/></div>
                }
            })}
        </div>
    );
}
