// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("content.js", { request });

  switch (request.action) {
    case "addUniqueTags":
      handleAddUniqueTags(sendResponse);
      return true;
    case "captureTab":
      handleCaptureTab(sendResponse);
      return true;
    case "clickElementByTag":
      handleClickElementByTag(request.uniqueTag, sendResponse);
      return true;
    case "inputElementByTag":
      handleInputElementByTag(request.uniqueTag, request.text, sendResponse);
      return true;
    case "scrollDown":
      handleScrollDown(sendResponse);
      break;
    case "openUrlInCurrentTab":
      handleOpenUrlInCurrentTab(request.url, sendResponse);
      return true;
    default:
      console.error("Invalid action: ", request.action);
  }
});

/* Message handlers */

async function handleAddUniqueTags(sendResponse) {
  try {
    await addUniqueTags();
    sendResponse({ status: "Success", message: "Tags added" });
  } catch (error) {
    console.error("Error adding unique tags: ", error);
    sendResponse({ status: "Error", message: error });
  }
}

async function handleCaptureTab(sendResponse) {
  try {
    const dataUrl = await captureTab();
    sendResponse({
      status: "Success",
      message: "Tab captured",
      image: dataUrl,
    });
  } catch (error) {
    console.error("Error capturing tab: ", error);
    sendResponse({ status: "Error", message: error.message });
  }
}

async function handleClickElementByTag(uniqueTag, sendResponse) {
  try {
    const clicked = await clickElementByTag(uniqueTag);
    sendResponse({
      status: clicked ? "Success" : "Error",
      message: clicked ? "Element clicked" : "Element not found",
    });
  } catch (error) {
    console.error("Error clicking element by tag: ", error);
    sendResponse({ status: "Error", message: error.message });
  }
}

async function handleInputElementByTag(uniqueTag, text, sendResponse) {
  try {
    const inputted = await inputElementByTag(uniqueTag, text);
    sendResponse({
      status: inputted ? "Success" : "Error",
      message: inputted ? "Element inputted" : "Element not found",
    });
  } catch (error) {
    console.error("Error inputting element by tag: ", error);
    sendResponse({ status: "Error", message: error.message });
  }
}

function handleScrollDown(sendResponse) {
  try {
    scrollDown();
    sendResponse({ status: "Success", message: "Scrolled down" });
  } catch (error) {
    console.error("Error scrolling down: ", error);
    sendResponse({ status: "Error", message: error.message });
  }
}

async function handleOpenUrlInCurrentTab(url, sendResponse) {
  try {
    await openUrlInCurrentTab(url);
    sendResponse({ status: "Success", message: "URL opened in current tab" });
  } catch (error) {
    console.error("Error opening URL in current tab: ", error);
    sendResponse({ status: "Error", message: error.message });
  }
}

/* Core functions */

async function addUniqueTags() {
  await wait(1000);

  const tagElementStyles = {
    color: "black",
    fontSize: "14px",
    padding: "3px",
    fontWeight: "bold",
    zIndex: "999",
    position: "relative"
  };

  const elements = document.querySelectorAll("a, button, input, textarea, [role='button'], [role='textbox']");

  elements.forEach((element) => {
    if (!element.hasAttribute("data-ai-tag")) {
      const uniqueTag = generateUID();
      element.setAttribute("data-ai-tag", uniqueTag);

      const tagElement = createTagElement(uniqueTag, tagElementStyles);

      if (["input", "textarea"].includes(element.tagName.toLowerCase()) || element.getAttribute('role') === 'textbox') {
        tagElement.style.background = "orange";
        element.parentNode.insertBefore(tagElement, element);
      } else {
        tagElement.style.background = "yellow";
        element.prepend(tagElement);
      }
    }
  });
}

async function captureTab() {
  await wait(1000);
  return new Promise((resolve, reject) => {
    // Delegate the capture to the background script. Todo: is there a better way to do this?
    chrome.runtime.sendMessage({ action: "createImageFromTab" }, (response) => {
      if (response) {
        resolve(response.dataUrl);
      } else {
        reject("Failed to capture tab");
      }
    });
  });
}

async function clickElementByTag(uniqueTag) {
  const element = document.querySelector(
    `[data-ai-tag="${cleanTag(uniqueTag)}"]`
  );
  let elementFound = false;

  if (element) {
    element.style.border = "5px solid red";
    await wait(500);
    element.click();
    element.style.border = "";
    elementFound = true;
  }

  return elementFound;
}

async function inputElementByTag(uniqueTag, text) {
  const element = document.querySelector(
    `[data-ai-tag="${cleanTag(uniqueTag)}"]`
  );
  let elementFound = false;

  if (element) {
    if (element.hasAttribute('contenteditable')) {
      // Handle contenteditable divs
      for (let i = 0; i < text.length; i++) {
        element.textContent += text[i];
        await wait(100);
      }
    } else {
      // Handle input elements
      for (let i = 0; i < text.length; i++) {
        element.value += text[i];
        await wait(100);
      }
    }
    elementFound = true;
  }

  return elementFound;
}

function scrollDown() {
  const scrollAmount = window.innerHeight * 0.8;
  window.scrollBy(0, scrollAmount);
}

function openUrlInCurrentTab(url) {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      var currTab = tabs[0];
      if (currTab) {
        chrome.tabs.update(currTab.id, { url: url }, function () {
          resolve();
        });
      } else {
        reject("No active tab found");
      }
    });
  });
}

/* Utility functions */

function createTagElement(uniqueTag, styles) {
  const tagElement = document.createElement("span");

  Object.keys(styles).forEach((styleKey) => {
    tagElement.style[styleKey] = styles[styleKey];
  });

  tagElement.textContent = `${uniqueTag}`;

  return tagElement;
}

function generateUID(digits = 4) {
  let string = "";
  for (let i = 0; i < digits; i++) {
    string += Math.floor(Math.random() * 10);
  }
  return string;
}

function cleanTag(tag) {
  return tag.replace(/\[|\]/g, "");
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
