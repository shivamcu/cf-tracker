import { useState } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import styles from '../styles/Profile.module.css'

export default function Profile() {
  const { user, token, login } = useAuth()
  const [cfHandle, setCfHandle] = useState(user?.cfHandle || '')
  const [saved, setSaved]       = useState(false)

  async function handleSave(e) {
    e.preventDefault()
    try {
      const res = await axios.put('/api/user/update',
        { cfHandle },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      login(res.data.user, token)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <main className={styles.container}>
      <h2>Profile</h2>
      <p className={styles.email}>{user?.email}</p>
      <form onSubmit={handleSave} className={styles.form}>
        <input className={styles.input} type="text"
          placeholder="Your Codeforces handle"
          value={cfHandle}
          onChange={e => setCfHandle(e.target.value)} />
        <button className={styles.button} type="submit">Save</button>
        {saved && <span className={styles.saved}>Saved!</span>}
      </form>
    </main>
  )
}