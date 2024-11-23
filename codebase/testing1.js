import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import MarkdownIt from 'markdown-it';
import { maybeShowApiKeyBanner } from '../gemini-api-banner';

// 🔥🔥 FILL THIS OUT FIRST! 🔥🔥
// Get your Gemini API key by:
// - Selecting "Add Gemini API" in the "Project IDX" panel in the sidebar
// - Or by visiting https://g.co/ai/idxGetGeminiKey
let API_KEY = 'AIzaSyA_-l4-8Otmcq8EKmOJ5LaVroGlb5GeGRc';

let form = document.querySelector('form');
let promptInput = document.querySelector('input[name="prompt"]');
let output = document.querySelector('.output');

form.onsubmit = async (ev) => {
  ev.preventDefault();
  output.textContent = 'Generating...';

  try {
    // Assemble the prompt with just the text input (no image)
    let contents = [
      {
        role: 'user',
        parts: [
          { text: promptInput.value }
        ]
      }
    ];

    // Call the multimodal model, and get a stream of results
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro", // or gemini-1.5-flash
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
    });

    const result = await model.generateContentStream({ contents });

    // Read from the stream and interpret the output as markdown
    let buffer = [];
    let md = new MarkdownIt();
    for await (let response of result.stream) {
      buffer.push(response.text());
      const combinedText = buffer.join('');
      output.innerHTML = md.render(combinedText);

      // Play the generated text as speech
      speakText(combinedText);
    }
  } catch (e) {
    output.innerHTML += '<hr>' + e;
  }
};

// Function to play text as speech
function speakText(text) {
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US'; // Set language (customize if needed)
  utterance.rate = 1; // Adjust the rate of speech (1 is normal)
  utterance.pitch = 1; // Adjust the pitch (1 is normal)

  synth.cancel(); // Cancel any ongoing speech
  synth.speak(utterance);
}

// You can delete this once you've filled out an API key
maybeShowApiKeyBanner(API_KEY);
