/**
 * Site-wide constants: this site's URL, its companion sites, the engine, the owner's slide
 * series it links into, the primary sources, and its repository.
 */

/** This site (production). */
export const SITE_URL = "https://agent-security-explained.vercel.app";

/** The companion sites. */
export const DECODER_URL = "https://transformer-decoder-explained.vercel.app";
export const INFERENCE_URL = "https://llm-inference-explained.vercel.app";
export const HARNESSES_URL = "https://agent-harnesses-explained.vercel.app";
export const PROTOCOLS_URL = "https://agent-protocols-explained.vercel.app";
export const CONTEXT_URL = "https://agent-context-explained.vercel.app";
export const ORCHESTRATION_URL =
  "https://agent-orchestration-explained.vercel.app";
export const EVALS_URL = "https://agent-evals-explained.vercel.app";

export const GITHUB_URL =
  "https://github.com/BrendanJamesLynskey/agent-security-explained";

/** The author, credited in one quiet line at the foot of the About page. */
export const AUTHOR = {
  name: "Brendan Lynskey",
  url: "https://brendanjameslynskey.github.io/",
} as const;
export const ENGINE_URL =
  "https://github.com/BrendanJamesLynskey/Agent_Loop_Sim";

/** Primary sources (each checked at export.arxiv.org, title and first author, 2026-10-14). */
export const ARXIV = (id: string) => `https://arxiv.org/abs/${id}`;
export const PAPERS = {
  greshake: "2302.12173",
  perez: "2211.09527",
  liu: "2310.12815",
  injecagent: "2403.02691",
  agentdojo: "2406.13352",
  spotlighting: "2403.14720",
  camel: "2503.18813",
  patterns: "2506.08837",
  adaptive: "2503.00061",
} as const;

/** Claude Code's sandboxing write-up (approval fatigue, fewer prompts; opened 2026-10-14). */
export const SANDBOXING_POST =
  "https://www.anthropic.com/engineering/claude-code-sandboxing";
/** The dual-model pattern (opened 2026-10-14). */
export const DUAL_LLM_URL =
  "https://simonwillison.net/2023/Apr/25/dual-llm-pattern/";

/** The term "lethal trifecta" (opened 2026-10-14). */
export const TRIFECTA_URL =
  "https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/";

/** The owner's slides the chapters link into ("go deeper"). */
export const AGENTS_HUB =
  "https://brendanjameslynskey.github.io/LLM_Hub_Agents/";
export const COMPUTER_USE_HUB =
  "https://brendanjameslynskey.github.io/LLM_Hub_Computer_Use/";
export const MCP_HUB = "https://brendanjameslynskey.github.io/LLM_Hub_MCP/";
export const OAUTH_FOR_MCP =
  "https://brendanjameslynskey.github.io/OAuth_for_MCP/";

/** A file in this site's repository on GitHub. */
export function repoFile(path: string): string {
  return `${GITHUB_URL}/blob/main/${path}`;
}
