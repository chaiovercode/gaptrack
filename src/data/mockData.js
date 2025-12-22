/**
 * Mock data for demo mode
 * User: Janardan Jakhar - Full Stack Developer
 */

// Mock analysis results for demo mode
export const MOCK_ANALYSIS = {
  normal: {
    mode: 'normal',
    score: 78,
    summary: 'Your resume presents a solid full-stack developer profile with strong JavaScript/React expertise. There are opportunities to better highlight leadership experience and quantify achievements.',
    strengths: [
      'Strong technical foundation in JavaScript, TypeScript, and React',
      'Clear progression from junior to senior roles',
      'Good mix of startup and agency experience',
      'Relevant certifications (AWS, GCP) add credibility'
    ],
    improvements: [
      'Add more quantified achievements (revenue impact, user growth, etc.)',
      'Include more keywords for ATS optimization',
      'Expand on leadership and mentoring experience',
      'Consider adding a projects or portfolio section'
    ],
    tips: [
      'Lead with impact metrics in each bullet point',
      'Tailor skills section to match job descriptions',
      'Add links to GitHub, portfolio, or notable projects',
      'Consider a brief professional summary at the top'
    ]
  },
  roast: {
    mode: 'roast',
    score: 52,
    summary: 'Oh look, another "Full Stack Developer" who lists every technology they\'ve ever Googled. Your resume reads like a Wikipedia article for web development buzzwords.',
    strengths: [
      'At least you spelled JavaScript correctly',
      'You managed to stay employed, which is... something',
      'The certifications show you can pass a multiple choice test'
    ],
    improvements: [
      '"Built full-stack web applications" - wow, so did every bootcamp grad in 2019',
      '"Reduced page load time by 40%" - from what, 10 seconds to 6? Still terrible.',
      'Your skills list is longer than your actual experience descriptions',
      '"Collaborated with design team" - you mean you argued about button colors?'
    ],
    tips: [
      'Stop listing technologies like you\'re a human package.json',
      'Actually explain what you built instead of vague corporate speak',
      'One really impressive project beats ten forgettable ones',
      'Maybe lead with something more exciting than "Senior Software Engineer"'
    ]
  }
}

export const MOCK_DATA = {
  applications: [
    {
      id: 'demo-1',
      company: 'Google',
      role: 'Senior Software Engineer',
      location: 'Mountain View, CA',
      status: 'interview',
      workType: 'hybrid',
      salary: '$180,000 - $250,000',
      link: 'https://careers.google.com',
      notes: 'Phone screen done. On-site scheduled for next week.',
      matchScore: 87,
      createdAt: '2024-12-01T10:00:00.000Z',
      updatedAt: '2024-12-18T14:30:00.000Z'
    },
    {
      id: 'demo-2',
      company: 'Stripe',
      role: 'Full Stack Engineer',
      location: 'San Francisco, CA',
      status: 'screening',
      workType: 'remote',
      salary: '$170,000 - $220,000',
      link: 'https://stripe.com/jobs',
      notes: 'Recruiter reached out on LinkedIn. Scheduled intro call.',
      matchScore: 92,
      createdAt: '2024-12-05T09:00:00.000Z',
      updatedAt: '2024-12-15T11:00:00.000Z'
    },
    {
      id: 'demo-3',
      company: 'Airbnb',
      role: 'Software Engineer, Frontend',
      location: 'San Francisco, CA',
      status: 'applied',
      workType: 'hybrid',
      salary: '$160,000 - $200,000',
      link: 'https://careers.airbnb.com',
      notes: 'Applied through referral from college friend.',
      matchScore: 78,
      createdAt: '2024-12-10T14:00:00.000Z',
      updatedAt: '2024-12-10T14:00:00.000Z'
    },
    {
      id: 'demo-4',
      company: 'Notion',
      role: 'Product Engineer',
      location: 'New York, NY',
      status: 'offer',
      workType: 'remote',
      salary: '$165,000 - $195,000',
      link: 'https://notion.so/careers',
      notes: 'Offer received! $185k base + equity. Need to decide by Dec 28.',
      matchScore: 95,
      createdAt: '2024-11-20T08:00:00.000Z',
      updatedAt: '2024-12-20T16:00:00.000Z'
    },
    {
      id: 'demo-5',
      company: 'Figma',
      role: 'Software Engineer',
      location: 'San Francisco, CA',
      status: 'rejected',
      workType: 'hybrid',
      salary: '$155,000 - $190,000',
      link: 'https://figma.com/careers',
      notes: 'Rejected after final round. Feedback: need more system design experience.',
      matchScore: 72,
      createdAt: '2024-11-15T10:00:00.000Z',
      updatedAt: '2024-12-12T09:00:00.000Z'
    },
    {
      id: 'demo-6',
      company: 'Vercel',
      role: 'Senior Frontend Engineer',
      location: 'Remote',
      status: 'interview',
      workType: 'remote',
      salary: '$175,000 - $210,000',
      link: 'https://vercel.com/careers',
      notes: 'Technical interview completed. Waiting for team matching.',
      matchScore: 88,
      createdAt: '2024-12-03T11:00:00.000Z',
      updatedAt: '2024-12-19T10:00:00.000Z'
    },
    {
      id: 'demo-7',
      company: 'Linear',
      role: 'Full Stack Developer',
      location: 'Remote',
      status: 'applied',
      workType: 'remote',
      salary: '$150,000 - $180,000',
      link: 'https://linear.app/careers',
      notes: 'Love their product! Applied directly on website.',
      matchScore: 85,
      createdAt: '2024-12-15T13:00:00.000Z',
      updatedAt: '2024-12-15T13:00:00.000Z'
    },
    {
      id: 'demo-8',
      company: 'Shopify',
      role: 'Senior Developer',
      location: 'Toronto, Canada',
      status: 'withdrawn',
      workType: 'remote',
      salary: '$140,000 - $175,000 CAD',
      link: 'https://shopify.com/careers',
      notes: 'Withdrew after receiving Notion offer.',
      matchScore: 81,
      createdAt: '2024-11-25T09:00:00.000Z',
      updatedAt: '2024-12-21T08:00:00.000Z'
    }
  ],
  contacts: [
    {
      id: 'contact-1',
      name: 'Sarah Chen',
      company: 'Google',
      role: 'Engineering Manager',
      email: 'sarah.chen@example.com',
      phone: '+1 (555) 123-4567',
      linkedin: 'https://linkedin.com/in/sarahchen',
      notes: 'Met at React Conf 2024. Very helpful with referral.',
      createdAt: '2024-11-28T10:00:00.000Z',
      updatedAt: '2024-12-01T10:00:00.000Z'
    },
    {
      id: 'contact-2',
      name: 'Mike Rodriguez',
      company: 'Stripe',
      role: 'Senior Recruiter',
      email: 'mike.r@example.com',
      phone: '+1 (555) 234-5678',
      linkedin: 'https://linkedin.com/in/mikerodriguez',
      notes: 'Reached out via LinkedIn. Quick to respond.',
      createdAt: '2024-12-04T14:00:00.000Z',
      updatedAt: '2024-12-05T09:00:00.000Z'
    },
    {
      id: 'contact-3',
      name: 'Emily Watson',
      company: 'Notion',
      role: 'Head of Engineering',
      email: 'emily.w@example.com',
      linkedin: 'https://linkedin.com/in/emilywatson',
      notes: 'Final round interviewer. Great conversation about team culture.',
      createdAt: '2024-12-10T11:00:00.000Z',
      updatedAt: '2024-12-20T16:00:00.000Z'
    },
    {
      id: 'contact-4',
      name: 'David Park',
      company: 'Vercel',
      role: 'Staff Engineer',
      email: 'david.park@example.com',
      linkedin: 'https://linkedin.com/in/davidpark',
      notes: 'College alumni. Helped prep for technical interview.',
      createdAt: '2024-12-02T15:00:00.000Z',
      updatedAt: '2024-12-03T11:00:00.000Z'
    },
    {
      id: 'contact-5',
      name: 'Lisa Thompson',
      company: 'Airbnb',
      role: 'Technical Recruiter',
      email: 'lisa.t@example.com',
      phone: '+1 (555) 345-6789',
      notes: 'Referral from college friend. Waiting for her update.',
      createdAt: '2024-12-09T10:00:00.000Z',
      updatedAt: '2024-12-10T14:00:00.000Z'
    }
  ],
  resume: {
    name: 'Janardan Jakhar',
    email: 'janardan.jakhar@example.com',
    phone: '+1 (555) 987-6543',
    location: 'San Francisco, CA',
    summary: 'Full Stack Developer with 5+ years of experience building scalable web applications. Passionate about clean code, great UX, and developer tools.',
    skills: [
      { name: 'JavaScript', level: 'Expert' },
      { name: 'TypeScript', level: 'Expert' },
      { name: 'React', level: 'Expert' },
      { name: 'Node.js', level: 'Advanced' },
      { name: 'Python', level: 'Advanced' },
      { name: 'PostgreSQL', level: 'Advanced' },
      { name: 'AWS', level: 'Intermediate' },
      { name: 'Docker', level: 'Intermediate' },
      { name: 'GraphQL', level: 'Intermediate' },
      { name: 'Redis', level: 'Intermediate' }
    ],
    experience: [
      {
        title: 'Senior Software Engineer',
        company: 'TechStartup Inc.',
        startDate: '2022-01',
        endDate: 'Present',
        description: 'Lead frontend architecture for SaaS platform serving 50k+ users. Reduced page load time by 40% through code splitting and optimization.'
      },
      {
        title: 'Software Engineer',
        company: 'Digital Agency Co.',
        startDate: '2019-06',
        endDate: '2021-12',
        description: 'Built full-stack web applications for Fortune 500 clients. Implemented CI/CD pipelines and automated testing.'
      },
      {
        title: 'Junior Developer',
        company: 'Web Solutions LLC',
        startDate: '2018-01',
        endDate: '2019-05',
        description: 'Developed responsive websites and RESTful APIs. Collaborated with design team on UX improvements.'
      }
    ],
    education: [
      {
        degree: 'B.S. Computer Science',
        school: 'UC Berkeley',
        year: '2017'
      }
    ],
    certifications: [
      'AWS Certified Developer',
      'Google Cloud Professional'
    ],
    parsedAt: '2024-11-15T10:00:00.000Z'
  },
  settings: {
    aiProvider: 'gemini',
    geminiApiKey: 'demo-key-not-real',
    goalDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 14 days from now
  },
  updatedAt: new Date().toISOString()
}
