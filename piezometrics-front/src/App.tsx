import { useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { InternalUsersPage } from './pages/InternalUsersPage'

function App() {
  const [activeNav, setActiveNav] = useState('Админ-панель')

  return (
    <div style={{
      display: 'flex', height: '100vh', overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      <Sidebar active={activeNav} setActive={setActiveNav} />
      <InternalUsersPage />
    </div>
  )
}

export default App
