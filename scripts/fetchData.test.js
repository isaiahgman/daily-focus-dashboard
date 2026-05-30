import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import { fetchExternalData, fetchWikipediaEvents, run } from './fetchData.js';

// Mock @google/genai module
const { mockGenerateContent } = vi.hoisted(() => {
  return {
    mockGenerateContent: vi.fn().mockResolvedValue({
      text: JSON.stringify({
        esvVerseText: "Rewritten ESV verse text.",
        takeaways: ["Mock Takeaway 1", "Mock Takeaway 2", "Mock Takeaway 3"],
        commentary: "Mock theological commentary.",
        history: "Mock historical context connecting verse with Wikipedia event.",
        wordStudy: {
          originalWord: "πίστις",
          transliteration: "pistis",
          language: "Greek",
          definition: "Faith, trust, belief."
        }
      })
    })
  };
});

vi.mock('@google/genai', () => {
  class MockGoogleGenAI {
    constructor() {
      this.models = {
        generateContent: mockGenerateContent
      };
    }
  }
  return {
    GoogleGenAI: MockGoogleGenAI
  };
});

describe('fetchData script', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('GEMINI_API_KEY', 'test-key-123');

    // Spy and mock fs methods to prevent write side-effects and mock fallbacks
    vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
    vi.spyOn(fs, 'readFileSync').mockImplementation((filePath) => {
      if (filePath.endsWith('fallback_data.json')) {
        return JSON.stringify({
          verse: {
            reference: "Lamentations 3:22-23",
            text: "Because of the Lord’s great love we are not consumed..."
          },
          commentary: "Mocked fallback commentary.",
          history: "Mocked fallback history."
        });
      }
      throw new Error(`Unexpected readFileSync in test for path: ${filePath}`);
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('fetchExternalData', () => {
    it('successfully fetches a random verse from bible-api.com', async () => {
      const mockApiResponse = {
        verses: [
          {
            book_name: "Romans",
            chapter: 12,
            verse: 2,
            text: "And be not conformed to this world...\n"
          }
        ]
      };

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockApiResponse
      }));

      const result = await fetchExternalData();

      expect(fetch).toHaveBeenCalled();
      expect(result.verse.reference).toBe("Romans 12:2");
      expect(result.verse.text).toBe("And be not conformed to this world...");
    });

    it('throws an error if the fetch fails', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: false,
        statusText: "Internal Server Error"
      }));

      await expect(fetchExternalData()).rejects.toThrow('Failed to fetch from Bible API');
    });

    it('throws an error if no verses are returned', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ verses: [] })
      }));

      await expect(fetchExternalData()).rejects.toThrow('No verses returned');
    });
  });

  describe('fetchWikipediaEvents', () => {
    it('successfully fetches events from Wikipedia REST API', async () => {
      const mockWikiResponse = {
        events: [
          { year: 1911, text: "The first Indianapolis 500 begins." },
          { year: 1431, text: "Joan of Arc is burned at the stake." }
        ]
      };

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockWikiResponse
      }));

      const result = await fetchWikipediaEvents();

      expect(fetch).toHaveBeenCalled();
      expect(result.length).toBe(2);
      expect(result).toContain("1911: The first Indianapolis 500 begins.");
    });

    it('returns an empty array and logs warning if fetch fails', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: false,
        statusText: "Bad Gateway"
      }));

      const result = await fetchWikipediaEvents();
      expect(result).toEqual([]);
    });
  });

  describe('run function', () => {
    it('runs successfully when API and Gemini calls succeed', async () => {
      // Mock fetch to handle both Bible API and Wikipedia events
      vi.stubGlobal('fetch', vi.fn().mockImplementation(async (url) => {
        if (url.includes('bible-api.com')) {
          return {
            ok: true,
            json: async () => ({
              verses: [
                {
                  book_name: "Psalms",
                  chapter: 23,
                  verse: 1,
                  text: "The LORD is my shepherd; I shall not want.\n"
                }
              ]
            })
          };
        } else if (url.includes('api.wikimedia.org')) {
          return {
            ok: true,
            json: async () => ({
              events: [
                { year: 1911, text: "The first Indianapolis 500 begins." }
              ]
            })
          };
        }
        return { ok: false, statusText: "Not Found" };
      }));

      await run();

      expect(fs.writeFileSync).toHaveBeenCalled();
      const [outputFile, dataString] = fs.writeFileSync.mock.calls[0];
      expect(outputFile).toContain('data.json');
      
      const parsedData = JSON.parse(dataString);
      expect(parsedData.verse.reference).toBe("Psalms 23:1");
      // Verify KJV text was overwritten by ESV text from Gemini mock
      expect(parsedData.verse.text).toBe("Rewritten ESV verse text.");
      expect(parsedData.commentary).toBe("Mock theological commentary.");
      expect(parsedData.history).toBe("Mock historical context connecting verse with Wikipedia event.");
      expect(parsedData.wordStudy.originalWord).toBe("πίστις");
      expect(parsedData.theme).toBeDefined();
      expect(parsedData.isRawMode).toBe(false);
    });

    it('falls back to local data and empty events when external APIs fail', async () => {
      // Simulate fetch failures
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: false,
        statusText: "Bad Gateway"
      }));

      await run();

      expect(fs.writeFileSync).toHaveBeenCalled();
      const [, dataString] = fs.writeFileSync.mock.calls[0];
      const parsedData = JSON.parse(dataString);

      // Verify it used fallback data reference
      expect(parsedData.verse.reference).toBe("Lamentations 3:22-23");
      expect(parsedData.isRawMode).toBe(true);
    });

    it('enters raw mode and uses generic takeaways/lexicon if Gemini fails', async () => {
      vi.stubGlobal('fetch', vi.fn().mockImplementation(async (url) => {
        if (url.includes('bible-api.com')) {
          return {
            ok: true,
            json: async () => ({
              verses: [
                {
                  book_name: "Psalms",
                  chapter: 23,
                  verse: 1,
                  text: "The LORD is my shepherd; I shall not want.\n"
                }
              ]
            })
          };
        } else if (url.includes('api.wikimedia.org')) {
          return {
            ok: true,
            json: async () => ({ events: [] })
          };
        }
        return { ok: false, statusText: "Not Found" };
      }));

      // Make Gemini call reject/throw error
      mockGenerateContent.mockRejectedValueOnce(new Error("API Overloaded"));

      await run();

      expect(fs.writeFileSync).toHaveBeenCalled();
      const [, dataString] = fs.writeFileSync.mock.calls[0];
      const parsedData = JSON.parse(dataString);

      expect(parsedData.isRawMode).toBe(true);
      expect(parsedData.takeaways[0]).toBe("Focus on the Lord Jesus Christ and His grace.");
      expect(parsedData.wordStudy.originalWord).toBe("ἀγάπη");
    });
  });
});
