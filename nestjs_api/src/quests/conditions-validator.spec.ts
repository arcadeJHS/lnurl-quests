import { validateConditions } from './conditions-validator';

describe('ConditionsValidator', () => {
  it('should validate exact string and number matches', () => {
    const scenario = { wordToPost: '#bitcoin', postsCount: 3 };
    const conditions = { wordToPost: '#bitcoin', postsCount: 3 };
    expect(validateConditions(scenario, conditions)).toBe(true);
  });

  it('should return false for mismatched strings and numbers', () => {
    const scenario = { wordToPost: '#ethereum', postsCount: 2 };
    const conditions = { wordToPost: '#bitcoin', postsCount: 3 };
    expect(validateConditions(scenario, conditions)).toBe(false);
  });

  it('should validate comparison conditions (gte)', () => {
    const scenario = { postsCount: 5 };
    const conditions = { postsCount: { comparison: 'gte', value: 3 } };
    expect(validateConditions(scenario, conditions)).toBe(true);
  });

  it('should validate comparison conditions (lt)', () => {
    const scenario = { postsCount: 2 };
    const conditions = { postsCount: { comparison: 'lt', value: 3 } };
    expect(validateConditions(scenario, conditions)).toBe(true);
  });

  it('should return false when comparison conditions fail', () => {
    const scenario = { postsCount: 2 };
    const conditions = { postsCount: { comparison: 'gte', value: 3 } };
    expect(validateConditions(scenario, conditions)).toBe(false);
  });

  it('should validate word guesses successfully', () => {
    const scenario = { wordsToGuess: ['quantum', 'blockchain', 'algorithm'] };
    const conditions = {
      wordsToGuess: {
        words: [
          'quantum',
          'relativity',
          'neuroscience',
          'blockchain',
          'algorithm',
        ],
        min: 3,
      },
    };
    expect(validateConditions(scenario, conditions)).toBe(true);
  });

  it('should return false when not enough words are guessed', () => {
    const scenario = { wordsToGuess: ['quantum', 'blockchain'] };
    const conditions = {
      words: {
        wordsToGuess: {
          words: [
            'quantum',
            'relativity',
            'neuroscience',
            'blockchain',
            'algorithm',
          ],
          min: 3,
        },
      },
    };
    expect(validateConditions(scenario, conditions)).toBe(false);
  });

  it('should return false if required keys are missing in the scenario', () => {
    const scenario = { postsCount: 3 };
    const conditions = { wordToPost: '#bitcoin' };
    expect(validateConditions(scenario, conditions)).toBe(false);
  });

  it('should handle complex conditions with multiple criteria', () => {
    const scenario = {
      wordToPost: '#bitcoin',
      postsCount: 5,
      wordsToGuess: ['quantum', 'blockchain', 'algorithm'],
    };
    const conditions = {
      wordToPost: '#bitcoin',
      postsCount: { comparison: 'gte', value: 3 },
      wordsToGuess: {
        words: [
          'quantum',
          'relativity',
          'neuroscience',
          'blockchain',
          'algorithm',
        ],
        min: 3,
      },
    };
    expect(validateConditions(scenario, conditions)).toBe(true);
  });

  it('should return false when any complex condition fails', () => {
    const scenario = {
      wordToPost: '#bitcoin',
      postsCount: 2,
      words: ['quantum', 'blockchain'],
    };
    const conditions = {
      wordToPost: '#bitcoin',
      postsCount: { comparison: 'gte', value: 3 },
      words: {
        wordsToGuess: {
          words: [
            'quantum',
            'relativity',
            'neuroscience',
            'blockchain',
            'algorithm',
          ],
          min: 3,
        },
      },
    };
    expect(validateConditions(scenario, conditions)).toBe(false);
  });

  it('should return false for unknown comparison operators', () => {
    const scenario = { postsCount: 3 };
    const conditions = { postsCount: { comparison: 'unknown', value: 3 } };
    expect(validateConditions(scenario, conditions)).toBe(false);
  });

  it('should handle null and undefined values gracefully', () => {
    const scenario = { key: null };
    const conditions = { key: null };
    expect(validateConditions(scenario, conditions)).toBe(false);
  });

  it('should return false if scenario value does not match required exact value', () => {
    const scenario = { key: 'value' };
    const conditions = { key: 'expectedValue' };
    expect(validateConditions(scenario, conditions)).toBe(false);
  });
});
