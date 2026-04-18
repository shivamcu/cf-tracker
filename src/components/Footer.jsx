import styles from '../styles/Footer.module.css'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={styles.content}>
        <div className={styles.section}>
          <h3>About CF Tracker</h3>
          <p>Track your Codeforces progress, analyze your problem-solving patterns, and improve your competitive programming skills.</p>
        </div>
        <div className={styles.section}>
          <h3>Resources</h3>
          <ul>
            <li><a href="https://codeforces.com" target="_blank" rel="noopener noreferrer">Codeforces</a></li>
            <li><a href="https://codeforces.com/api/help" target="_blank" rel="noopener noreferrer">API Docs</a></li>
            <li><a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a></li>
          </ul>
        </div>
        <div className={styles.section}>
          <h3>Contact</h3>
          <p>Email: support@cftracker.dev</p>
          <p>© {currentYear} CF Tracker. All rights reserved.</p>
        </div>
      </div>
      <div className={styles.bottom}>
        <p>Made with ❤️ for Competitive Programmers</p>
      </div>
    </footer>
  )
}
