const getModelId = async (languageModel, mediaType) => {
  if (languageModel === "ollama") {
    const { ollamaModel } = await browser.storage.local.get({ ollamaModel: "llama3" });
    return ollamaModel;
  } else if (languageModel === "1.5-flash") {
    return "gemini-1.5-flash";
  } else if (mediaType === "image") {
    return "gemini-1.5-flash";
  } else {
    return "gemini-1.0-pro";
  }
};

const getSystemPrompt = async (actionType, mediaType, languageCode, taskInputLength) => {
  const languageNames = {
    en: "English",
    de: "German",
    es: "Spanish",
    fr: "French",
    it: "Italian",
    pt_br: "Brazilian Portuguese",
    vi: "Vietnamese",
    ru: "Russian",
    ar: "Arabic",
    hi: "Hindi",
    bn: "Bengali",
    zh_cn: "Simplified Chinese",
    zh_tw: "Traditional Chinese",
    ja: "Japanese",
    ko: "Korean"
  };

  const numItems = Math.min(10, 3 + Math.floor(taskInputLength / 2000));
  let systemPrompt = "";

  if (actionType === "summarize") {
    if (mediaType === "image") {
      systemPrompt = `Summarize the image as Markdown numbered list in ${languageNames[languageCode]} and reply only with the list.\nFormat:\n1. First point.\n2. Second point.\n3. Third point.`;
    } else {
      systemPrompt = `Summarize the entire text as up to ${numItems}-item Markdown numbered list in ${languageNames[languageCode]} and reply only with the list.\nFormat:\n1. First point.\n2. Second point.\n3. Third point.`;
    }
  } else if (actionType === "translate") {
    if (mediaType === "image") {
      systemPrompt = `Translate the image into ${languageNames[languageCode]} and reply only with the translated result.`;
    } else {
      systemPrompt = `Translate the entire text into ${languageNames[languageCode]} and reply only with the translated result.`;
    }
  } else if (actionType === "noTextCustom") {
    systemPrompt = (await browser.storage.local.get({ noTextCustomPrompt: "" })).noTextCustomPrompt;
  } else if (actionType === "textCustom") {
    systemPrompt = (await browser.storage.local.get({ textCustomPrompt: "" })).textCustomPrompt;
  }

  return systemPrompt;
};

const getCharacterLimit = (modelId, actionType) => {
  const characterLimits = {
    "gemini-1.5-flash": {
      summarize: 786432,
      translate: 8192,
      noTextCustom: 786432,
      textCustom: 786432
    },
    "gemini-1.0-pro": {
      summarize: 25600,
      translate: 2048,
      noTextCustom: 25600,
      textCustom: 25600
    },
    "llama3": {
      summarize: 2048,
      translate: 2048,
      noTextCustom: 2048,
      textCustom: 2048
    }
  };

  return characterLimits[modelId]?.[actionType] || 2048;
};

const chunkText = (text, chunkSize) => {
  const chunks = [];
  const sentenceBreaks = ["\n\n", "।", "。", "．", ".", "\n", " "];
  let remainingText = text.replace(/\r\n?/g, "\n");

  while (remainingText.length > chunkSize) {
    const currentChunk = remainingText.substring(0, chunkSize);
    let breakIndex = -1;

    for (const sentenceBreak of sentenceBreaks) {
      breakIndex = currentChunk.indexOf(sentenceBreak, Math.floor(chunkSize * 0.8));

      if (breakIndex !== -1) {
        breakIndex += sentenceBreak.length;
        break;
      }
    }

    if (breakIndex === -1) {
      breakIndex = chunkSize;
    }

    chunks.push(remainingText.substring(0, breakIndex));
    remainingText = remainingText.substring(breakIndex);
  }

  chunks.push(remainingText);
  return chunks;
};

const tryParseJson = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    return { error: { message: text } };
  }
};

browser.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  (async () => {
    if (request.message === "chunk") {
      const { actionType, mediaType, taskInput, languageModel } = request;
      const modelId = await getModelId(languageModel, mediaType);
      const chunkSize = getCharacterLimit(modelId, actionType);
      const taskInputChunks = chunkText(taskInput, chunkSize);
      sendResponse(taskInputChunks);
    } else if (request.message === "generate") {
      await browser.storage.local.set({ taskCache: "", responseCache: {} });
      const { actionType, mediaType, taskInput, languageModel, languageCode } = request;

      if (languageModel === "ollama") {
        const { ollamaModel } = await browser.storage.local.get({ ollamaModel: "llama3" });

        try {
          const response = await fetch(`http://localhost:11434/api/generate`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: ollamaModel,
              prompt: taskInput,
              stream: false,
            }),
          });

          const responseData = await response.json();

          if (response.ok && responseData.response) {
            const taskData = JSON.stringify({ actionType, mediaType, taskInput, languageModel, languageCode });
            await browser.storage.local.set({ taskCache: taskData, responseCache: responseData });

            sendResponse({
              ok: true,
              body: {
                candidates: [
                  {
                    content: {
                      parts: [
                        { text: responseData.response }
                      ]
                    },
                    finishReason: "STOP"
                  }
                ]
              }
            });
          } else {
            sendResponse({
              ok: false,
              status: response.status,
              body: { error: { message: responseData.error || "Unknown error" } }
            });
          }
        } catch (error) {
          sendResponse({
            ok: false,
            status: 1000,
            body: { error: { message: error.message } }
          });
        }
      } else {
        const { apiKey } = await browser.storage.local.get({ apiKey: "" });
        const modelId = await getModelId(languageModel, mediaType);
        const systemPrompt = await getSystemPrompt(actionType, mediaType, languageCode, taskInput.length);

        let contents = [];

        if (mediaType === "image") {
          const [mediaInfo, mediaData] = taskInput.split(",");
          const mediaType = mediaInfo.split(":")[1].split(";")[0];

          contents.push({
            parts: [
              { text: systemPrompt },
              {
                inline_data: {
                  mime_type: mediaType,
                  data: mediaData
                }
              }
            ]
          });
        } else {
          contents.push({
            role: "user",
            parts: [{ text: `${systemPrompt}\nText:\n${taskInput}` }]
          });
        }

        try {
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": apiKey,
            },
            body: JSON.stringify({
              contents,
              safetySettings: [
                { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
              ]
            })
          });

          const responseData = {
            ok: response.ok,
            status: response.status,
            body: tryParseJson(await response.text())
          };

          if (response.ok) {
            const taskData = JSON.stringify({ actionType, mediaType, taskInput, languageModel, languageCode });
            await browser.storage.local.set({ taskCache: taskData, responseCache: responseData });
          }

          sendResponse(responseData);
        } catch (error) {
          sendResponse({
            ok: false,
            status: 1000,
            body: { error: { message: error.stack } }
          });
        }
      }
    }
  })();

  return true;
});
