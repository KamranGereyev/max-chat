import { LoginForm } from './components/LoginForm'
import { Messenger } from './components/Messenger'
import { useLocalStorage } from './hooks/useLocalStorage'
import type { Credentials } from './types'

export default function App() {
  const [creds, setCreds] = useLocalStorage<Credentials | null>('max-chat:credentials', null)

  if (!creds) return <LoginForm onLogin={setCreds} />

  return <Messenger key={creds.idInstance} creds={creds} onLogout={() => setCreds(null)} />
}
