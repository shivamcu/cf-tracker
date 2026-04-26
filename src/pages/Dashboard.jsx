import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import styles from '../styles/Dashboard.module.css'
import ProblemsList from '../components/ProblemsList'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Dashboard() {
  const { handle } = useParams()
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [showModal, setShowModal] = useState(false)
  const [filterType, setFilterType] = useState(null)
  const [filterValue, setFilterValue] = useState(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [submissions, setSubmissions] = useState([])
  const [loadingActivity, setLoadingActivity] = useState(false)
  const [visibleCount, setVisibleCount] = useState(50)
  const [selectedRating, setSelectedRating] = useState(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError('')
      try {
        const res = await axios.get(`/api/cf/user/${handle}`)
        setStats(res.data)
      } catch (err) {
        setError('Could not load data for this handle.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [handle])

  useEffect(() => {
    async function fetchSubmissions() {
      setLoadingActivity(true)
      try {
        const res = await axios.get(`https://codeforces.com/api/user.status?handle=${handle}`)
        if (res.data.status === 'OK') {
          setSubmissions(res.data.result)
        }
      } catch (err) {
        console.error('Failed to fetch raw submissions', err)
      } finally {
        setLoadingActivity(false)
      }
    }
    if (handle) fetchSubmissions()
  }, [handle])

  const activityData = useMemo(() => {
    const subsToUse = stats?.submissions || submissions;
    if (!subsToUse || subsToUse.length === 0) return { activeDates: [], problemsByDate: {}, allSolved: [] };

    const problemsByDate = {};
    const allSolvedMap = new Map();

    subsToUse.forEach(sub => {
      if (sub.verdict !== 'OK') return;
      
      const d = new Date(sub.creationTimeSeconds * 1000);
      const isoDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const problemKey = `${sub.problem.contestId || 'gym'}-${sub.problem.index}`;

      if (!allSolvedMap.has(problemKey)) {
        allSolvedMap.set(problemKey, sub.problem);
      }

      if (!problemsByDate[isoDate]) {
        problemsByDate[isoDate] = new Map();
      }
      if (!problemsByDate[isoDate].has(problemKey)) {
        problemsByDate[isoDate].set(problemKey, sub.problem);
      }
    });

    const activeDates = Object.keys(problemsByDate).sort((a, b) => b.localeCompare(a));
    const allSolved = Array.from(allSolvedMap.values());

    return { activeDates, problemsByDate, allSolved };
  }, [stats, submissions]);

  const solvedOnDate = useMemo(() => {
    if (selectedDate === '') return activityData.allSolved;
    return activityData.problemsByDate[selectedDate]
      ? Array.from(activityData.problemsByDate[selectedDate].values())
      : [];
  }, [selectedDate, activityData]);

  const visibleProblems = selectedDate === ''
    ? solvedOnDate.slice(0, visibleCount)
    : solvedOnDate;

  const formatShortDate = (isoStr) => {
    const [y, m, day] = isoStr.split('-');
    return new Date(y, m - 1, day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
  };
  
  const formatLongDate = (isoStr) => {
    const [y, m, day] = isoStr.split('-');
    return new Date(y, m - 1, day).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();
  };

  if (loading) return <LoadingSpinner message={`Loading stats for ${handle}...`} />
  if (error)   return <p className={styles.error}>{error}</p>

  if (!stats) return null

  const getRankColor = (rank) => {
    const rankColors = {
      'legendary grandmaster': '#ff0000',
      'international grandmaster': '#ff0000',
      'grandmaster': '#ff0000',
      'master': '#ff8c00',
      'candidate master': '#aa00aa',
      'expert': '#0000ff',
      'specialist': '#03a9f4',
      'pupil': '#008000',
      'newbie': '#808080',
    }
    return rankColors[rank?.toLowerCase()] || '#808080'
  }

  const topTags = Object.entries(stats.tagCount)
    .sort((a, b) => b[1] - a[1])

  const totalProblems = Object.values(stats.ratingCount).reduce((a, b) => a + b, 0)

  const handleTagClick = (tag) => {
    setFilterType('tag')
    setFilterValue(tag)
    setShowModal(true)
  }

  const handleRatingClick = (rating) => {
    setFilterType('rating')
    setFilterValue(rating)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setFilterType(null)
    setFilterValue(null)
  }

  return (
    <main className={styles.container}>
      <div className={styles.profileHeader}>
        <div className={styles.profileLeft}>
          <img src={stats.userInfo.avatar} alt={handle} className={styles.avatar} />
          <div className={styles.profileInfo}>
            <h1 className={styles.userName}>{handle}</h1>
            <p
              className={styles.userRank}
              style={{ color: getRankColor(stats.userInfo.rank) }}
            >
              {stats.userInfo.rank}
            </p>
          </div>
        </div>
        <div className={styles.profileRight}>
          <div className={styles.ratingBox}>
            <div className={styles.ratingLabel}>Rating</div>
            <div className={styles.ratingValue}>{stats.userInfo.rating}</div>
            <div className={styles.maxRating}>Max: {stats.userInfo.maxRating}</div>
          </div>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard} style={{ cursor: 'pointer' }}>
          <div className={styles.statContent}>
            <div className={styles.statLabel}>Problems Solved</div>
            <div className={styles.statValue}>{stats.totalSolved}</div>
          </div>
        </div>
        <div className={styles.statCard} style={{ cursor: 'pointer' }}>
          <div className={styles.statContent}>
            <div className={styles.statLabel}>Unique Problems</div>
            <div className={styles.statValue}>{totalProblems}</div>
          </div>
        </div>
        <div className={styles.statCard} style={{ cursor: 'pointer' }}>
          <div className={styles.statContent}>
            <div className={styles.statLabel}>Topics Covered</div>
            <div className={styles.statValue}>{Object.keys(stats.tagCount).length}</div>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>All Topics ({Object.keys(stats.tagCount).length})</h2>
        <div className={styles.topicsList}>
          {topTags.map(([tag, count], idx) => (
            <div
              key={tag}
              className={styles.topicItem}
              onClick={() => handleTagClick(tag)}
              style={{ cursor: 'pointer' }}
            >
              <span className={styles.topicRank}>{idx + 1}</span>
              <span className={styles.topicName}>{tag}</span>
              <span className={styles.topicCount}>{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Problems by Rating</h2>
        <div className={styles.chartContainer}>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={Object.entries(stats.ratingCount)
                .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
                .map(([rating, count]) => ({
                  rating,
                  count,
                }))}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="rating"
                tick={{ fill: '#666', fontSize: 12 }}
              />
              <YAxis
                tick={{ fill: '#666', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#f8f9fa', border: '1px solid #e0e0e0', borderRadius: '6px' }}
                formatter={(value) => `${value} problems`}
                cursor={{ fill: 'rgba(102, 126, 234, 0.1)' }}
              />
              <Legend />
              <Bar 
                dataKey="count" 
                fill="#667eea" 
                radius={[8, 8, 0, 0]} 
                onClick={(data) => setSelectedRating(data.rating)}
                style={{ cursor: 'pointer' }}
              />
            </BarChart>
          </ResponsiveContainer>
          <p className={styles.chartHint}>Hover to see problem counts. Click on ratings above to filter.</p>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Top Topics Distribution</h2>
        <div className={styles.chartContainer}>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={topTags.slice(0, 8).map(([tag, count]) => ({
                  name: tag,
                  value: count,
                  tag: tag,
                }))}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                onClick={(data) => handleTagClick(data.tag)}
              >
                {topTags.slice(0, 8).map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#30b0fe', '#a8edea'][index]}
                    style={{ cursor: 'pointer' }}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value} problems`} />
            </PieChart>
          </ResponsiveContainer>
          <p className={styles.chartHint}>Click on a segment to view problems with that tag</p>
        </div>
      </div>

      <div className={styles.section}>
        <div style={{ marginBottom: '24px' }}>
          <h2 className={styles.sectionTitle} style={{ marginBottom: '8px', borderBottom: 'none', paddingBottom: 0 }}>
            Problems Solved by Date
          </h2>
          <p className={styles.sectionSubtitle}>{activityData.activeDates.length} days with solutions</p>
        </div>

        <div className={styles.dateSelectorSection}>
          <div className={styles.dateInputWrapper}>
            <label className={styles.dateLabel}>SELECT A DATE:</label>
            <input
              type="date"
              className={styles.dateInput}
              value={selectedDate}
              onChange={(e) => { setSelectedDate(e.target.value); setVisibleCount(50); }}
            />
            {loadingActivity && <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Loading CF data...</span>}
          </div>

          <div className={styles.quickDates}>
            <button
              onClick={() => { setSelectedDate(''); setVisibleCount(50); }}
              className={selectedDate === '' ? styles.datePillActive : styles.datePill}
            >
              ALL
            </button>
            {activityData.activeDates.slice(0, 6).map(date => (
              <button
                key={date}
                onClick={() => { setSelectedDate(date); setVisibleCount(50); }}
                className={selectedDate === date ? styles.datePillActive : styles.datePill}
              >
                {formatShortDate(date)}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.activityResults}>
          <h3 className={styles.resultsHeading}>
            • {solvedOnDate.length} PROBLEMS SOLVED {selectedDate === '' ? 'IN TOTAL' : `ON ${formatLongDate(selectedDate)}`}
          </h3>

          {solvedOnDate.length > 0 ? (
            <>
              <div className={styles.activityTable}>
                <div className={styles.activityTableHeader}>
                  <div>PROBLEM</div>
                  <div>TAGS</div>
                  <div className={styles.colCenter}>RATING</div>
                  <div className={styles.colCenter}>LINK</div>
                </div>
                {visibleProblems.map((problem, idx) => {
                const visibleTags = problem.tags?.slice(0, 2) || [];
                const hiddenTagsCount = (problem.tags?.length || 0) - visibleTags.length;

                return (
                  <div key={`${problem.contestId}-${problem.index}-${idx}`} className={styles.activityTableRow}>
                    <div className={styles.colName}>
                      {problem.name}
                    </div>
                    <div className={styles.activityTags}>
                      {visibleTags.map(tag => (
                        <span key={tag} className={styles.tagPill} title={tag}>{tag}</span>
                      ))}
                      {hiddenTagsCount > 0 && (
                        <span className={styles.tagPlus} title={problem.tags.slice(2).join(', ')}>+{hiddenTagsCount}</span>
                      )}
                    </div>
                    <div className={styles.colCenter}>
                      {problem.rating ? (
                        <span className={styles.rating}>{problem.rating}</span>
                      ) : (
                        <span className={styles.unrated}>—</span>
                      )}
                    </div>
                    <div className={styles.colCenter}>
                      <a
                        href={`https://codeforces.com/contest/${problem.contestId}/problem/${problem.index}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.externalLinkBtn}
                        title="Open on Codeforces"
                      >
                        ↗
                      </a>
                    </div>
                  </div>
                )
              })}
              </div>
              {selectedDate === '' && solvedOnDate.length > visibleCount && (
                <div style={{ textAlign: 'center', marginTop: '24px' }}>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px', fontWeight: 600, letterSpacing: '0.5px' }}>
                    SHOWING {Math.min(visibleCount, solvedOnDate.length)} OF {solvedOnDate.length} PROBLEMS
                  </p>
                  <button
                    onClick={() => setVisibleCount(prev => prev + 50)}
                    className={styles.datePill}
                    style={{ padding: '8px 24px' }}
                  >
                    Load More
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className={styles.emptyActivity}>No problems solved on this date.</p>
          )}
        </div>
      </div>

      {showModal && (
        <ProblemsList
          handle={handle}
          filterType={filterType}
          filterValue={filterValue}
          onClose={closeModal}
        />
      )}

      {selectedRating && (
        <div className={styles.modalOverlay} onClick={() => setSelectedRating(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Problems solved at rating {selectedRating}</h2>
              <button className={styles.closeButton} onClick={() => setSelectedRating(null)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              {stats.solvedProblems
                ?.filter(p => String(p.rating) === String(selectedRating))
                .map((problem, idx) => (
                  <div key={idx} className={styles.problemItem}>
                    <a
                      href={problem.url || `https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.problemName}
                    >
                      {problem.name}
                    </a>
                    <div className={styles.activityTags}>
                      {problem.tags?.map(tag => (
                        <span key={tag} className={styles.tagPill} title={tag}>{tag}</span>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}