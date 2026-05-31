import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { BIBLE_BOOKS, GRADIENT_THEMES, getDevotionalPrompt } from './bibleData.js';

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
  let wordStudy = {};

  // 1. Fetch Scripture
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

  // 3. Select theme
  const theme = GRADIENT_THEMES[Math.floor(Math.random() * GRADIENT_THEMES.length)];

  // 4. Generate AI Devotional Content
  if (!process.env.GEMINI_API_KEY) {
    console.log("No GEMINI_API_KEY found, bypassing AI generation.");
    isRawMode = true;
    commentary = rawData.commentary || "A powerful reminder of faith and encouragement for our daily journey.";
    history = rawData.history || "This scripture has encouraged readers for generations.";
    takeaways = [
      "Focus on the Lord Jesus Christ and His grace.",
      "Explore the scriptures with a prayerful heart.",
      "Apply these eternal truths to your walk today."
    ];
    wordStudy = {
      originalWord: "ἀγάπη",
      transliteration: "agape",
      language: "Greek",
      definition: "Sacrificial, unconditional love; the love of God for man, which serves as the ultimate model for Christian fellowship."
    };
  } else {
    try {
      console.log("Generating AI content with Gemini...");
      const prompt = getDevotionalPrompt(rawData.verse.reference, rawData.verse.text);

      console.log(`[GEMINI PROMPT] Sending data to Gemini for reference: ${rawData.verse.reference}`);

      const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseJsonSchema: {
              type: 'object',
              properties: {
                esvVerseText: {
                  type: 'string',
                  description: 'The text of the verse rewritten in the English Standard Version (ESV).'
                },
                takeaways: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Exactly 3 concise, modern, and highly actionable takeaways pointing to the Lord Jesus Christ.'
                },
                commentary: {
                  type: 'string',
                  description: 'A encouraging theological commentary on this verse, drawing from the key influences mentioned in the rules and pointing to the Lord Jesus.'
                },
                history: {
                  type: 'string',
                  description: 'Interesting context connecting the history of the verse/book with one of today\'s Wikipedia events.'
                },
                wordStudy: {
                  type: 'object',
                  properties: {
                    originalWord: { type: 'string', description: 'The original word in Greek/Hebrew script (e.g. πίστις).' },
                    transliteration: { type: 'string', description: 'The transliterated English representation of the word (e.g. pistis).' },
                    language: { type: 'string', description: 'Whether the word is "Greek" or "Hebrew".' },
                    definition: { type: 'string', description: 'The root meaning, translation, and spiritual nuance of the word pointing to Christ.' }
                  },
                  required: ['originalWord', 'transliteration', 'language', 'definition']
                }
              },
              required: ['esvVerseText', 'takeaways', 'commentary', 'history', 'wordStudy']
            }
          }
      });

      const responseText = response.text.trim();
      console.log(`[GEMINI SUCCESS] Received structured AI response`);
      
      const parsed = JSON.parse(responseText);
      
      // Update KJV verse text in the payload with the rewritten ESV verse text
      rawData.verse.text = parsed.esvVerseText;
      takeaways = parsed.takeaways;
      commentary = parsed.commentary;
      history = parsed.history;
      wordStudy = parsed.wordStudy;
    } catch (error) {
      console.error("Gemini API failed or rate-limited:", error.message);
      isRawMode = true;
      commentary = rawData.commentary || "A powerful reminder of faith and encouragement for our daily journey.";
      history = rawData.history || "This scripture has encouraged readers for generations.";
      takeaways = [
        "Focus on the Lord Jesus Christ and His grace.",
        "Explore the scriptures with a prayerful heart.",
        "Apply these eternal truths to your walk today."
      ];
      wordStudy = {
        originalWord: "ἀγάπη",
        transliteration: "agape",
        language: "Greek",
        definition: "Sacrificial, unconditional love; the love of God for man, which serves as the ultimate model for Christian fellowship."
      };
    }
  }

  const finalOutput = {
    date: new Date().toISOString().split('T')[0],
    verse: rawData.verse,
    commentary: commentary,
    history: history,
    takeaways: takeaways,
    wordStudy: wordStudy,
    theme: theme,
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

export { fetchExternalData, BIBLE_BOOKS, run, DATA_FILE, FALLBACK_FILE };

// Direct execution guard
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run();
}
