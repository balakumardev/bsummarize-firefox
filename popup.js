/* globals Readability, marked */

let contentIndex = 0;

const getSelectedText = () => window.getSelection().toString();

const getWholeText = () => {
  const documentClone = document.cloneNode(true);
  const article = new Readability(documentClone).parse();

  return article ? article.textContent : document.body.innerText;
};

const fetchCaptions = async (videoUrl, languageCode) => {
  const languageCodeMap = {
    en: 'en',
    de: 'de',
    es: 'es',
    fr: 'fr',
    it: 'it',
    pt_br: 'pt',
    vi: 'vi',
    ru: 'ru',
    ar: 'ar',
    hi: 'hi',
    bn: 'bn',
    zh_cn: 'zh-Hans',
    zh_tw: 'zh-Hant',
    ja: 'ja',
    ko: 'ko'
  };

  const videoId = videoUrl.match(/v=([^&]+)/)[1];
  const apiUrl = `https://www.youtube.com/watch?v=${videoId}`;

  try {
    const response = await fetch(apiUrl);
    const html = await response.text();
    const captionsData = html.match(/"captions":(\{.*?\}),/s);

    if (captionsData) {
      const captions = JSON.parse(captionsData[1]);
      const captionTracks = captions.playerCaptionsTracklistRenderer?.captionTracks;

      if (captionTracks) {
        const preferredLanguages = [languageCodeMap[languageCode], 'en'];
        const track = captionTracks.find(track => preferredLanguages.includes(track.languageCode));

        if (track) {
          const captionsResponse = await fetch(track.baseUrl);
          const captionsXml = await captionsResponse.text();
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(captionsXml, 'text/xml');
          const captionsText = Array.from(xmlDoc.getElementsByTagName('text'))
              .map(element => element.textContent)
              .join(' ');

          return captionsText;
        }
      }
    }

    console.log('No captions found for the video.');
    return '';
  } catch (error) {
    console.error('Error retrieving captions:', error);
    return '';
  }
};

const extractTaskInformation = async (languageCode) => {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  const selectedText = await browser.tabs.executeScript(tab.id, { code: "(" + getSelectedText + ")();" });
  const { textAction, noTextAction } = await browser.storage.local.get({
    textAction: "translate",
    noTextAction: "summarize"
  });

  let actionType = "";
  let mediaType = "";
  let taskInput = selectedText[0];

  if (taskInput) {
    actionType = textAction;
    mediaType = "text";
  } else {
    actionType = noTextAction;

    if (tab.url.startsWith("https://www.youtube.com/watch?v=")) {
      mediaType = "captions";
      taskInput = await fetchCaptions(tab.url, languageCode);
    }

    if (!taskInput) {
      mediaType = "text";
      taskInput = await browser.tabs.executeScript(tab.id, { code: "(" + getWholeText + ")();" });
      taskInput = taskInput[0];
    }

    if (!taskInput) {
      mediaType = "image";
      taskInput = await browser.tabs.captureVisibleTab(tab.windowId, { format: "jpeg" });
    }
  }

  return { actionType, mediaType, taskInput };
};

const getLoadingMessage = (actionType, mediaType) => {
  const loadingMessages = {
    summarize: {
      captions: browser.i18n.getMessage("popup_summarizing_captions"),
      image: browser.i18n.getMessage("popup_summarizing_image"),
      text: browser.i18n.getMessage("popup_summarizing")
    },
    translate: {
      captions: browser.i18n.getMessage("popup_translating_captions"),
      image: browser.i18n.getMessage("popup_translating_image"),
      text: browser.i18n.getMessage("popup_translating")
    }
  };

  return loadingMessages[actionType]?.[mediaType] || browser.i18n.getMessage("popup_processing");
};

const displayLoadingMessage = (loadingMessage) => {
  const status = document.getElementById("status");

  switch (status.textContent) {
    case `${loadingMessage}.`:
      status.textContent = `${loadingMessage}..`;
      break;
    case `${loadingMessage}..`:
      status.textContent = `${loadingMessage}...`;
      break;
    default:
      status.textContent = `${loadingMessage}.`;
  }
};

const main = async (useCache) => {
  let displayIntervalId = 0;
  let content = "";

  contentIndex = (await browser.storage.local.get({ contentIndex: -1 })).contentIndex;
  contentIndex = (contentIndex + 1) % 10;
  await browser.storage.local.set({ contentIndex: contentIndex });

  try {
    const languageModel = document.getElementById("languageModel").value;
    const languageCode = document.getElementById("languageCode").value;
    let taskInputChunks = [];

    document.getElementById("content").textContent = "";
    document.getElementById("status").textContent = "";
    document.getElementById("run").disabled = true;
    document.getElementById("languageModel").disabled = true;
    document.getElementById("languageCode").disabled = true;
    document.getElementById("results").disabled = true;

    const { actionType, mediaType, taskInput } = await extractTaskInformation(languageCode);
    displayIntervalId = setInterval(displayLoadingMessage, 500, getLoadingMessage(actionType, mediaType));

    if (mediaType === "image") {
      taskInputChunks = [taskInput];
    } else {
      taskInputChunks = await browser.runtime.sendMessage({
        message: "chunk",
        actionType,
        mediaType,
        taskInput,
        languageModel
      });
    }

    for (const taskInputChunk of taskInputChunks) {
      const taskCache = (await browser.storage.local.get({ taskCache: "" })).taskCache;
      let response = {};

      if (useCache && taskCache === JSON.stringify({ actionType, mediaType, taskInput: taskInputChunk, languageModel, languageCode })) {
        response = (await browser.storage.local.get({ responseCache: {} })).responseCache;
      } else {
        try {
          response = await browser.runtime.sendMessage({
            message: "generate",
            actionType,
            mediaType,
            taskInput: taskInputChunk,
            languageModel,
            languageCode
          });
        } catch (error) {
          content = browser.i18n.getMessage("popup_miscellaneous_error");
          console.error("Error calling browser.runtime.sendMessage:", error);
          break;
        }
      }

      console.log(response);

      if (response.ok && response.body.candidates && response.body.candidates[0].content) {
        content += `${response.body.candidates[0].content.parts[0].text}\n\n`;
        const div = document.createElement("div");
        div.textContent = content;
        document.getElementById("content").innerHTML = marked.parse(div.innerHTML);
        window.scrollTo(0, document.body.scrollHeight);
      } else {
        content = response.ok ? browser.i18n.getMessage("popup_unexpected_response") : browser.i18n.getMessage("popup_miscellaneous_error");
        break;
      }
    }
  } catch (error) {
    content = browser.i18n.getMessage("popup_miscellaneous_error");
    console.log(error);
  } finally {
    if (displayIntervalId) {
      clearInterval(displayIntervalId);
    }

    document.getElementById("status").textContent = "";
    document.getElementById("run").disabled = false;
    document.getElementById("languageModel").disabled = false;
    document.getElementById("languageCode").disabled = false;
    document.getElementById("results").disabled = false;

    const div = document.createElement("div");
    div.textContent = content;
    document.getElementById("content").innerHTML = marked.parse(div.innerHTML);

    await browser.storage.local.set({ [`c_${contentIndex}`]: content });
  }
};

const initialize = async () => {
  marked.use({ renderer: { link: (_href, _title, text) => text } });

  document.body.setAttribute("dir", browser.i18n.getMessage("@@bidi_dir"));

  document.querySelectorAll("[data-i18n]").forEach(element => {
    element.textContent = browser.i18n.getMessage(element.getAttribute("data-i18n"));
  });

  const { languageModel, languageCode } = await browser.storage.local.get({
    languageModel: "1.5-flash",
    languageCode: "en"
  });

  document.getElementById("languageModel").value = languageModel;
  document.getElementById("languageCode").value = languageCode;

  main(true);
};

document.addEventListener("DOMContentLoaded", initialize);

document.getElementById("run").addEventListener("click", () => main(false));

document.getElementById("results").addEventListener("click", () => {
  browser.tabs.create({ url: browser.runtime.getURL(`results.html?i=${contentIndex}`) });
});

document.getElementById("options").addEventListener("click", () => {
  browser.runtime.openOptionsPage();
});
