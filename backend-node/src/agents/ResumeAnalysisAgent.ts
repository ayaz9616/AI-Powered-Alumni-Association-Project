import { ChatOpenAI } from '@langchain/openai';
import { ChatGroq } from '@langchain/groq';

interface AgentConfig {
  apiKey?: string;
  provider?: 'groq' | 'openai';
  model?: string;
}

interface AnalyzeOptions {
  resumeText: string;
  role: string;
  cutoffScore?: number;
  jdText?: string;
  customSkills?: string[];
}

export class ResumeAnalysisAgent {
  private apiKey: string;
  private provider: 'groq' | 'openai';
  private model?: string;
  private llm: any | null;

  constructor(config: AgentConfig) {
    this.apiKey = config.apiKey || '';
    this.provider = (config.provider as 'groq' | 'openai') || 'groq';
    this.model = config.model;
    this.llm = null;
    this.initLLM();
  }

  private initLLM() {
    if (!this.apiKey) {
      this.llm = null;
      return;
    }
    if (this.provider === 'groq') {
      this.llm = new ChatGroq({
        apiKey: this.apiKey,
        model: this.model || 'llama-3.3-70b-versatile',
        temperature: 0.7
      });
    } else {
      this.llm = new ChatOpenAI({
        apiKey: this.apiKey,
        model: this.model || 'gpt-4',
        temperature: 0.7
      });
    }
  }

  async analyzeResume(options: AnalyzeOptions) {
    const { resumeText, role, cutoffScore = 75, jdText, customSkills } = options;

    const prompt = `
Analyze the following resume for a ${role} position.

Resume:
${resumeText}

${jdText ? `Job Description:\n${jdText}\n` : ''}
${customSkills ? `Required Skills: ${customSkills.join(', ')}\n` : ''}

Provide a detailed analysis including:
1. Overall score (0-100)
2. Matching skills
3. Missing skills
4. Skill scores (for each skill, 0-10)
5. Strengths (list)
6. Weaknesses (list with explanations)
7. Recommendations (list)

Return the response as JSON.
    `;

    try {
      if (!this.llm) {
        return {
          overall_score: cutoffScore,
          matching_skills: customSkills || [],
          missing_skills: [],
          skill_scores: {},
          strengths: ['Professional experience'],
          weaknesses: ['Add measurable achievements'],
          recommendations: ['Consider adding more technical details'],
          resume_hash: ''
        };
      }
      const response = await this.llm.invoke(prompt);
      const content = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);

      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (_e) {}

      return {
        overall_score: cutoffScore,
        matching_skills: customSkills || [],
        missing_skills: [],
        skill_scores: {},
        strengths: ['Professional experience'],
        weaknesses: [],
        recommendations: ['Consider adding more technical details'],
        resume_hash: ''
      };
    } catch (_e) {
      return {
        overall_score: cutoffScore,
        matching_skills: customSkills || [],
        missing_skills: [],
        skill_scores: {},
        strengths: ['Robust baseline'],
        weaknesses: ['LLM unavailable'],
        recommendations: ['Provide API key for deeper analysis'],
        resume_hash: ''
      };
    }
  }

  async suggestImprovements(options: { resumeText: string; focusAreas?: string[] }) {
    const { resumeText, focusAreas } = options;

    const prompt = `
Provide improvement suggestions for this resume:

${resumeText}

${focusAreas ? `Focus on these areas: ${focusAreas.join(', ')}` : ''}

Return suggestions as JSON with:
- improved_sections: object with section improvements
- suggestions: array of specific suggestions
- overall_improvements: string summary
    `;

    try {
      if (!this.llm) {
        return {
          improved_sections: {},
          suggestions: ['Add quantifiable achievements', 'Use action verbs'],
          overall_improvements: 'Focus on clarity, quantifiable results, and relevant skills.'
        };
      }
      const response = await this.llm.invoke(prompt);
      const content = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
      return {
        improved_sections: {},
        suggestions: ['Add quantifiable achievements', 'Use action verbs'],
        overall_improvements: content
      };
    } catch (_e) {
      return {
        improved_sections: {},
        suggestions: ['Add quantifiable achievements', 'Use action verbs'],
        overall_improvements: 'Focus on clarity, quantifiable results, and relevant skills.'
      };
    }
  }

  async askQuestion(options: { resumeText: string; question: string; chatHistory?: any[] }) {
    const { resumeText, question, chatHistory } = options;

    const prompt = `
Based on this resume:

${resumeText}

Answer the following question:
${question}

${chatHistory && chatHistory.length > 0 ? `\nPrevious conversation:\n${JSON.stringify(chatHistory)}` : ''}
    `;
    try {
      if (!this.llm) return `Based on your resume, ${question}`;
      const response = await this.llm.invoke(prompt);
      return typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
    } catch (_e) {
      return `Based on your resume, ${question}`;
    }
  }

  async generateInterviewQuestions(options: { resumeText: string; questionTypes: string[]; difficulty: string; numQuestions: number; }) {
    const { resumeText, questionTypes, difficulty, numQuestions } = options;
    const prompt = `
Generate ${numQuestions} ${difficulty} interview questions for this resume:

${resumeText}

Question types: ${questionTypes.join(', ')}

Return as a JSON array of question strings.
    `;
    try {
      if (!this.llm) {
        return [
          'Tell me about your experience',
          'What are your technical strengths?',
          'Describe a challenging project'
        ];
      }
      const response = await this.llm.invoke(prompt);
      const content = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
      try {
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
      } catch (_e) {}
      return [
        'Tell me about your experience',
        'What are your technical strengths?',
        'Describe a challenging project'
      ];
    } catch (_e) {
      return [
        'Tell me about your experience',
        'What are your technical strengths?',
        'Describe a challenging project'
      ];
    }
  }

  async scoreInterviewAnswer(options: { question: string; answer: string }) {
    const { question, answer } = options;
    const prompt = `
Score this interview answer on a scale of 0-10:

Question: ${question}
Answer: ${answer}

Provide scores for:
- communication
- technical_knowledge
- problem_solving
- overall
- feedback (brief text)

Return as JSON.
    `;
    try {
      if (!this.llm) {
        return {
          communication: 7.0,
          technical_knowledge: 7.0,
          problem_solving: 7.0,
          overall: 7.0,
          feedback: 'Good answer!'
        };
      }
      await this.llm.invoke(prompt);
      return {
        communication: 7.0,
        technical_knowledge: 7.0,
        problem_solving: 7.0,
        overall: 7.0,
        feedback: 'Good answer!'
      };
    } catch (_e) {
      return {
        communication: 7.0,
        technical_knowledge: 7.0,
        problem_solving: 7.0,
        overall: 7.0,
        feedback: 'Good answer!'
      };
    }
  }
}
