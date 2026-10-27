import { useCallback, useEffect, useState } from 'react'
import type { AppData, CalendarEvent } from './types'
import { loadAppData, saveAppData } from './storage'
import Dashboard from './components/Dashboard'
import QuestionBank from './components/QuestionBank'
import AcademicCalendar from './components/AcademicCalendar'
import Disciplines from './components/Disciplines'
import Backup from './components/Backup'
import { Button, Icon, type IconName } from './components/UI'

type View = 'dashboard' | 'questions' | 'calendar' | 'disciplines' | 'backup'
const NAV: { id: View; label: string; icon: IconName; section: 'main' | 'manage' }[] = [
  { id: 'dashboard', label: 'Visão geral', icon: 'home', section: 'main' },
  { id: 'questions', label: 'Banco de questões', icon: 'book-open', section: 'manage' },
  { id: 'calendar', label: 'Calendário acadêmico', icon: 'calendar', section: 'manage' },
  { id: 'disciplines', label: 'Minhas disciplinas', icon: 'layers', section: 'manage' },
  { id: 'backup', label: 'Backup e preferências', icon: 'archive', section: 'manage' },
]
const VIEW_TITLES: Record<View, string> = {
  dashboard: 'Visão geral', questions: 'Banco de questões', calendar: 'Calendário acadêmico', disciplines: 'Minhas disciplinas', backup: 'Backup e preferências',
}

export default function App() {
  const [view, setView] = useState<View>('dashboard')
  const [data, setData] = useState<AppData>(() => loadAppData())
  const [toast, setToast] = useState('')
  const [eventToEdit, setEventToEdit] = useState<CalendarEvent | null>(null)
  const [storageError, setStorageError] = useState('')

  useEffect(() => {
    try {
      saveAppData(data)
      setStorageError('')
    } catch {
      setStorageError('O navegador não conseguiu salvar as últimas alterações. Verifique o espaço disponível ou exporte seus dados.')
    }
  }, [data])

  const updateData = useCallback((updater: (current: AppData) => AppData) => setData(current => updater(current)), [])
  const notify = useCallback((message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(current => current === message ? '' : current), 3200)
  }, [])
  const clearEventToEdit = useCallback(() => setEventToEdit(null), [])
  const navigateToEvent = useCallback((event: CalendarEvent) => {
    setEventToEdit(event)
    setView('calendar')
  }, [])

  useEffect(() => {
    const dismiss = () => updateData(old => ({ ...old, welcomeDismissed: true }))
    window.addEventListener('tdahmed:dismiss-welcome', dismiss)
    return () => window.removeEventListener('tdahmed:dismiss-welcome', dismiss)
  }, [updateData])

  const activeNav = NAV.find(n => n.id === view)
  const avatarLetter = data.profileName.trim().charAt(0).toLocaleUpperCase('pt-BR') || 'M'

  const renderPage = () => {
    if (view === 'dashboard') return <Dashboard data={data} onNavigate={setView} onEventClick={navigateToEvent}/>
    if (view === 'questions') return <QuestionBank data={data} updateData={updateData}/>
    if (view === 'calendar') return <AcademicCalendar data={data} updateData={updateData} initialEditEvent={eventToEdit} onInitialEditHandled={clearEventToEdit}/>
    if (view === 'disciplines') return <Disciplines data={data} updateData={updateData} notify={notify}/>
    return <Backup data={data} updateData={updateData} replaceData={setData} notify={notify}/>
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <button className="brand-lockup" onClick={() => setView('dashboard')} aria-label="TDAHMED, voltar ao início"><span className="brand-symbol"><span>t</span><i/></span><span className="brand-text"><strong>TDAHMED</strong><small>ACADEMIC STUDIO</small></span></button>
      <div className="sidebar-profile"><div className="profile-avatar">{avatarLetter}</div><div className="profile-label"><strong>{data.profileName.trim() || 'Meu espaço'}</strong><small>Estudante de Medicina</small></div><span className="profile-menu-dot">···</span></div>
      <nav className="sidebar-nav" aria-label="Navegação principal">
        <p className="nav-section-label">SEU ESPAÇO</p>
        {NAV.filter(n => n.section === 'main').map(n => <button key={n.id} className={`nav-item ${view === n.id ? 'active' : ''}`} onClick={() => setView(n.id)} aria-current={view === n.id ? 'page' : undefined}><span className="nav-icon"><Icon name={n.icon} size={19}/></span><span>{n.label}</span>{view === n.id && <span className="nav-active-mark"/>}</button>)}
        <p className="nav-section-label nav-section-manage">FERRAMENTAS ACADÊMICAS</p>
        {NAV.filter(n => n.section === 'manage').map(n => <button key={n.id} className={`nav-item ${view === n.id ? 'active' : ''}`} onClick={() => setView(n.id)} aria-current={view === n.id ? 'page' : undefined}><span className="nav-icon"><Icon name={n.icon} size={19}/></span><span>{n.label}</span>{n.id === 'questions' && data.mistakeIds.length > 0 && <span className="nav-count">{data.mistakeIds.length}</span>}{view === n.id && <span className="nav-active-mark"/>}</button>)}
      </nav>
      <div className="sidebar-bottom"><div className="semester-card"><div className="semester-card-icon"><Icon name="sparkles" size={17}/></div><strong>Seu semestre, no seu ritmo.</strong><p>Um lugar para organizar a jornada, uma etapa de cada vez.</p><button onClick={() => setView('disciplines')}>Organizar meus estudos <Icon name="arrow" size={13}/></button><div className="semester-art"><span/><span/><span/></div></div><div className="storage-status"><span className={`storage-dot ${storageError ? 'storage-dot-error' : ''}`}/><span>{storageError ? 'Falha ao salvar' : 'Salvo neste navegador'}</span><button title="Informações sobre armazenamento" onClick={() => setView('backup')}><Icon name="alert" size={14}/></button></div></div>
    </aside>

    <main className="main-panel">
      <header className="topbar"><div className="mobile-brand"><span className="brand-symbol"><span>t</span><i/></span><strong>TDAHMED</strong></div><div className="breadcrumb"><span>Meu espaço</span><Icon name="chevron" size={14}/><strong>{VIEW_TITLES[view]}</strong></div><div className="topbar-actions"><span className="local-pill"><i/> Seus dados ficam no aparelho</span><button className="topbar-avatar" onClick={() => setView('backup')} aria-label="Abrir preferências">{avatarLetter}</button></div></header>
      {storageError && <div className="storage-error-banner" role="alert"><Icon name="alert" size={16}/><span>{storageError}</span><button onClick={() => setView('backup')}>Backup e preferências</button></div>}
      <div className="page-content">{renderPage()}</div>
      <footer className="app-footer"><span>© TDAHMED · Academic Studio</span><span>Feito para acompanhar sua jornada em Medicina <b>✦</b></span></footer>
    </main>

    <nav className="mobile-nav" aria-label="Navegação móvel">{NAV.filter(n => n.id !== 'backup').map(n => <button key={n.id} className={view === n.id ? 'active' : ''} onClick={() => setView(n.id)} aria-current={view === n.id ? 'page' : undefined}><Icon name={n.icon} size={20}/><span>{n.id === 'dashboard' ? 'Início' : n.id === 'questions' ? 'Questões' : n.id === 'calendar' ? 'Calendário' : 'Disciplinas'}</span>{view === n.id && <i/>}</button>)}</nav>
    {toast && <div className="toast-message" role="status"><Icon name="circle-check" size={18}/>{toast}<button onClick={() => setToast('')} aria-label="Fechar aviso"><Icon name="close" size={15}/></button></div>}
  </div>
}
