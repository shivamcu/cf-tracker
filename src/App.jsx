import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import PrivateRoute from './components/PrivateRoute'
import Home      from './pages/Home'
import Login     from './pages/Login'
import Register  from './pages/Register'
import Dashboard from './pages/Dashboard'
import Problems  from './pages/Problems'
import Roadmap   from './pages/Roadmap'
import Profile   from './pages/Profile'
import NotFound  from './pages/NotFound'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/"                  element={<Home />} />
        <Route path="/login"             element={<Login />} />
        <Route path="/register"          element={<Register />} />
        <Route path="/dashboard/:handle" element={<Dashboard />} />
        <Route element={<PrivateRoute />}>
          <Route path="/problems" element={<Problems />} />
          <Route path="/roadmap"  element={<Roadmap />} />
          <Route path="/profile"  element={<Profile />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  )
}