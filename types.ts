
export type Subject = 
  | 'Biology (0610)' 
  | 'Chemistry (0620)' 
  | 'Physics (0625)' 
  | 'Combined Science (0653)' 
  | 'Mathematics (0580)' 
  | 'Additional Mathematics (0606)' 
  | 'Economics (0455)' 
  | 'English (0500)';

export interface MCQOption {
  id: string;
  text: string;
}

export interface MockQuestion {
  id: string;
  text: string;
  marks: number;
  type: 'theory' | 'mcq';
  options?: MCQOption[];
  diagramDescription?: string;
  parts?: {
    id: string;
    text: string;
    marks: number;
  }[];
}

export interface MockExamResult {
  totalMarks: number;
  attainedMarks: number;
  percentage: number;
  grade: string;
  feedbackPerQuestion: {
    questionId: string;
    correct: boolean;
    studentAnswer: string;
    correctAnswer: string;
    explanation: string;
  }[];
  overallTeacherComments: string;
}

export interface WorkedExample {
  title: string;
  question: string;
  steps: { description: string; working?: string }[];
  finalAnswer: string;
}

export interface StudyGuideData {
  topic: string;
  summary: string;
  subtopics: string[];
  formulas: { name: string; formula: string; application: string }[];
  mustKnows: string[];
  workedExamples: WorkedExample[];
}

export interface FeedbackResponse {
  totalMarks: number;
  attainedMarks: number;
  marksBreakdown: {
    point: string;
    awarded: boolean;
    reason: string;
  }[];
  teacherComments: string;
  improvementTips: string[];
  modelAnswer: string;
  predictedGrade?: string;
}

export interface TeacherExplanation {
  concept: string;
  explanation: string;
  keyKeywords: string[];
  syllabusReference: string;
  furtherReading: string;
}

export interface Resource {
  id: string;
  title: string;
  type: 'Book' | 'Mock Paper' | 'Revision Note';
  link: string;
  description: string;
}

export interface ExamAttempt {
  id: string;
  subject: Subject;
  timestamp: number;
  score: number;
  maxScore: number;
  topic?: string;
  mistakes?: string[];
}

export interface StudentAnalysis {
  strengths: string[];
  weaknesses: string[];
  predictedGrades: Record<string, string>;
  personalizedAdvice: string;
}
