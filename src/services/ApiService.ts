// API service for interacting with the Flask backend for AI features

// Use the local Flask server when running in development mode
export const API_BASE_URL = __DEV__ 
  ? 'http://localhost:5000/api'
  : 'https://your-flask-api.com/api'; // Replace with your production API URL when deploying

/**
 * Analyzes journal text to determine mood and suggested mode
 * 
 * @param journalText The text to analyze
 * @returns Promise with suggested mode and confidence score
 */
export const analyzeMood = async (journalText: string): Promise<{
  suggestedMode: 'growth' | 'action';
  confidence: number;
  analysis: string;
}> => {
  try {
    // For development/testing, mock the response
    if (!API_BASE_URL.includes('your-flask-api.com')) {
      const response = await fetch(`${API_BASE_URL}/analyze-mood`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: journalText }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    }

    // Mock response for development
    // In a real implementation, this would make an actual API call
    console.log('Analyzing mood (mock):', journalText.substring(0, 20) + '...');
    
    // Simple mock logic
    const isActionMode = journalText.toLowerCase().match(/energ|product|activ|focus|fast|accomplish/g);
    const isGrowthMode = journalText.toLowerCase().match(/calm|reflect|grow|mind|relax|peace/g);
    
    const actionCount = isActionMode ? isActionMode.length : 0;
    const growthCount = isGrowthMode ? isGrowthMode.length : 0;
    
    let suggestedMode: 'growth' | 'action' = 'growth';
    let confidence = 0.5;
    let analysis = 'Your journal suggests a balanced state.';
    
    if (actionCount > growthCount) {
      suggestedMode = 'action';
      confidence = 0.5 + Math.min(0.5, actionCount * 0.1);
      analysis = 'Your entry shows energy and focus. Action mode might help channel this productivity.';
    } else if (growthCount > actionCount) {
      suggestedMode = 'growth';
      confidence = 0.5 + Math.min(0.5, growthCount * 0.1);
      analysis = 'Your entry shows reflection and mindfulness. Growth mode could complement this state.';
    }
    
    // Mock delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      suggestedMode,
      confidence,
      analysis
    };
  } catch (error) {
    console.error('Error analyzing mood:', error);
    
    // Fallback
    return {
      suggestedMode: 'growth',
      confidence: 0.5,
      analysis: 'Unable to analyze mood. Default to balanced state.'
    };
  }
};

/**
 * Generates personalized habit suggestions based on current mode
 * 
 * @param mode The current app mode
 * @param existingHabits List of existing habits
 * @returns Promise with habit suggestions
 */
export const generateHabitSuggestions = async (
  mode: 'growth' | 'action',
  existingHabits: string[] = []
): Promise<Array<{
  title: string;
  description: string;
  category: string;
}>> => {
  try {
    // For actual API integration
    if (!API_BASE_URL.includes('your-flask-api.com')) {
      const response = await fetch(`${API_BASE_URL}/generate-habits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          mode,
          existingHabits 
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    }

    // Mock response for development
    console.log('Generating habit suggestions (mock) for mode:', mode);
    
    // Predefined habit suggestions based on mode
    const growthHabits = [
      {
        title: 'Morning Meditation',
        description: 'Start your day with 5-10 minutes of mindful meditation',
        category: 'Mindfulness'
      },
      {
        title: 'Gratitude Journal',
        description: 'Write down 3 things you are grateful for each day',
        category: 'Reflection'
      },
      {
        title: 'Deep Reading',
        description: 'Read a book for understanding and growth for 20 minutes',
        category: 'Learning'
      },
      {
        title: 'Nature Walk',
        description: 'Take a mindful walk in nature, focusing on your surroundings',
        category: 'Mindfulness'
      },
      {
        title: 'Skill Development',
        description: 'Spend time developing a skill important to your long-term growth',
        category: 'Learning'
      }
    ];
    
    const actionHabits = [
      {
        title: 'Morning HIIT',
        description: 'Start your day with 10 minutes of high-intensity interval training',
        category: 'Exercise'
      },
      {
        title: 'Task Prioritization',
        description: 'List and prioritize three key tasks to complete today',
        category: 'Productivity'
      },
      {
        title: 'Power Hour',
        description: 'Dedicate one distraction-free hour to your most important task',
        category: 'Productivity'
      },
      {
        title: 'Quick Learning',
        description: 'Spend 15 minutes learning something new relevant to today\'s goals',
        category: 'Learning'
      },
      {
        title: 'Evening Review',
        description: 'Review your accomplishments and plan for tomorrow',
        category: 'Planning'
      }
    ];
    
    // Select from the appropriate list based on mode
    const habitOptions = mode === 'growth' ? growthHabits : actionHabits;
    
    // Filter out existing habits (simple matching by title for the mock)
    const filteredHabits = habitOptions.filter(habit => 
      !existingHabits.some(existing => 
        existing.toLowerCase() === habit.title.toLowerCase()
      )
    );
    
    // Return 3 random suggestions (or all if less than 3)
    const shuffledHabits = [...filteredHabits].sort(() => 0.5 - Math.random());
    const suggestedHabits = shuffledHabits.slice(0, Math.min(3, shuffledHabits.length));
    
    // Mock delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    return suggestedHabits;
  } catch (error) {
    console.error('Error generating habit suggestions:', error);
    
    // Fallback suggestions
    if (mode === 'growth') {
      return [
        {
          title: 'Basic Meditation',
          description: 'Take a few minutes for mindful breathing and centering',
          category: 'Mindfulness'
        }
      ];
    } else {
      return [
        {
          title: 'Quick Task List',
          description: 'Write down your most important tasks for the day',
          category: 'Productivity'
        }
      ];
    }
  }
};

/**
 * Generates a personalized encouragement message based on user data
 * 
 * @param mode The current app mode
 * @param habitCompletions Number of habit completions
 * @returns Promise with encouragement message
 */
export const generateEncouragementMessage = async (
  mode: 'growth' | 'action',
  habitCompletions: number = 0
): Promise<string> => {
  try {
    // For actual API integration
    if (!API_BASE_URL.includes('your-flask-api.com')) {
      const response = await fetch(`${API_BASE_URL}/generate-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          mode,
          habitCompletions
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.message;
    }

    // Mock response for development
    console.log('Generating encouragement message (mock) for mode:', mode);
    
    // Based on completion count
    let completionLevel = 'starting';
    if (habitCompletions > 10) {
      completionLevel = 'advanced';
    } else if (habitCompletions > 3) {
      completionLevel = 'building';
    }
    
    // Message templates
    const messages = {
      growth: {
        starting: [
          "Every moment of mindfulness plants a seed of growth.",
          "Your journey of self-improvement begins with a single step.",
          "Growth is not always visible, but it's happening with every choice you make."
        ],
        building: [
          "Your dedication to growth is creating new neural pathways. Keep nurturing them.",
          "Like a tree establishing roots, your habits are creating a foundation for transformation.",
          "Notice the subtle changes in how you respond to challenges—that's growth happening."
        ],
        advanced: [
          "Your consistent practice has created a sanctuary of growth within you.",
          "The wisdom you're developing through practice is becoming part of who you are.",
          "Your mindful habits are not just activities—they're shaping your perception of the world."
        ]
      },
      action: {
        starting: [
          "Every action you take builds momentum. Let's keep it going!",
          "Small steps lead to big accomplishments. You're on your way!",
          "Energy follows intention. Your productivity journey has begun!"
        ],
        building: [
          "You're hitting your stride! Your productivity engine is warming up.",
          "Consistency is your superpower. Each completed habit multiplies your momentum.",
          "You're turning potential into kinetic energy with every task completed."
        ],
        advanced: [
          "You've become a force of nature—unstoppable and purposeful in your actions.",
          "Your productive habits have created a powerful slipstream effect in your life.",
          "The compound effect of your consistency is creating exponential results!"
        ]
      }
    };
    
    // Select random message from appropriate category
    const modeMessages = messages[mode];
    const levelMessages = modeMessages[completionLevel as keyof typeof modeMessages];
    const randomIndex = Math.floor(Math.random() * levelMessages.length);
    
    // Mock delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return levelMessages[randomIndex];
  } catch (error) {
    console.error('Error generating encouragement message:', error);
    
    // Fallback message
    if (mode === 'growth') {
      return "Every step on your growth journey matters. Keep going.";
    } else {
      return "You have the energy and focus to accomplish your goals today.";
    }
  }
};

/**
 * Analyze sentiment of a journal entry
 * 
 * @param journalText The journal text to analyze
 * @returns Promise with sentiment analysis result
 */
export const analyzeSentiment = async (journalText: string): Promise<{
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
  keywords: string[];
}> => {
  try {
    // For actual API integration
    if (!API_BASE_URL.includes('your-flask-api.com')) {
      const response = await fetch(`${API_BASE_URL}/analyze-sentiment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: journalText }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    }

    // Mock response for development
    console.log('Analyzing sentiment (mock):', journalText.substring(0, 20) + '...');
    
    // Simple mock sentiment analysis
    const posWords = ['happy', 'good', 'great', 'excellent', 'joy', 'excited', 'accomplished'];
    const negWords = ['sad', 'bad', 'awful', 'terrible', 'disappointed', 'anxious', 'stressed'];
    
    let posCount = 0;
    let negCount = 0;
    const keywords: string[] = [];
    
    // Count positive and negative words
    const words = journalText.toLowerCase().split(/\s+/);
    words.forEach(word => {
      const cleanWord = word.replace(/[^\w]/g, '');
      if (posWords.includes(cleanWord)) {
        posCount++;
        if (!keywords.includes(cleanWord)) keywords.push(cleanWord);
      } else if (negWords.includes(cleanWord)) {
        negCount++;
        if (!keywords.includes(cleanWord)) keywords.push(cleanWord);
      }
    });
    
    // Calculate sentiment
    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    let score = 0;
    
    if (posCount > negCount) {
      sentiment = 'positive';
      score = Math.min(1, 0.5 + (posCount - negCount) * 0.1);
    } else if (negCount > posCount) {
      sentiment = 'negative';
      score = Math.min(1, 0.5 + (negCount - posCount) * 0.1);
    }
    
    // Mock delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      sentiment,
      score,
      keywords
    };
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    
    // Fallback response
    return {
      sentiment: 'neutral',
      score: 0.5,
      keywords: []
    };
  }
};