/**
 * Mock data for demo mode
 * User: Elliot Alderson - Cybersecurity Engineer
 * "Hello, friend."
 */

// Mock analysis results for demo mode
export const MOCK_ANALYSIS = {
  normal: {
    mode: 'normal',
    score: 89,
    summary: 'analysis complete. subject demonstrates high-level offensive security capabilities. experience at allsafe provides adequate cover. technical proficiency in penetration testing is absolute. social skills are the primary vector for potential failure.',
    strengths: [
      'root access level mastery of linux/unix systems',
      'ability to bypass enterprise-grade firewalls undetected',
      'custom exploit development (python/ruby/assembly)',
      'strong understanding of physical security protocols'
    ],
    improvements: [
      'subject appears visibly anxious in corporate settings',
      'resume lacks "team player" buzzwords required by hr filters',
      'gaps in employment history correlate with "sick days"',
      'references are limited to gideon goddard and childhood friend'
    ],
    tips: [
      'mimic their language. use words like "synergy" and "deliverables"',
      'hide the anxiety. they can smell it.',
      'quantify "saved" revenue. they only care about money.',
      'do not mention specific hacks. keep it vague. keep it safe.'
    ]
  },
  roast: {
    mode: 'roast',
    score: 12,
    summary: 'this resume screams "i operate in the shadows" which translates to "i am a liability" for any hr department. you listed "social engineering" as a skill? are you trying to get arrested or hired? the hoodie picture was a nice touch if you are applying to a hackathon, not a bank.',
    strengths: [
      'technical skills are undeniable (if they verify them)',
      'allsafe tenure looks respectable on paper',
      'you didn\'t list "mr. robot" as a reference'
    ],
    improvements: [
      '"self-taught" sounds like "unmanageable" to a recruiter',
      'your github is empty (smart, but suspicious)',
      'you look sleep-deprived in your photo. corporate wants "energetic slaves"',
      'summary reads like a manifesto, not a professional bio'
    ],
    tips: [
      'delete "social engineering". call it "user security awareness"',
      'pretend to care about their "culture". it is all a lie anyway.',
      'get a haircut. look like one of them.',
      'stop trying to save the world. just get the paycheck.'
    ]
  }
}

export const MOCK_DATA = {
  applications: [
    {
      id: 'demo-1',
      company: 'Allsafe Cybersecurity',
      role: 'Lead Security Analyst',
      location: 'New York, NY',
      status: 'offer',
      workType: 'hybrid',
      salary: '$165,000 - $195,000',
      link: 'https://allsafe.com/careers',
      notes: 'gideon is a good man. he cares. that makes him vulnerable. offer is good. perfect cover. i can monitor e corp from here.',
      linkedContacts: ['contact-1', 'contact-4'],
      gapAnalysis: {
        matchScore: 99,
        summary: 'perfect infiltration point. access granted.',
        strengths: [
          { skill: 'Penetration Testing', relevance: 'primary objective' },
          { skill: 'E Corp Systems', relevance: 'target infrastructure access' },
          { skill: 'Incident Response', relevance: 'cover for investigation' }
        ],
        gaps: [
          { requirement: 'Social Interaction', suggestion: 'initiate "small talk" protocol' }
        ]
      },
      createdAt: '2024-11-20T08:00:00.000Z',
      updatedAt: '2024-12-20T16:00:00.000Z'
    },
    {
      id: 'demo-8',
      company: 'E Corp',
      role: 'InfoSec VP',
      location: 'New York, NY',
      status: 'withdrawn',
      workType: 'onsite',
      salary: '$350,000 - $500,000',
      link: 'https://e-corp.com/careers',
      notes: 'tyrell offered me a job. "join us". tempting. inside the belly of the beast. but too much exposure. had to decline. he didn\'t take it well.',
      linkedContacts: ['contact-2', 'contact-3'],
      gapAnalysis: {
        matchScore: 45,
        summary: 'high risk. high reward. ultimate trap.',
        strengths: [
          { skill: 'Technical Superiority', relevance: 'you are better than their entire team' }
        ],
        gaps: [
          { requirement: 'Soul', suggestion: 'required to sell to the devil' },
          { requirement: 'Compliance', suggestion: 'incapable of following blind orders' }
        ]
      },
      createdAt: '2024-11-01T10:00:00.000Z',
      updatedAt: '2024-11-05T08:00:00.000Z'
    },
    {
      id: 'demo-2',
      company: 'FBI',
      role: 'Cyber Division Contractor',
      location: 'Washington, DC',
      status: 'interview',
      workType: 'onsite',
      salary: '$120,000 - $150,000',
      link: 'https://fbijobs.gov',
      notes: 'dom dipierro suspects something. applying might throw them off... or put me on their radar. risky. need to leak the fsociety beat report first.',
      gapAnalysis: {
        matchScore: 88,
        summary: 'surveillance state actors. dangerous territory.',
        strengths: [
          { skill: 'Forensics', relevance: 'you know how to hide' },
          { skill: 'Dark Web', relevance: 'you live there' }
        ],
        gaps: [
          { requirement: 'Background Check', suggestion: 'critical failure point. sanitize history.' },
          { requirement: 'Drug Test', suggestion: 'detox required immediately' }
        ]
      },
      createdAt: '2024-12-03T11:00:00.000Z',
      updatedAt: '2024-12-19T10:00:00.000Z'
    },
    {
      id: 'demo-3',
      company: 'Theranos',
      role: 'Security Consultant',
      location: 'Palo Alto, CA',
      status: 'rejected',
      workType: 'onsite',
      salary: '$0',
      link: 'https://theranos.com',
      notes: 'fraud. smoke and mirrors. their "tech" is a shell script. i saw through it in 5 minutes. they knew i knew.',
      gapAnalysis: {
        matchScore: 0,
        summary: 'system error. do not proceed.',
        strengths: [],
        gaps: [
          { requirement: 'Belief within Lies', suggestion: 'incompatible with logic' }
        ]
      },
      createdAt: '2024-10-01T10:00:00.000Z',
      updatedAt: '2024-10-02T14:30:00.000Z'
    },
    {
      id: 'demo-5',
      company: 'Protonmail',
      role: 'Cryptography Engineer',
      location: 'Geneva, CH',
      status: 'screening',
      workType: 'remote',
      salary: '$170,000 - $210,000',
      link: 'https://protonmail.com/careers',
      notes: 'one of the few secure channels left. i use them. might as well work for them. privacy is a human right.',
      gapAnalysis: {
        matchScore: 91,
        summary: 'ethical match. safe harbor.',
        strengths: [
          { skill: 'Cryptography', relevance: 'mathematical purity' },
          { skill: 'Privacy', relevance: 'ideological alignment' }
        ],
        gaps: [
          { requirement: 'Relocation', suggestion: 'switzerland is neutral. good for disappearing.' }
        ]
      },
      createdAt: '2024-12-10T14:00:00.000Z',
      updatedAt: '2024-12-16T10:00:00.000Z'
    }
  ],
  contacts: [
    {
      id: 'contact-1',
      name: 'Gideon Goddard',
      company: 'Allsafe Cybersecurity',
      role: 'CEO',
      email: 'gideon@allsafe.com',
      notes: 'too kind for this world. he suspects something is wrong with me. invited me to dinner. need to deflect.',
      createdAt: '2024-11-28T10:00:00.000Z',
      updatedAt: '2024-12-01T10:00:00.000Z'
    },
    {
      id: 'contact-2',
      name: 'Angela Moss',
      company: 'E Corp',
      role: 'Risk Management',
      email: 'angela.moss@e-corp.com',
      notes: 'friend. weakness. she is climbing the corporate ladder. she thinks she can change them. she is wrong.',
      createdAt: '2024-12-04T14:00:00.000Z',
      updatedAt: '2024-12-05T09:00:00.000Z'
    },
    {
      id: 'contact-3',
      name: 'Tyrell Wellick',
      company: 'E Corp',
      role: 'CTO (acting)',
      email: 'tyrell.wellick@e-corp.com',
      notes: 'psychopath. unstable. obsessed with power. he knows i hacked them. why hasn\'t he turned me in? he wants to be partners.',
      createdAt: '2024-12-10T11:00:00.000Z',
      updatedAt: '2024-12-20T16:00:00.000Z'
    },
    {
      id: 'contact-4',
      name: 'Darlene',
      company: 'fsociety',
      role: 'Root',
      email: 'encrypted@protonmail.com',
      notes: 'sister. contact point. keep professional distance in logs. delete this entry after reading.',
      createdAt: '2024-12-02T15:00:00.000Z',
      updatedAt: '2024-12-03T11:00:00.000Z'
    },
    {
      id: 'contact-5',
      name: 'Whiterose',
      company: 'Dark Army',
      role: 'Leader',
      email: 'admin@deus-group.cn',
      notes: 'time is ticking. do not keep her waiting. dangerous.',
      createdAt: '2024-12-09T10:00:00.000Z',
      updatedAt: '2024-12-10T14:00:00.000Z'
    }
  ],
  resume: {
    name: 'Elliot Alderson',
    email: 'elliot.alderson@protonmail.com',
    phone: 'Unknown',
    location: 'New York, NY',
    summary: 'Senior cybersecurity engineer specializing in offensive security and intrusion detection. "White hat" hacker with a focus on enterprise infrastructure protection. I see the vulnerabilities others miss.',
    skills: [
      { name: 'Penetration Testing', level: 'Expert' },
      { name: 'Python/Ruby', level: 'Expert' },
      { name: 'Linux Kernel', level: 'Expert' },
      { name: 'Social Engineering', level: 'Expert' },
      { name: 'Cryptography', level: 'Advanced' },
      { name: 'Malware Analysis', level: 'Advanced' },
      { name: 'Data Recovery', level: 'Advanced' }
    ],
    experience: [
      {
        title: 'Senior Security Engineer',
        company: 'Allsafe Cybersecurity',
        startDate: '2014-09',
        endDate: 'Present',
        description: 'Primary architect for E Corp security protocols. Responded to DDOS attacks. Conducted vulnerability assessments for high-profile clients.'
      },
      {
        title: 'Security Consultant',
        company: 'Freelance',
        startDate: '2012-06',
        endDate: '2014-08',
        description: 'Anonymous consulting for small businesses. Security hardening. Data recovery services.'
      }
    ],
    education: [
      {
        degree: 'None',
        school: 'Self-Taught',
        year: 'Lifetime'
      }
    ],
    certifications: [
      'None required'
    ],
    parsedAt: '2024-11-15T10:00:00.000Z'
  },
  settings: {
    aiProvider: 'gemini',
    geminiApiKey: 'demo-mode-bypass',
    goalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  },
  updatedAt: new Date().toISOString()
}
