import fs from "node:fs";
import OpenAI from "openai";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

function readFileSafe(path) {
    try {
        return fs.readFileSync(path, "utf8");
    } catch {
        return "";
    }
}

function truncate(text, maxChars) {
    if (!text) return "";
    if (text.length <= maxChars) return text;
    return text.slice(0, maxChars) + "\n\n[TRUNCATED]";
}

function escapeMarkdown(text) {
    return text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const diffRaw = readFileSafe("pr.diff");
const diff = truncate(diffRaw, 120000);

if (!diff.trim()) {
    console.log("No diff content found. Skipping review.");
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
- security problems
- breaking changes
- obvious performance issues
- maintainability risks that are likely to cause defects
- missing or weak test coverage for risky changes

Do NOT comment on:
- formatting
- style preferences
- naming preferences
- things a formatter or linter would catch
- low-confidence guesses

Important:
- Be selective. Fewer, better findings.
- If there are no meaningful issues, say so.
- Prefer concrete, developer-usable feedback.
- Reference file paths when possible.
- Separate must-fix issues from nice-to-have suggestions.
- Keep the tone professional and concise.

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

    const reviewText = response.output_text?.trim() || "## AI PR Review\n\nNo review generated.";

    const body = `${reviewText}

---
_Automated review generated for PR #${process.env.PR_NUMBER}._`;

    fs.writeFileSync("review.md", body, "utf8");
    console.log(body);
}

main().catch((err) => {
    console.error("AI review failed:");
    console.error(err?.message || err);
    process.exit(1);
});