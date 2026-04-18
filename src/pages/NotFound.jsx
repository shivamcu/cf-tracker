import { Link } from 'react-router-dom'
import styles from '../styles/NotFound.module.css'

export default function NotFound() {
  return (
    <main className={styles.container}>
      <div className={styles.content}>
        <div className={styles.errorCode}>404</div>
        <h1 className={styles.title}>Page Not Found</h1>
        <p className={styles.description}>
          Sorry, we couldn't find the page you're looking for. The route might be incorrect or the page has been moved.
        </p>

        <div className={styles.suggestions}>
          <h3>Quick Links:</h3>
          <ul>
            <li><Link to="/">Go to Home</Link></li>
            <li><Link to="/problems">Browse Problems</Link></li>
            <li><Link to="/roadmap">View Roadmap</Link></li>
          </ul>
        </div>

        <div className={styles.illustration}>🛸</div>
      </div>
    </main>
  )
}
