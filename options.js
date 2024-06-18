const restoreOptions = async () => {
  const {
    apiKey,
    languageModel,
    languageCode,
    noTextAction,
    noTextCustomPrompt,
    textAction,
    textCustomPrompt,
    ollamaModel
  } = await browser.storage.local.get({
    apiKey: "",
    languageModel: "1.5-flash",
    languageCode: "en",
    noTextAction: "summarize",
    noTextCustomPrompt: "",
    textAction: "translate",
    textCustomPrompt: "",
    ollamaModel: "llama3"
  });

  document.getElementById("apiKey").value = apiKey;
  document.getElementById("languageModel").value = languageModel;
  document.getElementById("languageCode").value = languageCode;
  document.querySelector(`input[name="noTextAction"][value="${noTextAction}"]`).checked = true;
  document.getElementById("noTextCustomPrompt").value = noTextCustomPrompt;
  document.querySelector(`input[name="textAction"][value="${textAction}"]`).checked = true;
  document.getElementById("textCustomPrompt").value = textCustomPrompt;
  document.getElementById("ollamaModel").value = ollamaModel;
};

const saveOptions = async () => {
  const options = {
    apiKey: document.getElementById("apiKey").value,
    languageModel: document.getElementById("languageModel").value,
    languageCode: document.getElementById("languageCode").value,
    noTextAction: document.querySelector('input[name="noTextAction"]:checked').value,
    noTextCustomPrompt: document.getElementById("noTextCustomPrompt").value,
    textAction: document.querySelector('input[name="textAction"]:checked').value,
    textCustomPrompt: document.getElementById("textCustomPrompt").value,
    ollamaModel: document.getElementById("ollamaModel").value
  };

  await browser.storage.local.set(options);
  await browser.storage.session.set({ taskCache: "", responseCache: {} });

  const status = document.getElementById("status");
  status.textContent = browser.i18n.getMessage("options_saved");
  setTimeout(() => status.textContent = "", 1000);
};

const initialize = () => {
  document.body.setAttribute("dir", browser.i18n.getMessage("@@bidi_dir"));

  document.querySelectorAll("[data-i18n]").forEach(element => {
    element.textContent = browser.i18n.getMessage(element.getAttribute("data-i18n"));
  });

  restoreOptions();
};

document.addEventListener("DOMContentLoaded", initialize);
document.getElementById("save").addEventListener("click", saveOptions);
