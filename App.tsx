import { useCallback, useEffect, useState } from 'react'
import type { Task } from './db'
import { deleteTask, ensurePersistence, errMsg, getMeta, listTasks, newId, putTask, setMeta } from './db'
import { Backup, Home, LIMITS, Tasks } from './Views'
import type { Api } from './Views'

type View = 'home' | 'tasks' | 'backup'
const NAV: { id: View; label: string }[] = [
  { id: 'home', label: 'Início' },
  { id: 'tasks', label: 'Tarefas' },
  { id: 'backup', label: 'Backup' },
]

function Capture({ onSave, onClose }: { onSave: (t: Task) => void; onClose: () => void }) {
  const [text, setText] = useState('')
  const submit = () => {
    const v = text.trim()
    if (!v) return
    onSave({ id: newId(), title: v, status: 'inbox', priority: false, createdAt: Date.now() })
    onClose()
  }
  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/30 p-4 sm:items-center" role="dialog" aria-modal="true" aria-label="Capturar agora" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-lg" onClick={e => e.stopPropagation()}>
        <input autoFocus className="w-full rounded-xl border border-stone-300 px-3 py-2" placeholder="O que você quer registrar?" value={text}
          onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') onClose() }} aria-label="Ideia, tarefa ou data" />
        <p className="mt-2 text-xs text-stone-500">Vai para a caixa de entrada. Você organiza depois.</p>
        <div className="mt-3 flex justify-end gap-2">
          <button className="rounded-xl border border-stone-300 px-3 py-2 text-sm" onClick={onClose}>Cancelar</button>
          <button className="rounded-xl bg-terracotta px-3 py-2 text-sm text-white" onClick={submit}>Salvar na caixa de entrada</button>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [view, setView] = useState<View>('home')
  const [tasks, setTasks] = useState<Task[]>([])
  const [error, setError] = useState('')
  const [capture, setCapture] = useState(false)
  const [welcome, setWelcome] = useState(false)

  const reload = useCallback(async () => {
    try { setTasks(await listTasks()); setError('') } catch (e) { setError(errMsg(e)) }
  }, [])

  useEffect(() => {
    ;(async () => {
      await reload()
      try { setWelcome(!(await getMeta<boolean>('welcomed'))) } catch { /* sem armazenamento */ }
      ensurePersistence()
    })()
  }, [reload])

  const api: Api = {
    tasks,
    reload,
    save: async t => { try { await putTask(t); await reload() } catch (e) { setError(errMsg(e)) } },
    remove: async id => { try { await deleteTask(id); await reload() } catch (e) { setError(errMsg(e)) } },
  }

  const closeWelcome = async () => { setWelcome(false); try { await setMeta('welcomed', true) } catch { /* ignora */ } }

  return (
    <div className="min-h-screen md:flex">
      <nav className="hidden w-52 shrink-0 border-r border-stone-200 p-4 md:block" aria-label="Principal">
        <p className="mb-6 font-serif text-xl text-navy">TDAHMED</p>
        <ul className="space-y-1">
          {NAV.map(n => (
            <li key={n.id}>
              <button onClick={() => setView(n.id)} aria-current={view === n.id ? 'page' : undefined}
                className={`w-full rounded-xl px-3 py-2 text-left ${view === n.id ? 'bg-navy text-white' : 'hover:bg-stone-100'}`}>{n.label}</button>
            </li>
          ))}
        </ul>
      </nav>

      <main className="mx-auto w-full max-w-2xl flex-1 p-4 pb-32 md:p-8 md:pb-24">
        {welcome && (
          <div className="mb-6 rounded-2xl border border-navy/30 bg-white p-4 text-sm" role="note">
            <p className="font-serif text-lg">Antes de começar</p>
            <p className="mt-1 text-stone-700">{LIMITS}</p>
            <button className="mt-3 rounded-xl border border-stone-300 px-3 py-2" onClick={closeWelcome}>Entendi</button>
          </div>
        )}
        {error && <p role="alert" className="mb-4 rounded-xl border border-terracotta/40 bg-white p-3 text-sm text-terracotta">{error}</p>}
        {view === 'home' && <Home api={api} />}
        {view === 'tasks' && <Tasks api={api} />}
        {view === 'backup' && <Backup api={api} />}
      </main>

      <button onClick={() => setCapture(true)}
        className="fixed bottom-20 right-4 z-20 rounded-full bg-terracotta px-5 py-3 text-white shadow-lg md:bottom-6 md:right-6">Capturar agora</button>

      <nav className="fixed inset-x-0 bottom-0 z-10 flex border-t border-stone-200 bg-ivory md:hidden" aria-label="Principal">
        {NAV.map(n => (
          <button key={n.id} onClick={() => setView(n.id)} aria-current={view === n.id ? 'page' : undefined}
            className={`flex-1 py-4 text-sm ${view === n.id ? 'font-semibold text-navy' : 'text-stone-600'}`}>{n.label}</button>
        ))}
      </nav>

      {capture && <Capture onSave={t => { api.save(t) }} onClose={() => setCapture(false)} />}
    </div>
  )
}
