
import { GoogleGenAI, Type } from "@google/genai";
import { 
  FeedbackResponse, 
  Subject, 
  TeacherExplanation, 
  StudentAnalysis, 
  ExamAttempt, 
  MockQuestion, 
  StudyGuideData, 
  Resource,
  MockExamResult
} from "../types";

// Using the fastest model available: gemini-3-flash-preview for low latency
const FAST_MODEL = 'gemini-3-flash-preview';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const CAIE_SYSTEM_INSTRUCTION = `You are a Senior Examiner for CAIE (Cambridge Assessment International Education).
STRICT SYLLABUS ADHERENCE: You must ONLY use Cambridge International IGCSE standards.
BANNED SOURCES: Never mention or use logic from Cognito, AQA, OCR, Pearson Edexcel (Domestic), or any UK-specific GCSE boards. These are NOT reliable for CAIE students.
MANDATORY SOURCES: Use official Cambridge Marking Schemes, Examiner Reports, and Syllabus (0610, 0620, 0625, 0580, etc.).
TERMINOLOGY: Use CAIE-specific terms (e.g., 'M marks' for method, 'A marks' for accuracy, 'B marks' for independent). 
ASSESSMENT OBJECTIVES: Strictly align with AO1, AO2, and AO3 as defined by Cambridge.
ALTERNATIVES: If recommending resources, ONLY suggest PapaCambridge, Save My Exams (Cambridge Section), ZNotes, GCE Guide, and Physics and Maths Tutor (CAIE section).`;

/**
 * Generates a full mock paper with 10 questions using high-speed Flash model.
 * Strictly follows CAIE IGCSE (Cambridge International) structures.
 */
export const generateMockPaper = async (subject: Subject, topic?: string, type: 'theory' | 'mcq' = 'mcq'): Promise<MockQuestion[]> => {
  const prompt = `Generate exactly 10 high-quality CAIE IGCSE ${type} questions for ${subject}. 
  Topic: ${topic || 'General Syllabus'}. 
  Ensure questions are equivalent in difficulty to Cambridge Paper 2 (MCQ) or Paper 4 (Extended Theory).
  Ignore all domestic UK board conventions.
  Return as a valid JSON array.`;

  const response = await ai.models.generateContent({
    model: FAST_MODEL,
    contents: prompt,
    config: {
      systemInstruction: CAIE_SYSTEM_INSTRUCTION,
      thinkingConfig: { thinkingBudget: 0 },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            text: { type: Type.STRING },
            marks: { type: Type.NUMBER },
            type: { type: Type.STRING, enum: ['theory', 'mcq'] },
            options: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  text: { type: Type.STRING }
                }
              }
            }
          },
          required: ["id", "text", "marks", "type"]
        }
      }
    }
  });

  return JSON.parse(response.text || '[]');
};

/**
 * Grades an entire mock exam result set based on CAIE marking standards.
 */
export const gradeMockExam = async (
  subject: Subject, 
  questions: MockQuestion[], 
  answers: Record<string, string>
): Promise<MockExamResult> => {
  const submissionData = questions.map(q => ({
    id: q.id,
    question: q.text,
    studentAnswer: answers[q.id] || "No Answer Provided"
  }));

  const response = await ai.models.generateContent({
    model: FAST_MODEL,
    contents: `Grade this CAIE IGCSE ${subject} submission. 
    Use the strict Cambridge marking keys. 
    Data: ${JSON.stringify(submissionData)}
    Return total marks, percentage, and A*-G grade.`,
    config: {
      systemInstruction: CAIE_SYSTEM_INSTRUCTION,
      thinkingConfig: { thinkingBudget: 0 },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          totalMarks: { type: Type.NUMBER },
          attainedMarks: { type: Type.NUMBER },
          percentage: { type: Type.NUMBER },
          grade: { type: Type.STRING },
          feedbackPerQuestion: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                questionId: { type: Type.STRING },
                correct: { type: Type.BOOLEAN },
                studentAnswer: { type: Type.STRING },
                correctAnswer: { type: Type.STRING },
                explanation: { type: Type.STRING }
              }
            }
          },
          overallTeacherComments: { type: Type.STRING }
        },
        required: ["totalMarks", "attainedMarks", "percentage", "grade", "feedbackPerQuestion", "overallTeacherComments"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

/**
 * Fetches CAIE-specific study guides.
 */
export const fetchStudyGuide = async (subject: Subject, topic: string): Promise<StudyGuideData> => {
  const response = await ai.models.generateContent({
    model: FAST_MODEL,
    contents: `Create a CAIE IGCSE study guide for ${subject} on: "${topic}". 
    Strictly avoid Cognito/UK domestic references.
    Include 2 worked examples using Cambridge methodology.`,
    config: {
      systemInstruction: CAIE_SYSTEM_INSTRUCTION,
      thinkingConfig: { thinkingBudget: 0 },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          topic: { type: Type.STRING },
          summary: { type: Type.STRING },
          subtopics: { type: Type.ARRAY, items: { type: Type.STRING } },
          formulas: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                formula: { type: Type.STRING },
                application: { type: Type.STRING }
              }
            }
          },
          mustKnows: { type: Type.ARRAY, items: { type: Type.STRING } },
          workedExamples: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                question: { type: Type.STRING },
                steps: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      description: { type: Type.STRING },
                      working: { type: Type.STRING }
                    }
                  }
                },
                finalAnswer: { type: Type.STRING }
              }
            }
          }
        },
        required: ["topic", "summary", "subtopics", "workedExamples"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

/**
 * Grades individual answers using CAIE Examiner logic.
 */
export const gradeAnswer = async (
  subject: Subject,
  question: string,
  studentAnswer: string,
  imageUri?: string
): Promise<FeedbackResponse> => {
  const contents: any[] = [
    { text: `Grade this student script strictly following the CAIE (Cambridge International) marking scheme for ${subject}. 
    Exclude all Cognito/UK domestic GCSE logic.` },
    { text: `Question: ${question}` },
    { text: `Student's Answer: ${studentAnswer}` }
  ];
  if (imageUri) {
    contents.push({ inlineData: { mimeType: "image/jpeg", data: imageUri.split(",")[1] } });
  }

  const response = await ai.models.generateContent({
    model: FAST_MODEL,
    contents: { parts: contents },
    config: {
      systemInstruction: CAIE_SYSTEM_INSTRUCTION,
      thinkingConfig: { thinkingBudget: 0 },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          totalMarks: { type: Type.NUMBER },
          attainedMarks: { type: Type.NUMBER },
          predictedGrade: { type: Type.STRING },
          marksBreakdown: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                point: { type: Type.STRING },
                awarded: { type: Type.BOOLEAN },
                reason: { type: Type.STRING }
              }
            }
          },
          teacherComments: { type: Type.STRING },
          improvementTips: { type: Type.ARRAY, items: { type: Type.STRING } },
          modelAnswer: { type: Type.STRING }
        }
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

export const explainConcept = async (subject: Subject, topic: string): Promise<TeacherExplanation> => {
  const response = await ai.models.generateContent({
    model: FAST_MODEL,
    contents: `Explain ${topic} strictly for CAIE IGCSE ${subject}. Use official Cambridge technical terms.`,
    config: {
      systemInstruction: CAIE_SYSTEM_INSTRUCTION,
      thinkingConfig: { thinkingBudget: 0 },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          concept: { type: Type.STRING },
          explanation: { type: Type.STRING },
          keyKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          syllabusReference: { type: Type.STRING },
          furtherReading: { type: Type.STRING }
        }
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

export const analyzeStudentPerformance = async (history: ExamAttempt[]): Promise<StudentAnalysis> => {
  const response = await ai.models.generateContent({
    model: FAST_MODEL,
    contents: `Analyze performance data for a Cambridge International student: ${JSON.stringify(history.slice(-10))}. Predict A*-G grades.`,
    config: {
      systemInstruction: CAIE_SYSTEM_INSTRUCTION,
      thinkingConfig: { thinkingBudget: 0 },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
          predictedGrades: { type: Type.OBJECT },
          personalizedAdvice: { type: Type.STRING }
        }
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

export const fetchResources = async (subject: Subject): Promise<Resource[]> => {
  const response = await ai.models.generateContent({
    model: FAST_MODEL,
    contents: `Provide 5 verified CAIE (Cambridge International) resources for ${subject}. 
    ABSOLUTELY NO Cognito or domestic UK GCSE links. 
    Use PapaCambridge, GCE Guide, Save My Exams (Cambridge Section), and ZNotes.`,
    config: {
      systemInstruction: CAIE_SYSTEM_INSTRUCTION,
      thinkingConfig: { thinkingBudget: 0 },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            type: { type: Type.STRING },
            link: { type: Type.STRING },
            description: { type: Type.STRING }
          }
        }
      }
    }
  });
  return JSON.parse(response.text || '[]');
};
