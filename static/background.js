let id = 100;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log({ background: request });
  if (request.action === "captureTab") {
    chrome.tabs.captureVisibleTab({ format: "png" }, (screenshotUrl) => {
      console.log({screenshotUrl})
      sendResponse({ status: "Tab captured", dataUrl: screenshotUrl });
    });
    return true; // Return true to indicate you wish to send a response asynchronously
  }
});
