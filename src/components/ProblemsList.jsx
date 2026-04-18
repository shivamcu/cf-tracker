import { useState, useEffect } from 'react'
import axios from 'axios'
import styles from '../styles/ProblemsList.module.css'

export default function ProblemsList({ handle, filterType, filterValue, onClose }) {
  const [problems, setProblems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchProblems() {
      setLoading(true)
      setError('')
      try {
        let endpoint = ''
        if (filterType === 'tag') {
          endpoint = `/api/cf/user/${handle}/problems-by-tag/${filterValue}`
        } else if (filterType === 'rating') {
          endpoint = `/api/cf/user/${handle}/problems-by-rating/${filterValue}`
        }

        console.log('Fetching from:', endpoint)
        const res = await axios.get(endpoint)
        console.log('Response data:', res.data)

        if (res.data && res.data.problems) {
          setProblems(res.data.problems)
        } else {
          setError('Invalid response format from server')
        }
      } catch (err) {
        console.error('Error fetching problems:', err)
        setError(err.response?.data?.message || err.message || 'Could not load problems')
      } finally {
        setLoading(false)
      }
    }

    if (filterValue) fetchProblems()
  }, [handle, filterType, filterValue])

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
    }
    return colors[tag?.toLowerCase()] || '#e0e0e0'
  }

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {filterType === 'tag' ? `${filterValue} Problems` : `Rating ${filterValue} Problems`}
          </h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {loading ? (
          <div className={styles.loadingOverlay}>
            <div className={styles.spinner}>
              <div className={styles.spinnerRing}></div>
              <div className={styles.spinnerRing}></div>
              <div className={styles.spinnerRing}></div>
            </div>
            <p>Loading problems...</p>
          </div>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : problems.length === 0 ? (
          <p className={styles.empty}>No problems found</p>
        ) : (
          <div className={styles.problemsContainer}>
            <div className={styles.problemsCount}>Total: {problems.length} problems</div>
            {problems.map((problem, idx) => (
              <div key={idx} className={styles.problemItem}>
                <div className={styles.problemInfo}>
                  <a
                    href={problem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.problemName}
                  >
                    {problem.name}
                  </a>
                  {problem.rating && (
                    <span className={styles.rating}>{problem.rating}</span>
                  )}
                </div>
                <div className={styles.tags}>
                  {problem.tags && problem.tags.map((tag, i) => (
                    <span
                      key={i}
                      className={`${styles.tag} ${filterType === 'tag' && tag === filterValue ? styles.tagHighlighted : ''}`}
                      style={{ backgroundColor: getTagColor(tag) }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
