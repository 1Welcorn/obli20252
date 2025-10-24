// [FE-FIX] Provided full implementation for this file to resolve module and reference errors.
import type { Student, LearningPlan } from '../types';

const mockLearningPlan1: LearningPlan = {
  goal: 'Improve confidence speaking about current events.',
  modules: [
    {
      title: 'Vocabulary for the News',
      description: 'Learn essential words to understand and discuss news articles.',
      lessons: [
        {
          title: 'Politics & Government',
          objective: 'Learn 10 key terms related to politics.',
          explanation: 'Politics is how groups of people make decisions. Government is the system that runs a country or state.',
          example: 'The government announced a new policy to improve education.',
          practice_prompt: 'Write a sentence using the word "election".',
          pronunciation_guide: [{ word: 'government', ipa: '/ˈɡʌvərnmənt/' }, { word: 'policy', ipa: '/ˈpɑːləsi/' }],
          status: 'completed',
          notes: 'This is a tricky word to spell.',
          practice_answer: 'The election for president is next year.',
          practice_feedback: 'Excellent sentence! Your use of "election" is perfect. Keep it up!',
        },
        {
          title: 'Economics & Business',
          objective: 'Understand common business-related vocabulary.',
          explanation: 'Economics is the study of how people make, buy, and sell things.',
          example: 'The economy is growing, and many companies are hiring new employees.',
          practice_prompt: 'What does it mean for an economy to "grow"?',
          pronunciation_guide: [{ word: 'economy', ipa: '/ɪˈkɑːnəmi/' }, { word: 'company', ipa: '/ˈkʌmpəni/' }],
          status: 'in_progress',
        },
        {
          title: 'Technology & Innovation',
          objective: 'Discuss recent technological advancements.',
          explanation: 'Innovation means creating new ideas or products. Technology often involves innovation.',
          example: 'Artificial intelligence is a major innovation in technology.',
          practice_prompt: 'Name one recent technological innovation you find interesting.',
          pronunciation_guide: [{ word: 'technology', ipa: '/tekˈnɑːlədʒi/' }, { word: 'innovation', ipa: '/ˌɪnəˈveɪʃn/' }],
          status: 'not_started',
        },
      ],
    },
    {
        title: 'Forming Opinions',
        description: 'Practice expressing your thoughts and opinions clearly.',
        lessons: [
            {
                title: 'Agreeing & Disagreeing',
                objective: 'Learn phrases for agreeing and disagreeing politely.',
                explanation: 'When you talk with people, it\'s important to say if you have the same idea (agree) or a different idea (disagree).',
                example: '"I agree with you that the movie was exciting." or "I see your point, but I disagree."',
                practice_prompt: 'Your friend says "I think winter is the best season." How can you disagree politely?',
                pronunciation_guide: [{word: 'agree', ipa: '/əˈɡriː/'}, {word: 'disagree', ipa: '/ˌdɪsəˈɡriː/'}],
                status: 'completed',
            },
             {
                title: 'Giving Reasons',
                objective: 'Support your opinions with reasons and examples.',
                explanation: 'When you give an opinion, it is stronger if you explain WHY you think that way.',
                example: '"I prefer summer because I love swimming at the beach."',
                practice_prompt: 'Give a reason why you like your favorite food.',
                pronunciation_guide: [{word: 'because', ipa: '/bɪˈkɔːz/'}, {word: 'reason', ipa: '/ˈriːzən/'}],
                status: 'not_started',
            }
        ]
    }
  ],
};

const mockLearningPlan2: LearningPlan = {
  goal: 'Learn how to describe my family and hobbies using new vocabulary.',
  modules: [
    {
      title: 'All About Me',
      description: 'Introduce yourself and talk about your favorite things.',
      lessons: [
        {
          title: 'My Family',
          objective: 'Learn words for family members.',
          explanation: 'Your family includes people like your mother, father, brother, and sister.',
          example: 'My brother is taller than me.',
          practice_prompt: 'Write a sentence about your mother or father.',
          pronunciation_guide: [{ word: 'family', ipa: '/ˈfæməli/' }, { word: 'brother', ipa: '/ˈbrʌðər/' }],
          status: 'completed',
        },
        {
          title: 'My Hobbies',
          objective: 'Talk about what you like to do for fun.',
          explanation: 'Hobbies are activities you do in your free time, like playing video games, reading books, or playing sports.',
          example: 'My favorite hobby is playing soccer with my friends.',
          practice_prompt: 'What is your favorite hobby?',
          pronunciation_guide: [{ word: 'hobby', ipa: '/ˈhɑːbi/' }, { word: 'favorite', ipa: '/ˈfeɪvərɪt/' }],
          status: 'completed',
        },
      ],
    },
    {
        title: 'Daily Routines',
        description: 'Describe your daily activities from morning to night.',
        lessons: [
            {
                title: 'In the Morning',
                objective: 'Talk about what you do when you wake up.',
                explanation: 'Your morning routine includes things like waking up, eating breakfast, and brushing your teeth.',
                example: 'I eat breakfast at 7 AM every morning.',
                practice_prompt: 'What is the first thing you do in the morning?',
                pronunciation_guide: [{word: 'morning', ipa: '/ˈmɔːrnɪŋ/'}, {word: 'breakfast', ipa: '/ˈbrekfəst/'}],
                status: 'in_progress',
            }
        ]
    }
  ],
};

export const mockStudents: Student[] = [
  {
    uid: 'mock-uid-lucia-1',
    name: 'Lúcia Alves',
    email: 'lucia.alves@example.com',
    gradeLevel: 'level2',
    learningPlan: mockLearningPlan1,
  },
  {
    uid: 'mock-uid-pedro-2',
    name: 'Pedro Costa',
    email: 'pedro.costa@example.com',
    gradeLevel: 'junior',
    learningPlan: mockLearningPlan2,
  },
  {
    uid: 'mock-uid-sofia-3',
    name: 'Sofia Pereira',
    email: 'sofia.pereira@example.com',
    gradeLevel: 'level1',
    learningPlan: null, // This student hasn't started yet
  },
   {
    uid: 'mock-uid-rafael-4',
    name: 'Rafael Martins',
    email: 'rafael.martins@example.com',
    gradeLevel: 'upper',
    learningPlan: {
        goal: "Master advanced grammar for academic writing.",
        modules: [
            {
                title: 'Complex Sentences',
                description: 'Learn to use clauses and conjunctions effectively.',
                lessons: [
                    { title: 'Subordinate Clauses', objective: 'Objective', explanation: 'Explanation', example: 'Example', practice_prompt: 'Prompt', pronunciation_guide: [], status: 'completed' },
                    { title: 'Conditional Sentences', objective: 'Objective', explanation: 'Explanation', example: 'Example', practice_prompt: 'Prompt', pronunciation_guide: [], status: 'completed' },
                    { title: 'Relative Clauses', objective: 'Objective', explanation: 'Explanation', example: 'Example', practice_prompt: 'Prompt', pronunciation_guide: [], status: 'completed' },
                ]
            },
            {
                title: 'Punctuation Mastery',
                description: 'Understand the use of commas, semicolons, and colons.',
                 lessons: [
                    { title: 'The Oxford Comma', objective: 'Objective', explanation: 'Explanation', example: 'Example', practice_prompt: 'Prompt', pronunciation_guide: [], status: 'completed' },
                    { title: 'Semicolons vs. Colons', objective: 'Objective', explanation: 'Explanation', example: 'Example', practice_prompt: 'Prompt', pronunciation_guide: [], status: 'completed' },
                ]
            }
        ]
    }
  }
];