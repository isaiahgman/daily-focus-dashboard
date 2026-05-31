export const BIBLE_BOOKS = {
  // Old Testament (39 books)
  "Genesis": 50,
  "Exodus": 40,
  "Leviticus": 27,
  "Numbers": 36,
  "Deuteronomy": 34,
  "Joshua": 24,
  "Judges": 21,
  "Ruth": 4,
  "1 Samuel": 31,
  "2 Samuel": 24,
  "1 Kings": 22,
  "2 Kings": 25,
  "1 Chronicles": 29,
  "2 Chronicles": 36,
  "Ezra": 10,
  "Nehemiah": 13,
  "Esther": 10,
  "Job": 42,
  "Psalms": 150,
  "Proverbs": 31,
  "Ecclesiastes": 12,
  "Song of Solomon": 8,
  "Isaiah": 66,
  "Jeremiah": 52,
  "Lamentations": 5,
  "Ezekiel": 48,
  "Daniel": 12,
  "Hosea": 14,
  "Joel": 3,
  "Amos": 9,
  "Obadiah": 1,
  "Jonah": 4,
  "Micah": 7,
  "Nahum": 3,
  "Habakkuk": 3,
  "Zephaniah": 3,
  "Haggai": 2,
  "Zechariah": 14,
  "Malachi": 4,

  // New Testament (27 books)
  "Matthew": 28,
  "Mark": 16,
  "Luke": 24,
  "John": 21,
  "Acts": 28,
  "Romans": 16,
  "1 Corinthians": 16,
  "2 Corinthians": 13,
  "Galatians": 6,
  "Ephesians": 6,
  "Philippians": 4,
  "Colossians": 4,
  "1 Thessalonians": 5,
  "2 Thessalonians": 3,
  "1 Timothy": 6,
  "2 Timothy": 4,
  "Titus": 3,
  "Philemon": 1,
  "Hebrews": 13,
  "James": 5,
  "1 Peter": 5,
  "2 Peter": 3,
  "1 John": 5,
  "2 John": 1,
  "3 John": 1,
  "Jude": 1,
  "Revelation": 22
};

export const GRADIENT_THEMES = [
  {
    name: "Morning Grace",
    theme: "from-amber-500/10 via-orange-500/5 to-transparent dark:from-amber-500/20 dark:via-orange-600/10 dark:to-violet-800/20",
    border: "border-orange-500/15 dark:border-orange-500/20",
    text: "text-orange-700 dark:text-orange-400 font-semibold"
  },
  {
    name: "Living Waters",
    theme: "from-blue-500/10 via-cyan-500/5 to-transparent dark:from-blue-600/25 dark:via-cyan-600/15 dark:to-emerald-800/20",
    border: "border-cyan-500/15 dark:border-cyan-500/20",
    text: "text-cyan-700 dark:text-cyan-400 font-semibold"
  },
  {
    name: "Sovereign Gold",
    theme: "from-yellow-500/10 via-amber-500/5 to-transparent dark:from-yellow-600/15 dark:via-amber-600/15 dark:to-stone-900/40",
    border: "border-amber-500/15 dark:border-amber-500/20",
    text: "text-amber-700 dark:text-amber-400 font-semibold"
  },
  {
    name: "Peaceful Twilight",
    theme: "from-indigo-500/10 via-purple-500/5 to-transparent dark:from-indigo-600/25 dark:via-purple-600/15 dark:to-pink-800/20",
    border: "border-purple-500/15 dark:border-purple-500/20",
    text: "text-purple-700 dark:text-purple-400 font-semibold"
  },
  {
    name: "Living Hope",
    theme: "from-emerald-500/10 via-teal-500/5 to-transparent dark:from-emerald-500/15 dark:via-teal-600/15 dark:to-emerald-950/40",
    border: "border-emerald-500/15 dark:border-emerald-500/20",
    text: "text-emerald-700 dark:text-emerald-400 font-semibold"
  },
  {
    name: "Royal Purity",
    theme: "from-rose-500/10 via-purple-500/5 to-transparent dark:from-rose-500/25 dark:via-purple-600/15 dark:to-slate-900/30",
    border: "border-rose-500/15 dark:border-rose-500/20",
    text: "text-rose-700 dark:text-rose-400 font-semibold"
  }
];

export function getDevotionalPrompt(verseRef, verseText) {
  return `
    You are a Bible study companion designed for exploration and synthesis.

    Input Verse:
    Reference: ${verseRef}
    Text (King James Version): ${verseText}

    Core Rules:
    1. Primary Version: Use the English Standard Version (ESV) as the default text. Provide the text of the verse rewritten in the ESV as esvVerseText.
    2. Cross-Reference: When helpful for nuance in the commentary, reference the Amplified Bible, CSB, or KJV.
    3. No Preaching: Do not purely lecture on doctrine. Help the user explore the text, find connections, and synthesize insights.
    4. Key Influences: Prioritize the perspectives and writings of the following men (and their direct co-workers who were in agreement) to guide your commentary, insights, and takeaways:
       - Bakht Singh
       - Watchman Nee
       - Stephen Kaung
       - Dana Congdon
       - Lance Lambert
       - T. Austin-Sparks
       - A.W. Tozer
       - C.H. Mackintosh
       - Charles Stanley
    5. Christ-centered: Ultimately point the takeaways, commentary, and lexicon study to the Lord Jesus Christ.
    6. Historical Context: In your history field, provide the true historical, cultural, and geographical background of the verse/book. Show how these original circumstances illuminate the spiritual meaning of the text and point to Christ.
    7. Word Study: Identify one key theological word in the verse, find its original language script (Greek or Hebrew), its transliteration, and its original meaning.
  `;
}
