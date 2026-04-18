import { useEffect, useState } from 'react'
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
      {/* Profile Header */}
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

      {/* Statistics Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard} style={{ cursor: 'pointer' }}>
          <div className={styles.statIcon}>✓</div>
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
          <div className={styles.statIcon}>🏷️</div>
          <div className={styles.statContent}>
            <div className={styles.statLabel}>Topics Covered</div>
            <div className={styles.statValue}>{Object.keys(stats.tagCount).length}</div>
          </div>
        </div>
      </div>

      {/* Top Topics */}
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

      {/* Rating Distribution */}
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
              <Bar dataKey="count" fill="#667eea" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className={styles.chartHint}>Hover to see problem counts. Click on ratings above to filter.</p>
        </div>
      </div>

      {/* Top Topics Distribution */}
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

      {/* Problems Modal */}
      {showModal && (
        <ProblemsList
          handle={handle}
          filterType={filterType}
          filterValue={filterValue}
          onClose={closeModal}
        />
      )}
    </main>
  )
}