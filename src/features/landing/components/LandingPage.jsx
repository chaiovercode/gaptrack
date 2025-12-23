/**
 * LandingPage - Marketing homepage for GapTrack
 *
 * Sections: Navbar, Hero, Features, How It Works, Footer
 * Mr. Robot inspired dark, minimal aesthetic.
 */
import { useState, useEffect, useRef } from 'react'
import './LandingPage.css'

// Matrix-style decrypt animation hook
const useDecrypt = (text, speed = 50) => {
  const [displayText, setDisplayText] = useState(text)
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+"

  useEffect(() => {
    let iteration = 0
    let interval = null

    // Start slightly scrambled
    setDisplayText(text.split('').map((char, index) => {
      if (char === ' ') return ' '
      return chars[Math.floor(Math.random() * chars.length)]
    }).join(''))

    const startAnimation = () => {
      clearInterval(interval)
      interval = setInterval(() => {
        setDisplayText(prev =>
          text.split('').map((char, index) => {
            if (index < iteration) return text[index]
            if (char === ' ') return ' '
            return chars[Math.floor(Math.random() * chars.length)]
          }).join('')
        )

        if (iteration >= text.length) {
          clearInterval(interval)
        }

        iteration += 1 / 3
      }, speed)
    }

    // Small delay before starting
    const timeout = setTimeout(startAnimation, 500)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [text, speed])

  return displayText
}

const DecryptText = ({ text }) => {
  const decrypted = useDecrypt(text)
  return <span>{decrypted}</span>
}

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
            <img src="favicon.svg" alt="GapTrack" className="landing-logo-icon" />
            <span className="landing-logo-text">gaptrack</span>
          </div>
          <button className="landing-cta-btn" onClick={onGetStarted}>
            sudo start
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-hero-content">
          <h1 className="landing-hero-title">
            <DecryptText text="hello friend." /><span className="cursor-blink">|</span>
          </h1>
          <p className="landing-hero-subtitle">
            we're all stuck in the same loop. wake up. work. sleep. repeat.
            a daemon running in the background of society. disguised as a simple tracking tool.
            but to change the system, you first have to enter it.
          </p>
          <p className="landing-hero-subtitle">
            the hiring protocol is full of bugs. glitches. infinite waits.
            don't let the algorithm filter you out. debug your application.
            patch your resume. bypass the gatekeepers.
          </p>
          <div className="landing-hero-actions">
            <button className="landing-btn-primary" onClick={onGetStarted}>
              execute_patch
            </button>
            <button className="landing-btn-demo" onClick={onDemo}>
              load_simulation
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="landing-features">
        <div className="landing-section-header">
          <h2 className="landing-section-title">kernel_modules</h2>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <h3 className="feature-title">syntax_analysis</h3>
            <p className="feature-description">
              they speak in keywords. buzzwords. encrypted dialects.
              stay dark with local ollama. or weaponize their own intelligence against them with gemini/openai.
              you control the uplink.
            </p>
          </div>
          <div className="feature-card">
            <h3 className="feature-title">runtime_logs</h3>
            <p className="feature-description">
              chaos is the enemy. track every packet sent. every handshake attempt.
              maintain a pristine log of your infiltration attempts.
              never lose track of a thread.
            </p>
          </div>
          <div className="feature-card">
            <h3 className="feature-title">zero_knowledge</h3>
            <p className="feature-description">
              the cloud is just someone else's computer.
              we don't trust it. neither should you.
              everything runs locally. no leaks. no observers.
              just you and the screen.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="landing-how">
        <div className="landing-section-header">
          <h2 className="landing-section-title">runtime_sequence</h2>
        </div>
        <div className="how-steps">
          <div className="how-step">
            <div className="step-number">01</div>
            <div className="step-content">
              <h3 className="step-title">mount_profile</h3>
              <p className="step-description">
                load your resume into the buffer. extract the raw data structures.
              </p>
            </div>
          </div>
          <div className="how-step">
            <div className="step-number">02</div>
            <div className="step-content">
              <h3 className="step-title">scan_objective</h3>
              <p className="step-description">
                target the job description. parsing requirements... [100%]
              </p>
            </div>
          </div>
          <div className="how-step">
            <div className="step-number">03</div>
            <div className="step-content">
              <h3 className="step-title">debug_&_deploy</h3>
              <p className="step-description">
                identify the gap. rewrite the code. compile the perfect application.
              </p>
            </div>
          </div>
        </div>
        <div className="how-cta">
          <button className="landing-btn-primary" onClick={onGetStarted}>
            chmod +x start
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="footer-brand">
            <span className="footer-logo-text">gaptrack_daemon_v1.0</span>
          </div>
          <div className="footer-links">
            <a href="https://chaiovercode.com" target="_blank" rel="noopener noreferrer" className="footer-link">
              website
            </a>
            <span className="footer-separator">•</span>
            <a href="https://github.com/chaiovercode" target="_blank" rel="noopener noreferrer" className="footer-link">
              github
            </a>
            <span className="footer-separator">•</span>
            <a href="https://www.linkedin.com/in/vivektiwari13/" target="_blank" rel="noopener noreferrer" className="footer-link">
              linkedin
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>secure connection established. no logs retained.</p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
