/**
 * ProfileView Component
 *
 * Resume view with analysis prompt.
 * Has Normal/Roast mode toggle for AI feedback.
 */
import { useState } from 'react'
import { Button, Card } from '../../../shared/components'
import './ProfileView.css'

function ProfileView({
  resume,
  onUpdateResume,
  onAnalyzeResume,
  isAnalyzing = false,
  analysisResult = null
}) {
  // Track which sections are expanded (collapsed by default)
  const [expanded, setExpanded] = useState({
    skills: false,
    experience: false,
    education: false,
    certifications: false
  })

  // Analysis mode toggle
  const [analysisMode, setAnalysisMode] = useState('normal') // 'normal' or 'roast'

  const toggleSection = (section) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const handleAnalyze = () => {
    if (onAnalyzeResume) {
      onAnalyzeResume(analysisMode)
    }
  }

  // Safe accessors for resume data
  const skills = Array.isArray(resume?.skills) ? resume.skills : []
  const experience = Array.isArray(resume?.experience) ? resume.experience : []
  const education = Array.isArray(resume?.education) ? resume.education : []
  const certifications = Array.isArray(resume?.certifications) ? resume.certifications : []

  return (
    <div className="profile-view">
      <h2 className="page-title">Resume</h2>
      {/* Empty State when no resume */}
      {!resume && (
        <section className="profile-section">
          <Card padding="lg" className="resume-empty">
            <div className="empty-icon">+</div>
            <h3>No resume uploaded</h3>
            <p>Upload your resume to see how you match with jobs</p>
            <Button variant="primary" onClick={onUpdateResume}>
              Upload Resume
            </Button>
          </Card>
        </section>
      )}

      {/* Resume Analysis Section - At Top */}
      {resume && (
        <section className="profile-section analysis-section">
          <div className="section-header">
            <h2>Resume Analysis</h2>
          </div>

          <div className="analysis-prompt-card">
            <div className="analysis-prompt-header">
              <p className="analysis-prompt-text">
                Get AI feedback on your resume. Choose your preferred style:
              </p>
              <div className="analysis-mode-toggle">
                <button
                  className={`mode-btn ${analysisMode === 'normal' ? 'active' : ''}`}
                  onClick={() => setAnalysisMode('normal')}
                >
                  <span className="mode-icon mode-icon-normal" />
                  Normal
                </button>
                <button
                  className={`mode-btn roast ${analysisMode === 'roast' ? 'active' : ''}`}
                  onClick={() => setAnalysisMode('roast')}
                >
                  <span className="mode-icon mode-icon-roast" />
                  Roast
                </button>
              </div>
            </div>

            <div className="analysis-mode-desc">
              {analysisMode === 'normal' ? (
                <p>Constructive feedback with actionable suggestions to improve your resume.</p>
              ) : (
                <p>Brutally honest, no-holds-barred critique. Not for the faint of heart!</p>
              )}
            </div>

            <Button
              variant="primary"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="analyze-btn"
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze My Resume'}
            </Button>
          </div>

          {/* Analysis Results */}
          {analysisResult && (
            <div className={`analysis-result ${analysisResult.mode}`}>
              <div className="analysis-result-header">
                <h3>
                  {analysisResult.mode === 'roast' ? 'Roast Results' : 'Analysis Results'}
                </h3>
                <span className="analysis-mode-badge">
                  {analysisResult.mode === 'roast' ? 'Roast Mode' : 'Normal Mode'}
                </span>
              </div>

              {analysisResult.score && (
                <div className="analysis-score">
                  <span className="score-value">{analysisResult.score}</span>
                  <span className="score-label">/100</span>
                </div>
              )}

              <div className="analysis-content">
                {analysisResult.summary && (
                  <div className="analysis-summary">
                    <p>{analysisResult.summary}</p>
                  </div>
                )}

                {analysisResult.strengths?.length > 0 && (
                  <div className="analysis-block strengths">
                    <h4>Strengths</h4>
                    <ul>
                      {analysisResult.strengths.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysisResult.improvements?.length > 0 && (
                  <div className="analysis-block improvements">
                    <h4>{analysisResult.mode === 'roast' ? 'What Needs Fixing' : 'Areas for Improvement'}</h4>
                    <ul>
                      {analysisResult.improvements.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysisResult.tips?.length > 0 && (
                  <div className="analysis-block tips">
                    <h4>Pro Tips</h4>
                    <ul>
                      {analysisResult.tips.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Resume Details Section - Collapsed by Default */}
      {resume && (
        <section className="profile-section resume-details-section">
          <div className="section-header">
            <h2>Resume Details</h2>
            <Button variant="secondary" size="sm" onClick={onUpdateResume}>
              Update
            </Button>
          </div>

          <div className="resume-content">
                {/* Skills Section */}
                {skills.length > 0 && (
                  <div className={`resume-block skills-block ${expanded.skills ? 'expanded' : 'collapsed'}`}>
                    <button className="block-header" onClick={() => toggleSection('skills')}>
                      <span className="block-icon icon-skills" />
                      <h3>Skills</h3>
                      <span className="block-count">{skills.length}</span>
                      <span className="block-toggle" />
                    </button>
                    {expanded.skills && (
                      <div className="block-content">
                        <div className="skills-grid-view">
                          {skills.map((skill, i) => {
                            const skillName = typeof skill === 'string' ? skill : (skill?.name || '')
                            const level = typeof skill === 'object' ? skill?.level : null
                            return (
                              <div key={i} className={`skill-card ${level ? `level-${level.toLowerCase()}` : ''}`}>
                                <span className="skill-name">{skillName}</span>
                                {level && <span className="skill-level">{level}</span>}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Experience Section */}
                {experience.length > 0 && (
                  <div className={`resume-block ${expanded.experience ? 'expanded' : 'collapsed'}`}>
                    <button className="block-header" onClick={() => toggleSection('experience')}>
                      <span className="block-icon icon-briefcase" />
                      <h3>Experience</h3>
                      <span className="block-count">{experience.length}</span>
                      <span className="block-toggle" />
                    </button>
                    {expanded.experience && (
                      <div className="block-content">
                        <div className="timeline">
                          {experience.map((exp, i) => (
                            <div key={i} className="timeline-item">
                              <div className="timeline-marker" />
                              <div className="timeline-content">
                                <div className="timeline-header">
                                  <h4>{exp?.title || exp?.role || 'Position'}</h4>
                                  {(exp?.startDate || exp?.duration) && (
                                    <span className="timeline-date">
                                      {exp.startDate && exp.endDate
                                        ? `${exp.startDate} - ${exp.endDate}`
                                        : exp.duration
                                      }
                                    </span>
                                  )}
                                </div>
                                {exp?.company && (
                                  <span className="timeline-company">{exp.company}</span>
                                )}
                                {exp?.description && (
                                  <p className="timeline-desc">{exp.description}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Education Section */}
                {education.length > 0 && (
                  <div className={`resume-block ${expanded.education ? 'expanded' : 'collapsed'}`}>
                    <button className="block-header" onClick={() => toggleSection('education')}>
                      <span className="block-icon icon-education" />
                      <h3>Education</h3>
                      <span className="block-count">{education.length}</span>
                      <span className="block-toggle" />
                    </button>
                    {expanded.education && (
                      <div className="block-content">
                        <div className="education-grid">
                          {education.map((edu, i) => (
                            <div key={i} className="education-card">
                              <div className="edu-degree">{edu?.degree || edu?.field || 'Degree'}</div>
                              {edu?.school && <div className="edu-school">{edu.school}</div>}
                              {edu?.year && <div className="edu-year">{edu.year}</div>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Certifications Section */}
                {certifications.length > 0 && (
                  <div className={`resume-block ${expanded.certifications ? 'expanded' : 'collapsed'}`}>
                    <button className="block-header" onClick={() => toggleSection('certifications')}>
                      <span className="block-icon icon-cert" />
                      <h3>Certifications</h3>
                      <span className="block-count">{certifications.length}</span>
                      <span className="block-toggle" />
                    </button>
                    {expanded.certifications && (
                      <div className="block-content">
                        <div className="cert-grid">
                          {certifications.map((cert, i) => (
                            <div key={i} className="cert-badge">
                              <span className="cert-check" />
                              <span className="cert-name">
                                {typeof cert === 'string' ? cert : (cert?.name || '')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
          </div>
        </section>
      )}
    </div>
  )
}

export default ProfileView
