import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from '../styles/Home.module.css'

export default function Home() {
  const [handle, setHandle] = useState('')
  const navigate = useNavigate()

  function handleSearch(e) {
    e.preventDefault()
    if (handle.trim()) navigate(`/dashboard/${handle.trim()}`)
  }

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>CF Tracker</h1>
      <p className={styles.subtitle}>Visualise your Codeforces progress by topic</p>
      <form onSubmit={handleSearch} className={styles.form}>
        <input
          className={styles.input}
          type="text"
          placeholder="Enter Codeforces handle..."
          value={handle}
          onChange={e => setHandle(e.target.value)}
        />
        <button className={styles.button} type="submit">Search</button>
      </form>
    </main>
  )
}