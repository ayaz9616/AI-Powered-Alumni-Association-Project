import axios from 'axios';
import { ParsedResume } from '../models/Mentorship';

/**
 * N8N_SERVICE
 * 
 * Responsibility: Resume parsing ONLY
 * - Send PDF/DOC to n8n webhook
 * - Receive structured JSON (skills, education, experience, projects, keywords)
 * - Store as source of truth
 * 
 * NOT responsible for:
 * - AI reasoning
 * - Matching logic
 * - Scoring
 */

const N8N_WEBHOOK_URL = process.env.N8N_RESUME_PARSE_WEBHOOK || 
  'https://identityforgestudio.app.n8n.cloud/webhook/a38ed656-03ad-43a5-ad5a-a9a4b6e9b7d9';

export interface N8nParseRequest {
  userId: string;
  filename: string;
  mimetype: string;
  content_base64: string;
}

export interface N8nParseResponse {
  output: {
    UseID?: string;
    Name: string;
    Domain?: string;
    "ATS Score"?: string;
    CGPA?: string;
    Branch?: string;
    Email: string;
    "Phone Number"?: string;
    "Total year of experience"?: string;
    Internship?: string[];
    "Profile Summary"?: string;
    "skill keyword": string[];
    Projects?: string[];
    Certificate?: string[];
    Batch?: string;
    LinkedIn?: string;
    github?: string;
    "portfolio URL"?: string;
    "Resume URL"?: string;
    Goal?: string;
  };
}

export class N8nService {
  
  /**
   * Parse resume using n8n webhook
   * This is the ONLY way to parse resumes in the system
   */
  static async parseResume(request: N8nParseRequest): Promise<ParsedResume> {
    try {
      console.log(`[N8nService] Parsing resume for user: ${request.userId}`);
      
      const response = await axios.post<N8nParseResponse>(
        N8N_WEBHOOK_URL,
        {
          userId: request.userId,
          filename: request.filename,
          mimetype: request.mimetype,
          content_base64: request.content_base64
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 second timeout
        }
      );

      // Handle empty response from n8n (200 OK with no body)
      if (!response.data || !response.data.output) {
        console.warn('[N8nService] n8n returned empty response, using defaults');
        throw new Error('n8n returned empty or invalid response');
      }

      // Extract the output object from n8n response
      const output = response.data.output;
      
      const parsedResume: ParsedResume = {
        UseID: output.UseID || '',
        Name: output.Name || '',
        Domain: output.Domain || '',
        "ATS Score": output["ATS Score"] || '',
        CGPA: output.CGPA || '',
        Branch: output.Branch || '',
        Email: output.Email || '',
        "Phone Number": output["Phone Number"] || '',
        "Total year of experience": output["Total year of experience"] || '',
        Internship: Array.isArray(output.Internship) ? output.Internship : [],
        "Profile Summary": output["Profile Summary"] || '',
        "skill keyword": Array.isArray(output["skill keyword"]) ? output["skill keyword"] : [],
        Projects: Array.isArray(output.Projects) ? output.Projects : [],
        Certificate: Array.isArray(output.Certificate) ? output.Certificate : [],
        Batch: output.Batch || '',
        LinkedIn: output.LinkedIn || '',
        github: output.github || '',
        "portfolio URL": output["portfolio URL"] || '',
        "Resume URL": output["Resume URL"] || '',
        Goal: output.Goal || ''
      };

      console.log(`[N8nService] Successfully parsed resume for ${parsedResume.Name} with ${parsedResume["skill keyword"].length} skills`);
      
      return parsedResume;
      
    } catch (error: any) {
      console.error('[N8nService] Failed to parse resume:', error.message);
      
      if (error.response) {
        console.error('[N8nService] n8n error response:', {
          status: error.response.status,
          data: error.response.data
        });
      }
      
      throw new Error(`Failed to parse resume via n8n: ${error.message}`);
    }
  }

  /**
   * Parse resume from file buffer
   * Helper method that converts buffer to base64 and calls n8n
   */
  static async parseResumeFromBuffer(
    userId: string,
    filename: string,
    mimetype: string,
    buffer: Buffer
  ): Promise<ParsedResume> {
    const content_base64 = buffer.toString('base64');
    
    return this.parseResume({
      userId,
      filename,
      mimetype,
      content_base64
    });
  }

  /**
   * Test n8n webhook connectivity
   */
  static async testWebhook(): Promise<boolean> {
    try {
      const testRequest: N8nParseRequest = {
        userId: 'test-user',
        filename: 'test.pdf',
        mimetype: 'application/pdf',
        content_base64: 'dGVzdA==' // "test" in base64
      };

      await axios.post(N8N_WEBHOOK_URL, testRequest, {
        timeout: 5000
      });

      return true;
    } catch (error) {
      console.error('[N8nService] Webhook test failed:', error);
      return false;
    }
  }
}
