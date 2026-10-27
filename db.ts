// Camada de armazenamento local (IndexedDB). Nada sai do aparelho.
export type Status = 'inbox' | 'todo' | 'doing' | 'done' | 'postponed'
export interface Task {
  id: string
  title: string
  status: Status
  due?: string // AAAA-MM-DD, no fuso do aparelho
  priority: boolean
  createdAt: number
}

const DB_NAME = 'tdahmed'
const DB_VERSION = 1 // aumente e trate em onupgradeneeded ao mudar a estrutura
export const BACKUP_VERSION = 1
const STATUSES: Status[] = ['inbox', 'todo', 'doing', 'done', 'postponed']

let dbp: Promise<IDBDatabase> | null = null
function open(): Promise<IDBDatabase> {
  if (!dbp) {
    dbp = new Promise((res, rej) => {
      if (typeof indexedDB === 'undefined') return rej(new Error('Este navegador não oferece armazenamento local (IndexedDB).'))
      const r = indexedDB.open(DB_NAME, DB_VERSION)
      r.onupgradeneeded = () => {
        const db = r.result
        if (!db.objectStoreNames.contains('tasks')) db.createObjectStore('tasks', { keyPath: 'id' })
        if (!db.objectStoreNames.contains('meta')) db.createObjectStore('meta')
      }
      r.onsuccess = () => res(r.result)
      r.onerror = () => { dbp = null; rej(r.error ?? new Error('Falha ao abrir o armazenamento local.')) }
    })
  }
  return dbp
}

function run<T>(store: string, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return open().then(db => new Promise<T>((res, rej) => {
    const tx = db.transaction(store, mode)
    const req = fn(tx.objectStore(store))
    tx.oncomplete = () => res(req.result)
    tx.onerror = () => rej(tx.error ?? new Error('Falha ao gravar os dados.'))
    tx.onabort = () => rej(tx.error ?? new Error('Gravação cancelada. Verifique o espaço disponível no aparelho.'))
  }))
}

export const listTasks = () => run<Task[]>('tasks', 'readonly', s => s.getAll())
export const putTask = (t: Task) => run('tasks', 'readwrite', s => s.put(t))
export const deleteTask = (id: string) => run('tasks', 'readwrite', s => s.delete(id))
export const getMeta = <T>(k: string) => run<T | undefined>('meta', 'readonly', s => s.get(k))
export const setMeta = (k: string, v: unknown) => run('meta', 'readwrite', s => s.put(v, k))

export const errMsg = (e: unknown) => (e instanceof Error ? e.message : 'Erro inesperado.')
export const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Date.now().toString(36) + Math.random().toString(36).slice(2)

export const toDateStr = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
export function addDays(s: string, n: number) {
  const d = new Date(s + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return toDateStr(d)
}

export async function ensurePersistence(): Promise<boolean> {
  try {
    if (navigator.storage?.persist) return (await navigator.storage.persisted()) || (await navigator.storage.persist())
  } catch { /* o navegador pode recusar */ }
  return false
}

// ---- Backup (formato versionado: { format, version, exportedAt, data }) ----
export async function exportBackup(): Promise<string> {
  const tasks = await listTasks()
  return JSON.stringify({ format: 'tdahmed-backup', version: BACKUP_VERSION, exportedAt: new Date().toISOString(), data: { tasks } }, null, 2)
}

export function parseBackup(text: string): { tasks: Task[]; skipped: number; exportedAt: string } {
  let o: any
  try { o = JSON.parse(text) } catch { throw new Error('O arquivo não é um JSON válido.') }
  if (!o || o.format !== 'tdahmed-backup' || typeof o.version !== 'number') throw new Error('Este arquivo não é um backup do TDAHMED.')
  if (o.version > BACKUP_VERSION) throw new Error('Este backup foi criado por uma versão mais nova do aplicativo.')
  if (!Array.isArray(o.data?.tasks)) throw new Error('O backup não contém a lista de tarefas.')
  const tasks: Task[] = []
  let skipped = 0
  for (const x of o.data.tasks) {
    if (x && typeof x.id === 'string' && typeof x.title === 'string' && STATUSES.includes(x.status)) {
      tasks.push({
        id: x.id,
        title: x.title.slice(0, 500),
        status: x.status,
        due: typeof x.due === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x.due) ? x.due : undefined,
        priority: x.priority === true,
        createdAt: typeof x.createdAt === 'number' ? x.createdAt : Date.now(),
      })
    } else skipped++
  }
  return { tasks, skipped, exportedAt: typeof o.exportedAt === 'string' ? o.exportedAt : '' }
}

// merge: só adiciona o que ainda não existe. replace: apaga tudo e usa o backup (numa única transação).
export async function restoreTasks(tasks: Task[], mode: 'merge' | 'replace'): Promise<number> {
  const db = await open()
  return new Promise<number>((res, rej) => {
    const tx = db.transaction('tasks', 'readwrite')
    const s = tx.objectStore('tasks')
    let added = 0
    if (mode === 'replace') {
      s.clear()
      tasks.forEach(t => s.put(t))
      added = tasks.length
    } else {
      for (const t of tasks) {
        const g = s.get(t.id)
        g.onsuccess = () => { if (!g.result) { s.put(t); added++ } }
      }
    }
    tx.oncomplete = () => res(added)
    tx.onerror = () => rej(tx.error ?? new Error('Falha ao restaurar.'))
    tx.onabort = () => rej(tx.error ?? new Error('Restauração cancelada. Nada foi alterado.'))
  })
}
