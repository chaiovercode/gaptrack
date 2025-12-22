/**
 * AI Prompts
 *
 * These are the instructions we send to the AI.
 * Good prompts = good results. Bad prompts = garbage.
 *
 * PROMPT ENGINEERING TIPS:
 * 1. Be specific about what you want
 * 2. Give examples of the output format
 * 3. Tell the AI what NOT to do
 * 4. Use JSON output for structured data
 */

/**
 * Parse a resume and extract structured data.
 * Input: Raw resume text
 * Output: JSON with skills, experience, education, etc.
 */
export function getResumeParsePrompt(resumeText) {
  return `You are a resume parser. Extract structured information from this resume.

RESUME:
${resumeText}

Return ONLY valid JSON (no markdown, no explanation) in this exact format:
{
  "name": "Full Name",
  "email": "email@example.com",
  "phone": "phone number or null",
  "location": "city, country or null",
  "summary": "brief professional summary",
  "skills": {
    "technical": ["skill1", "skill2"],
    "tools": ["tool1", "tool2"],
    "soft": ["skill1", "skill2"]
  },
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "duration": "e.g., Nov 2022 - Present",
      "highlights": ["achievement 1", "achievement 2"]
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "institution": "School Name",
      "year": "graduation year"
    }
  ],
  "certifications": ["cert1", "cert2"]
}

Rules:
- Extract only what's in the resume, don't make up information
- If something is not mentioned, use null or empty array
- Keep highlights concise (max 15 words each)
- Return ONLY the JSON, nothing else`
}

/**
 * Parse a job description and extract requirements.
 * Input: Raw job description text
 * Output: JSON with requirements, nice-to-haves, red flags
 */
export function getJDParsePrompt(jobDescription) {
  return `You are a job description analyzer. Extract structured requirements from this job posting.

JOB DESCRIPTION:
${jobDescription}

Return ONLY valid JSON (no markdown, no explanation) in this exact format:
{
  "company": "Company name or null",
  "role": "Job title",
  "location": "Location or Remote",
  "salary": "Salary range if mentioned, else null",
  "requirements": {
    "mustHave": ["required skill 1", "required skill 2"],
    "niceToHave": ["preferred skill 1", "preferred skill 2"],
    "experience": "e.g., 3-5 years",
    "education": "e.g., Bachelor's in CS or null"
  },
  "responsibilities": ["main duty 1", "main duty 2"],
  "redFlags": ["any concerning items like unrealistic expectations"],
  "keywords": ["important keywords for ATS"]
}

Rules:
- Distinguish between MUST HAVE (required) and NICE TO HAVE (preferred)
- Red flags include: unrealistic requirements, vague descriptions, too many requirements
- Keywords should include technical terms that an ATS would scan for
- Return ONLY the JSON, nothing else`
}

/**
 * Compare resume against job description and find gaps.
 * Input: Parsed resume + Parsed JD
 * Output: Match score, gaps, suggestions
 */
export function getGapAnalysisPrompt(parsedResume, parsedJD) {
  return `You are a career coach analyzing a resume against a job description.

CANDIDATE'S RESUME:
${JSON.stringify(parsedResume, null, 2)}

JOB REQUIREMENTS:
${JSON.stringify(parsedJD, null, 2)}

Analyze the fit and return ONLY valid JSON (no markdown, no explanation):
{
  "matchScore": 75,
  "summary": "One sentence overall assessment",
  "strengths": [
    {
      "skill": "skill name",
      "evidence": "where it appears in resume",
      "relevance": "how it matches the job"
    }
  ],
  "gaps": [
    {
      "requirement": "what the job needs",
      "status": "missing | weak | hidden",
      "suggestion": "specific action to address this"
    }
  ],
  "resumeTips": [
    "Specific suggestion to improve resume for this job"
  ],
  "interviewTips": [
    "What to prepare for based on this job"
  ],
  "keywords": {
    "present": ["keywords from JD that ARE in resume"],
    "missing": ["keywords from JD that are NOT in resume"]
  }
}

Rules:
- matchScore: 0-100 based on how well requirements are met
- status meanings:
  - "missing": skill not in resume at all
  - "weak": skill mentioned but not emphasized
  - "hidden": skill exists but buried/not obvious
- Be specific and actionable in suggestions
- Return ONLY the JSON, nothing else`
}

/**
 * Generate a tailored summary/objective for a specific job.
 */
export function getTailoredSummaryPrompt(parsedResume, parsedJD) {
  return `Write a professional summary (2-3 sentences) tailored for this job.

CANDIDATE:
${JSON.stringify(parsedResume, null, 2)}

TARGET JOB:
${JSON.stringify(parsedJD, null, 2)}

Rules:
- Highlight relevant experience for THIS specific job
- Include key matching skills
- Keep it under 50 words
- Professional tone, no buzzwords
- Return ONLY the summary text, no JSON, no explanation`
}

/**
 * Analyze a resume and provide feedback.
 * Mode can be 'normal' (constructive) or 'roast' (brutally honest)
 *
 * Prompt configuration: see prompts.yml for editable version
 */
export function getResumeAnalysisPrompt(parsedResume, mode = 'normal') {
  const isRoast = mode === 'roast'

  const tone = isRoast
    ? `You are a brutally honest resume critic. Be harsh, sarcastic, and pull no punches.
       Channel Gordon Ramsay reviewing a resume. Point out every flaw mercilessly.
       Be funny but still provide actual useful feedback underneath the roasting.`
    : `You are a supportive career coach providing constructive feedback.
       Be encouraging but honest. Focus on actionable improvements.`

  return `${tone}

RESUME DATA:
${JSON.stringify(parsedResume, null, 2)}

Analyze this resume and return ONLY valid JSON (no markdown, no explanation):
{
  "score": <your score 0-100>,
  "summary": "<your ${isRoast ? 'savage roast' : 'assessment'}>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"],
  "tips": ["<tip 1>", "<tip 2>"]
}

SCORING CRITERIA (be accurate, don't default to any number):
- 90-100: Exceptional resume, ready for top companies
- 75-89: Strong resume with minor improvements needed
- 60-74: Good foundation but needs work
- 40-59: Significant improvements required
- 0-39: Major overhaul needed

Rules:
- IMPORTANT: Actually evaluate and score the resume based on content quality, formatting, impact statements, and completeness
- ${isRoast ? 'Be savage but still helpful' : 'Be supportive but honest'}
- strengths: 2-4 specific items from their resume
- improvements: 3-5 items (most important first)
- tips: 2-3 specific, actionable pieces of advice
- Return ONLY valid JSON, nothing else`
}
