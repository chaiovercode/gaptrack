/**
 * Resume View Component
 *
 * Displays parsed resume data in a nice format.
 * Shows skills, experience, education, etc.
 */
import { Button } from '../../../shared/components'
import './ResumeView.css'

function ResumeView({ resume, onEdit, onDelete }) {
  if (!resume) {
    return (
      <div className="resume-empty">
        <p>No resume uploaded yet.</p>
      </div>
    )
  }

  const { name, email, phone, location, summary, skills, experience, education, certifications } = resume

  return (
    <div className="resume-view">
      {/* Header */}
      <div className="resume-header">
        <h2 className="resume-name">{name || 'Your Name'}</h2>
        <div className="resume-contact">
          {email && <span>{email}</span>}
          {phone && <span>{phone}</span>}
          {location && <span>{location}</span>}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <p className="resume-summary">{summary}</p>
      )}

      {/* Skills */}
      {skills && (skills.technical?.length > 0 || skills.tools?.length > 0 || skills.soft?.length > 0) && (
        <div className="resume-section">
          <h3 className="resume-section-title">Skills</h3>
          <div className="skills-grid">
            {skills.technical?.length > 0 && (
              <div className="skill-category">
                <span className="skill-category-title">Technical</span>
                <div className="skill-tags">
                  {skills.technical.map((skill, i) => (
                    <span key={i} className="skill-tag technical">{skill}</span>
                  ))}
                </div>
              </div>
            )}
            {skills.tools?.length > 0 && (
              <div className="skill-category">
                <span className="skill-category-title">Tools</span>
                <div className="skill-tags">
                  {skills.tools.map((skill, i) => (
                    <span key={i} className="skill-tag tools">{skill}</span>
                  ))}
                </div>
              </div>
            )}
            {skills.soft?.length > 0 && (
              <div className="skill-category">
                <span className="skill-category-title">Soft Skills</span>
                <div className="skill-tags">
                  {skills.soft.map((skill, i) => (
                    <span key={i} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Experience */}
      {experience?.length > 0 && (
        <div className="resume-section">
          <h3 className="resume-section-title">Experience</h3>
          <div className="experience-list">
            {experience.map((exp, i) => (
              <div key={i} className="experience-item">
                <div className="experience-header">
                  <div>
                    <h4 className="experience-title">{exp.title}</h4>
                    <p className="experience-company">{exp.company}</p>
                  </div>
                  <span className="experience-duration">{exp.duration}</span>
                </div>
                {exp.highlights?.length > 0 && (
                  <ul className="experience-highlights">
                    {exp.highlights.map((h, j) => (
                      <li key={j}>{h}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education?.length > 0 && (
        <div className="resume-section">
          <h3 className="resume-section-title">Education</h3>
          <div className="education-list">
            {education.map((edu, i) => (
              <div key={i} className="education-item">
                <div>
                  <span className="education-degree">{edu.degree}</span>
                  <span className="education-school"> - {edu.institution}</span>
                </div>
                {edu.year && <span className="education-year">{edu.year}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {certifications?.length > 0 && (
        <div className="resume-section">
          <h3 className="resume-section-title">Certifications</h3>
          <div className="cert-list">
            {certifications.map((cert, i) => (
              <span key={i} className="cert-tag">{cert}</span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="resume-actions">
        <Button variant="secondary" onClick={onEdit}>
          Update Resume
        </Button>
        <Button variant="outline" onClick={onDelete}>
          Delete
        </Button>
      </div>
    </div>
  )
}

export default ResumeView
