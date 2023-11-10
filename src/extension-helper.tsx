export interface CommandResult {
  status: "Success" | "Error";
  message: string;
}

export interface ImageCommandResult extends CommandResult {
  image?: string;
}

export async function navigateWithClick(tag: string): Promise<CommandResult> {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]?.id) {
        reject("Something went wrong.");
        return;
      }
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "clickElementByTag", uniqueTag: tag },
        (response) => {
          if (response?.status === "Success") {
            console.log("Click successful!");
            resolve(response);
          } else {
            console.log("Element not found.");
            reject(response.message);
          }
        }
      );
    });
  });
}

export async function inputText(
  tag: string,
  text: string
): Promise<CommandResult> {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]?.id) {
        reject("Something went wrong.");
        return;
      }
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "inputElementByTag", uniqueTag: tag, text },
        (response) => {
          if (response?.status === "Success") {
            console.log("Input successful!");
            resolve(response);
          } else {
            console.log("Element not found.");
            reject(response.message);
          }
        }
      );
    });
  });
}

export async function scrollPage(): Promise<CommandResult> {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]?.id) {
        reject("Something went wrong.");
        return;
      }
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "scrollDown" },
        (response) => {
          if (response?.status === "Success") {
            console.log("Scroll successful!");
            resolve(response);
          } else {
            console.log("Scroll failed.");
            reject(response.message);
          }
        }
      );
    });
  });
}

export async function openUrl(url: string): Promise<CommandResult> {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]?.id) {
        reject("Something went wrong.");
        return;
      }
      chrome.tabs.update(tabs[0].id, { url: url }, function () {
        console.log("Page opened successfully!");
        resolve({
          status: "Success",
          message: "Page opened successfully!",
        });
      });
    });
  });
}

export async function addUniqueTags(): Promise<CommandResult> {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]?.id) {
        reject("Something went wrong.");
        return;
      }
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "addUniqueTags" },
        (response) => {
          if (response?.status === "Success") {
            console.log("Tags added successfully!");
            resolve(response);
          } else {
            console.log("Failed to add tags.");
            console.log(response);
            reject(response.message);
          }
        }
      );
    });
  });
}

export async function captureTab(): Promise<ImageCommandResult> {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]?.id) {
        reject("Something went wrong.");
        return;
      }
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "captureTab" },
        (response) => {
          if (response?.status === "Success") {
            console.log("Tab captured successfully!");
            resolve(response);
          } else {
            console.log("Failed to capture tab.");
            reject(response.message);
          }
        }
      );
    });
  });
}

export function setChromeStorage(key: string, value: any): void {
  chrome.storage.session.set({ [key]: value }, () => {
    console.log(`Value is set to ${JSON.stringify(value)}`);
  });
}

export function getChromeStorage(key: string): Promise<any> {
  return new Promise((resolve, reject) => {
    chrome.storage.session.get([key], (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result[key]);
      }
    });
  });
}
