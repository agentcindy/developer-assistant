const mockText = jest.fn().mockReturnValue('This is an analysis result');
const mockGenerateContent = jest.fn().mockResolvedValue({
  response: {
    text: mockText,
  },
});
const mockGetGenerativeModel = jest.fn().mockReturnValue({
  generateContent: mockGenerateContent,
});
const mockGoogleGenerativeAI = jest.fn().mockImplementation(() => ({
  getGenerativeModel: mockGetGenerativeModel,
}));

// Mock the Google Generative AI module
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: mockGoogleGenerativeAI,
}));

import { analyzeCode } from '../api/actions';

describe('analyzeCode', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    // Reset mocks to default behavior
    mockText.mockReturnValue('This is an analysis result');
    mockGenerateContent.mockResolvedValue({
      response: {
        text: mockText,
      },
    });
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should throw error when API key is not set', async () => {
    delete process.env.GOOGLE_API_KEY;

    await expect(analyzeCode('const x = 1;')).rejects.toThrow(
      'Failed to analyze code: No API key found'
    );
  });

  it('should return analysis result when API key is set', async () => {
    process.env.GOOGLE_API_KEY = 'test-api-key';

    const result = await analyzeCode('const x = 1;');

    expect(result).toBe('This is an analysis result');
  });

  it('should use default model when GEMINI_MODEL is not set', async () => {
    process.env.GOOGLE_API_KEY = 'test-api-key';
    delete process.env.GEMINI_MODEL;

    await analyzeCode('const x = 1;');

    expect(mockGetGenerativeModel).toHaveBeenCalledWith({
      model: 'gemma-3-27b-it',
    });
  });

  it('should use custom model when GEMINI_MODEL is set', async () => {
    process.env.GOOGLE_API_KEY = 'test-api-key';
    process.env.GEMINI_MODEL = 'custom-model';

    await analyzeCode('const x = 1;');

    expect(mockGetGenerativeModel).toHaveBeenCalledWith({
      model: 'custom-model',
    });
  });

  it('should include code snippet in the prompt', async () => {
    process.env.GOOGLE_API_KEY = 'test-api-key';

    const codeSnippet = 'function test() { return 42; }';
    await analyzeCode(codeSnippet);

    expect(mockGenerateContent).toHaveBeenCalledWith(
      expect.stringContaining(codeSnippet)
    );
  });

  it('should construct proper prompt with instructions', async () => {
    process.env.GOOGLE_API_KEY = 'test-api-key';

    await analyzeCode('const x = 1;');

    expect(mockGenerateContent).toHaveBeenCalledWith(
      expect.stringContaining('Generate a short and concise summary')
    );
  });

  it('should handle API errors gracefully', async () => {
    process.env.GOOGLE_API_KEY = 'test-api-key';
    mockGenerateContent.mockRejectedValue(new Error('API Error'));

    await expect(analyzeCode('const x = 1;')).rejects.toThrow(
      'Failed to analyze code: API Error'
    );
  });

  it('should handle non-Error exceptions', async () => {
    process.env.GOOGLE_API_KEY = 'test-api-key';
    mockGenerateContent.mockRejectedValue('String error');

    await expect(analyzeCode('const x = 1;')).rejects.toThrow(
      'Failed to analyze code: Unknown error'
    );
  });

  it('should initialize GoogleGenerativeAI with correct API key', async () => {
    process.env.GOOGLE_API_KEY = 'my-secret-key';

    await analyzeCode('const x = 1;');

    expect(mockGoogleGenerativeAI).toHaveBeenCalledWith('my-secret-key');
  });
});
