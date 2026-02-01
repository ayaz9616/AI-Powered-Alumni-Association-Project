import Anthropic from '@anthropic-ai/sdk';
import Groq from 'groq-sdk';

const anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) : null;
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;
const AI_PROVIDER = anthropic ? 'anthropic' : (groq ? 'groq' : 'none');

export interface InfluenceNode {
  id: string;
  label?: string;
  impactedStudents: number;
  batches: string[];
  centrality: number; // 0-1 normalized
}

export class InfluenceInsightsService {
  static async generateInsights(nodes: InfluenceNode[]): Promise<string[]> {
    try {
      const top = nodes
        .sort((a, b) => b.impactedStudents - a.impactedStudents)
        .slice(0, 10);

      const summary = top.map(n => `${n.label || n.id}: ${n.impactedStudents} students, ${n.batches.length} batches, centrality ${n.centrality}`).join('\n');

      const prompt = `You are an analytics assistant for an alumni mentorship network. Given alumni metrics, produce concise, high-signal insights that quantify influence and spread.

Alumni Metrics (Top 10):
${summary}

Task:
- Write 5 short insights (one sentence each) that sound analytical.
- Prefer concrete numbers: impacted students, batch coverage, comparative centrality.
- Avoid repetition; highlight indirect impact and cohort breadth when relevant.
- Output strictly as a JSON array of strings.

Example style: "This alumnus indirectly impacted 47 students across 3 batches."`;

      if (AI_PROVIDER === 'anthropic' && anthropic) {
        const message = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 512,
          messages: [{ role: 'user', content: prompt }]
        });
        const text = message.content[0].type === 'text' ? message.content[0].text : '[]';
        const match = text.match(/\[[\s\S]*\]/);
        return match ? JSON.parse(match[0]) : [];
      }

      if (AI_PROVIDER === 'groq' && groq) {
        const chat = await groq.chat.completions.create({
          model: 'llama-3.1-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2
        });
        const text = chat.choices?.[0]?.message?.content || '[]';
        const match = text.match(/\[[\s\S]*\]/);
        return match ? JSON.parse(match[0]) : [];
      }

      // Fallback without AI
      return top.map(n => `${n.label || n.id} impacted ${n.impactedStudents} students across ${n.batches.length} batches (centrality ${(n.centrality).toFixed(2)}).`);
    } catch (err) {
      return [];
    }
  }
}
