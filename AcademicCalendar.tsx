import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import type { AppData, CalendarEvent, EventType } from '../types'
import { EVENT_COLORS, EVENT_LABELS } from '../seed'
import { addDateDays, makeId, todayString } from '../storage'
import { Button, EmptyState, Icon, Modal, PageTitle, daysUntil, fmtDate, prettyDay, type IconName } from './UI'

interface Props {
  data: AppData
  updateData: (updater: (current: AppData) => AppData) => void
  initialEditEvent?: CalendarEvent | null
  onInitialEditHandled?: () => void
}

const WEEKDAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
const MONTH_NAMES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
const TYPE_ICONS: Record<EventType, IconName> = { exam: 'target', assignment: 'file', presentation: 'play', class: 'book-open', important: 'calendar' }
const emptyEvent = (date: string, data: AppData): CalendarEvent => ({ id: '', title: '', date, type: 'exam', courseId: data.courses[0]?.id ?? '', time: '', location: '', notes: '', completed: false, createdAt: Date.now() })

function EventEditor({ data, event, onClose, onSave, onDelete }: { data: AppData; event: CalendarEvent; onClose: () => void; onSave: (e: CalendarEvent) => void; onDelete: (id: string) => void }) {
  const [draft, setDraft] = useState<CalendarEvent>(event)
  const [error, setError] = useState('')
  const change = <K extends keyof CalendarEvent>(key: K, value: CalendarEvent[K]) => setDraft(old => ({ ...old, [key]: value }))
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!draft.title.trim()) return setError('Dê um nome para este compromisso.')
    if (!draft.date) return setError('Escolha uma data para o compromisso.')
    onSave({ ...draft, title: draft.title.trim(), id: draft.id || makeId(), createdAt: draft.createdAt || Date.now() })
  }
  return <Modal title={event.id ? 'Editar compromisso' : 'Adicionar ao calendário'} description="Provas, entregas, apresentações, aulas e datas importantes." onClose={onClose}>
    <form className="form-stack" onSubmit={submit}>
      <label className="field"><span>Nome do compromisso</span><input autoFocus value={draft.title} onChange={e => change('title', e.target.value)} placeholder="Ex.: Prova de Histologia"/></label>
      <div className="form-two-columns"><label className="field"><span>Data</span><input type="date" value={draft.date} onChange={e => change('date', e.target.value)} required/></label><label className="field"><span>Horário (opcional)</span><input type="time" value={draft.time} onChange={e => change('time', e.target.value)}/></label></div>
      <label className="field"><span>Tipo</span><select value={draft.type} onChange={e => change('type', e.target.value as EventType)}>{Object.entries(EVENT_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
      <label className="field"><span>Disciplina</span><select value={draft.courseId} onChange={e => change('courseId', e.target.value)}><option value="">Sem disciplina</option>{data.courses.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}</select></label>
      <div className="form-two-columns"><label className="field"><span>Local / sala (opcional)</span><input value={draft.location} onChange={e => change('location', e.target.value)} placeholder="Ex.: Sala 12"/></label><label className="field"><span>Status</span><select value={draft.completed ? 'done' : 'open'} onChange={e => change('completed', e.target.value === 'done')}><option value="open">Pendente</option><option value="done">Concluído</option></select></label></div>
      <label className="field"><span>Observações (opcional)</span><textarea rows={2} value={draft.notes} onChange={e => change('notes', e.target.value)} placeholder="Conteúdos, materiais para levar, lembretes..."/></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="modal-actions modal-actions-split">{event.id && <Button type="button" variant="danger" onClick={() => onDelete(event.id)}><Icon name="trash" size={15}/> Excluir</Button>}<div className="modal-actions-right"><Button type="button" onClick={onClose}>Cancelar</Button><Button type="submit" variant="primary"><Icon name="check" size={16}/> Salvar</Button></div></div>
    </form>
  </Modal>
}

export default function AcademicCalendar({ data, updateData, initialEditEvent, onInitialEditHandled }: Props) {
  const [month, setMonth] = useState(() => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), 1, 12) })
  const [selectedDate, setSelectedDate] = useState(todayString())
  const [editor, setEditor] = useState<CalendarEvent | null>(null)
  const [filterType, setFilterType] = useState<'all' | EventType>('all')
  const today = todayString()

  useEffect(() => {
    if (initialEditEvent) {
      setEditor(initialEditEvent)
      setSelectedDate(initialEditEvent.date)
      const [year, m] = initialEditEvent.date.split('-').map(Number)
      setMonth(new Date(year, m - 1, 1, 12))
      onInitialEditHandled?.()
    }
  }, [initialEditEvent, onInitialEditHandled])

  const eventsInMonth = useMemo(() => data.events.filter(e => e.date.startsWith(`${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`) && (filterType === 'all' || e.type === filterType)), [data.events, month, filterType])
  const dayEvents = data.events.filter(e => e.date === selectedDate && (filterType === 'all' || e.type === filterType)).sort((a, b) => a.time.localeCompare(b.time))
  const firstOffset = (new Date(month.getFullYear(), month.getMonth(), 1).getDay() + 6) % 7
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const cellCount = Math.ceil((firstOffset + daysInMonth) / 7) * 7
  const monthDays = Array.from({ length: cellCount }, (_, i) => {
    const day = i - firstOffset + 1
    if (day < 1 || day > daysInMonth) return null
    return `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  })

  const saveEvent = (event: CalendarEvent) => {
    updateData(old => ({ ...old, events: old.events.some(e => e.id === event.id) ? old.events.map(e => e.id === event.id ? event : e) : [...old.events, event] }))
    setSelectedDate(event.date); setEditor(null)
  }
  const deleteEvent = (id: string) => {
    if (!window.confirm('Excluir este compromisso do calendário?')) return
    updateData(old => ({ ...old, events: old.events.filter(e => e.id !== id) }))
    setEditor(null)
  }
  const changeMonth = (delta: number) => {
    const next = new Date(month.getFullYear(), month.getMonth() + delta, 1, 12)
    setMonth(next)
    setSelectedDate(todayString(next))
  }
  const startNew = (date = selectedDate) => setEditor(emptyEvent(date, data))
  const upcomingCount = data.events.filter(e => !e.completed && e.date >= today).length

  return <div className="calendar-page">
    <PageTitle eyebrow="VISÃO DO SEMESTRE" title="Calendário acadêmico" description="Provas, trabalhos, apresentações e tudo o que você não quer esquecer." action={<Button variant="primary" onClick={() => startNew()}><Icon name="plus" size={17}/> Novo compromisso</Button>}/>
    <div className="calendar-highlights"><div className="calendar-highlight primary-highlight"><span className="highlight-icon"><Icon name="calendar"/></span><span><small>Próximos compromissos</small><strong>{upcomingCount}</strong></span><span className="highlight-label">No calendário</span></div><div className="calendar-highlight"><span className="highlight-icon burgundy-icon"><Icon name="target"/></span><span><small>Próximas provas</small><strong>{data.events.filter(e => e.type === 'exam' && !e.completed && e.date >= today).length}</strong></span></div><div className="calendar-highlight"><span className="highlight-icon sage-icon"><Icon name="check"/></span><span><small>Concluídos</small><strong>{data.events.filter(e => e.completed).length}</strong></span></div></div>

    <div className="calendar-layout"><section className="calendar-board panel"><div className="calendar-board-header"><div><p className="eyebrow">CALENDÁRIO MENSAL</p><h2>{MONTH_NAMES[month.getMonth()]} <span>{month.getFullYear()}</span></h2></div><div className="calendar-controls"><Button className="calendar-today" onClick={() => { setMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1, 12)); setSelectedDate(today) }}>Hoje</Button><button className="icon-button" onClick={() => changeMonth(-1)} aria-label="Mês anterior"><Icon name="left"/></button><button className="icon-button" onClick={() => changeMonth(1)} aria-label="Próximo mês"><Icon name="right"/></button></div></div>
      <div className="month-grid"><div className="weekday-row">{WEEKDAYS.map(d => <div key={d}>{d}</div>)}</div><div className="date-grid">{monthDays.map((date, i) => { if (!date) return <div key={`blank-${i}`} className="date-cell is-blank"/>; const cellEvents = eventsInMonth.filter(e => e.date === date); const isSelected = selectedDate === date; const isToday = date === today; return <button key={date} className={`date-cell ${isSelected ? 'is-selected' : ''} ${isToday ? 'is-today' : ''} ${cellEvents.length ? 'has-events' : ''}`} onClick={() => setSelectedDate(date)} aria-pressed={isSelected} aria-label={`${fmtDate(date, { day: 'numeric', month: 'long', year: 'numeric' })}, ${cellEvents.length} compromisso(s)`}><span className="date-number">{Number(date.slice(-2))}</span><span className="date-dots">{cellEvents.slice(0, 3).map(e => <i key={e.id} className={`dot dot-${EVENT_COLORS[e.type]}`} title={EVENT_LABELS[e.type]}/>)}</span>{cellEvents.length > 3 && <span className="more-events">+{cellEvents.length - 3}</span>}</button> })}</div></div>
      <div className="calendar-legend"><span><i className="dot dot-burgundy"/> Prova</span><span><i className="dot dot-pink"/> Trabalho / entrega</span><span><i className="dot dot-sage"/> Apresentação</span><span><i className="dot dot-blue"/> Aula</span><span><i className="dot dot-amber"/> Importante</span></div>
      <div className="calendar-filter-row"><span>Mostrar:</span><div className="filter-pills"><button className={filterType === 'all' ? 'active' : ''} onClick={() => setFilterType('all')}>Tudo</button>{Object.entries(EVENT_LABELS).map(([key, value]) => <button key={key} className={filterType === key ? 'active' : ''} onClick={() => setFilterType(key as EventType)}>{value}</button>)}</div></div>
    </section>

    <aside className="day-agenda panel"><div className="day-agenda-header"><div><p className="eyebrow">AGENDA DO DIA</p><h2>{prettyDay(selectedDate)}</h2></div><button className="icon-button" onClick={() => startNew()} aria-label="Adicionar compromisso neste dia"><Icon name="plus"/></button></div><div className="selected-day-stamp"><span>{fmtDate(selectedDate, { day: '2-digit' })}</span><span>{fmtDate(selectedDate, { month: 'long' })}</span></div>
      {dayEvents.length ? <div className="day-event-list">{dayEvents.map(event => { const course = data.courses.find(c => c.id === event.courseId); return <article className={`day-event day-event-${event.type} ${event.completed ? 'event-completed' : ''}`} key={event.id}><div className="day-event-time">{event.time || '—'}</div><div className="day-event-content"><div className="day-event-type"><Icon name={TYPE_ICONS[event.type]} size={13}/>{EVENT_LABELS[event.type]}</div><button className="day-event-title" onClick={() => setEditor(event)}>{event.title}</button>{course && <p>{course.icon} {course.name}</p>}{event.location && <p><Icon name="pin" size={12}/> {event.location}</p>}{event.notes && !event.notes.startsWith('Evento demonstrativo.') && <p className="day-event-notes">{event.notes}</p>}<div className="day-event-actions"><button onClick={() => updateData(old => ({ ...old, events: old.events.map(e => e.id === event.id ? { ...e, completed: !e.completed } : e) }))}><Icon name={event.completed ? 'refresh' : 'check'} size={13}/>{event.completed ? 'Reabrir' : 'Concluir'}</button><button onClick={() => setEditor(event)}><Icon name="edit" size={13}/> Editar</button></div></div></article> })}</div> : <EmptyState icon="calendar-plus" title="Dia livre" description="Este dia está sem compromissos. Aproveite para planejar ou adicione uma data importante." action={<Button onClick={() => startNew()}><Icon name="plus" size={15}/> Adicionar</Button>}/>}
      <div className="agenda-next"><div className="agenda-next-title"><Icon name="clock" size={15}/> Próximos dias</div>{data.events.filter(e => !e.completed && e.date > selectedDate && (filterType === 'all' || e.type === filterType)).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3).map(e => <button className="next-event-row" key={e.id} onClick={() => { setSelectedDate(e.date); const [year, m] = e.date.split('-').map(Number); setMonth(new Date(year, m - 1, 1, 12)) }}><span className={`next-event-indicator dot-${EVENT_COLORS[e.type]}`}/><span><strong>{e.title.replace(/^Exemplo · /, '')}</strong><small>{fmtDate(e.date, { weekday: 'short', day: 'numeric', month: 'short' })} {e.time && `· ${e.time}`}</small></span><Icon name="chevron" size={15}/></button>)}</div>
    </aside></div>
    {editor && <EventEditor data={data} event={editor} onClose={() => setEditor(null)} onSave={saveEvent} onDelete={deleteEvent}/>}
  </div>
}
