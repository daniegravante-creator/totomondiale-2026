import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ParticipantProvider } from './context/ParticipantContext'
import Layout       from './components/Layout'
import Login        from './pages/Login'
import Schedina     from './pages/Schedina'
import MySchedulina from './pages/MySchedulina'
import Classifica   from './pages/Classifica'
import Admin        from './pages/Admin'

export default function App() {
  return (
    <BrowserRouter>
      <ParticipantProvider>
        <Layout>
          <Routes>
            <Route path="/"              element={<Login />} />
            <Route path="/schedina"      element={<Schedina />} />
            <Route path="/mia-schedina"  element={<MySchedulina />} />
            <Route path="/classifica"    element={<Classifica />} />
            <Route path="/admin"         element={<Admin />} />
            <Route path="*"              element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </ParticipantProvider>
    </BrowserRouter>
  )
}
