import type { AppData, CalendarEvent, Course, EventType } from '../types'
import { EVENT_LABELS } from '../seed'
import { daysUntil, fmtDate, Icon, PageTitle, type IconName, Button } from './UI'

interface Props {
  data: AppData
  onNavigate: (view: 'questions' | 'calendar' | 'disciplines' | 'backup') => void
  onEventClick: (event: CalendarEvent) => void
}

const eventIcon: Record<EventType, IconName> = { exam: 'target', assignment: 'file', presentation: 'play', class: 'book-open', important: 'calendar' }
const greeting = () => {
  const h = new Date().getHours()
  return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'
}

function EventCard({ event, course, onClick }: { event: CalendarEvent; course?: Course; onClick: () => void }) {
  const days = daysUntil(event.date)
  return <button className={`upcoming-card event-${event.type}`} onClick={onClick}><div className="upcoming-top"><span className="event-type"><Icon name={eventIcon[event.type]} size={14}/>{EVENT_LABELS[event.type]}</span><span className="event-days">{days < 0 ? `${Math.abs(days)}d atrás` : days === 0 ? 'Hoje' : days === 1 ? 'Amanhã' : `${days} dias`}</span></div><strong>{event.title.replace(/^Exemplo · /, '')}</strong><div className="upcoming-meta"><span>{course?.icon ?? '📚'} {course?.name ?? 'Sem disciplina'}</span><span>{fmtDate(event.date)}{event.time ? ` · ${event.time}` : ''}</span></div></button>
}

export default function Dashboard({ data, onNavigate, onEventClick }: Props) {
  const todayString = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`
  const upcoming = data.events.filter(e => !e.completed && e.date >= todayString).sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)).slice(0, 3)
  const totalTopics = data.courses.reduce((s, c) => s + c.topics.length, 0)
  const completedTopics = data.courses.reduce((s, c) => s + c.topics.filter(t => t.status === 'done').length, 0)
  const questionAttempts = data.questions.reduce((s, q) => s + q.attempts, 0)
  const completedEvents = data.events.filter(e => e.completed).length
  const progress = totalTopics ? Math.round(completedTopics / totalTopics * 100) : 0
  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })

  return <div className="dashboard-page">
    <PageTitle eyebrow={today} title={<><span>{greeting()}{data.profileName.trim() ? `, ${data.profileName.trim()}` : ''}.</span><span className="handwritten title-subline">Vamos avançar um pouco hoje.</span></>} description="Sua vida acadêmica, organizada em um só lugar." action={<button className="date-pill" onClick={() => onNavigate('calendar')}><Icon name="calendar" size={16}/>{new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</button>} />

    {!data.welcomeDismissed && <div className="welcome-strip"><div className="welcome-symbol"><Icon name="sparkles" size={20}/></div><div><strong>Bem-vinda ao seu espaço de estudos</strong><p>As disciplinas, os tópicos e os eventos com “Exemplo” são sugestões demonstrativas. Personalize tudo para refletir sua turma.</p></div><button className="icon-button" onClick={() => window.dispatchEvent(new CustomEvent('tdahmed:dismiss-welcome'))} aria-label="Fechar aviso"><Icon name="close" size={17}/></button></div>}

    <div className="stats-grid">
      <button className="stat-card stat-burgundy" onClick={() => onNavigate('calendar')}><span className="stat-icon"><Icon name="calendar"/></span><span className="stat-label">Próximos compromissos</span><strong className="stat-value">{upcoming.length}</strong><span className="stat-foot">{upcoming.length ? 'Na sua agenda' : 'Tudo em dia'} <Icon name="arrow" size={14}/></span></button>
      <button className="stat-card stat-sage" onClick={() => onNavigate('questions')}><span className="stat-icon"><Icon name="book-open"/></span><span className="stat-label">Banco de questões</span><strong className="stat-value">{data.questions.length}</strong><span className="stat-foot">{questionAttempts} tentativas registradas <Icon name="arrow" size={14}/></span></button>
      <button className="stat-card stat-peach" onClick={() => onNavigate('disciplines')}><span className="stat-icon"><Icon name="layers"/></span><span className="stat-label">Tópicos estudados</span><strong className="stat-value">{completedTopics}<small>/{totalTopics}</small></strong><span className="stat-foot">{progress}% do seu plano <Icon name="arrow" size={14}/></span><span className="stat-progress"><i style={{ width: `${progress}%` }}/></span></button>
    </div>

    <section className="dashboard-section"><div className="section-heading"><div><p className="eyebrow">PLANEJAMENTO</p><h2>Próximas avaliações</h2></div><button className="text-link" onClick={() => onNavigate('calendar')}>Abrir calendário <Icon name="arrow" size={15}/></button></div>
      {upcoming.length ? <div className="upcoming-grid">{upcoming.map(e => <EventCard key={e.id} event={e} course={data.courses.find(c => c.id === e.courseId)} onClick={() => onEventClick(e)}/>)}</div> : <div className="inline-empty"><Icon name="calendar-plus"/><span>Nenhuma data próxima. Adicione uma prova, um trabalho ou uma apresentação.</span><Button onClick={() => onNavigate('calendar')}><Icon name="plus" size={16}/> Adicionar data</Button></div>}
    </section>

    <div className="dashboard-columns"><section className="panel progress-panel"><div className="section-heading"><div><p className="eyebrow">SEU PROGRESSO</p><h2>Disciplinas em foco</h2></div><button className="icon-button" onClick={() => onNavigate('disciplines')} aria-label="Ver disciplinas"><Icon name="arrow"/></button></div><div className="course-progress-list">{data.courses.slice(0, 4).map(course => { const done = course.topics.filter(t => t.status === 'done').length; const total = course.topics.length; const pct = total ? Math.round(done / total * 100) : 0; return <button className="course-progress-row" key={course.id} onClick={() => onNavigate('disciplines')}><span className={`subject-icon subject-${course.color}`}>{course.icon}</span><span className="course-progress-info"><span><strong>{course.name}</strong><small>{done} de {total} tópicos</small></span><span className="progress-number">{pct}%</span><span className="progress-track"><i style={{ width: `${pct}%` }}/></span></span></button> })}</div><button className="panel-footer-link" onClick={() => onNavigate('disciplines')}>Ver painel de disciplinas <Icon name="arrow" size={15}/></button></section>

    <section className="panel focus-panel"><div className="section-heading"><div><p className="eyebrow">ESTUDO ATIVO</p><h2>Próximo passo</h2></div><span className="soft-chip"><Icon name="sparkles" size={13}/> Sugestão</span></div><div className="focus-illustration"><div className="focus-orbit orbit-one"/><div className="focus-orbit orbit-two"/><div className="focus-book"><Icon name="book-open" size={38}/></div><span className="focus-star star-a">✦</span><span className="focus-star star-b">✧</span></div><h3>{data.mistakeIds.length ? 'Retome as questões que errou' : 'Pratique para fixar o conteúdo'}</h3><p>{data.mistakeIds.length ? `${data.mistakeIds.length} questão(ões) aguardam uma nova revisão.` : 'Uma sessão curta de questões pode ajudar a identificar o que você já domina e o que precisa rever.'}</p><Button variant="primary" onClick={() => onNavigate('questions')}><Icon name="play" size={16}/> Começar a praticar</Button></section></div>

    <div className="dashboard-bottom-note"><Icon name="sun" size={17}/><span>Pequenos avanços, feitos com constância, também contam.</span><span className="note-separator"/> <span>{completedEvents} compromisso(s) concluído(s)</span></div>
  </div>
}
