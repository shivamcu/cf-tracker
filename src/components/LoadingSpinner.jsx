import styles from '../styles/LoadingSpinner.module.css'

export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className={styles.spinnerContainer}>
      <div className={styles.spinner}>
        <div className={styles.spinnerRing}></div>
        <div className={styles.spinnerRing}></div>
        <div className={styles.spinnerRing}></div>
      </div>
      <p className={styles.message}>{message}</p>
    </div>
  )
}
