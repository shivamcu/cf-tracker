import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import styles from '../styles/Problems.module.css'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Problems() {
  const { token } = useAuth()
  const [problems, setProblems] = useState([])
  const [filteredProblems, setFilteredProblems] = useState([])
  const [filter, setFilter] = useState({ tag: '', minRating: 0, maxRating: 5000 })
  const [loading, setLoading] = useState(true)
  const [tags, setTags] = useState([])
  const [bookmarks, setBookmarks] = useState(new Set())
  const [bookmarkLoading, setBookmarkLoading] = useState(false)

  // Fetch all problems
  useEffect(() => {
    async function fetchProblems() {
      setLoading(true)
      try {
        const res = await axios.get('/api/cf/problems')
        setProblems(res.data)

        // Extract unique tags
        const uniqueTags = new Set()
        res.data.forEach(p => {
          p.tags?.forEach(tag => uniqueTags.add(tag))
        })
        setTags(Array.from(uniqueTags).sort())
      } catch (err) {
        console.error('Error fetching problems:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProblems()
  }, [token])

  // Fetch user's bookmarks
  useEffect(() => {
    if (!token) return
    async function fetchBookmarks() {
      try {
        const res = await axios.get('/api/user/bookmarks', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const bookmarkIds = new Set(res.data.map(b => b.problemId))
        setBookmarks(bookmarkIds)
      } catch (err) {
        console.error('Error fetching bookmarks:', err)
      }
    }
    fetchBookmarks()
  }, [token])

  // Apply filters
  useEffect(() => {
    let result = problems

    if (filter.tag) {
      result = result.filter(p => p.tags?.includes(filter.tag))
    }

    result = result.filter(p => {
      const rating = p.rating || 0
      return rating >= filter.minRating && rating <= filter.maxRating
    })

    setFilteredProblems(result)
  }, [problems, filter])

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilter(prev => ({
      ...prev,
      [name]: name === 'tag' ? value : parseInt(value)
    }))
  }

  const handleBookmark = async (problem) => {
    if (!token) {
      alert('Please login to bookmark problems')
      return
    }

    const problemId = `${problem.contestId}-${problem.index}`
    setBookmarkLoading(true)

    try {
      if (bookmarks.has(problemId)) {
        // Remove bookmark
        setBookmarks(prev => {
          const newSet = new Set(prev)
          newSet.delete(problemId)
          return newSet
        })
      } else {
        // Add bookmark
        setBookmarks(prev => new Set(prev).add(problemId))

        await axios.post(
          '/api/user/bookmark',
          {
            problemId: problemId,
            status: 'todo',
            note: ''
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )
      }
    } catch (err) {
      console.error('Error updating bookmark:', err)
      alert('Failed to update bookmark')
    } finally {
      setBookmarkLoading(false)
    }
  }

  if (loading) return <LoadingSpinner message="Loading all problems..." />

  return (
    <main className={styles.container}>
      <h2>Problem Tracker</h2>
      <p className={styles.subtitle}>Browse and track all Codeforces problems by tag and difficulty</p>

      {/* Filter Controls */}
      <div className={styles.filterSection}>
        <div className={styles.filterGroup}>
          <label>Topic:</label>
          <select
            name="tag"
            value={filter.tag}
            onChange={handleFilterChange}
            className={styles.select}
          >
            <option value="">All Topics</option>
            {tags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label>Min Rating:</label>
          <input
            type="number"
            name="minRating"
            value={filter.minRating}
            onChange={handleFilterChange}
            className={styles.input}
            min="0"
            step="100"
          />
        </div>

        <div className={styles.filterGroup}>
          <label>Max Rating:</label>
          <input
            type="number"
            name="maxRating"
            value={filter.maxRating}
            onChange={handleFilterChange}
            className={styles.input}
            min="0"
            step="100"
          />
        </div>
      </div>

      {/* Results */}
      <div className={styles.resultsSection}>
        <p className={styles.count}>
          {filteredProblems.length} of {problems.length} problems
        </p>

        {filteredProblems.length === 0 ? (
          <p className={styles.empty}>No problems match your filters</p>
        ) : (
          <div className={styles.table}>
            <div className={styles.tableHeader}>
              <div className={styles.colBookmark}></div>
              <div className={styles.colName}>Problem</div>
              <div className={styles.colRating}>Rating</div>
              <div className={styles.colTags}>Tags</div>
            </div>
            {filteredProblems.map((problem, idx) => {
              const problemId = `${problem.contestId}-${problem.index}`
              const isBookmarked = bookmarks.has(problemId)
              return (
                <div key={idx} className={styles.tableRow}>
                  <div className={styles.colBookmark}>
                    <button
                      className={`${styles.bookmarkBtn} ${isBookmarked ? styles.bookmarked : ''}`}
                      onClick={() => handleBookmark(problem)}
                      disabled={bookmarkLoading}
                      title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
                    >
                      ★
                    </button>
                  </div>
                  <div className={styles.colName}>
                    <a
                      href={`https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.link}
                    >
                      {problem.contestId}{problem.index}. {problem.name}
                    </a>
                  </div>
                  <div className={styles.colRating}>
                    {problem.rating ? (
                      <span className={styles.rating}>{problem.rating}</span>
                    ) : (
                      <span className={styles.unrated}>N/A</span>
                    )}
                  </div>
                  <div className={styles.colTags}>
                    {problem.tags?.map(tag => (
                      <span key={tag} className={styles.tag}>{tag}</span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}