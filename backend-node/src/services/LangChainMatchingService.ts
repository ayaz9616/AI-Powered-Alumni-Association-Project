import Anthropic from '@anthropic-ai/sdk';
import Groq from 'groq-sdk';
import { ParsedResume } from '../models/Mentorship';

/**
 * LANGCHAIN_MATCHING_SERVICE
 * 
 * Responsibility: AI intelligence & matching ONLY
 * - Student-Alumni profile matching
 * - Resume intelligence (ATS, improvements, JD matching)
 * - Scoring with explanations
 * - Learning from feedback
 * 
 * NOT responsible for:
 * - Resume parsing (use n8n output)
 * - File handling
 * 
 * Key principle: REUSE existing resume-JD matching logic
 */

// Primary AI provider: Anthropic (Claude)
const anthropic = process.env.ANTHROPIC_API_KEY 
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

// Fallback AI provider: Groq (Llama)
const groq = process.env.GROQ_API_KEY 
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

// Check which AI provider is available
const AI_PROVIDER = anthropic ? 'anthropic' : (groq ? 'groq' : 'none');

if (AI_PROVIDER === 'none') {
  console.warn('[LangChain] No AI provider configured. Matching will use fallback scoring.');
} else {
  console.log(`[LangChain] Using AI provider: ${AI_PROVIDER}`);
}

export interface StudentMatchProfile {
  userId: string;
  skills: string[];
  careerGoals?: string;
  domain?: string;
  matchKeywords: string[];
}

export interface AlumniMatchProfile {
  userId: string;
  skills: string[];
  experience: string;
  domainsOfExpertise: string[];
  currentRole: string;
  totalExperience?: string;
  matchKeywords: string[];
}

export interface MatchResult {
  alumniId: string;
  matchScore: number; // 0-1
  reasons: string[];
  skillOverlap: string[];
  domainOverlap: string[];
}

export interface ATSAnalysis {
  atsScore: number; // 0-100
  missingSkills: string[];
  improvementSuggestions: string[];
  strengthAreas: string[];
}

export class LangChainMatchingService {
  
  /**
   * Match a student with multiple alumni profiles
   * This extends the existing resume-JD matching logic
   * Alumni profile is treated like a "JD"
   * Student profile is treated like a "resume"
   */
  static async matchStudentWithAlumni(
    studentProfile: StudentMatchProfile,
    alumniProfiles: AlumniMatchProfile[]
  ): Promise<MatchResult[]> {
    try {
      console.log(`[LangChain] Matching student ${studentProfile.userId} with ${alumniProfiles.length} alumni`);

      const prompt = this.buildMatchingPrompt(studentProfile, alumniProfiles);

      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const responseText = message.content[0].type === 'text' 
        ? message.content[0].text 
        : '';

      // Parse JSON response
      const matchResults = this.parseMatchingResponse(responseText);
      
      console.log(`[LangChain] Generated ${matchResults.length} match results`);
      
      return matchResults;

    } catch (error: any) {
      console.error('[LangChain] Matching failed:', error.message);
      throw new Error(`Failed to match student with alumni: ${error.message}`);
    }
  }

  /**
   * Build matching prompt for Claude
   * Treats alumni profiles as "job descriptions" for mentorship
   */
  private static buildMatchingPrompt(
    student: StudentMatchProfile,
    alumni: AlumniMatchProfile[]
  ): string {
    return `You are an AI mentor matching system. Compare a student profile with multiple alumni profiles to identify the best mentorship matches.

**Student Profile:**
- Skills: ${student.skills.join(', ')}
- Career Goals: ${student.careerGoals || 'Not specified'}
- Domain: ${student.domain || 'Not specified'}
- Match Keywords: ${student.matchKeywords.join(', ')}

**Alumni Profiles:**
${alumni.map((alum, idx) => `
Alumni ${idx + 1} (ID: ${alum.userId}):
- Skills: ${alum.skills.join(', ')}
- Experience: ${alum.experience || '0 years'}
- Domains of Expertise: ${alum.domainsOfExpertise.join(', ')}
- Current Role: ${alum.currentRole}
- Years of Experience: ${alum.totalExperience || alum.experience}
- Match Keywords: ${alum.matchKeywords.join(', ')}
`).join('\n')}

**Evaluation Criteria (Weighted):**
1. Skill Overlap (40%): How many skills match between student and alumni?
2. Domain Overlap (30%): Do the alumni's expertise domains align with student's interests?
3. Career Alignment (20%): Does the alumni's career trajectory match student's goals?
4. Experience Seniority (10%): Does the alumni have sufficient experience to mentor?

**Task:**
For EACH alumni profile, provide:
1. Match score between 0.0 and 1.0 (higher = better match)
2. List of specific reasons why this is a good/poor match
3. Overlapping skills (exact matches only)
4. Overlapping domains (exact matches only)

**Output Format (strict JSON array):**
[
  {
    "alumniId": "alumni_user_id",
    "matchScore": 0.87,
    "reasons": [
      "Strong backend skill overlap (Node.js, PostgreSQL)",
      "Alumni has relevant industry experience in target domain",
      "Career goals align well with alumni's trajectory"
    ],
    "skillOverlap": ["node", "react"],
    "domainOverlap": ["backend", "web"]
  }
]

Return ONLY the JSON array, no additional text.`;
  }

  /**
   * Parse Claude's matching response
   */
  private static parseMatchingResponse(responseText: string): MatchResult[] {
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        console.warn('[LangChain] No JSON found in response, returning empty array');
        return [];
      }

      const results = JSON.parse(jsonMatch[0]) as MatchResult[];
      
      // Validate and normalize
      return results.map(result => ({
        alumniId: result.alumniId,
        matchScore: Math.min(Math.max(result.matchScore, 0), 1), // Clamp 0-1
        reasons: Array.isArray(result.reasons) ? result.reasons : [],
        skillOverlap: Array.isArray(result.skillOverlap) ? result.skillOverlap : [],
        domainOverlap: Array.isArray(result.domainOverlap) ? result.domainOverlap : []
      }));

    } catch (error) {
      console.error('[LangChain] Failed to parse matching response:', error);
      return [];
    }
  }

  /**
   * Analyze resume with ATS scoring
   * Uses n8n parsed data as input
   */
  static async analyzeResumeATS(
    parsedResume: ParsedResume,
    targetRole?: string
  ): Promise<ATSAnalysis> {
    try {
      console.log('[LangChain] Performing ATS analysis');

      const prompt = `You are an ATS (Applicant Tracking System) analyzer. Analyze the following structured resume data and provide insights.

**Parsed Resume Data:**
- Name: ${parsedResume.Name}
- Email: ${parsedResume.Email}
- Skills: ${parsedResume["skill keyword"]?.join(', ') || 'None'}
- Domain: ${parsedResume.Domain || 'Not specified'}
- Branch: ${parsedResume.Branch || 'Not specified'}
- Experience: ${parsedResume["Total year of experience"] || '0'} years
- Internships: ${parsedResume.Internship?.join(', ') || 'None'}
- Projects: ${parsedResume.Projects?.join(', ') || 'None'}
- Certificates: ${parsedResume.Certificate?.join(', ') || 'None'}
- Profile Summary: ${parsedResume["Profile Summary"] || 'None'}
${targetRole ? `\n**Target Role:** ${targetRole}` : ''}

**Task:**
1. Calculate an ATS score (0-100) based on keyword density, structure, and completeness
2. Identify missing skills or keywords that could improve the score
3. Provide actionable improvement suggestions
4. Highlight strength areas

**Output Format (strict JSON):**
{
  "atsScore": 75,
  "missingSkills": ["cloud computing", "docker"],
  "improvementSuggestions": [
    "Add more quantifiable achievements in experience section",
    "Include relevant certifications"
  ],
  "strengthAreas": ["Strong technical skills", "Diverse project portfolio"]
}

Return ONLY the JSON object, no additional text.`;

      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }]
      });

      const responseText = message.content[0].type === 'text' 
        ? message.content[0].text 
        : '{}';

      // Parse JSON response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        atsScore: 0,
        missingSkills: [],
        improvementSuggestions: [],
        strengthAreas: []
      };

      console.log(`[LangChain] ATS analysis complete: score ${analysis.atsScore}`);
      
      return analysis;

    } catch (error: any) {
      console.error('[LangChain] ATS analysis failed:', error.message);
      throw new Error(`Failed to analyze resume: ${error.message}`);
    }
  }

  /**
   * Match resume against job description
   * Reusable logic that's also used for student-alumni matching
   */
  static async matchResumeToJD(
    parsedResume: ParsedResume,
    jobDescription: string
  ): Promise<{ matchScore: number; reasons: string[] }> {
    try {
      console.log('[LangChain] Matching resume to job description');

      const prompt = `Compare this resume with a job description and calculate match quality.

**Resume:**
- Skills: ${parsedResume["skill keyword"]?.join(', ') || 'None'}
- Experience: ${parsedResume["Total year of experience"] || '0'} years
- Domain: ${parsedResume.Domain || 'Not specified'}
- Projects: ${parsedResume.Projects?.join(', ') || 'None'}

**Job Description:**
${jobDescription}

**Task:**
Calculate a match score (0.0 to 1.0) and provide specific reasons.

**Output Format (strict JSON):**
{
  "matchScore": 0.82,
  "reasons": [
    "Strong skill alignment with required technologies",
    "Experience level matches job requirements"
  ]
}

Return ONLY the JSON object.`;

      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }]
      });

      const responseText = message.content[0].type === 'text' 
        ? message.content[0].text 
        : '{}';

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const result = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        matchScore: 0,
        reasons: []
      };

      return result;

    } catch (error: any) {
      console.error('[LangChain] JD matching failed:', error.message);
      throw new Error(`Failed to match resume to JD: ${error.message}`);
    }
  }

  /**
   * Match students to a job posting
   * Returns sorted list of students with match scores and reasons
   */
  static async matchStudentsToJob(
    jobDescription: string,
    requiredSkills: string[],
    preferredSkills: string[],
    students: Array<{
      userId: string;
      name: string;
      skills: string[];
      cgpa?: string;
      branch?: string;
      batch?: string;
      domain?: string;
      careerGoals?: string;
      totalExperience?: string;
      projects?: string[];
      internships?: string[];
    }>
  ): Promise<Array<{
    studentId: string;
    matchScore: number;
    matchReasons: string[];
    skillMatches: string[];
    skillGaps: string[];
  }>> {
    try {
      console.log(`[LangChain] Matching ${students.length} students to job using ${AI_PROVIDER}`);

      // If no AI provider available, use fallback scoring
      if (AI_PROVIDER === 'none') {
        return this.fallbackMatchStudents(students, requiredSkills, preferredSkills);
      }

      const prompt = `You are an intelligent job-student matching system. Analyze multiple student profiles against a job posting to identify the best candidates.

**Job Details:**
Description: ${jobDescription}
Required Skills: ${requiredSkills.join(', ')}
Preferred Skills: ${preferredSkills.join(', ')}

**Student Profiles:**
${students.map((student, idx) => `
Student ${idx + 1} (ID: ${student.userId}):
- Name: ${student.name}
- Skills: ${student.skills.join(', ')}
- CGPA: ${student.cgpa || 'N/A'}
- Branch: ${student.branch || 'N/A'}
- Batch: ${student.batch || 'N/A'}
- Domain: ${student.domain || 'N/A'}
- Career Goals: ${student.careerGoals || 'N/A'}
- Experience: ${student.totalExperience || '0'}
- Projects: ${student.projects?.join(', ') || 'None'}
- Internships: ${student.internships?.join(', ') || 'None'}
`).join('\n')}

**Evaluation Criteria (Weighted):**
1. Required Skills Match (50%): Does student have the required technical skills?
2. Preferred Skills Match (20%): Does student have additional preferred skills?
3. Relevant Experience (15%): Projects, internships, and domain knowledge
4. Career Alignment (15%): Do career goals align with job role?

**Task:**
For EACH student, provide:
1. Match score between 0 and 100 (integer, higher = better fit)
2. List of specific reasons why this student is a good/poor match
3. Skills that match the job requirements (exact matches only)
4. Critical skills the student is missing

**Output Format (strict JSON array):**
[
  {
    "studentId": "student_user_id",
    "matchScore": 87,
    "matchReasons": [
      "Strong proficiency in required skills: React, Node.js, TypeScript",
      "Relevant project experience in web development",
      "Career goals align with role requirements"
    ],
    "skillMatches": ["React", "Node.js", "TypeScript"],
    "skillGaps": ["Docker", "Kubernetes"]
  }
]

Return ONLY the JSON array. Ensure all students are evaluated.`;

      let responseText = '';

      // Use available AI provider
      if (AI_PROVIDER === 'anthropic' && anthropic) {
        const message = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 8192,
          messages: [{ role: 'user', content: prompt }]
        });
        responseText = message.content[0].type === 'text' ? message.content[0].text : '[]';
      } else if (AI_PROVIDER === 'groq' && groq) {
        const completion = await groq.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 8192,
          temperature: 0.3
        });
        responseText = completion.choices[0]?.message?.content || '[]';
      }

      // Parse JSON array
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      const results = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

      console.log(`[LangChain] Generated ${results.length} student matches`);
      
      return results;

    } catch (error: any) {
      console.error('[LangChain] Student-job matching failed:', error.message);
      // Fallback to rule-based scoring on error
      console.log('[LangChain] Using fallback scoring due to error');
      return this.fallbackMatchStudents(students, requiredSkills, preferredSkills);
    }
  }

  /**
   * Extract and enhance keywords from resume for better matching
   * Called during profile creation to generate enhanced matchKeywords
   */
  static async extractEnhancedKeywords(
    parsedResume: ParsedResume
  ): Promise<string[]> {
    try {
      console.log('[LangChain] Extracting enhanced keywords from resume');

      const prompt = `Extract and enhance keywords from this resume for better job/mentor matching.

**Resume Data:**
- Skills: ${parsedResume["skill keyword"]?.join(', ') || 'None'}
- Domain: ${parsedResume.Domain || 'Not specified'}
- Branch: ${parsedResume.Branch || 'Not specified'}
- Goal: ${parsedResume.Goal || 'Not specified'}
- Projects: ${parsedResume.Projects?.join(', ') || 'None'}
- Internships: ${parsedResume.Internship?.join(', ') || 'None'}
- Profile Summary: ${parsedResume["Profile Summary"] || 'Not specified'}

**Task:**
1. Identify all technical skills, tools, frameworks, and technologies
2. Extract domain knowledge areas
3. Infer implicit skills from projects and internships
4. Add relevant industry keywords
5. Include career direction keywords

**Output Format (strict JSON):**
{
  "keywords": ["keyword1", "keyword2", "keyword3"]
}

Return ONLY the JSON object with a comprehensive list of keywords.`;

      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }]
      });

      const responseText = message.content[0].type === 'text' 
        ? message.content[0].text 
        : '{}';

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const result = jsonMatch ? JSON.parse(jsonMatch[0]) : { keywords: [] };

      console.log(`[LangChain] Extracted ${result.keywords.length} enhanced keywords`);
      
      return result.keywords || [];

    } catch (error: any) {
      console.error('[LangChain] Keyword extraction failed:', error.message);
      // Fallback to basic keywords
      return [
        ...(parsedResume["skill keyword"] || []),
        parsedResume.Domain || '',
        parsedResume.Branch || ''
      ].filter(k => k && k.length > 0);
    }
  }

  /**
   * Fallback scoring method when AI provider is unavailable
   * Uses rule-based algorithm to score students against job requirements
   */
  private static fallbackMatchStudents(
    students: Array<{
      userId: string;
      name: string;
      skills: string[];
      cgpa?: string;
      branch?: string;
      batch?: string;
      domain?: string;
      careerGoals?: string;
      totalExperience?: string;
      projects?: string[];
      internships?: string[];
    }>,
    requiredSkills: string[],
    preferredSkills: string[]
  ): Array<{
    studentId: string;
    matchScore: number;
    matchReasons: string[];
    skillMatches: string[];
    skillGaps: string[];
  }> {
    console.log('[LangChain] Using rule-based fallback scoring');

    return students.map(student => {
      const studentSkills = student.skills.map(s => s.toLowerCase());
      const required = requiredSkills.map(s => s.toLowerCase());
      const preferred = preferredSkills.map(s => s.toLowerCase());

      const skillMatches = student.skills.filter(skill => 
        required.includes(skill.toLowerCase()) || preferred.includes(skill.toLowerCase())
      );

      const requiredMatches = required.filter(req => 
        studentSkills.includes(req)
      );

      const preferredMatches = preferred.filter(pref => 
        studentSkills.includes(pref)
      );

      let score = 0;
      
      if (required.length > 0) {
        score += (requiredMatches.length / required.length) * 50;
      }

      if (preferred.length > 0) {
        score += (preferredMatches.length / preferred.length) * 20;
      }

      const hasExperience = (student.projects?.length || 0) > 0 || (student.internships?.length || 0) > 0;
      if (hasExperience) {
        score += 15;
      }

      const cgpa = parseFloat(student.cgpa || '0');
      if (cgpa >= 8.0) score += 15;
      else if (cgpa >= 7.0) score += 10;
      else if (cgpa >= 6.0) score += 5;

      const reasons: string[] = [];
      if (requiredMatches.length > 0) {
        reasons.push(`Matches ${requiredMatches.length}/${required.length} required skills`);
      }
      if (preferredMatches.length > 0) {
        reasons.push(`Has ${preferredMatches.length} preferred skills`);
      }
      if (student.projects?.length) {
        reasons.push(`${student.projects.length} relevant projects`);
      }
      if (student.internships?.length) {
        reasons.push(`${student.internships.length} internships`);
      }
      if (cgpa >= 8.0) {
        reasons.push(`Strong academic performance (${cgpa} CGPA)`);
      }

      const skillGaps = required.filter(req => 
        !studentSkills.includes(req)
      );

      return {
        studentId: student.userId,
        matchScore: Math.round(score),
        matchReasons: reasons.length > 0 ? reasons : ['Profile available for review'],
        skillMatches,
        skillGaps
      };
    }).sort((a, b) => b.matchScore - a.matchScore);
  }
}