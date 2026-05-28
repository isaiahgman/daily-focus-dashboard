import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, '../src/data/data.json');
const FALLBACK_FILE = path.join(__dirname, '../src/data/fallback_data.json');

// Initialize Gemini API
// GitHub Actions will provide GEMINI_API_KEY as an env variable
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'dummy' });

async function fetchExternalData() {
  // Simulating fetching a verse. In production, this would ping a free API like bible-api.com
  // Example: const res = await fetch('https://bible-api.com/?random=verse');
  // For this reliable set-and-forget, we'll fetch a random Proverb or Psalm.
  const randomChapter = Math.floor(Math.random() * 31) + 1;
  const response = await fetch(`https://bible-api.com/proverbs+${randomChapter}:1`);
  if (!response.ok) {
    throw new Error('Failed to fetch from Bible API');
  }
  const data = await response.json();
  
  // Mocks for Commentary and History as free reliable APIs for these are scarce
  // In a real scenario, you'd fetch these from other endpoints
  return {
    verse: {
      reference: data.reference,
      text: data.text.trim()
    },
    commentary: "A powerful reminder of ancient wisdom applicable to modern life. Proverbs often highlights the duality of human choices: the path of wisdom versus the path of folly.",
    history: "The Book of Proverbs is a collection of biblical wisdom literature, traditionally attributed to King Solomon of Israel in the 10th century BC, though it likely contains contributions from various authors over centuries."
  };
}

async function run() {
  console.log("Starting Daily Focus Data Aggregation...");
  let rawData = null;
  let isRawMode = false;
  let takeaways = [];

  try {
    console.log("Fetching external APIs...");
    rawData = await fetchExternalData();
  } catch (error) {
    console.error("External API failed, attempting fallback:", error.message);
    try {
      const fallbackContent = fs.readFileSync(FALLBACK_FILE, 'utf8');
      const fallbackData = JSON.parse(fallbackContent);
      rawData = {
        verse: fallbackData.verse,
        commentary: fallbackData.commentary,
        history: fallbackData.history
      };
      isRawMode = true; // Still marking as raw if primary failed and we had to fallback
    } catch (fallbackError) {
      console.error("Fallback also failed!", fallbackError.message);
      process.exit(1); // Abort action if both fail
    }
  }

  // Attempt to use Gemini for summaries
  if (!process.env.GEMINI_API_KEY) {
    console.log("No GEMINI_API_KEY found, bypassing AI summary.");
    isRawMode = true;
  } else {
    try {
      console.log("Generating AI takeaways with Gemini...");
      const prompt = `
        Analyze the following verse, commentary, and historical context.
        Extract exactly 3 concise, modern, and highly actionable takeaways for a daily focus dashboard.
        Format the output strictly as a JSON array of 3 strings. Do not include markdown formatting or the word JSON.
        
        Verse (${rawData.verse.reference}): ${rawData.verse.text}
        Commentary: ${rawData.commentary}
        History: ${rawData.history}
      `;

      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
      });

      const responseText = response.text.trim();
      // Simple parse attempt, assuming it returns a raw array or markdown array
      let cleanedText = responseText;
      if (cleanedText.startsWith('```json')) {
          cleanedText = cleanedText.replace(/```json/g, '').replace(/```/g, '').trim();
      }
      takeaways = JSON.parse(cleanedText);
    } catch (error) {
      console.error("Gemini API failed or rate-limited:", error.message);
      isRawMode = true; // Fallback to Raw Mode
    }
  }

  const finalOutput = {
    date: new Date().toISOString().split('T')[0],
    verse: rawData.verse,
    commentary: rawData.commentary,
    history: rawData.history,
    takeaways: takeaways.length > 0 ? takeaways : [
        "Focus on the wisdom of the text.",
        "Consider its historical weight.",
        "Reflect on its application today."
    ],
    isRawMode: isRawMode
  };

  // Final Validation
  if (!finalOutput.verse || !finalOutput.verse.text) {
    console.error("Critical Failure: Final assembled object is null or invalid.");
    process.exit(1); // Abort GitHub Action
  }

  // Write to data.json
  fs.writeFileSync(DATA_FILE, JSON.stringify(finalOutput, null, 2));
  console.log("Successfully generated src/data/data.json");
}

run();
