import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import type { AppData, Difficulty, Question } from '../types'
import { makeId } from '../storage'
import { Button, EmptyState, Icon, Modal, PageTitle } from './UI'

interface Props { data: AppData; updateData: (updater: (current: AppData) => AppData) => void; initialMode?: 'bank' | 'practice' | 'mistakes' }
const difficultyLabels: Record<Difficulty, string> = { easy: 'Fácil', medium: 'Intermediária', hard: 'Difícil' }

function QuestionEditor({ data, question, onClose, onSave }: { data: AppData; question?: Question; onClose: () => void; onSave: (q: Question) => void }) {
  const [courseId, setCourseId] = useState(question?.courseId ?? data.courses[0]?.id ?? '')
  const [prompt, setPrompt] = useState(question?.prompt ?? '')
  const [options, setOptions] = useState<string[]>(question?.options ?? ['', '', '', ''])
  const [correctIndex, setCorrectIndex] = useState(question?.correctIndex ?? 0)
  const [explanation, setExplanation] = useState(question?.explanation ?? '')
  const [difficulty, setDifficulty] = useState<Difficulty>(question?.difficulty ?? 'medium')
  const [tags, setTags] = useState(question?.tags.join(', ') ?? '')
  const [error, setError] = useState('')
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) return setError('Escreva o enunciado da questão.')
    if (options.some(x => !x.trim())) return setError('Preencha as quatro alternativas.')
    onSave({ id: question?.id ?? makeId(), courseId, prompt: prompt.trim(), options: options.map(x => x.trim()), correctIndex, explanation: explanation.trim(), difficulty, tags: tags.split(',').map(x => x.trim()).filter(Boolean), favorite: question?.favorite ?? false, attempts: question?.attempts ?? 0, correctCount: question?.correctCount ?? 0, createdAt: question?.createdAt ?? Date.now() })
  }
  return <Modal title={question ? 'Editar questão' : 'Nova questão'} description="Guarde questões de aula, provas anteriores ou simulados." onClose={onClose} wide>
    <form className="form-stack" onSubmit={submit}>
      <label className="field"><span>Disciplina</span><select value={courseId} onChange={e => setCourseId(e.target.value)}>{data.courses.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}</select></label>
      <label className="field"><span>Enunciado</span><textarea rows={3} value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Escreva a pergunta..." autoFocus/></label>
      <div className="field-group-title"><span>Alternativas</span><small>Marque a resposta correta</small></div>
      <div className="options-editor">{options.map((option, i) => <div className={`option-edit-row ${correctIndex === i ? 'option-is-correct' : ''}`} key={i}><label className="correct-radio" title="Definir como resposta correta"><input type="radio" name="correct-option" checked={correctIndex === i} onChange={() => setCorrectIndex(i)}/><span>{String.fromCharCode(65 + i)}</span></label><input aria-label={`Alternativa ${String.fromCharCode(65 + i)}`} value={option} onChange={e => setOptions(old => old.map((x, j) => i === j ? e.target.value : x))} placeholder={`Alternativa ${String.fromCharCode(65 + i)}`}/></div>)}</div>
      <label className="field"><span>Explicação da resposta</span><textarea rows={2} value={explanation} onChange={e => setExplanation(e.target.value)} placeholder="Por que esta é a resposta correta? (opcional)"/></label>
      <div className="form-two-columns"><label className="field"><span>Dificuldade</span><select value={difficulty} onChange={e => setDifficulty(e.target.value as Difficulty)}><option value="easy">Fácil</option><option value="medium">Intermediária</option><option value="hard">Difícil</option></select></label><label className="field"><span>Tags (separadas por vírgula)</span><input value={tags} onChange={e => setTags(e.target.value)} placeholder="ex.: membrana, citologia"/></label></div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="modal-actions"><Button type="button" onClick={onClose}>Cancelar</Button><Button type="submit" variant="primary"><Icon name="check" size={16}/>{question ? 'Salvar alterações' : 'Adicionar ao banco'}</Button></div>
    </form>
  </Modal>
}

export default function QuestionBank({ data, updateData, initialMode = 'bank' }: Props) {
  const [mode, setMode] = useState<'bank' | 'practice' | 'mistakes'>(initialMode)
  const [search, setSearch] = useState('')
  const [courseFilter, setCourseFilter] = useState('all')
  const [difficultyFilter, setDifficultyFilter] = useState('all')
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editing, setEditing] = useState<Question | undefined>()
  const [revealed, setRevealed] = useState<string[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [choice, setChoice] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)
  const [practiceMistakesOnly, setPracticeMistakesOnly] = useState(false)

  const filtered = useMemo(() => data.questions.filter(q => {
    const course = data.courses.find(c => c.id === q.courseId)
    const text = `${q.prompt} ${q.explanation} ${q.tags.join(' ')} ${course?.name ?? ''}`.toLocaleLowerCase('pt-BR')
    return (courseFilter === 'all' || q.courseId === courseFilter) && (difficultyFilter === 'all' || q.difficulty === difficultyFilter) && (!favoritesOnly || q.favorite) && (mode !== 'mistakes' || data.mistakeIds.includes(q.id)) && (!(mode === 'practice' && practiceMistakesOnly) || data.mistakeIds.includes(q.id) || (answered && q.id === activeId)) && text.includes(search.toLocaleLowerCase('pt-BR'))
  }), [data, courseFilter, difficultyFilter, favoritesOnly, mode, practiceMistakesOnly, answered, activeId, search])
  const current = filtered.find(q => q.id === activeId) ?? (mode === 'practice' ? filtered[0] : undefined)
  const attempts = data.questions.reduce((sum, q) => sum + q.attempts, 0)
  const accuracy = attempts ? Math.round(data.questions.reduce((sum, q) => sum + q.correctCount, 0) / attempts * 100) : 0

  const resetQuestionSelection = () => { setActiveId(null); setChoice(null); setAnswered(false) }
  const changeCourseFilter = (courseId: string) => { setCourseFilter(courseId); resetQuestionSelection() }
  const changeDifficultyFilter = (difficulty: string) => { setDifficultyFilter(difficulty); resetQuestionSelection() }

  const switchMode = (next: 'bank' | 'practice' | 'mistakes') => {
    setMode(next); setPracticeMistakesOnly(false); setActiveId(null); setChoice(null); setAnswered(false)
  }
  const saveQuestion = (q: Question) => {
    updateData(old => ({ ...old, questions: old.questions.some(x => x.id === q.id) ? old.questions.map(x => x.id === q.id ? q : x) : [q, ...old.questions] }))
    setEditorOpen(false); setEditing(undefined)
  }
  const toggleFavorite = (q: Question) => updateData(old => ({ ...old, questions: old.questions.map(x => x.id === q.id ? { ...x, favorite: !x.favorite } : x) }))
  const removeQuestion = (q: Question) => {
    if (!window.confirm('Excluir esta questão permanentemente?')) return
    updateData(old => ({ ...old, questions: old.questions.filter(x => x.id !== q.id), mistakeIds: old.mistakeIds.filter(id => id !== q.id) }))
  }
  const startPractice = (id?: string, fromMistakes = false) => {
    setMode('practice'); setPracticeMistakesOnly(fromMistakes); setActiveId(id ?? null); setChoice(null); setAnswered(false)
  }
  const submitAnswer = () => {
    if (!current || choice === null || answered) return
    const correct = choice === current.correctIndex
    setAnswered(true)
    updateData(old => ({
      ...old,
      questions: old.questions.map(q => q.id === current.id ? { ...q, attempts: q.attempts + 1, correctCount: q.correctCount + (correct ? 1 : 0) } : q),
      mistakeIds: correct ? old.mistakeIds.filter(id => id !== current.id) : old.mistakeIds.includes(current.id) ? old.mistakeIds : [...old.mistakeIds, current.id],
    }))
  }
  const nextQuestion = () => {
    if (filtered.length < 2) { setChoice(null); setAnswered(false); return }
    const idx = filtered.findIndex(q => q.id === current?.id)
    setActiveId(filtered[(idx + 1 + filtered.length) % filtered.length].id); setChoice(null); setAnswered(false)
  }

  return <div className="question-page">
    <PageTitle eyebrow="ESTUDO ATIVO" title="Banco de questões" description="Guarde, organize e pratique questões de todas as suas disciplinas." action={<Button variant="primary" onClick={() => { setEditing(undefined); setEditorOpen(true) }}><Icon name="plus" size={17}/> Nova questão</Button>}/>

    <div className="question-summary"><div className="question-summary-intro"><div className="summary-mark"><Icon name="book-open" size={22}/></div><div><strong>Seu acervo de conhecimento</strong><p>Questões próprias, organizadas por disciplina e prontas para revisão.</p></div></div><div className="summary-metric"><span>Questões</span><strong>{data.questions.length}</strong></div><div className="summary-metric"><span>Precisão</span><strong>{accuracy}%</strong></div><div className="summary-metric"><span>Revisar</span><strong>{data.mistakeIds.length}</strong></div></div>

    <div className="segmented-tabs" role="tablist" aria-label="Modo do banco de questões"><button role="tab" aria-selected={mode === 'bank'} className={mode === 'bank' ? 'is-active' : ''} onClick={() => switchMode('bank')}><Icon name="layers" size={16}/> Meu banco <span>{data.questions.length}</span></button><button role="tab" aria-selected={mode === 'practice'} className={mode === 'practice' ? 'is-active' : ''} onClick={() => switchMode('practice')}><Icon name="play" size={16}/> Praticar</button><button role="tab" aria-selected={mode === 'mistakes'} className={mode === 'mistakes' ? 'is-active' : ''} onClick={() => switchMode('mistakes')}><Icon name="refresh" size={16}/> Revisar erros <span>{data.mistakeIds.length}</span></button></div>

    <section className="question-subject-panel" aria-label="Escolher disciplina"><div className="question-subject-heading"><p className="eyebrow">SEU BANCO POR DISCIPLINA</p><span>Escolha uma matéria</span></div><div className="question-subject-menu"><button className={`question-subject-button ${courseFilter === 'all' ? 'selected' : ''}`} onClick={() => changeCourseFilter('all')} aria-pressed={courseFilter === 'all'}><span className="subject-icon subject-burgundy">📚</span><strong>Todas</strong><small>{data.questions.length} questões</small></button>{data.courses.map(c => { const count = data.questions.filter(q => q.courseId === c.id).length; return <button key={c.id} className={`question-subject-button ${courseFilter === c.id ? 'selected' : ''}`} onClick={() => changeCourseFilter(c.id)} aria-pressed={courseFilter === c.id}><span className={`subject-icon subject-${c.color}`}>{c.icon}</span><strong>{c.name}</strong><small>{count} {count === 1 ? 'questão' : 'questões'}</small></button> })}</div></section>

    <div className="bank-filters"><label className="search-field"><Icon name="search" size={18}/><input value={search} onChange={e => { setSearch(e.target.value); resetQuestionSelection() }} placeholder="Buscar pergunta, tag ou explicação..." aria-label="Buscar questões"/>{search && <button onClick={() => setSearch('')} aria-label="Limpar busca"><Icon name="close" size={15}/></button>}</label><label className="filter-select"><Icon name="filter" size={16}/><select value={difficultyFilter} onChange={e => changeDifficultyFilter(e.target.value)} aria-label="Filtrar por dificuldade"><option value="all">Todas as dificuldades</option><option value="easy">Fácil</option><option value="medium">Intermediária</option><option value="hard">Difícil</option></select></label><button className={`filter-favorite ${favoritesOnly ? 'is-on' : ''}`} onClick={() => { setFavoritesOnly(!favoritesOnly); resetQuestionSelection() }} aria-pressed={favoritesOnly}><Icon name="heart" size={16}/><span>Favoritas</span></button></div>

    {mode === 'practice' ? <section className="practice-area">{!current ? <EmptyState icon="book-open" title="Nenhuma questão para praticar" description="Adicione uma questão ou altere os filtros para começar uma sessão." action={<Button variant="primary" onClick={() => { setEditing(undefined); setEditorOpen(true) }}><Icon name="plus" size={16}/> Criar questão</Button>}/> : <div className="practice-card"><div className="practice-topline"><span className="soft-chip">Questão {Math.max(1, filtered.findIndex(q => q.id === current.id) + 1)} de {filtered.length}</span><span className={`difficulty difficulty-${current.difficulty}`}>{difficultyLabels[current.difficulty]}</span><button className={`icon-button ${current.favorite ? 'favorite-on' : ''}`} onClick={() => toggleFavorite(current)} aria-label={current.favorite ? 'Remover favorita' : 'Adicionar favorita'}><Icon name="heart"/></button></div><p className="question-course-label">{data.courses.find(c => c.id === current.courseId)?.name ?? 'Sem disciplina'}</p><h2>{current.prompt}</h2><div className="practice-options">{current.options.map((option, i) => { const correct = answered && i === current.correctIndex; const wrong = answered && choice === i && i !== current.correctIndex; return <button key={`${current.id}-${i}`} className={`practice-option ${choice === i ? 'selected' : ''} ${correct ? 'correct' : ''} ${wrong ? 'wrong' : ''}`} onClick={() => !answered && setChoice(i)} disabled={answered}><span className="option-letter">{String.fromCharCode(65 + i)}</span><span>{option}</span>{correct && <Icon name="check" size={18}/>}</button> })}</div>{answered && <div className={`answer-feedback ${choice === current.correctIndex ? 'feedback-correct' : 'feedback-wrong'}`}><div className="feedback-title"><Icon name={choice === current.correctIndex ? 'circle-check' : 'alert'} size={19}/>{choice === current.correctIndex ? 'Muito bem! Resposta correta.' : `Ainda não. A resposta correta é ${String.fromCharCode(65 + current.correctIndex)}.`}</div>{current.explanation && <p>{current.explanation}</p>}</div>}<div className="practice-actions">{answered ? <Button variant="primary" onClick={nextQuestion}>Próxima questão <Icon name="arrow" size={16}/></Button> : <Button variant="primary" disabled={choice === null} onClick={submitAnswer}>Confirmar resposta <Icon name="check" size={16}/></Button>}<span className="practice-accuracy">{current.attempts ? `${Math.round(current.correctCount / current.attempts * 100)}% de acerto nesta questão` : 'Primeira tentativa'}</span></div></div>}</section> : <section className="question-list">{filtered.length ? filtered.map((q, index) => { const course = data.courses.find(c => c.id === q.courseId); const show = revealed.includes(q.id); const rate = q.attempts ? Math.round(q.correctCount / q.attempts * 100) : null; return <article className="question-item" key={q.id}><div className="question-item-head"><span className={`question-number subject-${course?.color ?? 'sage'}`}>{String(index + 1).padStart(2, '0')}</span><div className="question-item-meta"><span className="course-chip"><span>{course?.icon ?? '📚'}</span>{course?.name ?? 'Sem disciplina'}</span><span className={`difficulty difficulty-${q.difficulty}`}>{difficultyLabels[q.difficulty]}</span>{q.tags.slice(0, 2).map(tag => <span className="tag-chip" key={tag}>#{tag}</span>)}</div><div className="question-item-actions"><button className={`icon-button ${q.favorite ? 'favorite-on' : ''}`} onClick={() => toggleFavorite(q)} aria-label={q.favorite ? 'Remover favorita' : 'Favoritar'}><Icon name="heart" size={17}/></button><button className="icon-button" onClick={() => { setEditing(q); setEditorOpen(true) }} aria-label="Editar questão"><Icon name="edit" size={17}/></button><button className="icon-button danger-hover" onClick={() => removeQuestion(q)} aria-label="Excluir questão"><Icon name="trash" size={17}/></button></div></div><h3>{q.prompt}</h3><div className="question-item-footer"><span className="question-performance">{q.attempts ? <><Icon name="chart" size={14}/>{rate}% de acerto · {q.attempts} tentativa(s)</> : 'Ainda não praticada'}</span><div className="question-footer-actions"><button className="text-link" onClick={() => setRevealed(old => show ? old.filter(id => id !== q.id) : [...old, q.id])}>{show ? 'Ocultar resposta' : 'Ver resposta'}</button><button className="practice-small-button" onClick={() => startPractice(q.id, mode === 'mistakes')}><Icon name="play" size={14}/> Praticar</button></div></div>{show && <div className="answer-reveal"><p className="answer-label"><Icon name="check" size={16}/> Resposta correta</p><p><strong>{String.fromCharCode(65 + q.correctIndex)}.</strong> {q.options[q.correctIndex]}</p>{q.explanation && <p className="answer-explanation">{q.explanation}</p>}</div>}</article> }) : <EmptyState icon={mode === 'mistakes' ? 'circle-check' : 'book-open'} title={mode === 'mistakes' ? 'Nenhum erro para revisar' : 'Nada encontrado por aqui'} description={mode === 'mistakes' ? 'Quando errar uma questão durante a prática, ela aparecerá nesta lista.' : 'Tente outra busca ou crie a primeira questão da disciplina.'} action={mode !== 'mistakes' ? <Button variant="primary" onClick={() => { setEditing(undefined); setEditorOpen(true) }}><Icon name="plus" size={16}/> Nova questão</Button> : undefined}/>}</section>}

    {editorOpen && <QuestionEditor data={data} question={editing} onClose={() => { setEditorOpen(false); setEditing(undefined) }} onSave={saveQuestion}/>}
  </div>
}
