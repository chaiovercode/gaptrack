/**
 * LandingPage - Marketing homepage for GapTrack
 *
 * Sections: Navbar, Hero, Features, How It Works, Footer
 */
import './LandingPage.css'

function LandingPage({ onGetStarted, onDemo }) {
  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="landing">
      {/* Navbar */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-logo">
            <img src="/gaptrack/logo.png" alt="GapTrack" className="landing-logo-img" />
            <span className="landing-logo-text">GapTrack</span>
          </div>
          <button className="landing-cta-btn" onClick={onGetStarted}>
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-hero-content">
          <h1 className="landing-hero-title">
            Track Your Job Hunt.
            <br />
            <span className="highlight">Land Your Dream Role.</span>
          </h1>
          <p className="landing-hero-subtitle">
            AI-powered job application tracker that identifies skill gaps between your resume and job descriptions.
            100% private - your data never leaves your device.
          </p>
          <div className="landing-hero-actions">
            <button className="landing-btn-primary" onClick={onGetStarted}>
              Get Started Free
            </button>
            <button className="landing-btn-demo" onClick={onDemo}>
              Try Demo
            </button>
            <button className="landing-btn-secondary" onClick={scrollToFeatures}>
              Learn More
            </button>
          </div>
        </div>
        <div className="landing-hero-visual">
          <div className="hero-mockup">
            <div className="mockup-header">
              <span className="mockup-dot" />
              <span className="mockup-dot" />
              <span className="mockup-dot" />
            </div>
            <div className="mockup-content">
              <div className="mockup-sidebar">
                <div className="mockup-nav-item active" />
                <div className="mockup-nav-item" />
              </div>
              <div className="mockup-main">
                <div className="mockup-card">
                  <div className="mockup-title" />
                  <div className="mockup-score good">92%</div>
                </div>
                <div className="mockup-card">
                  <div className="mockup-title" />
                  <div className="mockup-score medium">75%</div>
                </div>
                <div className="mockup-card">
                  <div className="mockup-title" />
                  <div className="mockup-score">--</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="landing-features">
        <div className="landing-section-header">
          <h2 className="landing-section-title">Everything You Need</h2>
          <p className="landing-section-subtitle">
            Stop juggling spreadsheets. Get instant insights on every application.
          </p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon feature-icon-gap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
              </svg>
            </div>
            <h3 className="feature-title">Resume Gap Analysis</h3>
            <p className="feature-description">
              AI compares your resume against job descriptions to find missing skills.
              Know exactly what to highlight or learn before you apply.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon feature-icon-track">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </div>
            <h3 className="feature-title">Application Tracking</h3>
            <p className="feature-description">
              Kanban board and list views to track every application.
              Applied, interviewing, offer, rejected - see your pipeline at a glance.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon feature-icon-privacy">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h3 className="feature-title">100% Private</h3>
            <p className="feature-description">
              No sign-up, no cloud, no tracking. Your resume and job data stays on your computer.
              Sync via Dropbox, iCloud, or Google Drive if you want.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="landing-how">
        <div className="landing-section-header">
          <h2 className="landing-section-title">How It Works</h2>
          <p className="landing-section-subtitle">
            Three simple steps to supercharge your job search.
          </p>
        </div>
        <div className="how-steps">
          <div className="how-step">
            <div className="step-number">1</div>
            <h3 className="step-title">Upload Your Resume</h3>
            <p className="step-description">
              Paste or upload your resume. AI extracts your skills, experience, and qualifications.
            </p>
          </div>
          <div className="how-connector" />
          <div className="how-step">
            <div className="step-number">2</div>
            <h3 className="step-title">Paste Job Descriptions</h3>
            <p className="step-description">
              Add jobs you're interested in. We parse requirements and company details automatically.
            </p>
          </div>
          <div className="how-connector" />
          <div className="how-step">
            <div className="step-number">3</div>
            <h3 className="step-title">Get Gap Analysis</h3>
            <p className="step-description">
              See match scores, missing skills, and what to emphasize. Track your applications as you go.
            </p>
          </div>
        </div>
        <div className="how-cta">
          <button className="landing-btn-primary" onClick={onGetStarted}>
            Start Tracking Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="footer-brand">
            <img src="/gaptrack/logo.png" alt="GapTrack" className="footer-logo-img" />
            <p className="footer-tagline">Your job search, your data, your device.</p>
          </div>
          <div className="footer-links">
            <a
              href="https://github.com/chaiovercode/gaptrack"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              View on GitHub
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>Built with privacy in mind. No accounts. No tracking. No cloud.</p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
