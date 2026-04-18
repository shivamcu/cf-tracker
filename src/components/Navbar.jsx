import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from '../styles/Navbar.module.css'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [dashboardHandle, setDashboardHandle] = useState('')

  function handleLogout() {
    logout()
    navigate('/')
  }

  function handleDashboardSearch(e) {
    e.preventDefault()
    if (dashboardHandle.trim()) {
      navigate(`/dashboard/${dashboardHandle.trim()}`)
      setDashboardHandle('')
    }
  }

  return (
    <nav className={styles.nav}>
      <Link to="/" className={styles.logo}>CF Tracker</Link>
      <div className={styles.links}>
        <Link to="/" className={styles.navLink}>Home</Link>

        {!user && (
          <form onSubmit={handleDashboardSearch} className={styles.searchForm}>
            <input
              type="text"
              placeholder="View a dashboard..."
              value={dashboardHandle}
              onChange={(e) => setDashboardHandle(e.target.value)}
              className={styles.searchInput}
            />
            <button type="submit" className={styles.searchBtn}>Go</button>
          </form>
        )}

        {user ? (
          <>
            <Link to={`/dashboard/${user.cfHandle}`} className={styles.navLink}>Dashboard</Link>
            <Link to="/problems" className={styles.navLink}>Problems</Link>
            <Link to="/roadmap" className={styles.navLink}>Roadmap</Link>
            <Link to="/profile" className={styles.navLink}>Profile</Link>
            <button onClick={handleLogout} className={styles.logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className={`${styles.navLink} ${styles.authLink}`}>Login</Link>
            <Link to="/register" className={`${styles.navLink} ${styles.authLink}`}>Register</Link>
          </>
        )}
      </div>
    </nav>
  )
}