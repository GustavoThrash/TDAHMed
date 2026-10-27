import { useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import type { AppData, Course, Material, ScheduleEntry, Topic, TopicStatus } from '../types'
import { deletePdfBlob, getPdfBlob, makeId, savePdfBlob } from '../storage'
import { Button, EmptyState, Icon, Modal, PageTitle, fmtDate, daysUntil } from './UI'

interface Props { data: AppData; updateData: (updater: (current: AppData) => AppData) => void; notify: (message: string) => void }
const COLORS = ['burgundy', 'sage', 'rose', 'lavender', 'blue', 'amber', 'teal', 'peach']
const DAYS = [{ value: 1, label: 'Segunda-feira' }, { value: 2, label: 'Terça-feira' }, { value: 3, label: 'Quarta-feira' }, { value: 4, label: 'Quinta-feira' }, { value: 5, label: 'Sexta-feira' }, { value: 6, label: 'Sábado' }, { value: 0, label: 'Domingo' }]
const statusLabel: Record<TopicStatus, string> = { todo: 'A estudar', studying: 'Em andamento', done: 'Concluído' }

function CourseEditor({ course, onClose, onSave }: { course?: Course; onClose: () => void; onSave: (course: Course) => void }) {
  const [name, setName] = useState(course?.name ?? '')
  const [icon, setIcon] = useState(course?.icon ?? '📘')
  const [color, setColor] = useState(course?.color ?? 'sage')
  const [professor, setProfessor] = useState(course?.professor ?? '')
  const [room, setRoom] = useState(course?.room ?? '')
  const [description, setDescription] = useState(course?.description ?? '')
  const [error, setError] = useState('')
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return setError('Informe o nome da disciplina.')
    const id = course?.id ?? `materia-${makeId()}`
    onSave({ id, name: name.trim(), shortName: name.trim().split(/\s+/).map(s => s[0]).join('').slice(0, 2).toUpperCase(), icon: icon.trim() || '📘', color, professor: professor.trim(), room: room.trim(), description: description.trim(), topics: course?.topics ?? [], schedule: course?.schedule ?? [], materials: course?.materials ?? [] })
  }
  return <Modal title={course ? 'Editar disciplina' : 'Nova disciplina'} description="Personalize a identidade e as informações da matéria." onClose={onClose}>
    <form className="form-stack" onSubmit={submit}>
      <div className="course-icon-preview-row"><span className={`subject-icon subject-${color}`}>{icon || '📘'}</span><label className="field grow-field"><span>Nome da disciplina</span><input value={name} onChange={e => setName(e.target.value)} placeholder="Ex.: Anatomia" autoFocus/></label></div>
      <div className="form-two-columns"><label className="field"><span>Ícone (emoji ou símbolo)</span><input value={icon} onChange={e => setIcon(e.target.value)} maxLength={8} placeholder="🦴"/></label><label className="field"><span>Professor(a)</span><input value={professor} onChange={e => setProfessor(e.target.value)} placeholder="Nome do professor"/></label></div>
      <label className="field"><span>Cor da disciplina</span><div className="color-palette">{COLORS.map(c => <button key={c} type="button" className={`color-swatch swatch-${c} ${color === c ? 'swatch-active' : ''}`} onClick={() => setColor(c)} aria-label={`Cor ${c}`} aria-pressed={color === c}/>)}</div></label>
      <label className="field"><span>Sala / local habitual</span><input value={room} onChange={e => setRoom(e.target.value)} placeholder="Ex.: Laboratório 2"/></label>
      <label className="field"><span>Descrição</span><textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="Objetivos, bibliografia, observações..."/></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="modal-actions"><Button type="button" onClick={onClose}>Cancelar</Button><Button type="submit" variant="primary"><Icon name="check" size={16}/> Salvar disciplina</Button></div>
    </form>
  </Modal>
}

export default function Disciplines({ data, updateData, notify }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editor, setEditor] = useState<Course | 'new' | null>(null)
  const [detailTab, setDetailTab] = useState<'overview' | 'topics' | 'schedule' | 'materials'>('overview')
  const [topicTitle, setTopicTitle] = useState('')
  const [topicNotes, setTopicNotes] = useState('')
  const [scheduleDay, setScheduleDay] = useState('1')
  const [scheduleStart, setScheduleStart] = useState('08:00')
  const [scheduleEnd, setScheduleEnd] = useState('09:30')
  const [scheduleRoom, setScheduleRoom] = useState('')
  const [materialTitle, setMaterialTitle] = useState('')
  const [materialUrl, setMaterialUrl] = useState('')
  const [materialError, setMaterialError] = useState('')
  const [materialBusy, setMaterialBusy] = useState(false)
  const [pdfPreview, setPdfPreview] = useState<{ url: string; name: string } | null>(null)
  const pdfInputRef = useRef<HTMLInputElement>(null)
  const course = data.courses.find(c => c.id === selectedId) ?? null
  const [courseSearch, setCourseSearch] = useState('')
  const filteredCourses = useMemo(() => data.courses.filter(c => `${c.name} ${c.description} ${c.professor}`.toLocaleLowerCase('pt-BR').includes(courseSearch.toLocaleLowerCase('pt-BR'))), [data.courses, courseSearch])

  const saveCourse = (next: Course) => {
    updateData(old => ({ ...old, courses: old.courses.some(c => c.id === next.id) ? old.courses.map(c => c.id === next.id ? next : c) : [...old.courses, next] }))
    setSelectedId(next.id); setEditor(null); setDetailTab('overview')
  }
  const patchCourse = (updater: (current: Course) => Course) => {
    if (!course) return
    updateData(old => ({ ...old, courses: old.courses.map(c => c.id === course.id ? updater(c) : c) }))
  }
  const addTopic = (e: FormEvent) => {
    e.preventDefault()
    if (!course || !topicTitle.trim()) return
    const topic: Topic = { id: makeId(), title: topicTitle.trim(), notes: topicNotes.trim(), status: 'todo' }
    patchCourse(c => ({ ...c, topics: [...c.topics, topic] }))
    setTopicTitle(''); setTopicNotes(''); notify('Tópico adicionado à disciplina.')
  }
  const updateTopicStatus = (topicId: string, status: TopicStatus) => patchCourse(c => ({ ...c, topics: c.topics.map(t => t.id === topicId ? { ...t, status } : t) }))
  const removeTopic = (topicId: string) => {
    if (!window.confirm('Remover este tópico da disciplina?')) return
    patchCourse(c => ({ ...c, topics: c.topics.filter(t => t.id !== topicId) }))
  }
  const addSchedule = (e: FormEvent) => {
    e.preventDefault()
    if (!course) return
    if (scheduleEnd <= scheduleStart) return notify('O horário final precisa ser posterior ao inicial.')
    const entry: ScheduleEntry = { id: makeId(), day: Number(scheduleDay), start: scheduleStart, end: scheduleEnd, room: scheduleRoom.trim() }
    patchCourse(c => ({ ...c, schedule: [...c.schedule, entry].sort((a, b) => a.day - b.day || a.start.localeCompare(b.start)) }))
    notify('Aula adicionada à grade semanal.'); setScheduleRoom('')
  }
  const removeSchedule = (entryId: string) => patchCourse(c => ({ ...c, schedule: c.schedule.filter(s => s.id !== entryId) }))

  const addMaterialLink = (e: FormEvent) => {
    e.preventDefault(); setMaterialError('')
    if (!course) return
    if (!materialTitle.trim()) return setMaterialError('Dê um nome ao material.')
    let url: URL
    try { url = new URL(materialUrl) } catch { return setMaterialError('Informe um link válido, começando com https://') }
    if (!['http:', 'https:'].includes(url.protocol)) return setMaterialError('Use um link web seguro (https://).')
    const item: Material = { id: makeId(), title: materialTitle.trim(), kind: 'link', url: url.toString(), addedAt: Date.now() }
    patchCourse(c => ({ ...c, materials: [item, ...c.materials] }))
    setMaterialTitle(''); setMaterialUrl(''); notify('Link adicionado aos materiais.')
  }
  const uploadPdf = async (file?: File) => {
    if (!course || !file) return
    setMaterialError('')
    if (!(file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))) return setMaterialError('Escolha um arquivo PDF.')
    if (file.size > 10 * 1024 * 1024) return setMaterialError('Este PDF ultrapassa 10 MB. Para manter o armazenamento local estável, adicione um arquivo menor ou um link externo.')
    setMaterialBusy(true)
    const id = makeId()
    try {
      await savePdfBlob(id, file, file.name)
      const item: Material = { id: makeId(), title: file.name, kind: 'pdf', fileId: id, size: file.size, addedAt: Date.now() }
      patchCourse(c => ({ ...c, materials: [item, ...c.materials] }))
      notify('PDF salvo neste navegador e associado à disciplina.')
    } catch (error) {
      setMaterialError(error instanceof Error ? error.message : 'Não foi possível guardar o PDF.')
    } finally { setMaterialBusy(false); if (pdfInputRef.current) pdfInputRef.current.value = '' }
  }
  const openMaterial = async (item: Material) => {
    if (item.kind === 'link' && item.url) { window.open(item.url, '_blank', 'noopener,noreferrer'); return }
    if (!item.fileId) return
    try {
      const blob = await getPdfBlob(item.fileId)
      if (!blob) return setMaterialError('O arquivo não está disponível neste navegador. Ele pode ter sido removido pelos dados do site.')
      const url = URL.createObjectURL(blob)
      setPdfPreview(old => { if (old) URL.revokeObjectURL(old.url); return { url, name: item.title } })
    } catch (error) { setMaterialError(error instanceof Error ? error.message : 'Não foi possível abrir o PDF.') }
  }
  const removeMaterial = async (item: Material) => {
    if (!course || !window.confirm(`Remover “${item.title}” desta disciplina?${item.kind === 'pdf' ? ' O arquivo salvo localmente também será excluído.' : ''}`)) return
    if (item.kind === 'pdf' && item.fileId) {
      try { await deletePdfBlob(item.fileId) } catch (error) { setMaterialError(error instanceof Error ? error.message : 'Não foi possível excluir o arquivo.'); return }
    }
    patchCourse(c => ({ ...c, materials: c.materials.filter(m => m.id !== item.id) }))
  }

  if (!course) {
    const totalTopics = data.courses.reduce((sum, c) => sum + c.topics.length, 0)
    const doneTopics = data.courses.reduce((sum, c) => sum + c.topics.filter(t => t.status === 'done').length, 0)
    return <div className="disciplines-page"><PageTitle eyebrow="ORGANIZAÇÃO DO SEMESTRE" title="Minhas disciplinas" description="Um espaço para reunir conteúdos, horários, materiais e progresso de cada matéria." action={<Button variant="primary" onClick={() => setEditor('new')}><Icon name="plus" size={17}/> Nova disciplina</Button>}/>
      <div className="discipline-overview-band"><div className="overview-band-mark"><Icon name="graduation" size={26}/></div><div className="overview-band-text"><strong>Sua trajetória acadêmica, matéria por matéria.</strong><p>Personalize os ícones, registre tópicos, monte a grade semanal e guarde os materiais de cada disciplina.</p></div><div className="overview-band-progress"><span>{doneTopics}/{totalTopics}</span><small>tópicos concluídos</small><div className="progress-track"><i style={{ width: `${totalTopics ? doneTopics / totalTopics * 100 : 0}%` }}/></div></div></div>
      <div className="course-list-toolbar"><label className="search-field"><Icon name="search" size={18}/><input value={courseSearch} onChange={e => setCourseSearch(e.target.value)} placeholder="Encontrar disciplina..." aria-label="Buscar disciplinas"/></label><span>{data.courses.length} disciplinas</span></div>
      {filteredCourses.length ? <div className="discipline-grid">{filteredCourses.map(c => { const done = c.topics.filter(t => t.status === 'done').length; const total = c.topics.length; const pct = total ? Math.round(done / total * 100) : 0; return <button className={`discipline-card discipline-card-${c.color}`} key={c.id} onClick={() => { setSelectedId(c.id); setDetailTab('overview') }}><div className="discipline-card-top"><span className={`subject-icon subject-${c.color}`}>{c.icon}</span><span className="subject-short">{c.shortName}</span><span className="card-arrow"><Icon name="arrow" size={17}/></span></div><h2>{c.name}</h2><p>{c.description || 'Adicione uma descrição para esta disciplina.'}</p><div className="discipline-card-meta"><span><Icon name="book" size={14}/>{total} tópicos</span><span><Icon name="clock" size={14}/>{c.schedule.length} aulas/semana</span></div><div className="discipline-progress-head"><span>Progresso dos conteúdos</span><strong>{pct}%</strong></div><div className="progress-track"><i style={{ width: `${pct}%` }}/></div><div className="discipline-card-footer"><span>{c.materials.length} material(is)</span><span>{c.topics.filter(t => t.status === 'studying').length} em andamento</span></div></button> })}</div> : <EmptyState icon="layers" title="Nenhuma disciplina encontrada" description="Tente outra busca ou adicione uma disciplina." action={<Button variant="primary" onClick={() => setEditor('new')}><Icon name="plus" size={16}/> Adicionar disciplina</Button>}/>} 
      {editor && <CourseEditor course={editor === 'new' ? undefined : editor} onClose={() => setEditor(null)} onSave={saveCourse}/>}
    {pdfPreview && <Modal title={pdfPreview.name} description="Pré-visualização do PDF salvo neste navegador" onClose={() => { URL.revokeObjectURL(pdfPreview.url); setPdfPreview(null) }} wide><div className="pdf-preview-body"><iframe title={pdfPreview.name} src={pdfPreview.url}/></div><div className="modal-actions"><a className="button button-secondary" href={pdfPreview.url} download={pdfPreview.name}><Icon name="download" size={15}/> Baixar PDF</a><Button variant="primary" onClick={() => { URL.revokeObjectURL(pdfPreview.url); setPdfPreview(null) }}>Fechar</Button></div></Modal>}
    </div>
  }

  const totalTopics = course.topics.length
  const completeTopics = course.topics.filter(t => t.status === 'done').length
  const courseEvents = data.events.filter(e => e.courseId === course.id && !e.completed).sort((a, b) => a.date.localeCompare(b.date))
  const schedule = [...course.schedule].sort((a, b) => ((a.day + 6) % 7) - ((b.day + 6) % 7) || a.start.localeCompare(b.start))
  const currentDate = new Date(); const todayDay = currentDate.getDay()
  const currentTime = `${String(currentDate.getHours()).padStart(2, '0')}:${String(currentDate.getMinutes()).padStart(2, '0')}`
  const nextClass = [...schedule].filter(s => s.day === todayDay && s.end >= currentTime).sort((a, b) => a.start.localeCompare(b.start))[0]
    ?? [...schedule].filter(s => s.day !== todayDay).sort((a, b) => (((a.day - todayDay + 7) % 7) - ((b.day - todayDay + 7) % 7)) || a.start.localeCompare(b.start))[0]
    ?? schedule[0]

  return <div className="discipline-detail-page"><button className="back-link" onClick={() => { setSelectedId(null); setMaterialError('') }}><Icon name="left" size={16}/> Todas as disciplinas</button>
    <header className={`course-detail-hero course-hero-${course.color}`}><div className="course-detail-icon">{course.icon}</div><div className="course-detail-title"><p className="eyebrow">PAINEL DA DISCIPLINA</p><h1>{course.name}</h1><p>{course.description || 'Organize conteúdos, horários e materiais desta matéria.'}</p><div className="course-detail-badges"><span><Icon name="book" size={14}/>{course.topics.length} tópicos</span><span><Icon name="folder" size={14}/>{course.materials.length} materiais</span>{course.professor && <span><Icon name="graduation" size={14}/>{course.professor}</span>}</div></div><Button className="course-edit-button" onClick={() => setEditor(course)}><Icon name="edit" size={15}/> Editar</Button></header>
    <div className="course-detail-tabs" role="tablist" aria-label="Seções da disciplina">{([{ id: 'overview', label: 'Visão geral', icon: 'chart' }, { id: 'topics', label: 'Conteúdos e aulas', icon: 'book-open' }, { id: 'schedule', label: 'Horários', icon: 'calendar' }, { id: 'materials', label: 'Materiais', icon: 'folder' }] as const).map(tab => <button key={tab.id} role="tab" aria-selected={detailTab === tab.id} className={detailTab === tab.id ? 'active' : ''} onClick={() => setDetailTab(tab.id)}><Icon name={tab.icon} size={16}/>{tab.label}<span>{tab.id === 'topics' ? course.topics.length : tab.id === 'schedule' ? course.schedule.length : tab.id === 'materials' ? course.materials.length : ''}</span></button>)}</div>

    {detailTab === 'overview' && <div className="course-overview-layout"><div className="course-overview-main"><section className="panel course-content-panel"><div className="section-heading"><div><p className="eyebrow">CONTEÚDO PROGRAMÁTICO</p><h2>Seu progresso</h2></div><button className="text-link" onClick={() => setDetailTab('topics')}>Gerenciar tópicos <Icon name="arrow" size={14}/></button></div><div className="big-progress-row"><div className="progress-ring" style={{ background: `conic-gradient(var(--sage) ${totalTopics ? completeTopics / totalTopics * 100 : 0}%, #eee9df 0)` }}><span>{totalTopics ? Math.round(completeTopics / totalTopics * 100) : 0}<small>%</small></span></div><div><strong>{completeTopics} de {totalTopics} tópicos concluídos</strong><p>Marque os conteúdos que já estudou para acompanhar sua evolução.</p></div></div><div className="topic-progress-preview">{course.topics.slice(0, 4).map(topic => <div className="topic-preview-row" key={topic.id}><span className={`topic-status-dot topic-dot-${topic.status}`}/><span className={topic.status === 'done' ? 'topic-done-text' : ''}>{topic.title}</span><small>{statusLabel[topic.status]}</small></div>)}{!course.topics.length && <p className="muted-text">Ainda não há tópicos. Adicione o conteúdo programático na aba “Conteúdos e aulas”.</p>}</div></section>
      <section className="panel course-upcoming-panel"><div className="section-heading"><div><p className="eyebrow">PRAZOS E AVALIAÇÕES</p><h2>O que vem por aí</h2></div><Icon name="calendar"/></div>{courseEvents.length ? courseEvents.slice(0, 3).map(event => <div key={event.id} className="course-event-preview"><span className={`event-date-badge event-${event.type}`}><strong>{fmtDate(event.date, { day: '2-digit' })}</strong><small>{fmtDate(event.date, { month: 'short' })}</small></span><span><strong>{event.title}</strong><small>{daysUntil(event.date) === 0 ? 'Hoje' : daysUntil(event.date) === 1 ? 'Amanhã' : daysUntil(event.date) > 1 ? `Em ${daysUntil(event.date)} dias` : 'Data passada'}{event.time ? ` · ${event.time}` : ''}</small></span><span className="event-type-small">{event.type === 'exam' ? 'Prova' : event.type === 'assignment' ? 'Entrega' : event.type === 'presentation' ? 'Apresentação' : 'Agenda'}</span></div>) : <p className="muted-text">Nenhuma avaliação pendente para esta disciplina. Você pode registrá-las no Calendário acadêmico.</p>}</section></div>
      <aside className="course-overview-side"><section className="panel side-info-panel"><div className="side-panel-heading"><span className={`subject-icon subject-${course.color}`}>{course.icon}</span><div><strong>Informações</strong><small>Detalhes da disciplina</small></div></div><div className="side-info-list"><div><span>Professor(a)</span><strong>{course.professor || 'Não informado'}</strong></div><div><span>Sala habitual</span><strong>{course.room || 'Não informada'}</strong></div><div><span>Próxima aula</span><strong>{nextClass ? `${DAYS.find(d => d.value === nextClass.day)?.label} · ${nextClass.start}` : 'Adicione seus horários'}</strong></div><div><span>Material de estudo</span><strong>{course.materials.length} arquivo(s)/link(s)</strong></div></div><Button className="full-width" onClick={() => setEditor(course)}><Icon name="edit" size={15}/> Atualizar informações</Button></section><section className="motivation-note"><span>✦</span><strong>Um passo de cada vez.</strong><p>Organize o conteúdo, acompanhe seu progresso e volte sempre que precisar.</p></section></aside></div>}

    {detailTab === 'topics' && <div className="topic-manager-layout"><section className="panel topic-manager-main"><div className="section-heading"><div><p className="eyebrow">PLANO DE ESTUDO</p><h2>Conteúdos e aulas</h2></div><span className="soft-chip">{completeTopics}/{totalTopics} concluídos</span></div>{course.topics.length ? <div className="topic-list">{course.topics.map((topic, i) => <article className={`topic-row topic-row-${topic.status}`} key={topic.id}><span className="topic-index">{String(i + 1).padStart(2, '0')}</span><span className={`topic-status-mark topic-mark-${topic.status}`}>{topic.status === 'done' ? <Icon name="check" size={15}/> : topic.status === 'studying' ? <Icon name="play" size={13}/> : <span/>}</span><div className="topic-row-body"><strong className={topic.status === 'done' ? 'topic-done-text' : ''}>{topic.title}</strong>{topic.notes && <p>{topic.notes}</p>}</div><select aria-label={`Status de ${topic.title}`} value={topic.status} onChange={e => updateTopicStatus(topic.id, e.target.value as TopicStatus)}><option value="todo">A estudar</option><option value="studying">Em andamento</option><option value="done">Concluído</option></select><button className="icon-button danger-hover" onClick={() => removeTopic(topic.id)} aria-label={`Remover tópico ${topic.title}`}><Icon name="trash" size={16}/></button></article>)}</div> : <EmptyState icon="book-open" title="Comece pelo conteúdo programático" description="Adicione os assuntos e as aulas que você precisa estudar nesta disciplina."/>}</section><aside className="panel add-topic-panel"><p className="eyebrow">NOVO CONTEÚDO</p><h2>Adicionar tópico</h2><p>Registre uma aula, uma unidade ou um assunto para acompanhar seu estudo.</p><form className="form-stack" onSubmit={addTopic}><label className="field"><span>Nome do tópico</span><input value={topicTitle} onChange={e => setTopicTitle(e.target.value)} placeholder="Ex.: Osteología" required/></label><label className="field"><span>Notas (opcional)</span><textarea value={topicNotes} onChange={e => setTopicNotes(e.target.value)} rows={3} placeholder="Páginas, pontos importantes, dúvidas..."/></label><Button type="submit" variant="primary" className="full-width"><Icon name="plus" size={16}/> Adicionar tópico</Button></form><div className="topic-status-guide"><span><i className="topic-status-dot topic-dot-todo"/> A estudar</span><span><i className="topic-status-dot topic-dot-studying"/> Em andamento</span><span><i className="topic-status-dot topic-dot-done"/> Concluído</span></div></aside></div>}

    {detailTab === 'schedule' && <div className="schedule-layout"><section className="panel schedule-main"><div className="section-heading"><div><p className="eyebrow">ROTINA SEMANAL</p><h2>Horários das aulas</h2></div><span className="soft-chip">{course.schedule.length} horário(s)</span></div>{schedule.length ? <div className="weekly-schedule-list">{schedule.map(entry => <article className="schedule-row" key={entry.id}><div className="schedule-day-block"><strong>{DAYS.find(d => d.value === entry.day)?.label.slice(0, 3)}</strong><small>{DAYS.find(d => d.value === entry.day)?.label}</small></div><div className="schedule-time"><Icon name="clock" size={16}/><strong>{entry.start} – {entry.end}</strong></div><div className="schedule-room">{entry.room ? <><Icon name="pin" size={15}/>{entry.room}</> : <span className="muted-text">Sala não informada</span>}</div><button className="icon-button danger-hover" onClick={() => removeSchedule(entry.id)} aria-label="Remover horário"><Icon name="trash" size={16}/></button></article>)}</div> : <EmptyState icon="calendar" title="Sua grade começa aqui" description="Adicione os dias, horários e salas das aulas desta disciplina."/>}</section><aside className="panel add-schedule-panel"><p className="eyebrow">NOVA AULA</p><h2>Adicionar horário</h2><form className="form-stack" onSubmit={addSchedule}><label className="field"><span>Dia da semana</span><select value={scheduleDay} onChange={e => setScheduleDay(e.target.value)}>{DAYS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}</select></label><div className="form-two-columns"><label className="field"><span>Início</span><input type="time" value={scheduleStart} onChange={e => setScheduleStart(e.target.value)} required/></label><label className="field"><span>Fim</span><input type="time" value={scheduleEnd} onChange={e => setScheduleEnd(e.target.value)} required/></label></div><label className="field"><span>Sala / local</span><input value={scheduleRoom} onChange={e => setScheduleRoom(e.target.value)} placeholder="Ex.: Lab. 3"/></label><Button variant="primary" type="submit" className="full-width"><Icon name="plus" size={16}/> Adicionar à grade</Button></form><p className="form-footnote">Os horários ficam nesta disciplina e podem ser ajustados quando sua grade mudar.</p></aside></div>}

    {detailTab === 'materials' && <div className="materials-layout"><section className="panel materials-main"><div className="section-heading"><div><p className="eyebrow">BIBLIOTECA DA DISCIPLINA</p><h2>Materiais de estudo</h2></div><span className="soft-chip">{course.materials.length} item(ns)</span></div>{course.materials.length ? <div className="material-list">{course.materials.map(item => <article className="material-row" key={item.id}><span className={`material-icon ${item.kind === 'pdf' ? 'material-pdf' : 'material-link'}`}><Icon name={item.kind === 'pdf' ? 'file' : 'external'} size={20}/></span><div className="material-row-main"><strong>{item.title}</strong><small>{item.kind === 'pdf' ? `PDF salvo neste navegador${item.size ? ` · ${(item.size / 1024 / 1024).toFixed(1)} MB` : ''}` : item.url}</small><small>Adicionado em {new Date(item.addedAt).toLocaleDateString('pt-BR')}</small></div><Button onClick={() => openMaterial(item)}><Icon name={item.kind === 'pdf' ? 'external' : 'arrow'} size={15}/>{item.kind === 'pdf' ? 'Abrir' : 'Acessar'}</Button><button className="icon-button danger-hover" onClick={() => removeMaterial(item)} aria-label={`Remover ${item.title}`}><Icon name="trash" size={16}/></button></article>)}</div> : <EmptyState icon="folder" title="Nenhum material salvo ainda" description="Anexe PDFs ou guarde links para slides, livros digitais e arquivos de aula."/>}{materialError && <p className="form-error material-error" role="alert">{materialError}</p>}</section><aside className="material-add-column"><section className="panel add-material-panel"><div className="upload-illustration"><Icon name="upload" size={26}/></div><h2>Enviar um PDF</h2><p>Guarde uma cópia do arquivo neste navegador para abrir pelo painel da disciplina.</p><input ref={pdfInputRef} className="visually-hidden" type="file" accept="application/pdf,.pdf" onChange={e => uploadPdf(e.target.files?.[0])}/><Button variant="primary" className="full-width" onClick={() => pdfInputRef.current?.click()} disabled={materialBusy}><Icon name="plus" size={16}/>{materialBusy ? 'Salvando PDF...' : 'Escolher arquivo PDF'}</Button><small className="form-footnote">Máximo de 10 MB por arquivo. O PDF fica neste navegador e dispositivo.</small></section><section className="panel add-link-panel"><p className="eyebrow">MATERIAL ONLINE</p><h2>Salvar um link</h2><form className="form-stack" onSubmit={addMaterialLink}><label className="field"><span>Nome do material</span><input value={materialTitle} onChange={e => setMaterialTitle(e.target.value)} placeholder="Ex.: Slides da aula 4"/></label><label className="field"><span>Endereço do link</span><input type="url" value={materialUrl} onChange={e => setMaterialUrl(e.target.value)} placeholder="https://..."/></label><Button type="submit" className="full-width"><Icon name="external" size={15}/> Adicionar link</Button></form></section><div className="local-file-note"><Icon name="alert" size={16}/><p>Para ter os PDFs em outros aparelhos, use links online ou transfira os backups. O GitHub Pages não sincroniza os arquivos entre dispositivos.</p></div></aside></div>}

    {editor && <CourseEditor course={editor === 'new' ? undefined : editor} onClose={() => setEditor(null)} onSave={saveCourse}/>}
    {pdfPreview && <Modal title={pdfPreview.name} description="Pré-visualização do PDF salvo neste navegador" onClose={() => { URL.revokeObjectURL(pdfPreview.url); setPdfPreview(null) }} wide><div className="pdf-preview-body"><iframe title={pdfPreview.name} src={pdfPreview.url}/></div><div className="modal-actions"><a className="button button-secondary" href={pdfPreview.url} download={pdfPreview.name}><Icon name="download" size={15}/> Baixar PDF</a><Button variant="primary" onClick={() => { URL.revokeObjectURL(pdfPreview.url); setPdfPreview(null) }}>Fechar</Button></div></Modal>}
  </div>
}
