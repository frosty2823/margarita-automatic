window.addEventListener("load", function () {
  const buttons = document.querySelectorAll(".margarita");
  const personalNote = document.querySelector("#personalNote");
  const successLabel = document.querySelector("#clipped");
  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      runCopyFunction(button.textContent, personalNote.value, successLabel);
    });
  });
});

async function runCopyFunction(buttonText, personalNote, successLabel) {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  let nextTab;
  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      function: copyToClickBoard,
      args: [buttonText, personalNote],
    },
    (result) => {
      console.log(result);
      successLabel.innerText = result[0].result;
      setTimeout(function () {
        successLabel.innerText = " ";
      }, 2000);
    }
  );

  // Switching the Tabs
  chrome.tabs.query({ currentWindow: true }, (tabsArray) => {
    // If only 1 tab is present, do nothing.
    if (tabsArray.length === 1) return;

    // Otherwise switch to the next available tab.
    // Find index of the currently active tab.
    let activeTabIndex = null;
    tabsArray.forEach((tab, index) => {
      if (tab.active === true) {
        activeTabIndex = index;
      }
    });

    // Obtain the next tab. If the current active
    // tab is the last tab, the next tab should be
    // the first tab.
    for (let i = 0; i < tabsArray.length; i++) {
      let checkTab = tabsArray[(activeTabIndex + (i + 1)) % tabsArray.length];
      let tabUrl = checkTab.url;
      if (tabUrl.includes("airtable")) {
        nextTab = tabsArray[(activeTabIndex + (i + 1)) % tabsArray.length];
        break;
      }
      console;
    }

    // Switch to the next tab.
    chrome.scripting.executeScript({
      target: { tabId: nextTab.id },
      function: displayThis,
      args: [tabsArray[activeTabIndex]],
    });

    chrome.tabs.update(nextTab.id, { active: true });
  });
}

const displayThis = function (activeTab) {
  setTimeout(function () {
    document.querySelectorAll(".rowNumber")[1].click();
    document.querySelectorAll(".rowNumber")[1].focus();
    setTimeout(function () {
      document.execCommand("paste");
    }, 1000);
  }, 2000);
};

const copyToClickBoard = function (buttonText, personalNote) {
  const date = document.querySelector(".g3").getAttribute("title");
  const fullName = document.querySelector(".gD").getAttribute("name");
  const email = document.querySelector(".gD").getAttribute("email");
  const domainName = email.split("@").pop();
  const arr = document.querySelectorAll(".a3s.aiL");
  let lastEmailContent = arr[0].innerText.split("\n").join(" ");
  lastEmailContent = lastEmailContent.split("\t").join(" ");
  const conversationURL = document.location.href;
  // Creating the textfield from where we will execute the copy commmand
  var textArea = document.createElement("textarea");
  textArea.value =
    date +
    "\t" +
    fullName +
    "\t" +
    domainName +
    "\t" +
    email +
    "\t" +
    buttonText +
    "\t" +
    lastEmailContent +
    "\t" +
    personalNote +
    "\t" +
    conversationURL;

  textArea.style.position = "fixed";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    var successful = document.execCommand("copy");
    var msg = successful ? "Clipped" : "Not Clipped";
    return msg;
  } catch (err) {
    console.error("Error");
  }

  document.body.removeChild(textArea);
};
