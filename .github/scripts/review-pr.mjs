import fs from "node:fs";
import OpenAI from "openai";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

function readFile(path) {
    try {
        return fs.readFileSync(path, "utf8");
    } catch {
        return "";
    }
}

function truncate(text, maxChars) {
    if (!text) return "";
    if (text.length <= maxChars) return text;
    return `${text.slice(0, maxChars)}\n\n[TRUNCATED]`;
}

const diffRaw = readFile("../pr.diff");
const diff = truncate(diffRaw, 120000);

if (!diff.trim()) {
    const emptyReview = `## AI PR Review

**Overall risk:** Low

### Must fix
- None

### Suggestions
- None

### Test coverage concerns
- None

### Summary
No relevant diff content was found for review.`;

    fs.writeFileSync("review.md", emptyReview, "utf8");
    process.exit(0);
}

const prompt = `
You are reviewing a GitHub pull request.

Repository: ${process.env.GITHUB_REPOSITORY}
PR Number: ${process.env.PR_NUMBER}
PR Title: ${process.env.PR_TITLE}
PR URL: ${process.env.PR_URL}
Author: ${process.env.PR_AUTHOR}
Base: ${process.env.BASE_REF}
Head: ${process.env.HEAD_REF}

Review ONLY for:
- functional bugs
- breaking changes
- security risks
- obvious performance problems
- maintainability risks likely to cause defects
- missing or weak tests for risky code changes

Do NOT comment on:
- formatting
- code style preferences
- naming preferences
- things a linter or formatter would catch
- speculative issues with weak evidence

Be selective.
Only raise issues that are concrete and useful.

Return markdown in exactly this structure:

## AI PR Review

**Overall risk:** Low | Medium | High

### Must fix
- bullet list, or "None"

### Suggestions
- bullet list, or "None"

### Test coverage concerns
- bullet list, or "None"

### Summary
One short paragraph.

PR diff:
\`\`\`diff
${diff}
\`\`\`
`;

async function main() {
    const response = await client.responses.create({
        model: "gpt-5.4",
        input: prompt,
    });

    const text = response.output_text?.trim() || `## AI PR Review

**Overall risk:** Low

### Must fix
- None

### Suggestions
- None

### Test coverage concerns
- None

### Summary
No review output was generated.`;

    fs.writeFileSync("review.md", text, "utf8");
    console.log(text);
}

main().catch((error) => {
    const fallback = `## AI PR Review

**Overall risk:** Low

### Must fix
- None

### Suggestions
- AI review failed to run: ${error?.message || "Unknown error"}

### Test coverage concerns
- None

### Summary
The automated reviewer encountered an error before it could complete.`;

    fs.writeFileSync("review.md", fallback, "utf8");
    console.error(error);
    process.exit(0);
});