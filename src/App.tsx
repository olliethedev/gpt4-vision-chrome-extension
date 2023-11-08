import React, { useCallback } from "react";
import { createCompletion, createCompletionWorkaround, navigateWithClick } from "./ai-helper";

export function App() {

  const [imageUrl, setImageUrl] = React.useState<string>("");

  const [answer, setAnswer] = React.useState<string>("");

  const handleAddTagsClick = () => {

    // Query the active tab, which will be the current window when the user clicked the popup
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      // Send a message to the content script
      if (!tabs[0].id) return;
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "addUniqueTags" },
        (response) => {
          // Handle the response here
          console.log({ response });
        }
      );
    });
  };

  const handleCaptureClick = () => {
    console.log("Capture clicked");
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0].id) return;
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "captureTab" },
        (response) => {
          console.log({ response });
          if (response && response.status === "Tab captured") {
            // Here you have the image as a data URL
            const imageDataUrl = response.image;
            console.log(imageDataUrl);
            // create new img element and set its src to the dataURL
            const img = document.createElement("img");
            img.src = imageDataUrl;
            document.body.appendChild(img);
            // createCompletion(imageDataUrl).then((res) => {
            //   console.log(res);
            // });
            setImageUrl(imageDataUrl);
          }
        }
      );
    });
  };
  return (
    <div className="w-72 flex flex-col gap-4">
      <h1 className="text-2xl font-bold">GPT4-Vision Assistant</h1>
      <button className="btn btn-primary" onClick={handleAddTagsClick}>
        Add Tags
      </button>
      <button className="btn btn-primary" onClick={handleCaptureClick}>
        Capture
      </button>
      <form
        className="flex flex-col"
        onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          //get the value of the input
          const input = (e.currentTarget.elements[0] as HTMLInputElement).value;
          navigateWithClick(input);
        }}
      >
        <input className="input" type="text" placeholder="button id" />
      </form>
      {imageUrl && (
        <form className="flex flex-col" onSubmit={async (e) => {
            e.preventDefault();
            const input = (e.currentTarget.elements[0] as HTMLInputElement).value;
            const result = await createCompletionWorkaround(imageUrl, input);
            setAnswer(result.choices[0].message.content??"none");
        }}>
          <input
            className="input"
            type="text"
            placeholder="task description"
          />
          </form>
      )}

      <span className="text-base text-amber-200"
      >{answer}</span>
      
    </div>
  );
}
