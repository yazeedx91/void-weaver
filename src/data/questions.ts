export interface Question {
  id: string;
  text: string;
  options: { value: number; label: string }[];
}

export interface QuestionSet {
  title: string;
  description: string;
  questions: Question[];
}

export const personalityQuestions: QuestionSet = {
  title: 'Personality Profile',
  description: 'HEXACO Dimensions',
  questions: [
    {
      id: 'hex-1',
      text: 'When meeting new people, I tend to...',
      options: [
        { value: 1, label: 'Keep to myself and observe' },
        { value: 2, label: 'Engage cautiously at first' },
        { value: 3, label: 'Warm up gradually' },
        { value: 4, label: 'Dive right into conversation' },
        { value: 5, label: 'Become the center of attention' },
      ],
    },
    {
      id: 'hex-2',
      text: 'When faced with a difficult decision, I prioritize...',
      options: [
        { value: 1, label: 'What benefits me directly' },
        { value: 2, label: 'Practical outcomes' },
        { value: 3, label: 'A balanced approach' },
        { value: 4, label: 'What\'s fair for everyone' },
        { value: 5, label: 'The greater good, always' },
      ],
    },
    {
      id: 'hex-3',
      text: 'My approach to rules and structure is...',
      options: [
        { value: 1, label: 'Rules are meant to be broken' },
        { value: 2, label: 'Flexible interpretation' },
        { value: 3, label: 'Depends on the situation' },
        { value: 4, label: 'Generally follow them' },
        { value: 5, label: 'Strict adherence' },
      ],
    },
    {
      id: 'hex-4',
      text: 'When something goes wrong, I typically...',
      options: [
        { value: 1, label: 'Stay completely calm' },
        { value: 2, label: 'Feel mild concern' },
        { value: 3, label: 'Get moderately stressed' },
        { value: 4, label: 'Feel quite anxious' },
        { value: 5, label: 'Experience intense worry' },
      ],
    },
    {
      id: 'hex-5',
      text: 'My curiosity about abstract ideas is...',
      options: [
        { value: 1, label: 'I prefer concrete, practical things' },
        { value: 2, label: 'Occasionally interested' },
        { value: 3, label: 'Moderately curious' },
        { value: 4, label: 'Quite fascinated' },
        { value: 5, label: 'Deeply passionate about concepts' },
      ],
    },
  ],
};

export const mentalHealthQuestions: QuestionSet = {
  title: 'Emotional Wellness',
  description: 'DASS-21 Indicators',
  questions: [
    {
      id: 'dass-1',
      text: 'Over the past week, I\'ve found it difficult to wind down...',
      options: [
        { value: 0, label: 'Never' },
        { value: 1, label: 'Sometimes' },
        { value: 2, label: 'Often' },
        { value: 3, label: 'Almost always' },
      ],
    },
    {
      id: 'dass-2',
      text: 'I\'ve been experiencing a sense of dread or unease...',
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Occasionally' },
        { value: 2, label: 'Frequently' },
        { value: 3, label: 'Most of the time' },
      ],
    },
    {
      id: 'dass-3',
      text: 'I\'ve felt like I had nothing to look forward to...',
      options: [
        { value: 0, label: 'Never felt this way' },
        { value: 1, label: 'Rarely' },
        { value: 2, label: 'Sometimes' },
        { value: 3, label: 'Very often' },
      ],
    },
    {
      id: 'dass-4',
      text: 'I\'ve been able to experience positive emotions...',
      options: [
        { value: 0, label: 'Very easily and often' },
        { value: 1, label: 'Most of the time' },
        { value: 2, label: 'With some difficulty' },
        { value: 3, label: 'Rarely or never' },
      ],
    },
    {
      id: 'dass-5',
      text: 'I\'ve felt my heart racing without physical exertion...',
      options: [
        { value: 0, label: 'Never' },
        { value: 1, label: 'Once or twice' },
        { value: 2, label: 'Several times' },
        { value: 3, label: 'Very frequently' },
      ],
    },
  ],
};

export const communicationQuestions: QuestionSet = {
  title: 'Communication Style',
  description: 'EQ Assessment',
  questions: [
    {
      id: 'eq-1',
      text: 'When someone is upset, I can usually tell...',
      options: [
        { value: 1, label: 'Only if they explicitly tell me' },
        { value: 2, label: 'Sometimes, if it\'s obvious' },
        { value: 3, label: 'Usually pick up on cues' },
        { value: 4, label: 'Almost always sense it' },
        { value: 5, label: 'Immediately and intuitively' },
      ],
    },
    {
      id: 'eq-2',
      text: 'In heated discussions, I tend to...',
      options: [
        { value: 1, label: 'React emotionally first' },
        { value: 2, label: 'Sometimes lose my cool' },
        { value: 3, label: 'Stay relatively composed' },
        { value: 4, label: 'Remain calm and listen' },
        { value: 5, label: 'Actively de-escalate' },
      ],
    },
    {
      id: 'eq-3',
      text: 'I adapt my communication style to different people...',
      options: [
        { value: 1, label: 'I communicate the same way with everyone' },
        { value: 2, label: 'Rarely adjust' },
        { value: 3, label: 'Sometimes adapt' },
        { value: 4, label: 'Often tailor my approach' },
        { value: 5, label: 'Always customize for the person' },
      ],
    },
    {
      id: 'eq-4',
      text: 'When receiving criticism, my first response is...',
      options: [
        { value: 1, label: 'Defensive or dismissive' },
        { value: 2, label: 'Initially hurt' },
        { value: 3, label: 'Neutral evaluation' },
        { value: 4, label: 'Openness to learn' },
        { value: 5, label: 'Grateful for the feedback' },
      ],
    },
    {
      id: 'eq-5',
      text: 'I express my needs and boundaries...',
      options: [
        { value: 1, label: 'Rarely or never' },
        { value: 2, label: 'Only when pushed' },
        { value: 3, label: 'When necessary' },
        { value: 4, label: 'Clearly and respectfully' },
        { value: 5, label: 'Proactively and confidently' },
      ],
    },
  ],
};
