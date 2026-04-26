import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ThemeToggleButton from './ThemeToggleButton'
import styles from '../styles/Navbar.module.css'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <nav className={styles.nav}>
      <Link to="/" className={styles.logo}>CF Tracker</Link>
      
      <div className={styles.links}>
        <Link to="/">Home</Link>
        {user && (
          <>
            <Link to={`/dashboard/${user.cfHandle}`}>Dashboard</Link>
            <Link to="/problems">Problems</Link>
            <Link to="/roadmap">Roadmap</Link>
            <Link to="/profile">Profile</Link>
          </>
        )}
      </div>

      <div className={styles.actions}>
        <ThemeToggleButton />
        
        {user ? (
          <button onClick={handleLogout} className={styles.logout}>Logout</button>
        ) : (
          <div className={styles.authGroup}>
            <Link to="/login" className={styles.navLink}>Login</Link>
            <Link to="/register" className={styles.authLink}>Register</Link>
          </div>
        )}
      </div>
    </nav>
  )
}