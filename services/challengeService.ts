import { generateContent } from './geminiService';
import type { Challenge, ChallengeType } from '../types';

export interface ChallengeGenerationRequest {
    type: ChallengeType;
    difficulty: 'easy' | 'medium' | 'hard';
    category?: string;
    topic?: string;
}

export interface ChallengeGenerationResponse {
    title: string;
    description: string;
    question: string;
    answer: string;
    hints: string[];
    points: number;
    timeLimit?: number;
}

const getChallengePrompt = (request: ChallengeGenerationRequest): string => {
    const { type, difficulty, category, topic } = request;
    
    const difficultyDescriptions = {
        easy: 'simple and straightforward, suitable for beginners',
        medium: 'moderately challenging, requiring some thinking',
        hard: 'complex and challenging, requiring deep thinking and problem-solving skills'
    };

    const typeDescriptions = {
        riddle: 'a classic riddle that requires lateral thinking and wordplay',
        word_hunt: 'a word search or word puzzle where users need to find hidden words or solve word-based challenges',
        enigmas: 'a mysterious puzzle or problem that requires careful analysis and deduction',
        logic_puzzle: 'a logical reasoning problem that requires step-by-step thinking',
        word_play: 'a creative word-based puzzle involving puns, anagrams, or linguistic tricks',
        math_challenge: 'a mathematical problem or puzzle that requires numerical reasoning',
        trivia: 'a knowledge-based question testing general or specific knowledge'
    };

    let prompt = `Generate a ${typeDescriptions[type]} that is ${difficultyDescriptions[difficulty]}.`;
    
    if (category) {
        prompt += ` The challenge should be related to the category: ${category}.`;
    }
    
    if (topic) {
        prompt += ` Focus on the topic: ${topic}.`;
    }

    prompt += `

Please provide your response in the following JSON format:
{
    "title": "A catchy, engaging title for the challenge",
    "description": "A brief description of what the challenge involves",
    "question": "The main question or puzzle to solve",
    "answer": "The correct answer (be specific and clear)",
    "hints": ["Hint 1", "Hint 2", "Hint 3"],
    "points": ${getPointsForDifficulty(difficulty)},
    "timeLimit": ${getTimeLimitForDifficulty(difficulty)}
}

Make sure the challenge is:
- Engaging and fun to solve
- Age-appropriate for students
- Clear and unambiguous
- Educational and thought-provoking
- Has hints that progressively help without giving away the answer`;

    return prompt;
};

const getPointsForDifficulty = (difficulty: 'easy' | 'medium' | 'hard'): number => {
    switch (difficulty) {
        case 'easy': return 10;
        case 'medium': return 25;
        case 'hard': return 50;
        default: return 10;
    }
};

const getTimeLimitForDifficulty = (difficulty: 'easy' | 'medium' | 'hard'): number => {
    switch (difficulty) {
        case 'easy': return 5;
        case 'medium': return 10;
        case 'hard': return 15;
        default: return 5;
    }
};

export const generateChallenge = async (request: ChallengeGenerationRequest): Promise<ChallengeGenerationResponse> => {
    try {
        const prompt = getChallengePrompt(request);
        const response = await generateContent(prompt);
        
        // Parse the JSON response
        const challengeData = JSON.parse(response);
        
        // Validate the response structure
        if (!challengeData.title || !challengeData.question || !challengeData.answer) {
            throw new Error('Invalid challenge data received from AI');
        }

        return {
            title: challengeData.title,
            description: challengeData.description || 'A fun challenge to test your skills!',
            question: challengeData.question,
            answer: challengeData.answer,
            hints: challengeData.hints || [],
            points: challengeData.points || getPointsForDifficulty(request.difficulty),
            timeLimit: challengeData.timeLimit || getTimeLimitForDifficulty(request.difficulty)
        };
    } catch (error) {
        console.error('Error generating challenge:', error);
        throw new Error('Failed to generate challenge. Please try again.');
    }
};

export const generateMultipleChallenges = async (
    count: number, 
    request: ChallengeGenerationRequest
): Promise<ChallengeGenerationResponse[]> => {
    const challenges: ChallengeGenerationResponse[] = [];
    
    for (let i = 0; i < count; i++) {
        try {
            const challenge = await generateChallenge(request);
            challenges.push(challenge);
        } catch (error) {
            console.error(`Error generating challenge ${i + 1}:`, error);
            // Continue with other challenges even if one fails
        }
    }
    
    return challenges;
};

export const getChallengeCategories = (): string[] => {
    return [
        'General Knowledge',
        'Language & Literature',
        'Science & Nature',
        'Mathematics',
        'History & Geography',
        'Arts & Culture',
        'Sports & Games',
        'Technology',
        'Food & Cooking',
        'Animals & Nature'
    ];
};

export const getChallengeTypeDescription = (type: ChallengeType): string => {
    const descriptions = {
        riddle: 'Classic riddles that require lateral thinking and wordplay',
        word_hunt: 'Word puzzles and searches that challenge your vocabulary',
        enigmas: 'Mysterious puzzles that require careful analysis and deduction',
        logic_puzzle: 'Logical reasoning problems that test your thinking skills',
        word_play: 'Creative word puzzles involving puns, anagrams, and linguistic tricks',
        math_challenge: 'Mathematical problems and puzzles for number lovers',
        trivia: 'Knowledge-based questions to test your general knowledge'
    };
    
    return descriptions[type];
};
