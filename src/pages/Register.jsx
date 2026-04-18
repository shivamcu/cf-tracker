import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import styles from '../styles/Auth.module.css'

export default function Register() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [form, setForm]   = useState({ email: '', password: '', cfHandle: '' })
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const res = await axios.post('/api/auth/register', form)
      login(res.data.user, res.data.token)
      navigate('/profile')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <h2>Create account</h2>
        {error && <p className={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit} className={styles.form}>
          <input className={styles.input} type="email" placeholder="Email"
            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          <input className={styles.input} type="password" placeholder="Password"
            value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          <input className={styles.input} type="text" placeholder="Codeforces handle (e.g. tourist)"
            value={form.cfHandle} onChange={e => setForm({ ...form, cfHandle: e.target.value })} required />
          <button className={styles.button} type="submit">Register</button>
        </form>
        <p className={styles.link}>Already have an account? <Link to="/login">Log in</Link></p>
      </div>
    </main>
  )
}