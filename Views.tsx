import { useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'
import type { Task } from './db'
import { addDays, errMsg, exportBackup, getMeta, newId, parseBackup, restoreTasks, setMeta, toDateStr } from './db'

export interface Api {
  tasks: Task[]
  save: (t: Task) => Promise<void>
  remove: (id: string) => Promise<void>
  reload: () => Promise<void>
}

export const LIMITS =
  'Seus dados ficam só neste aparelho e navegador. Não há sincronização entre dispositivos nem cópia na nuvem, e limpar os dados do navegador ou desinstalar o app pode apagá-los. O armazenamento local não é criptografado. Faça backups com frequência.'

const card = 'rounded-2xl border border-stone-200 bg-white p-4'
const btn = 'rounded-xl border border-stone-300 px-3 py-2 text-sm hover:bg-stone-100'
const btnMain = 'rounded-xl bg-navy px-3 py-2 text-sm text-white hover:opacity-90'
const fmt = (d: string) => d.split('-').reverse().join('/')

function Row({ t, api, today }: { t: Task; api: Api; today: string }) {
  const done = t.status === 'done'
  const late = !done && !!t.due && t.due < today
  const activePrio = api.tasks.filter(x => x.priority && x.status !== 'done').length
  const togglePrio = () => {
    if (!t.priority && activePrio >= 3) return alert('Você já tem 3 prioridades ativas. Conclua ou retire uma antes de escolher outra.')
    api.save({ ...t, priority: !t.priority })
  }
  const meta = [
    t.due ? `${late ? 'Atrasada, prazo' : 'Prazo'} ${fmt(t.due)}` : '',
    t.status === 'inbox' ? 'Na caixa de entrada' : t.status === 'postponed' ? 'Adiada' : '',
  ].filter(Boolean).join('. ')
  return (
    <li className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2">
      <input type="checkbox" className="h-5 w-5 shrink-0 accent-olive" checked={done} aria-label={`Concluir: ${t.title}`}
        onChange={() => api.save({ ...t, status: done ? 'todo' : 'done' })} />
      <div className="min-w-0 flex-1">
        <p className={`break-words ${done ? 'text-stone-400 line-through' : ''}`}>{t.title}</p>
        {meta && <p className={`text-xs ${late ? 'text-terracotta' : 'text-stone-500'}`}>{meta}</p>}
      </div>
      {t.status === 'inbox' && <button className="text-xs text-navy underline" onClick={() => api.save({ ...t, status: 'todo' })}>Organizar</button>}
      {!done && <button className="text-xs text-stone-600 underline" onClick={() => api.save({ ...t, due: addDays(today, 1), status: 'postponed' })}>Adiar</button>}
      <button className={`px-1 text-lg ${t.priority ? 'text-terracotta' : 'text-stone-300'}`} aria-label="Marcar como prioridade" aria-pressed={t.priority} onClick={togglePrio}>★</button>
      <button className="px-1 text-stone-400 hover:text-terracotta" aria-label={`Excluir: ${t.title}`}
        onClick={() => { if (confirm('Excluir esta tarefa?')) api.remove(t.id) }}>✕</button>
    </li>
  )
}

function Section({ title, items, api, today, empty }: { title: string; items: Task[]; api: Api; today: string; empty?: string }) {
  if (!items.length && !empty) return null
  return (
    <section className="mb-6">
      <h2 className="mb-2 font-serif text-lg">{title}</h2>
      {items.length
        ? <ul className="space-y-2">{items.map(t => <Row key={t.id} t={t} api={api} today={today} />)}</ul>
        : <p className="text-sm text-stone-500">{empty}</p>}
    </section>
  )
}

export function Home({ api }: { api: Api }) {
  const today = toDateStr(new Date())
  const open = api.tasks.filter(t => t.status !== 'done')
  const prio = open.filter(t => t.priority).slice(0, 3)
  const rest = open.filter(t => !prio.includes(t))
  const total = api.tasks.length
  const done = total - open.length
  const date = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
  return (
    <div>
      <h1 className="mb-6 font-serif text-3xl first-letter:capitalize">{date}</h1>
      {total === 0 && (
        <div className={`${card} mb-6`}>
          <p className="font-serif text-lg">Comece por aqui</p>
          <p className="mt-1 text-sm text-stone-600">Use o botão “Capturar agora” para anotar a primeira tarefa ou ideia. O que não tiver categoria fica na caixa de entrada até você organizar.</p>
        </div>
      )}
      <Section title="Prioridades do dia" items={prio} api={api} today={today} empty="Escolha até três prioridades tocando na estrela de uma tarefa." />
      <Section title="Atrasadas" items={rest.filter(t => t.due && t.due < today)} api={api} today={today} />
      <Section title="Para hoje" items={rest.filter(t => t.due === today)} api={api} today={today} />
      <Section title="Caixa de entrada" items={rest.filter(t => t.status === 'inbox')} api={api} today={today} />
      {total > 0 && (
        <div className={card}>
          <p className="text-sm text-stone-600">{done} de {total} tarefas concluídas</p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-200"><div className="h-full bg-olive" style={{ width: `${(done / total) * 100}%` }} /></div>
        </div>
      )}
    </div>
  )
}

type Filter = 'today' | 'next' | 'late' | 'open' | 'done'
const FILTERS: { id: Filter; label: string }[] = [
  { id: 'open', label: 'Pendentes' }, { id: 'today', label: 'Hoje' }, { id: 'next', label: 'Próximas' },
  { id: 'late', label: 'Atrasadas' }, { id: 'done', label: 'Concluídas' },
]

export function Tasks({ api }: { api: Api }) {
  const today = toDateStr(new Date())
  const [title, setTitle] = useState('')
  const [due, setDue] = useState('')
  const [f, setF] = useState<Filter>('open')
  const test: Record<Filter, (t: Task) => boolean> = {
    open: t => t.status !== 'done',
    today: t => t.status !== 'done' && t.due === today,
    next: t => t.status !== 'done' && !!t.due && t.due > today,
    late: t => t.status !== 'done' && !!t.due && t.due < today,
    done: t => t.status === 'done',
  }
  const items = api.tasks.filter(test[f]).sort((a, b) => (a.due ?? '9999').localeCompare(b.due ?? '9999') || a.createdAt - b.createdAt)
  const add = () => {
    const v = title.trim()
    if (!v) return
    api.save({ id: newId(), title: v, status: 'todo', due: due || undefined, priority: false, createdAt: Date.now() })
    setTitle(''); setDue('')
  }
  return (
    <div>
      <h1 className="mb-4 font-serif text-3xl">Tarefas</h1>
      <div className={`${card} mb-4 flex flex-wrap gap-2`}>
        <input className="min-w-0 flex-1 rounded-xl border border-stone-300 px-3 py-2" placeholder="Nova tarefa" value={title}
          onChange={e => setTitle(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') add() }} aria-label="Título da tarefa" />
        <input type="date" className="rounded-xl border border-stone-300 px-3 py-2" value={due} onChange={e => setDue(e.target.value)} aria-label="Prazo" />
        <button className={btnMain} onClick={add}>Adicionar</button>
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map(x => (
          <button key={x.id} onClick={() => setF(x.id)} aria-pressed={f === x.id}
            className={`rounded-full border px-3 py-1 text-sm ${f === x.id ? 'border-navy bg-navy text-white' : 'border-stone-300 hover:bg-stone-100'}`}>{x.label}</button>
        ))}
      </div>
      {items.length
        ? <ul className="space-y-2">{items.map(t => <Row key={t.id} t={t} api={api} today={today} />)}</ul>
        : <p className="text-sm text-stone-500">Nenhuma tarefa nesta lista.</p>}
    </div>
  )
}

const fmtDT = (iso: string) => (iso ? new Date(iso).toLocaleString('pt-BR') : 'não informada')

export function Backup({ api }: { api: Api }) {
  const [last, setLast] = useState('')
  const [persisted, setPersisted] = useState<boolean | null>(null)
  const [ok, setOk] = useState('')
  const [err, setErr] = useState('')
  const [pre, setPre] = useState<{ name: string; tasks: Task[]; skipped: number; exportedAt: string } | null>(null)

  useEffect(() => {
    getMeta<string>('lastBackup').then(v => setLast(v ?? '')).catch(() => {})
    ;(navigator.storage?.persisted ? navigator.storage.persisted() : Promise.resolve(false)).then(setPersisted).catch(() => setPersisted(false))
  }, [])

  const exportNow = async () => {
    setOk(''); setErr('')
    try {
      const blob = new Blob([await exportBackup()], { type: 'application/json' })
      if (blob.size === 0) throw new Error('O arquivo gerado está vazio.')
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `tdahmed-backup-${toDateStr(new Date())}.json`
      document.body.appendChild(a); a.click(); a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 10000)
      const now = new Date().toISOString()
      await setMeta('lastBackup', now); setLast(now)
      setOk(`Arquivo gerado: ${(blob.size / 1024).toFixed(1)} KB, ${api.tasks.length} tarefa(s). Confirme que ele foi salvo no seu aparelho.`)
    } catch (x) { setErr(errMsg(x)) }
  }

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    setOk(''); setErr(''); setPre(null)
    if (!file) return
    try { setPre({ name: file.name, ...parseBackup(await file.text()) }) } catch (x) { setErr(errMsg(x)) }
  }

  const restore = async (mode: 'merge' | 'replace') => {
    if (!pre) return
    if (mode === 'replace' && !confirm('Substituir apaga todas as tarefas atuais e usa só as do backup. Continuar?')) return
    try {
      const n = await restoreTasks(pre.tasks, mode)
      await api.reload()
      setOk(mode === 'merge' ? `${n} tarefa(s) nova(s) adicionada(s). As que já existiam foram mantidas.` : `${n} tarefa(s) restauradas.`)
      setPre(null)
    } catch (x) { setErr(errMsg(x)) }
  }

  return (
    <div>
      <h1 className="mb-4 font-serif text-3xl">Backup e restauração</h1>
      <p className={`${card} mb-4 text-sm text-stone-700`}>{LIMITS}</p>
      <div className={`${card} mb-4`}>
        <p className="text-sm text-stone-600">Último backup: {fmtDT(last)}</p>
        <p className="mb-3 text-sm text-stone-600">
          Proteção contra limpeza automática: {persisted === null ? 'verificando' : persisted ? 'ativa neste navegador' : 'não concedida pelo navegador'}
        </p>
        <button className={btnMain} onClick={exportNow}>Baixar backup</button>
      </div>
      <div className={card}>
        <p className="mb-2 font-serif text-lg">Restaurar um backup</p>
        <input type="file" accept="application/json,.json" onChange={onFile} aria-label="Escolher arquivo de backup" className="text-sm" />
        {pre && (
          <div className="mt-3 rounded-xl bg-stone-50 p-3 text-sm">
            <p>{pre.name}: backup de {fmtDT(pre.exportedAt)} com {pre.tasks.length} tarefa(s){pre.skipped ? `, ${pre.skipped} ignorada(s) por dados inválidos` : ''}.</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button className={btnMain} onClick={() => restore('merge')}>Adicionar sem apagar nada</button>
              <button className={btn} onClick={() => restore('replace')}>Substituir tudo</button>
              <button className={btn} onClick={() => setPre(null)}>Cancelar</button>
            </div>
          </div>
        )}
      </div>
      {ok && <p role="status" className="mt-4 text-sm text-olive">{ok}</p>}
      {err && <p role="alert" className="mt-4 text-sm text-terracotta">{err}</p>}
    </div>
  )
}
