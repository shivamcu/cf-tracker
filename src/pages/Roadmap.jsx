import { useState } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import styles from '../styles/Roadmap.module.css'
import LoadingSpinner from '../components/LoadingSpinner'

const TOPICS = ['dp', 'graphs', 'greedy', 'binary search', 'trees', 'math', 'strings', 'implementation']

export default function Roadmap() {
  const { token, user } = useAuth()
  const [topic, setTopic]       = useState('')
  const [roadmap, setRoadmap]   = useState([])
  const [loading, setLoading]   = useState(false)
  const [currentTopic, setCurrentTopic] = useState('')

  async function generateRoadmap() {
    if (!topic) return
    setLoading(true)
    setCurrentTopic(topic)
    try {
      // Include user's handle if available to exclude solved problems
      const url = user?.cfHandle
        ? `/api/cf/roadmap?topic=${topic}&handle=${user.cfHandle}`
        : `/api/cf/roadmap?topic=${topic}`

      const res = await axios.get(url)
      setRoadmap(res.data.roadmap || [])
    } catch (err) {
      console.error('Error fetching roadmap:', err)
      setRoadmap([])
    } finally {
      setLoading(false)
    }
  }

  const getTagColor = (tag) => {
    const colors = {
      dp: '#667eea',
      greedy: '#764ba2',
      math: '#f093fb',
      implementation: '#4facfe',
      constructive: '#43e97b',
      strings: '#fa709a',
      graphs: '#30b0fe',
      sortings: '#a8edea',
      brute: '#fed6e3',
      bitmasks: '#ff9a56',
      number: '#feca57',
      'binary search': '#fa8072',
      trees: '#20b2aa',
    }
    return colors[tag?.toLowerCase()] || '#e0e0e0'
  }

  return (
    <main className={styles.container}>
      <h2>Custom Learning Roadmap</h2>
      <p className={styles.subtitle}>Generate a structured path to master any topic</p>

      <div className={styles.controls}>
        <select
          className={styles.select}
          value={topic}
          onChange={e => setTopic(e.target.value)}>
          <option value="">Select a topic...</option>
          {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <button
          className={styles.button}
          onClick={generateRoadmap}
          disabled={!topic || loading}
        >
          {loading ? 'Generating...' : 'Generate'}
        </button>
      </div>

      {/* Roadmap Results */}
      {loading && (
        <LoadingSpinner message={`Generating ${topic} roadmap...`} />
      )}

      {!loading && roadmap.length > 0 && (
        <div className={styles.resultsSection}>
          <div className={styles.header}>
            <h3 className={styles.title}>{currentTopic} Learning Roadmap</h3>
            <p className={styles.count}>{roadmap.length} problems in sequence</p>
          </div>

          <div className={styles.roadmapGrid}>
            {roadmap.map((problem, idx) => (
              <div key={idx} className={styles.problemCard}>
                <div className={styles.stepNumber}>Step {idx + 1}</div>
                <a
                  href={problem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.problemTitle}
                >
                  {problem.contestId}{problem.index}. {problem.name}
                </a>
                <div className={styles.problemMeta}>
                  {problem.rating ? (
                    <span className={styles.rating}>{problem.rating}</span>
                  ) : (
                    <span className={styles.unrated}>N/A</span>
                  )}
                </div>
                <div className={styles.tags}>
                  {problem.tags?.map(tag => (
                    <span
                      key={tag}
                      className={styles.tag}
                      style={{ backgroundColor: getTagColor(tag) }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}