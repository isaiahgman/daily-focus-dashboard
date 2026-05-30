import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { BIBLE_BOOKS } from './bibleData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, '../src/data/data.json');
const FALLBACK_FILE = path.join(__dirname, '../src/data/fallback_data.json');

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'dummy' });

async function fetchExternalData() {
  const bookList = Object.keys(BIBLE_BOOKS);
  const randomBook = bookList[Math.floor(Math.random() * bookList.length)];
  const maxChapters = BIBLE_BOOKS[randomBook];
  const randomChapter = Math.floor(Math.random() * maxChapters) + 1;

  const url = `https://bible-api.com/${encodeURIComponent(randomBook)}+${randomChapter}?translation=kjv`;
  console.log(`[API CALL] Requesting Bible Chapter: ${url}`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch from Bible API: ${response.statusText}`);
  }
  const data = await response.json();
  const verses = data.verses;
  
  if (!verses || verses.length === 0) {
    throw new Error(`No verses returned for ${randomBook} ${randomChapter}`);
  }

  // Pick a random verse from the chapter
  const randomVerseIndex = Math.floor(Math.random() * verses.length);
  const verse = verses[randomVerseIndex];
  console.log(`[API SUCCESS] Selected: ${verse.book_name} ${verse.chapter}:${verse.verse}`);

  return {
    verse: {
      reference: `${verse.book_name} ${verse.chapter}:${verse.verse}`,
      text: verse.text.trim()
    }
  };
}

async function run() {
  console.log("Starting Daily Godly Encouragement Data Aggregation...");
  let rawData = null;
  let isRawMode = false;
  let takeaways = [];
  let commentary = "";
  let history = "";

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
      isRawMode = true;
    } catch (fallbackError) {
      console.error("Fallback also failed!", fallbackError.message);
      process.exit(1);
    }
  }

  // Attempt to use Gemini for dynamic commentary, history, and takeaways
  if (!process.env.GEMINI_API_KEY) {
    console.log("No GEMINI_API_KEY found, bypassing AI generation.");
    isRawMode = true;
    commentary = rawData.commentary || "A powerful reminder of faith and encouragement for our daily journey.";
    history = rawData.history || "This scripture has encouraged readers for generations.";
    takeaways = [
      "Focus on the wisdom of the text.",
      "Consider its historical weight.",
      "Reflect on its application today."
    ];
  } else {
    try {
      console.log("Generating AI content with Gemini...");
      const prompt = `
        Analyze the following verse (King James Version):
        Reference: ${rawData.verse.reference}
        Verse text: ${rawData.verse.text}

        Generate the dynamic content for a daily encouragement dashboard.
      `;

      console.log(`[GEMINI PROMPT] Sending data to Gemini for reference: ${rawData.verse.reference}`);

      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseJsonSchema: {
              type: 'object',
              properties: {
                takeaways: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Exactly 3 concise, modern, and highly actionable takeaways for the user.'
                },
                commentary: {
                  type: 'string',
                  description: 'A brief, encouraging, and modern theological commentary on this specific verse.'
                },
                history: {
                  type: 'string',
                  description: 'Interesting historical or cultural context about the book or chapter of this verse.'
                }
              },
              required: ['takeaways', 'commentary', 'history']
            }
          }
      });

      const responseText = response.text.trim();
      console.log(`[GEMINI SUCCESS] Received structured AI response`);
      
      const parsed = JSON.parse(responseText);
      takeaways = parsed.takeaways;
      commentary = parsed.commentary;
      history = parsed.history;
    } catch (error) {
      console.error("Gemini API failed or rate-limited:", error.message);
      isRawMode = true;
      commentary = rawData.commentary || "A powerful reminder of faith and encouragement for our daily journey.";
      history = rawData.history || "This scripture has encouraged readers for generations.";
      takeaways = [
        "Focus on the wisdom of the text.",
        "Consider its historical weight.",
        "Reflect on its application today."
      ];
    }
  }

  const finalOutput = {
    date: new Date().toISOString().split('T')[0],
    verse: rawData.verse,
    commentary: commentary,
    history: history,
    takeaways: takeaways,
    isRawMode: isRawMode
  };

  // Final Validation
  if (!finalOutput.verse || !finalOutput.verse.text) {
    console.error("Critical Failure: Final assembled object is null or invalid.");
    process.exit(1);
  }

  // Write to data.json
  fs.writeFileSync(DATA_FILE, JSON.stringify(finalOutput, null, 2));
  console.log("Successfully generated src/data/data.json");
}

// Export functions for unit testing
export { fetchExternalData, BIBLE_BOOKS, run, DATA_FILE, FALLBACK_FILE };

// Direct execution guard
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run();
}
