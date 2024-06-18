
# BSummarize - Firefox Extension 🦊

Effortlessly grasp web content with the power of AI! 🪄

[![Firefox Add-on](https://img.shields.io/amo/v/YOUR_EXTENSION_ID?label=Get%20it%20on%20Firefox&style=for-the-badge)](https://addons.mozilla.org/firefox/addon/YOUR_EXTENSION_ID)

**Tired of endlessly scrolling through lengthy articles? Struggle to comprehend content in other languages?**

BSummarize is your solution! Our powerful Firefox extension allows you to quickly **summarize and translate** web pages, including YouTube videos, using cutting-edge language models from **Google Gemini and Ollama**.

## ✨ Key Features

* **Summarize Entire Pages:** Get a concise summary with a single click!

* **Summarize Selected Text:** Highlight specific passages for focused summaries.
  
* **Multi-Language Support:** Summarize and translate into your preferred language.
  
* **Effortless YouTube Summaries:** Automatically detect and summarize video captions.
  
* **Handles Long Content:** Intelligent chunking for efficient processing of large articles.

## 🚀 Benefits

* **Save Time:** Extract key information in seconds. ⏳
* **Boost Comprehension:** Understand complex topics with ease. 🧠
* **Break Language Barriers:** Access content in any language. 🌐

## ⬇️ Installation

1. **Download:** Head over to the latest release page: [link to your releases page].
2. **Open in Firefox:** Click on the `.xpi` file for the latest version.
3. **Confirm Installation:** Click "Add" when Firefox prompts you.
4. **Get Started!** The BSummarize icon will appear in your toolbar.

##  ➡️ How to Use

1. **Go to a Webpage:** Visit any website you'd like to summarize or translate.
2. **Click the Icon:**
    * **Entire Page:** Click the BSummarize icon without selecting any text.
    * **Specific Text:** Highlight the desired text, then click the icon.
3. **View Results:** The summary or translation appears in a popup. Click "View Results" for a full-screen view.

## 🧠 Choose Your Language Model

BSummarize offers flexibility with support for both Google Gemini and Ollama.

* **Google Gemini:** Often faster and more powerful. Requires a free API key.
* **Ollama:** Runs locally on your computer; no API key needed. Requires installation.

### 🗝️ Getting a Google Gemini API Key

1. Visit the Google AI for Developers website: [https://ai.google.dev](https://ai.google.dev/)
2. Sign in with your Google Account.
3. Create a new project and enable the "Gemini API."
4. Generate an API key and paste it into BSummarize's options.

### 🚀 Installing Ollama & Enabling CORS

1. **Install Ollama:** Follow the instructions for your operating system: [https://ollama.ai/](https://ollama.ai/)

2. **Enable CORS:** This is crucial for BSummarize to communicate with Ollama.

   **macOS:**

   ```bash
   launchctl setenv OLLAMA_ORIGINS "*"
   ```

   **Linux (using systemd):**

    * Edit the Ollama service file:
      ```bash
      sudo systemctl edit ollama.service
      ```
    * Add this line under the `[Service]` section:
      ```
      Environment="OLLAMA_ORIGINS=*"
      ```
    * Reload and restart Ollama:
      ```bash
      sudo systemctl daemon-reload
      sudo systemctl restart ollama.service
      ```

   **Windows:**

    1. Make sure Ollama is closed.
    2. Open: **Control Panel > System and Security > System**.
    3. Click "Advanced system settings" > "Environment Variables."
    4. Create a new system variable:
        * Variable name: `OLLAMA_ORIGINS`
        * Variable value: `*`
    5. Restart your computer.

## 🔐 Security

We take your privacy seriously! BSummarize does not store your API keys or the content you process on any external servers. All processing happens locally on your device.

---

**Enjoy BSummarize!** If you have any questions or need help, feel free to [open an issue on GitHub](link-to-your-github-issues). 