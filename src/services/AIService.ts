// AIService.ts - Integration of AI capabilities using LangChain-like functionality
// This is a simplified version of the Flask backend's AI capabilities

// Base API URL - same as other services
import { API_BASE_URL } from './ApiService';

// In-memory storage for user profile information
let userProfile = {
  likes: [],
  dislikes: [],
  hobbies: [],
  interests: [],
  remarks: ''
};

/**
 * Generates or updates remarks for a habit based on previous remarks
 * 
 * @param habitId The ID of the habit
 * @param newRemark The new remark to add
 * @returns Promise with updated remark
 */
export const generateHabitRemark = async (
  habitId: string, 
  newRemark: string
): Promise<string> => {
  try {
    // For actual API integration
    if (!API_BASE_URL.includes('your-flask-api.com')) {
      const response = await fetch(`${API_BASE_URL}/remarker`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          habit_id: habitId,
          text: newRemark
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.remark;
    }

    // Mock implementation with simple remark combining logic
    console.log('Generating remark for habit (mock):', habitId);
    
    // For the mock version, we'll simulate the behavior with simpler logic
    // In a real implementation, this would use LangChain/Groq
    
    // Find existing remarks in our in-memory database
    // This is a simplified version - in the real app you'd store and retrieve remarks per habit
    const existingRemark = localStorage.getItem(`habit-remark-${habitId}`) || '';
    
    // Combine remarks (simple approach for mock)
    let combinedRemark = newRemark;
    if (existingRemark) {
      // Avoid duplication by checking if new remark contains parts of existing
      if (!newRemark.toLowerCase().includes(existingRemark.toLowerCase())) {
        combinedRemark = existingRemark + '. ' + newRemark;
      }
    }
    
    // Truncate to 20 words max (similar to original remarker function)
    const words = combinedRemark.split(' ');
    if (words.length > 20) {
      combinedRemark = words.slice(0, 20).join(' ');
    }
    
    // Store for future use
    localStorage.setItem(`habit-remark-${habitId}`, combinedRemark);
    
    // Mock delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return combinedRemark;
  } catch (error) {
    console.error('Error generating remark:', error);
    return 'Failed to update habit remark';
  }
};

/**
 * Generate a user profile based on answers to questionnaire
 * 
 * @param userData Object containing user's answers to profile questions
 * @returns Promise with generated profile
 */
export const generateUserProfile = async (
  userData: Record<string, any>
): Promise<{ profile: string }> => {
  try {
    // For actual API integration
    if (!API_BASE_URL.includes('your-flask-api.com')) {
      const response = await fetch(`${API_BASE_URL}/profiler`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_data: userData
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    }

    // Mock implementation of profile generation
    console.log('Generating user profile (mock):', userData);
    
    // Analyze free time preferences
    let profile = 'Based on your answers, ';
    
    // Extract insights from user data (simplified version of what LangChain would do)
    if (userData["How do you usually prefer to spend your free time?"]) {
      const freeTime = userData["How do you usually prefer to spend your free time?"];
      if (Array.isArray(freeTime)) {
        if (freeTime.includes("Engaging in creative activities")) {
          userProfile.interests.push("creativity");
          userProfile.hobbies.push("artistic pursuits");
        }
        if (freeTime.includes("Socializing with friends/family")) {
          userProfile.likes.push("social interaction");
        }
        if (freeTime.includes("Learning something new")) {
          userProfile.interests.push("knowledge acquisition");
        }
      }
    }
    
    // Analyze work style
    if (userData["What's your ideal work style?"]) {
      if (userData["What's your ideal work style?"].includes("structured environment")) {
        userProfile.likes.push("organization");
        userProfile.likes.push("structure");
      }
    }
    
    // Analyze task approach
    if (userData["Which of the following statements best describes your approach to tasks?"]) {
      if (userData["Which of the following statements best describes your approach to tasks?"].includes("small, manageable tasks")) {
        profile += "you prefer incremental progress. ";
      }
    }
    
    // Compile profile from extracted insights
    if (userProfile.likes.length > 0) {
      profile += `You enjoy ${userProfile.likes.join(", ")}. `;
    }
    
    if (userProfile.interests.length > 0) {
      profile += `Your interests include ${userProfile.interests.join(", ")}. `;
    }
    
    if (userProfile.hobbies.length > 0) {
      profile += `You seem to have hobbies related to ${userProfile.hobbies.join(", ")}. `;
    }
    
    // Add recommendation based on motivations
    if (userData["What motivates you the most to stick to a goal or habit?"]) {
      if (userData["What motivates you the most to stick to a goal or habit?"].includes("Internal satisfaction")) {
        profile += "You're intrinsically motivated and would benefit from habits that provide a sense of personal achievement.";
      }
    }
    
    // Store the profile
    userProfile.remarks = profile;
    
    // Mock delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return { profile };
  } catch (error) {
    console.error('Error generating profile:', error);
    return { profile: 'Unable to generate profile at this time.' };
  }
};

// Helper function to get the current user profile
export const getUserProfile = (): typeof userProfile => {
  return { ...userProfile };
};

// Helper function to reset the user profile (for testing)
export const resetUserProfile = (): void => {
  userProfile = {
    likes: [],
    dislikes: [],
    hobbies: [],
    interests: [],
    remarks: ''
  };
};