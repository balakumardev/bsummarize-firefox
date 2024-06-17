# BSummarize - Firefox Extension

BSummarize is a powerful Firefox extension that enables you to effortlessly summarize and translate web pages, including YouTube video captions, using cutting-edge language models such as Gemini and open-source models like Llama3, Mistral, and Gemma. With BSummarize, you can quickly grasp the key points of lengthy articles, research papers, or any web content, and even translate them into your preferred language, all for free!

## Features

- Summarize entire web pages or selected text using state-of-the-art language models
- Translate web pages or selected text into multiple languages
- Automatically detect and summarize YouTube video captions
- Customize summarization and translation settings for different scenarios
- Efficiently handle long text by intelligently splitting it into chunks
- Support for Gemini 1.5 Flash and Gemini 1.0 Pro language models (free to use, at least for a while)
- Integration with open-source language models like Llama3, Mistral, and Gemma for local processing (free and locally run)
- Seamless integration with Firefox browser for a smooth user experience

## Installation

To install the BSummarize Firefox extension, follow these steps:

1. Download the BSummarize extension package (`bsummarize.xpi`) from the official website or the provided download link.

2. Open Firefox and go to the "Add-ons" page by clicking on the menu button (three horizontal lines) and selecting "Add-ons" from the menu.

3. On the "Add-ons" page, click on the gear icon in the top-right corner and select "Install Add-on From File" from the dropdown menu.

4. In the file selection dialog, navigate to the location where you downloaded the `bsummarize.xpi` file, select it, and click "Open".

5. Firefox will prompt you to confirm the installation. Click "Add" to proceed.

6. Once the installation is complete, you will see the BSummarize extension icon in the Firefox toolbar, indicating that the extension is ready to use.

## Usage

Using BSummarize is intuitive and straightforward. Here's how you can start summarizing and translating web content:

1. Navigate to a web page you want to summarize or translate.

2. To summarize or translate the entire page, simply click on the BSummarize extension icon in the Firefox toolbar.

3. If you want to summarize or translate a specific portion of the page, select the desired text and then click on the BSummarize extension icon.

4. BSummarize will process the content using the selected language model and display the summarized or translated result in a popup window.

5. You can customize the summarization and translation settings by clicking on the gear icon in the popup window. This will open the options page where you can:
    - Choose the preferred language model (Gemini 1.5 Flash, Gemini 1.0 Pro, or open-source models like Llama3, Mistral, and Gemma)
    - Select the target language for translation
    - Specify custom actions for summarization and translation when no text is selected or when text is selected

6. If you choose to use the open-source language models (Llama3, Mistral, or Gemma), make sure you have the model server running locally and set the `OLLAMA_ORIGINS` environment variable to allow cross-origin requests. You can set the environment variable by running the following command in your terminal:
    - For Mac:
   ```
   export OLLAMA_ORIGINS="*"
   ```
    - For Linux, edit the service using "systemctl edit ollama.service" and add:
   ```
   [Service]
   Environment="OLLAMA_ORIGINS=*"
    ```
    - For Windows, open "Edit system environment variables"  in Settings:
   ```
   OLLAMA_ORIGINS=*
    ```

7. BSummarize automatically detects YouTube video pages and provides the option to summarize or translate the video captions. Simply click on the BSummarize extension icon while on a YouTube video page to access this feature.

8. For long articles or web pages, BSummarize intelligently splits the content into smaller chunks to ensure efficient processing and to handle text that exceeds the maximum input size of the language model. The summarized or translated results will be seamlessly combined and presented to you.

9. You can click on the "Copy" button in the popup window to copy the summarized or translated text to the clipboard for further use.

10. To view the summarization or translation history, click on the "Open results in a new tab" button in the popup window. This will open a new tab displaying your previous results.

That's it! With BSummarize, you can effortlessly summarize and translate web content, saving time and enhancing your browsing experience. The extension works seamlessly in the background, allowing you to focus on the information that matters most to you.

**Note:** The Gemini language models are currently free to use, at least for a while. The open-source language models, such as Llama3, Mistral, and Gemma, can be run locally on your machine, providing a free and privacy-friendly option for summarization and translation.

If you have any further questions or need assistance, please refer to the BSummarize documentation or contact our support team. Happy summarizing and translating!