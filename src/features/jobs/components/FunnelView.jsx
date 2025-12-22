import { useState, useRef, useLayoutEffect, useMemo, useEffect, forwardRef, useImperativeHandle } from 'react'
import html2canvas from 'html2canvas'
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

const FunnelView = forwardRef(function FunnelView({ jobs = [], onEditJob }, ref) {
  // Use Sets to allow multiple expanded items at each level
  const [expandedWorkTypes, setExpandedWorkTypes] = useState(new Set())
  const [expandedLocations, setExpandedLocations] = useState(new Set())
  const [expandedStatuses, setExpandedStatuses] = useState(new Set())

  const [svgPaths, setSvgPaths] = useState([])

  // Refs for measuring
  const containerRef = useRef(null)
  const rootNodeRef = useRef(null)
  const typeRefs = useRef({})
  const locRefs = useRef({})
  const statusRefs = useRef({})
  const jobListRefs = useRef({})

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

  // 2. Get Locations for each work type
  const getLocationsForType = (typeId) => {
    const typeJobs = jobsByType[typeId] || []
    const map = {}
    typeJobs.forEach(job => {
      const loc = job.location || 'Unknown'
      if (!map[loc]) map[loc] = []
      map[loc].push(job)
    })
    return { map, list: Object.keys(map).sort() }
  }

  // 3. Get Statuses for a location within a work type
  const getStatusesForLocation = (typeId, loc) => {
    const locData = getLocationsForType(typeId)
    const locJobs = locData.map[loc] || []
    const map = {}
    STATUS_COLS.forEach(col => map[col.id] = [])
    locJobs.forEach(job => {
      if (map[job.status]) map[job.status].push(job)
      else if (map['applied']) map['applied'].push(job)
    })
    return { map }
  }


  // --- Toggles (now toggle individual items without closing others) ---

  // Collapse all when clicking "All Jobs"
  const collapseAll = () => {
    setExpandedWorkTypes(new Set())
    setExpandedLocations(new Set())
    setExpandedStatuses(new Set())
  }

  // Check if anything is expanded
  const hasAnyExpanded = expandedWorkTypes.size > 0 || expandedLocations.size > 0 || expandedStatuses.size > 0

  const toggleWorkType = (typeId) => {
    setExpandedWorkTypes(prev => {
      const next = new Set(prev)
      if (next.has(typeId)) {
        next.delete(typeId)
      } else {
        next.add(typeId)
      }
      return next
    })
  }

  const toggleLocation = (typeId, loc) => {
    const key = `${typeId}:${loc}`
    setExpandedLocations(prev => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  const toggleStatus = (typeId, loc, statusId) => {
    const key = `${typeId}:${loc}:${statusId}`
    setExpandedStatuses(prev => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  // --- Expose downloadPNG to parent via ref ---
  const [isExporting, setIsExporting] = useState(false)

  const downloadPNG = async () => {
    if (!containerRef.current) return

    // Save current state
    const prevWorkTypes = new Set(expandedWorkTypes)
    const prevLocations = new Set(expandedLocations)
    const prevStatuses = new Set(expandedStatuses)

    // Expand everything for the screenshot
    const newWorkTypes = new Set()
    const newLocations = new Set()
    const newStatuses = new Set()

    WORK_TYPES.forEach(type => {
      if ((jobsByType[type.id]?.length || 0) > 0) {
        newWorkTypes.add(type.id)
        const locData = getLocationsForType(type.id)
        locData.list.forEach(loc => {
          const locKey = `${type.id}:${loc}`
          newLocations.add(locKey)
          const statData = getStatusesForLocation(type.id, loc)
          STATUS_COLS.forEach(col => {
            if ((statData.map[col.id]?.length || 0) > 0) {
              newStatuses.add(`${locKey}:${col.id}`)
            }
          })
        })
      }
    })

    // Set exporting state (hides button) and expand all
    setIsExporting(true)
    setExpandedWorkTypes(newWorkTypes)
    setExpandedLocations(newLocations)
    setExpandedStatuses(newStatuses)

    // Wait for DOM to update
    await new Promise(resolve => setTimeout(resolve, 200))

    try {
      // Get full content dimensions
      const fullWidth = containerRef.current.scrollWidth
      const fullHeight = containerRef.current.scrollHeight

      // Temporarily expand container to show all content
      const originalOverflow = containerRef.current.style.overflow
      const originalWidth = containerRef.current.style.width
      const originalHeight = containerRef.current.style.height
      containerRef.current.style.overflow = 'visible'
      containerRef.current.style.width = `${fullWidth}px`
      containerRef.current.style.height = `${fullHeight}px`

      // Get computed styles and apply them inline (fixes CSS variable issues in html2canvas)
      const computedStyle = getComputedStyle(document.documentElement)
      const textColor = computedStyle.getPropertyValue('--color-text').trim() || '#1a1a1a'
      const textMuted = computedStyle.getPropertyValue('--color-text-muted').trim() || '#6b7280'
      const bgColor = computedStyle.getPropertyValue('--color-bg').trim() || '#faf9f6'
      const surfaceColor = computedStyle.getPropertyValue('--color-surface').trim() || '#ffffff'

      // Add a style tag with resolved CSS variables
      const styleTag = document.createElement('style')
      styleTag.id = 'export-styles'
      styleTag.textContent = `
        .sankey-view * { color: ${textColor} !important; }
        .sankey-view .node-label { color: ${textColor} !important; }
        .sankey-view .job-role { color: ${textColor} !important; }
        .sankey-view .job-company { color: ${textMuted} !important; }
        .sankey-view .node-count-badge { color: ${textMuted} !important; }
        .sankey-view .root-node, .sankey-view .root-node * { color: white !important; }
      `
      document.head.appendChild(styleTag)

      // Wait for layout to settle
      await new Promise(resolve => setTimeout(resolve, 100))

      const canvas = await html2canvas(containerRef.current, {
        backgroundColor: bgColor,
        scale: 2,
        useCORS: true,
        logging: false,
        width: fullWidth,
        height: fullHeight,
        scrollX: 0,
        scrollY: 0,
        windowWidth: fullWidth,
        windowHeight: fullHeight
      })

      // Remove temporary style tag
      styleTag.remove()

      // Restore original styles
      containerRef.current.style.overflow = originalOverflow
      containerRef.current.style.width = originalWidth
      containerRef.current.style.height = originalHeight

      const link = document.createElement('a')
      link.download = `gaptrack-funnel-${new Date().toISOString().split('T')[0]}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (err) {
      console.error('Failed to export PNG:', err)
      alert('Failed to export image')
    }

    // Restore previous state
    setIsExporting(false)
    setExpandedWorkTypes(prevWorkTypes)
    setExpandedLocations(prevLocations)
    setExpandedStatuses(prevStatuses)
  }

  useImperativeHandle(ref, () => ({
    downloadPNG
  }))

  // --- Expand All / Collapse All Toggle ---
  const isAllExpanded = expandedWorkTypes.size > 0 || expandedLocations.size > 0 || expandedStatuses.size > 0

  const toggleExpandAll = () => {
    if (isAllExpanded) {
      // Collapse all
      setExpandedWorkTypes(new Set())
      setExpandedLocations(new Set())
      setExpandedStatuses(new Set())
    } else {
      // Expand all work types, locations, and statuses
      const newWorkTypes = new Set()
      const newLocations = new Set()
      const newStatuses = new Set()

      WORK_TYPES.forEach(type => {
        if ((jobsByType[type.id]?.length || 0) > 0) {
          newWorkTypes.add(type.id)
          const locData = getLocationsForType(type.id)
          locData.list.forEach(loc => {
            const locKey = `${type.id}:${loc}`
            newLocations.add(locKey)
            const statData = getStatusesForLocation(type.id, loc)
            STATUS_COLS.forEach(col => {
              if ((statData.map[col.id]?.length || 0) > 0) {
                newStatuses.add(`${locKey}:${col.id}`)
              }
            })
          })
        }
      })

      setExpandedWorkTypes(newWorkTypes)
      setExpandedLocations(newLocations)
      setExpandedStatuses(newStatuses)
    }
  }


  // --- SVG Drawing (Sankey Links) ---
  useLayoutEffect(() => {
    const drawPaths = () => {
      if (!containerRef.current || !rootNodeRef.current) return

      const newPaths = []
      const containerRect = containerRef.current.getBoundingClientRect()
      const totalJobs = jobs.length

      // Helper to calc curve
      const addCurve = (startEl, endEl, color, count, totalBase, key) => {
        if (!startEl || !endEl) return
        const sRect = startEl.getBoundingClientRect()
        const eRect = endEl.getBoundingClientRect()

        // Account for container scroll position
        const scrollLeft = containerRef.current.scrollLeft
        const scrollTop = containerRef.current.scrollTop

        const startPt = {
          x: sRect.right - containerRect.left + scrollLeft,
          y: sRect.top + sRect.height / 2 - containerRect.top + scrollTop
        }
        const endPt = {
          x: eRect.left - containerRect.left + scrollLeft,
          y: eRect.top + eRect.height / 2 - containerRect.top + scrollTop
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

      // 2. Work Type -> Locations (for each expanded work type)
      expandedWorkTypes.forEach(typeId => {
        const typeEl = typeRefs.current[typeId]
        const typeTotal = jobsByType[typeId]?.length || 1
        const locData = getLocationsForType(typeId)

        locData.list.forEach(loc => {
          const count = locData.map[loc]?.length || 0
          if (count > 0) {
            addCurve(
              typeEl,
              locRefs.current[`${typeId}:${loc}`],
              WORK_TYPES.find(t => t.id === typeId)?.color || '#cbd5e1',
              count,
              typeTotal,
              `type-${typeId}-${loc}`
            )
          }
        })
      })

      // 3. Location -> Statuses (for each expanded location)
      expandedLocations.forEach(locKey => {
        const parts = locKey.split(':')
        const typeId = parts[0]
        const loc = parts.slice(1).join(':') // Handle locations with colons
        const locEl = locRefs.current[locKey]
        const locData = getLocationsForType(typeId)
        const locTotal = locData.map[loc]?.length || 1
        const statData = getStatusesForLocation(typeId, loc)

        STATUS_COLS.forEach(col => {
          const count = statData.map[col.id]?.length || 0
          if (count > 0) {
            addCurve(
              locEl,
              statusRefs.current[`${locKey}:${col.id}`],
              col.color,
              count,
              locTotal,
              `loc-${locKey}-${col.id}`
            )
          }
        })
      })

      // 4. Status -> Job List (for each expanded status)
      expandedStatuses.forEach(statusKey => {
        const statusEl = statusRefs.current[statusKey]
        const jobListEl = jobListRefs.current[statusKey]
        if (statusEl && jobListEl) {
          // Get the status color from the key
          const statusId = statusKey.split(':').pop()
          const statusCol = STATUS_COLS.find(c => c.id === statusId)
          addCurve(
            statusEl,
            jobListEl,
            statusCol?.color || '#cbd5e1',
            1,
            1,
            `status-${statusKey}-jobs`
          )
        }
      })

      setSvgPaths(newPaths)
    }

    // Use setTimeout to ensure DOM has fully settled after layout changes
    const timerId = setTimeout(drawPaths, 50)

    // Redraw on scroll since paths are relative to scroll position
    const container = containerRef.current
    const handleScroll = () => drawPaths()
    container?.addEventListener('scroll', handleScroll)

    return () => {
      clearTimeout(timerId)
      container?.removeEventListener('scroll', handleScroll)
    }
  }, [expandedWorkTypes, expandedLocations, expandedStatuses, jobs, jobsByType])


  return (
    <div className="sankey-wrapper">
      {/* Expand/Collapse Toggle - outside scrollable area */}
      {!isExporting && (
        <button
          className="sankey-expand-btn"
          onClick={toggleExpandAll}
          title={isAllExpanded ? 'Collapse All' : 'Expand All'}
        >
          {isAllExpanded ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="4 14 10 14 10 20" />
              <polyline points="20 10 14 10 14 4" />
              <line x1="14" y1="10" x2="21" y2="3" />
              <line x1="3" y1="21" x2="10" y2="14" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 3 21 3 21 9" />
              <polyline points="9 21 3 21 3 15" />
              <line x1="21" y1="3" x2="14" y2="10" />
              <line x1="3" y1="21" x2="10" y2="14" />
            </svg>
          )}
          {isAllExpanded ? 'Collapse' : 'Expand'}
        </button>
      )}

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
        <button
          className={`sankey-node root-node ${hasAnyExpanded ? 'has-expanded' : ''}`}
          ref={rootNodeRef}
          onClick={collapseAll}
          title={hasAnyExpanded ? 'Click to collapse all' : 'All jobs'}
        >
          <span className="node-count">{jobs.length}</span>
          <span className="node-label">All Jobs</span>
        </button>
      </div>

      {/* 2. Work Type Column */}
      <div className="sankey-column">
        {WORK_TYPES.map(type => {
          const count = jobsByType[type.id]?.length || 0
          if (count === 0) return null

          const isExpanded = expandedWorkTypes.has(type.id)
          const locationData = getLocationsForType(type.id)

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
                    const locKey = `${type.id}:${loc}`
                    const locCount = locationData.map[loc]?.length || 0
                    const isLocExpanded = expandedLocations.has(locKey)
                    const statusData = getStatusesForLocation(type.id, loc)

                    return (
                      <div key={loc} className="sankey-leaf-group">
                        <button
                          ref={el => locRefs.current[locKey] = el}
                          className={`sankey-node location-node ${isLocExpanded ? 'expanded' : ''}`}
                          onClick={() => toggleLocation(type.id, loc)}
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
                              const statusKey = `${locKey}:${col.id}`
                              const isStatusExpanded = expandedStatuses.has(statusKey)

                              return (
                                <div key={col.id} className="sankey-leaf-group">
                                  <button
                                    ref={el => statusRefs.current[statusKey] = el}
                                    className={`sankey-node status-node ${isStatusExpanded ? 'expanded' : ''}`}
                                    onClick={() => toggleStatus(type.id, loc, col.id)}
                                    style={{ '--node-color': col.color }}
                                  >
                                    <span className="node-dot" style={{ background: col.color }} />
                                    <span className="node-label">{col.label}</span>
                                    <span className="node-count-badge">{statusJobs.length}</span>
                                  </button>

                                  {/* 5. Job Cards */}
                                  {isStatusExpanded && (
                                    <div
                                      className="sankey-jobs-list"
                                      ref={el => jobListRefs.current[statusKey] = el}
                                    >
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
    </div>
  )
})

export default FunnelView
