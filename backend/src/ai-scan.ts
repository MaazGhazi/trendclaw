import OpenAI from "openai";
import { z } from "zod";
import { getDb } from "./db";
import { getClients } from "./tools/get-clients";
import { getKeywords } from "./tools/get-keywords";
import { saveDigest } from "./tools/save-digest";
import { checkSeen } from "./tools/check-seen";
import { markSeen } from "./tools/mark-seen";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SalesSignalSchema = z.object({
  type: z.enum(["FUNDING", "HIRING", "PRODUCT_LAUNCH", "EXPANSION", "PARTNERSHIP"]),
  description: z.string(),
  confidence: z.number().min(0).max(1),
});

const CompanyAnalysisSchema = z.object({
  company_name: z.string(),
  signals: z.array(
    z.object({
      type: z.enum(["FUNDING", "HIRING", "PRODUCT_LAUNCH", "EXPANSION", "PARTNERSHIP"]),
      description: z.string(),
      confidence: z.number().min(0).max(1),
      source_url: z.string(),
      title: z.string(),
    })
  ),
  opportunity_score: z.number().min(1).max(10),
  outreach_hook: z.string(),
  content_hook: z.string(),
  keywords_matched: z.array(z.string()),
});

const ScanResponseSchema = z.object({
  analyses: z.array(CompanyAnalysisSchema),
});

export async function runSalesScan(userId: string): Promise<{
  ok: boolean;
  digestCount: number;
  errors: string[];
}> {
  const clients = getClients({ user_id: userId }) as Array<{
    id: number;
    name: string;
    domain: string | null;
  }>;
  const keywords = getKeywords({ user_id: userId }) as Array<{
    id: number;
    keyword: string;
  }>;

  if (clients.length === 0) {
    return { ok: false, digestCount: 0, errors: ["No clients found. Add clients first."] };
  }

  const keywordList = keywords.map((k) => k.keyword);
  const today = new Date().toISOString().split("T")[0];
  const errors: string[] = [];
  let digestCount = 0;

  for (const client of clients) {
    try {
      const result = await analyzeCompany(client, keywordList, userId, today);
      digestCount += result;
    } catch (err: any) {
      console.error(`Error analyzing ${client.name}:`, err.message);
      errors.push(`Failed to analyze ${client.name}: ${err.message}`);
    }
  }

  return { ok: true, digestCount, errors };
}

async function analyzeCompany(
  client: { id: number; name: string; domain: string | null },
  keywords: string[],
  userId: string,
  date: string
): Promise<number> {
  const prompt = `You are a sales intelligence analyst. Analyze the company "${client.name}"${client.domain ? ` (website: ${client.domain})` : ""} for recent sales opportunities and signals.

Keywords to watch for: ${keywords.length > 0 ? keywords.join(", ") : "general business signals"}

Based on your knowledge, identify any recent or likely sales signals for this company. For each signal, provide:
- The type of signal (FUNDING, HIRING, PRODUCT_LAUNCH, EXPANSION, PARTNERSHIP)
- A detailed description of the signal
- A confidence score (0-1) for how likely this signal is real/current
- A plausible source URL (use the company domain or relevant news sites)
- A short title for the signal

Also provide:
- An overall opportunity score (1-10) for sales outreach potential
- A personalized outreach hook (1-2 sentences a sales rep could use to open a conversation)
- A content hook (a topic or angle for creating relevant content)
- Which keywords matched

Return your analysis as JSON matching this exact structure:
{
  "company_name": "string",
  "signals": [
    {
      "type": "FUNDING|HIRING|PRODUCT_LAUNCH|EXPANSION|PARTNERSHIP",
      "description": "string",
      "confidence": 0.0-1.0,
      "source_url": "string",
      "title": "string"
    }
  ],
  "opportunity_score": 1-10,
  "outreach_hook": "string",
  "content_hook": "string",
  "keywords_matched": ["string"]
}

Be creative but realistic. Generate 2-4 signals per company.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-2024-08-06",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Empty response from OpenAI");

  const parsed = CompanyAnalysisSchema.parse(JSON.parse(content));
  let savedCount = 0;

  for (const signal of parsed.signals) {
    // Deduplicate using seen_signals
    const { seen } = checkSeen({ user_id: userId, url: signal.source_url });
    if (seen) continue;

    // Mark as seen
    markSeen({
      user_id: userId,
      url: signal.source_url,
      entity: parsed.company_name,
      title: signal.title,
    });

    // Save digest entry
    saveDigest({
      user_id: userId,
      date,
      entity: parsed.company_name,
      type: signal.type,
      summary: signal.description,
      score: parsed.opportunity_score * signal.confidence,
      url: signal.source_url,
      outreach_snippet: parsed.outreach_hook,
      content_hook: parsed.content_hook,
    });

    savedCount++;
  }

  return savedCount;
}
