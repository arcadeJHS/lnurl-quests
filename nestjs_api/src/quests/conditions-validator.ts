// TODO: improve implementation and types of the validation function
// TODO: is it possible to implement a generic interface for validation in order to use different "validators"?

const validateWordGuess = (
  scenarioWords: string[],
  wordsToGuess: { words: string[]; min: number },
): boolean => {
  const correctGuesses = scenarioWords.filter((word) =>
    wordsToGuess.words.includes(word),
  );
  return correctGuesses.length >= wordsToGuess.min;
};

const compareValues = (a: any, operator: string, b: any): boolean => {
  switch (operator) {
    case 'eq':
      return a === b;
    case 'gt':
      return a > b;
    case 'gte':
      return a >= b;
    case 'lt':
      return a < b;
    case 'lte':
      return a <= b;
    default:
      return false;
  }
};

/**
    This is a simple example function that validates if a user's scenario satisfy the quest conditions.
    @param {Object} scenario - Dictionary of user's scenario to validate
    @param {Object} conditions - Dictionary defining the quest conditions
    @returns {boolean} Indicates if the conditions is satisfied
    
    Example conditions with a possible scenario:
    
    conditions: {
      wordsToGuess: {
        words: ['quantum', 'relativity', 'neuroscience', 'blockchain', 'algorithm'],
        min: 3
      }
    },
    scenario: {
      words: ['quantum', 'blockchain', 'algorithm']
    }
  
    conditions:{
      wordToPost: { comparison: 'eq', value: "#bitcoin" },
      postsCount: { comparison: 'gte', value: 3 },
    }
    scenario: {
      wordToPost: "#bitcoin",
      postsCount: 3
    }
   */
export const validateConditions = (
  scenario: Record<string, any>,
  conditions: Record<string, any>,
): boolean => {
  // Iterate through all conditions keys
  for (const [key, requiredValue] of Object.entries(conditions)) {
    // Check if the key exists in user scenario
    if (!(key in scenario)) {
      return false;
    }

    const scenarioValue = scenario[key];

    // Simple number or string conditions (exact match)
    if (
      typeof requiredValue === 'number' ||
      typeof requiredValue === 'string'
    ) {
      if (scenarioValue !== requiredValue) {
        return false;
      }
    }
    // Condition is a complex object
    else if (typeof requiredValue === 'object' && requiredValue !== null) {
      // Guess the words condition
      if ('wordsToGuess' in requiredValue) {
        if (!Array.isArray(scenario.words)) {
          return false;
        }
        if (!validateWordGuess(scenario.words, requiredValue.wordsToGuess)) {
          return false;
        }
      }
      // Complex conditions with comparison operators
      else if ('comparison' in requiredValue && 'value' in requiredValue) {
        const operator = requiredValue.comparison || 'eq';
        const targetValue = requiredValue.value;
        if (!compareValues(scenarioValue, operator, targetValue)) {
          return false;
        }
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  return true;
};
