import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import { fetchExternalData, run } from './fetchData.js';

// Mock @google/genai module
const { mockGenerateContent } = vi.hoisted(() => {
  return {
    mockGenerateContent: vi.fn().mockResolvedValue({
      text: JSON.stringify({
        takeaways: ["Mock Takeaway 1", "Mock Takeaway 2", "Mock Takeaway 3"],
        commentary: "Mock theological commentary.",
        history: "Mock historical context."
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
      // Mock successful fetch response
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

  describe('run function', () => {
    it('runs successfully when API and Gemini calls succeed', async () => {
      const mockApiResponse = {
        verses: [
          {
            book_name: "Psalms",
            chapter: 23,
            verse: 1,
            text: "The LORD is my shepherd; I shall not want.\n"
          }
        ]
      };

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockApiResponse
      }));

      await run();

      expect(fs.writeFileSync).toHaveBeenCalled();
      const [outputFile, dataString] = fs.writeFileSync.mock.calls[0];
      expect(outputFile).toContain('data.json');
      
      const parsedData = JSON.parse(dataString);
      expect(parsedData.verse.reference).toBe("Psalms 23:1");
      expect(parsedData.commentary).toBe("Mock theological commentary.");
      expect(parsedData.takeaways).toEqual(["Mock Takeaway 1", "Mock Takeaway 2", "Mock Takeaway 3"]);
      expect(parsedData.isRawMode).toBe(false);
    });

    it('falls back to local data when Bible API fails', async () => {
      // Simulate fetch failure
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

    it('enters raw mode and uses generic takeaways if Gemini fails', async () => {
      const mockApiResponse = {
        verses: [
          {
            book_name: "Psalms",
            chapter: 23,
            verse: 1,
            text: "The LORD is my shepherd; I shall not want.\n"
          }
        ]
      };

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockApiResponse
      }));

      // Make Gemini call reject/throw error
      mockGenerateContent.mockRejectedValueOnce(new Error("API Overloaded"));

      await run();

      expect(fs.writeFileSync).toHaveBeenCalled();
      const [, dataString] = fs.writeFileSync.mock.calls[0];
      const parsedData = JSON.parse(dataString);

      expect(parsedData.isRawMode).toBe(true);
      // Fallback takeaways should be used
      expect(parsedData.takeaways[0]).toBe("Focus on the wisdom of the text.");
    });
  });
});
