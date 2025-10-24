// [FE-FIX] Provided full implementation for this file to resolve module and reference errors.
import { GoogleGenAI, Type } from "@google/genai";
import type { LearningPlan } from '../types';

let ai: GoogleGenAI | null = null;

function getAiInstance(): GoogleGenAI {
  if (!ai) {
    if (!process.env.API_KEY) {
      throw new Error("API_KEY environment variable is not set. The application cannot connect to the AI service.");
    }
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
}

const model = "gemini-2.5-flash";

const gradeLevelMap: { [key: string]: string } = {
    'junior': 'Junior (4th - 5th Grade)',
    'level1': 'Level 1 (6th - 7th Grade)',
    'level2': 'Level 2 (8th - 9th Grade)',
    'upper': 'Upper/Free (High School & Adults)',
};

const learningPlanSchema = {
    type: Type.OBJECT,
    properties: {
        goal: {
            type: Type.STRING,
            description: "A concise, one-sentence goal for the student based on their needs."
        },
        modules: {
            type: Type.ARRAY,
            description: "A list of 3-5 learning modules to achieve the student's goal.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "A short, engaging title for the module." },
                    description: { type: Type.STRING, description: "A one-sentence description of what the student will learn in this module." },
                    lessons: {
                        type: Type.ARRAY,
                        description: "A list of 3-5 lessons within the module.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING, description: "A short, clear title for the lesson." },
                                objective: { type: Type.STRING, description: "A one-sentence learning objective for this lesson." },
                                explanation: { type: Type.STRING, description: "A simple, one-paragraph explanation of the concept, suitable for the student's grade level." },
                                example: { type: Type.STRING, description: "A clear, concise example sentence or short dialogue demonstrating the concept." },
                                practice_prompt: { type: Type.STRING, description: "A simple, one-sentence practice prompt for the student to apply what they've learned." },
                                pronunciation_guide: {
                                    type: Type.ARRAY,
                                    description: "A list of 2-3 key vocabulary words from the lesson with their IPA pronunciation. Provide only the word and its IPA string.",
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            word: { type: Type.STRING, description: "The vocabulary word." },
                                            ipa: { type: Type.STRING, description: "The International Phonetic Alphabet (IPA) transcription of the word." }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};

export const generateLearningPlan = async (studentNeeds: string, gradeLevel: string): Promise<LearningPlan> => {
  const gradeLabel = gradeLevelMap[gradeLevel] || 'default level';
  const prompt = `
    You are an expert ESL curriculum designer for Brazilian students preparing for the OBLI (Olimpíada Brasileira de Língua Inglesa).
    Your task is to create a personalized, engaging, and structured learning plan.

    Student's Competition Level: ${gradeLabel}
    Student's Goal: "${studentNeeds}"

    Based on this, generate a complete learning plan with 3 to 5 modules. Each module should contain 3 to 5 lessons.
    The content must be tailored to the student's level. For junior levels, use very simple language and concepts. For upper levels, you can be more complex.
    The plan should be structured, practical, and directly help the student achieve their goal for the competition.
    Ensure all fields in the JSON schema are populated with high-quality, relevant content.
    The goal in the output JSON should be a refined, single-sentence version of the student's stated goal.
  `;

  try {
    const response = await getAiInstance().models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: learningPlanSchema,
      },
    });

    const jsonText = response.text.trim();
    const parsedPlan = JSON.parse(jsonText);

    // Initialize lesson statuses
    parsedPlan.modules.forEach((module: any) => {
        module.lessons.forEach((lesson: any) => {
            lesson.status = 'not_started';
        });
    });

    return parsedPlan as LearningPlan;

  } catch (error) {
    console.error("Error generating learning plan:", error);
    throw new Error("Failed to generate the learning plan. The AI model might be busy or the service is not configured correctly. Please try again.");
  }
};


export const suggestGoal = async (gradeLevel: string): Promise<string> => {
    const gradeLabel = gradeLevelMap[gradeLevel] || 'default level';
    const prompt = `
      You are an encouraging ESL teacher helping a student in Brazil prepare for the OBLI competition.
      The student is at the "${gradeLabel}" level and needs a suggestion for a learning goal.
      Provide one, specific, and inspiring learning goal as a single sentence. Do not add any preamble or explanation.
      The goal should be something a student could type into a text box.

      Example for Junior: "Learn how to describe my family and hobbies using new vocabulary."
      Example for Upper/Free: "Improve my ability to debate complex topics like technology and the environment."

      Generate a goal for the "${gradeLabel}" level.
    `;

    try {
      const response = await getAiInstance().models.generateContent({
        model,
        contents: prompt,
      });

      // Clean up the response to be a simple string
      return response.text.trim().replace(/"/g, '');

    } catch (error) {
      console.error("Error suggesting goal:", error);
      throw new Error("Failed to suggest a goal. The AI service may be unavailable.");
    }
};

export const generateContent = async (prompt: string): Promise<string> => {
    try {
        const response = await getAiInstance().models.generateContent({
            model,
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating content:", error);
        throw new Error("Failed to generate content. The AI service may be unavailable.");
    }
};

export const generatePracticeFeedback = async (practicePrompt: string, studentAnswer: string, gradeLevel: string): Promise<string> => {
    const gradeLabel = gradeLevelMap[gradeLevel] || 'default level';
    const prompt = `
      You are a friendly and helpful ESL teacher named Alex. You are providing feedback on a practice exercise for a student preparing for the OBLI competition in Brazil.
      The student is at the "${gradeLabel}" level.

      The exercise prompt was: "${practicePrompt}"
      The student's answer is: "${studentAnswer}"

      Your task is to provide feedback that is:
      1.  **Positive and Encouraging**: Start with a positive comment.
      2.  **Constructive**: Gently point out any mistakes in grammar, vocabulary, or spelling.
      3.  **Clear**: Explain *why* it's a mistake and provide the correct version.
      4.  **Concise**: Keep the feedback to 2-4 sentences.
      5.  **Level-Appropriate**: Use language the student at the "${gradeLabel}" level can understand.

      Do not give feedback on the content or opinion, only on the English language usage.
      
      Example Feedback:
      "Great job trying to use the past tense! One small correction: instead of 'I goed to the store,' we say 'I went to the store.' 'Went' is the irregular past tense of 'go.' Keep up the great work! 👍"

      Now, provide feedback for the student's answer.
    `;

    try {
        const response = await getAiInstance().models.generateContent({
            model,
            contents: prompt,
        });

        return response.text.trim();
    } catch (error) {
        console.error("Error generating feedback:", error);
        throw new Error("Failed to generate feedback. The AI service may be unavailable.");
    }
};