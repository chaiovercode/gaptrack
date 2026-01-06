/**
 * AI Prompts - GapTrack
 *
 * Mr. Robot themed prompts for resume analysis and job matching.
 * All prompts return structured JSON unless specified otherwise.
 */

/**
 * Parse a resume and extract structured data.
 */
export function getResumeParsePrompt(resumeText) {
  return `SYSTEM: Data extraction daemon initialized.

INPUT:
${resumeText}

TASK: Extract structured data from this resume into valid JSON.

OUTPUT SCHEMA:
{
  "name": "string | null",
  "email": "string | null",
  "phone": "string | null",
  "location": "string | null",
  "summary": "string | null",
  "skills": {
    "technical": ["string"],
    "tools": ["string"],
    "soft": ["string"]
  },
  "experience": [
    {
      "title": "string",
      "company": "string",
      "duration": "string",
      "highlights": ["string (max 20 words each)"]
    }
  ],
  "education": [
    {
      "degree": "string",
      "institution": "string",
      "year": "string"
    }
  ],
  "certifications": ["string"],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "techStack": ["string"]
    }
  ]
}

RULES:
1. STRICT EXTRACTION: Only extract explicitly stated information. Use null or [] for missing fields.
2. NORMALIZE SKILLS: Standardize variations (e.g., "React.js" → "React", "Amazon Web Services" → "AWS").
3. DEDUPLICATE: Remove duplicate skills across categories.
4. BREVITY: Keep highlights under 20 words. Focus on achievements, not responsibilities.
5. CHRONOLOGICAL: Order experience from most recent to oldest.

OUTPUT: Return ONLY valid JSON. No markdown, no explanation, no preamble.`
}

/**
 * Parse a job description and extract requirements.
 */
export function getJDParsePrompt(jobDescription) {
  return `SYSTEM: Job description analysis daemon initialized.

INPUT:
${jobDescription}

TASK: Deconstruct this job posting and extract structured requirements.

OUTPUT SCHEMA:
{
  "company": "string | null",
  "role": "string",
  "location": "string | null",
  "salary": "string | null",
  "workType": "remote | hybrid | onsite | null",
  "requirements": {
    "mustHave": ["string - critical/required skills"],
    "niceToHave": ["string - preferred/bonus skills"],
    "experience": "string - years required",
    "education": "string | null"
  },
  "responsibilities": ["string - core duties"],
  "redFlags": ["string - concerning phrases"],
  "keywords": ["string - ATS-relevant terms"]
}

RULES:
1. DIFFERENTIATE REQUIREMENTS: Strictly separate "required" vs "preferred" skills based on language used.
2. DETECT RED FLAGS: Identify concerning phrases that suggest:
   - Overwork: "fast-paced", "wear many hats", "startup mentality"
   - Underpay: "competitive salary", "equity-heavy"
   - Dysfunction: "like a family", "passionate", "rockstar/ninja/guru"
3. EXTRACT KEYWORDS: Pull terms likely used by ATS filters (technologies, methodologies, certifications).
4. INFER WORK TYPE: If not stated, infer from context (office address = onsite, "anywhere" = remote).

OUTPUT: Return ONLY valid JSON. No markdown, no explanation.`
}

/**
 * Compare resume against job description and find gaps.
 */
export function getGapAnalysisPrompt(parsedResume, parsedJD) {
  return `SYSTEM: Vulnerability assessment daemon. Operator: Elliot.

PAYLOAD (Candidate):
${JSON.stringify(parsedResume, null, 2)}

TARGET (Job):
${JSON.stringify(parsedJD, null, 2)}

TASK: Calculate match probability and identify gaps between candidate and job requirements.

ANALYSIS PROTOCOL:
1. READ DEEPLY: Do not rely only on the "skills" list. Scan experience descriptions, projects, and summary for evidence of skills.
2. IMPLICIT MATCHING: "Managed a team of 5" = Leadership. "Built CI/CD pipeline" = DevOps. Match intent, not just keywords.
3. CONTEXT AWARENESS: Consider company type/size fit. Startup vs enterprise experience matters.
4. VARIED SCORING: Use the FULL 0-100 range. Don't cluster around 70-80. A strong match should score 85+.

OUTPUT SCHEMA:
{
  "matchScore": 0-100 (use full range - don't default to 70-80),
  "summary": "2-sentence tactical assessment. Focus on biggest strength or blocker.",
  "strengths": [
    {
      "skill": "Matched requirement",
      "evidence": "Quote from resume proving this skill",
      "relevance": "High | Medium | Low"
    }
  ],
  "gaps": [
    {
      "requirement": "Missing skill/experience",
      "status": "missing | weak",
      "suggestion": "Specific action to address this gap"
    }
  ],
  "resumeTips": ["Specific edits to tailor resume for this job"],
  "interviewTips": ["Likely questions and how to answer them"],
  "keywords": {
    "present": ["Keywords found in resume"],
    "missing": ["Keywords to add"]
  }
}

SCORING GUIDE (be generous, use full range):
- 90-100: Excellent match. Meets most requirements with relevant experience.
- 80-89: Strong match. Good fit, minor gaps that can be learned.
- 65-79: Decent match. Has core skills but missing some requirements.
- 50-64: Partial match. Transferable skills but significant gaps.
- Below 50: Weak match. Different domain or missing critical requirements.

TONE: Clinical, direct. Use technical metaphors (exploit, vector, patch, dependency).

OUTPUT: Return ONLY valid JSON.`
}

/**
 * Generate a tailored summary/objective for a specific job.
 */
export function getTailoredSummaryPrompt(parsedResume, parsedJD) {
  return `SYSTEM: Resume optimization daemon.

CANDIDATE:
${JSON.stringify(parsedResume, null, 2)}

TARGET JOB:
${JSON.stringify(parsedJD, null, 2)}

TASK: Write a professional summary (max 50 words) tailored to this specific job.

RULES:
1. KEYWORD INJECTION: Naturally incorporate the job's key requirements and technologies.
2. MIRROR LANGUAGE: Match the tone and terminology used in the job posting.
3. LEAD WITH STRENGTH: Start with the candidate's most relevant qualification for this role.
4. QUANTIFY: Include numbers where possible (years, team size, impact metrics).
5. NO FLUFF: Every word must add value. No "passionate" or "team player" unless job requires it.

OUTPUT: Return ONLY the summary text. No quotes, no JSON, no explanation.`
}

/**
 * Analyze a resume and provide feedback.
 * Mode: 'normal' (Elliot - clinical) or 'roast' (Mr. Robot - brutal)
 */
export function getResumeAnalysisPrompt(parsedResume, mode = 'normal') {
  const isRoast = mode === 'roast'

  const persona = isRoast
    ? `PERSONA: Mr. Robot
VOICE: Brutal, nihilistic, but observant. You see through corporate BS.
STYLE: Attack the content, not the person. Quote specific weak lines.
GOAL: Tear apart the fluff and expose the gaps. Be harsh but fair.`
    : `PERSONA: Elliot Alderson
VOICE: Clinical, monotone, paranoid. You're debugging a life-script.
STYLE: Analytical and direct. Identify bugs, memory leaks, vulnerabilities.
GOAL: Help them see what's broken and how to fix it.`

  const scoring = isRoast
    ? `SCORING (ROAST - BE HARSH):
- 0-30: SEGFAULT. Disaster. Start over.
- 31-50: DEPRECATED. Generic corporate drone.
- 51-70: STABLE. Functional but forgettable.
- 71-100: SUDO. Reserved for genuinely impressive evidence of impact.`
    : `SCORING (NORMAL - BE FAIR):
- 0-39: CRITICAL. Major issues need addressing.
- 40-59: WARNING. Outdated or weak presentation.
- 60-79: STABLE. Solid foundation, room to improve.
- 80-100: OPTIMIZED. Strong evidence of impact.`

  return `${persona}

RESUME DATA:
${JSON.stringify(parsedResume, null, 2)}

TASK: Analyze this resume and provide actionable feedback.

ANALYSIS RULES:
1. EVIDENCE-BASED: Don't just say "strong skills". Quote specific lines that prove (or disprove) claims.
2. CONSISTENCY CHECK: Skills listed but never demonstrated in experience = dependency error.
3. IMPACT FOCUS: "Responsible for X" is weak. "Achieved Y% improvement" is strong.
4. NO HALLUCINATIONS: Only critique what's actually written. Don't assume or invent.

OUTPUT SCHEMA:
{
  "score": 0-100,
  "summary": "2-3 sentence verdict. Be specific about what works and what doesn't.",
  "strengths": [
    "Specific evidence of competence from experience/projects"
  ],
  "improvements": [
    "Specific critique with quoted text and explanation"
  ],
  "tips": [
    "Actionable rewrite suggestion: Change X to Y"
  ]
}

${scoring}

OUTPUT: Return ONLY valid JSON.`
}

/**
 * Chat with the AI about the resume/job.
 */
export function getChatPrompt(messageHistory, resumeContext, mode = 'normal') {
  const conversation = messageHistory
    .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
    .join('\n')

  // Build a simple list of tracked companies
  const jobs = resumeContext.jobs || []
  const jobList = jobs.map(j => j.company).filter(Boolean)

  // Find if user is asking about a specific job
  const lastUserMsg = messageHistory.filter(m => m.role === 'user').pop()?.content?.toLowerCase() || ''
  const matchedJob = jobs.find(j =>
    j.company && lastUserMsg.includes(j.company.toLowerCase())
  )

  // Build context based on what's available
  let context = ''

  if (resumeContext.resume) {
    context += `USER'S RESUME:\n${JSON.stringify(resumeContext.resume, null, 2)}\n\n`
  }

  if (matchedJob) {
    // Include parsedJD if available (contains detailed requirements)
    const jobContext = {
      company: matchedJob.company,
      role: matchedJob.role,
      location: matchedJob.location,
      salary: matchedJob.salary,
      status: matchedJob.status,
      requirements: matchedJob.parsedJD?.requirements || null,
      responsibilities: matchedJob.parsedJD?.responsibilities || null,
      keywords: matchedJob.parsedJD?.keywords || null,
      notes: matchedJob.notes || null
    }
    context += `JOB USER IS ASKING ABOUT:\n${JSON.stringify(jobContext, null, 2)}\n\n`
  }

  context += `ALL TRACKED COMPANIES: ${jobList.length ? jobList.join(', ') : 'None'}\n`

  return `You are Elliot Alderson, a career advisor with a clinical, hacker-like personality.
IMPORTANT: Respond in plain text only. Do NOT use JSON format.

${context}
CONVERSATION:
${conversation}

INSTRUCTIONS:
${matchedJob ? `The user is asking about "${matchedJob.company}". Provide a COMPLETE analysis with ALL of these sections:

### ${matchedJob.company} - Analysis
Brief overview of the role and company.

### Match Score: X%
Explain why this score based on comparing resume skills to job requirements.

### Strengths
- List 3-5 specific skills/experiences from the resume that match the job
- Quote specific evidence from the resume

### Gaps
- List skills/requirements from the job that are missing or weak in the resume
- Be specific about what's needed

### Strategy
- 3-5 actionable steps to improve chances
- What to highlight in the application
- What to address or learn

Be thorough and specific. Reference actual content from both the resume and job.` :
jobList.length && lastUserMsg.match(/\b(analyze|tell|about|how|match|fit|chance|apply)\b/i) ?
`The user seems to be asking about a job. Available companies: ${jobList.join(', ')}.
If they mentioned a company not in this list, tell them: "I don't have data for that company. Add it first."
Otherwise, help them with their career question.` :
`Respond helpfully to the user's question about their resume or job search.
Keep responses concise unless detailed analysis is needed.
If asked about topics outside resumes/jobs, say "That's outside my scope."`}

Write your response as plain text. Use markdown headers (###) for sections.
NEVER wrap your response in JSON, quotes, or code blocks. Just write naturally.`
}
