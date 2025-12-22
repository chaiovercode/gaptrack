import { useState, useRef, useLayoutEffect, useMemo } from 'react'
import './FunnelView.css'

const STATUS_COLS = [
  { id: 'applied', label: 'Applied', color: '#6366f1' },
  { id: 'screening', label: 'Screening', color: '#8b5cf6' },
  { id: 'interview', label: 'Interview', color: '#f59e0b' },
  { id: 'offer', label: 'Offer', color: '#10b981' },
  { id: 'accepted', label: 'Accepted', color: '#059669' },
  { id: 'rejected', label: 'Rejected', color: '#ef4444' },
  { id: 'withdrawn', label: 'Withdrawn', color: '#6b7280' }
]

const WORK_TYPES = [
  { id: 'onsite', label: 'On-site', color: '#6366f1' },
  { id: 'hybrid', label: 'Hybrid', color: '#8b5cf6' },
  { id: 'remote', label: 'Remote', color: '#10b981' },
]

// Helper to determine link thickness
const getLinkThickness = (count, total) => {
  const min = 4
  const max = 24
  if (!total) return min
  return Math.max(min, (count / total) * max)
}

function FunnelView({ jobs = [], onEditJob }) {
  const [expandedWorkType, setExpandedWorkType] = useState(null)
  const [expandedLocation, setExpandedLocation] = useState(null)
  const [expandedStatus, setExpandedStatus] = useState(null)

  const [svgPaths, setSvgPaths] = useState([])

  // Refs for measuring
  const containerRef = useRef(null)
  const rootNodeRef = useRef(null)
  const typeRefs = useRef({})
  const locRefs = useRef({})
  const statusRefs = useRef({})

  // --- Data Processing ---

  // Helper to get work type
  const getJobWorkType = (job) => {
    const type = (job.workType || job.type || '').toLowerCase()
    const loc = (job.location || '').toLowerCase()
    if (type.includes('remote') || loc.includes('remote')) return 'remote'
    if (type.includes('hybrid') || loc.includes('hybrid')) return 'hybrid'
    return 'onsite'
  }

  // 1. Group by Work Type
  const jobsByType = useMemo(() => {
    const map = { onsite: [], hybrid: [], remote: [] }
    jobs.forEach(job => {
      const type = getJobWorkType(job)
      if (map[type]) map[type].push(job)
      else map['onsite'].push(job) // Fallback
    })
    return map
  }, [jobs])

  // 2. Get Locations for expanded Work Type
  const locationData = useMemo(() => {
    if (!expandedWorkType) return { map: {}, list: [] }
    const typeJobs = jobsByType[expandedWorkType] || []
    const map = {}
    typeJobs.forEach(job => {
      const loc = job.location || 'Unknown'
      if (!map[loc]) map[loc] = []
      map[loc].push(job)
    })
    return { map, list: Object.keys(map).sort() }
  }, [expandedWorkType, jobsByType])

  // 3. Get Statuses for expanded Location
  const statusData = useMemo(() => {
    if (!expandedLocation || !expandedWorkType) return { map: {} }
    const locJobs = locationData.map[expandedLocation] || []
    const map = {}
    STATUS_COLS.forEach(col => map[col.id] = [])
    locJobs.forEach(job => {
      if (map[job.status]) map[job.status].push(job)
      else if (map['applied']) map['applied'].push(job)
    })
    return { map }
  }, [expandedLocation, expandedWorkType, locationData])


  // --- Toggles ---
  const toggleWorkType = (typeId) => {
    if (expandedWorkType === typeId) {
      setExpandedWorkType(null)
      setExpandedLocation(null)
      setExpandedStatus(null)
    } else {
      setExpandedWorkType(typeId)
      setExpandedLocation(null)
      setExpandedStatus(null)
    }
  }

  const toggleLocation = (loc) => {
    if (expandedLocation === loc) {
      setExpandedLocation(null)
      setExpandedStatus(null)
    } else {
      setExpandedLocation(loc)
      setExpandedStatus(null)
    }
  }

  const toggleStatus = (statusId) => {
    setExpandedStatus(expandedStatus === statusId ? null : statusId)
  }


  // --- SVG Drawing (Sankey Links) ---
  useLayoutEffect(() => {
    if (!containerRef.current || !rootNodeRef.current) return

    const newPaths = []
    const containerRect = containerRef.current.getBoundingClientRect()
    const rootRect = rootNodeRef.current.getBoundingClientRect()
    const totalJobs = jobs.length

    // Helper to calc curve
    const addCurve = (startEl, endEl, color, count, totalBase, key) => {
      if (!startEl || !endEl) return
      const sRect = startEl.getBoundingClientRect()
      const eRect = endEl.getBoundingClientRect()

      const startPt = {
        x: sRect.right - containerRect.left,
        y: sRect.top + sRect.height / 2 - containerRect.top
      }
      const endPt = {
        x: eRect.left - containerRect.left,
        y: eRect.top + eRect.height / 2 - containerRect.top
      }

      const thickness = getLinkThickness(count, totalBase)
      const cp1x = startPt.x + (endPt.x - startPt.x) * 0.5
      const cp2x = endPt.x - (endPt.x - startPt.x) * 0.5

      newPaths.push({
        d: `M ${startPt.x} ${startPt.y} C ${cp1x} ${startPt.y}, ${cp2x} ${endPt.y}, ${endPt.x} ${endPt.y}`,
        stroke: color,
        strokeWidth: thickness,
        key
      })
    }

    // 1. Root -> Work Types
    WORK_TYPES.forEach(type => {
      const count = jobsByType[type.id]?.length || 0
      if (count > 0) {
        addCurve(
          rootNodeRef.current,
          typeRefs.current[type.id],
          '#cbd5e1',
          count,
          totalJobs,
          `root-${type.id}`
        )
      }
    })

    // 2. Work Type -> Locations
    if (expandedWorkType) {
      const typeEl = typeRefs.current[expandedWorkType]
      const typeTotal = jobsByType[expandedWorkType]?.length || 1

      locationData.list.forEach(loc => {
        const count = locationData.map[loc]?.length || 0
        if (count > 0) {
          addCurve(
            typeEl,
            locRefs.current[loc],
            WORK_TYPES.find(t => t.id === expandedWorkType)?.color || '#cbd5e1',
            count,
            typeTotal,
            `type-${expandedWorkType}-${loc}`
          )
        }
      })
    }

    // 3. Location -> Statuses
    if (expandedLocation && expandedWorkType) {
      const locEl = locRefs.current[expandedLocation]
      const locTotal = locationData.map[expandedLocation]?.length || 1

      STATUS_COLS.forEach(col => {
        const count = statusData.map[col.id]?.length || 0
        if (count > 0) {
          addCurve(
            locEl,
            statusRefs.current[col.id],
            col.color,
            count,
            locTotal,
            `loc-${expandedLocation}-${col.id}`
          )
        }
      })
    }

    setSvgPaths(newPaths)
  }, [expandedWorkType, expandedLocation, expandedStatus, jobs, jobsByType, locationData, statusData])


  return (
    <div className="sankey-view" ref={containerRef}>
      <svg className="sankey-svg-layer">
        {svgPaths.map(p => (
          <path
            key={p.key}
            d={p.d}
            stroke={p.stroke}
            strokeWidth={p.strokeWidth}
            className="sankey-path"
          />
        ))}
      </svg>

      {/* 1. Root Column */}
      <div className="sankey-column">
        <div className="sankey-node root-node" ref={rootNodeRef}>
          <span className="node-count">{jobs.length}</span>
          <span className="node-label">All Jobs</span>
        </div>
      </div>

      {/* 2. Work Type Column */}
      <div className="sankey-column">
        {WORK_TYPES.map(type => {
          const count = jobsByType[type.id]?.length || 0
          if (count === 0) return null

          const isExpanded = expandedWorkType === type.id

          return (
            <div key={type.id} className="sankey-branch-group">
              <button
                ref={el => typeRefs.current[type.id] = el}
                className={`sankey-node type-node ${isExpanded ? 'expanded' : ''}`}
                onClick={() => toggleWorkType(type.id)}
                style={{ '--node-color': type.color }}
              >
                <span className="node-dot" style={{ background: type.color }} />
                <span className="node-label">{type.label}</span>
                <span className="node-count-badge">{count}</span>
              </button>

              {/* 3. Location Column (Only for expanded Work Type) */}
              {isExpanded && (
                <div className="sankey-sub-branch">
                  {locationData.list.map(loc => {
                    const locCount = locationData.map[loc]?.length || 0
                    const isLocExpanded = expandedLocation === loc

                    return (
                      <div key={loc} className="sankey-leaf-group">
                        <button
                          ref={el => locRefs.current[loc] = el}
                          className={`sankey-node location-node ${isLocExpanded ? 'expanded' : ''}`}
                          onClick={() => toggleLocation(loc)}
                        >
                          <span className="node-label">{loc}</span>
                          <span className="node-count-badge">{locCount}</span>
                        </button>

                        {/* 4. Status Column (Only for expanded Location) */}
                        {isLocExpanded && (
                          <div className="sankey-sub-branch status-column">
                            {STATUS_COLS.map(col => {
                              const statusJobs = statusData.map[col.id] || []
                              if (statusJobs.length === 0) return null
                              const isStatusExpanded = expandedStatus === col.id

                              return (
                                <div key={col.id} className="sankey-leaf-group">
                                  <button
                                    ref={el => statusRefs.current[col.id] = el}
                                    className={`sankey-node status-node ${isStatusExpanded ? 'expanded' : ''}`}
                                    onClick={() => toggleStatus(col.id)}
                                    style={{ '--node-color': col.color }}
                                  >
                                    <span className="node-dot" style={{ background: col.color }} />
                                    <span className="node-label">{col.label}</span>
                                    <span className="node-count-badge">{statusJobs.length}</span>
                                  </button>

                                  {/* 5. Job Cards */}
                                  {isStatusExpanded && (
                                    <div className="sankey-jobs-list">
                                      {statusJobs.map(job => (
                                        <div key={job.id} className="sankey-job-card" onClick={() => onEditJob(job)}>
                                          <div className="job-role">{job.role}</div>
                                          <div className="job-company">{job.company}</div>
                                          {job.gapAnalysis?.matchScore && (
                                            <div className="job-score" style={{
                                              color: job.gapAnalysis.matchScore >= 70 ? '#10b981' : '#f59e0b'
                                            }}>
                                              {job.gapAnalysis.matchScore}%
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default FunnelView
