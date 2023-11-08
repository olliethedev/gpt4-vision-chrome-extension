// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log({request});
  if (request.action === "addUniqueTags") {
    addUniqueTags(() => {
      sendResponse({ status: "Tags added" });
    });
    return true;
  } else if (request.action === "captureTab") {
    captureTab((dataUrl) => {
      sendResponse({ status: "Tab captured", image: dataUrl });
    });
    return true;
  } else if (request.action === "clickElementByTag") {
    const clicked = clickElementByTag(request.uniqueTag);
    sendResponse({ success: clicked });
  }
});

function addUniqueTags(completion) {
  //wait 2 seconds
  setTimeout(function () {
    // Get all the buttons and links on the page
    const elements = document.querySelectorAll("a, button, input, textarea");
    elements.forEach((element) => {
      // Generate a unique tag for each element
      const uniqueTag = generateUID();
      // Add the unique tag as text or an attribute
      // Here, we're adding a data attribute and also showing it as text for visibility
      element.setAttribute("data-unique-tag", uniqueTag);
      // Creating a span element to hold the unique tag
      const tagElement = document.createElement("span");
      tagElement.style.background = "yellow";
      tagElement.style.color = "black";
      tagElement.style.fontSize = "small";
      tagElement.style.margin = "0 3px";
      tagElement.style.fontWeight = "bold";
      tagElement.textContent = `[${uniqueTag}]`;
      // Append or prepend the tagElement based on your preference
      if (element.tagName.toLowerCase() === "input") {
        element.parentNode.insertBefore(tagElement, element);
      } else {
        element.prepend(tagElement);
      }
    });

    completion();
  }, 2000);
}

function captureTab(callback) {
  // Delegate the capture to the background script
  chrome.runtime.sendMessage({ action: "captureTab" }, (response) => {
    if (response) {
      console.log({ dataUrl: response.dataUrl });
      callback(response.dataUrl);
    }
  });
}

function clickElementByTag(uniqueTag) {
  console.log({ uniqueTag });
  // Find the element with the specified unique tag
  const elements = document.querySelectorAll('[data-unique-tag]');
  let elementFound = false;

  elements.forEach((element) => {

    const cleanTag = uniqueTag.replace(/\[|\]/g, '');
    if (element.getAttribute('data-unique-tag') === cleanTag) {
      // If the element is found, click it and set the flag
      element.click();
      elementFound = true;
    }
  });

  // Return whether the click was successful
  return elementFound;
}

// Function to generate a unique ID
function generateUID(digits = 4) {
  let string = "";
  for (let i = 0; i < digits; i++) {
    string += Math.floor(Math.random() * 10);
  }
  return string;
}
