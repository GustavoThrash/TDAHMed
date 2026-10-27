import type { AppData, PdfBackupFile } from './types'
import { makeSeedData } from './seed'

const STORAGE_KEY = 'tdahmed-academic-v1'
const PDF_DB = 'tdahmed-academic-files'
const PDF_DB_VERSION = 1

export function loadAppData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return makeSeedData()
    const parsed = JSON.parse(raw) as AppData
    if (parsed?.version !== 1 || !Array.isArray(parsed.courses) || !Array.isArray(parsed.events) || !Array.isArray(parsed.questions)) return makeSeedData()
    return parsed
  } catch {
    return makeSeedData()
  }
}

export function saveAppData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function openPdfDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') return reject(new Error('Este navegador não oferece armazenamento local de arquivos.'))
    const req = indexedDB.open(PDF_DB, PDF_DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains('pdfs')) db.createObjectStore('pdfs', { keyPath: 'id' })
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error ?? new Error('Não foi possível abrir o armazenamento de PDFs.'))
  })
}

export async function savePdfBlob(id: string, blob: Blob, name: string): Promise<void> {
  const db = await openPdfDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pdfs', 'readwrite')
    tx.objectStore('pdfs').put({ id, blob, name, type: blob.type || 'application/pdf' })
    tx.oncomplete = () => { db.close(); resolve() }
    tx.onerror = () => { db.close(); reject(tx.error ?? new Error('Não foi possível guardar o PDF.')) }
    tx.onabort = () => { db.close(); reject(tx.error ?? new Error('O armazenamento do PDF foi cancelado.')) }
  })
}

export async function getPdfBlob(id: string): Promise<Blob | null> {
  const db = await openPdfDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pdfs', 'readonly')
    const req = tx.objectStore('pdfs').get(id)
    req.onsuccess = () => resolve(req.result?.blob ?? null)
    tx.onerror = () => reject(tx.error ?? new Error('Não foi possível abrir este PDF.'))
    tx.oncomplete = () => db.close()
  })
}

export async function deletePdfBlob(id: string): Promise<void> {
  const db = await openPdfDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pdfs', 'readwrite')
    tx.objectStore('pdfs').delete(id)
    tx.oncomplete = () => { db.close(); resolve() }
    tx.onerror = () => { db.close(); reject(tx.error ?? new Error('Não foi possível excluir o PDF.')) }
  })
}

export async function getPdfBackupFiles(data: AppData): Promise<PdfBackupFile[]> {
  const refs = data.courses.flatMap(course => course.materials.filter(m => m.kind === 'pdf' && m.fileId).map(m => ({ id: m.fileId!, name: m.title })))
  const files: PdfBackupFile[] = []
  let totalBytes = 0
  for (const ref of refs) {
    const blob = await getPdfBlob(ref.id)
    if (!blob) continue
    totalBytes += blob.size
    if (totalBytes > 25 * 1024 * 1024) throw new Error('Seus PDFs ultrapassam 25 MB. Faça backups menores ou baixe os PDFs separadamente antes de exportar.')
    const bytes = new Uint8Array(await blob.arrayBuffer())
    let binary = ''
    const chunk = 0x8000
    for (let i = 0; i < bytes.length; i += chunk) binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
    files.push({ id: ref.id, name: ref.name, mime: blob.type || 'application/pdf', base64: btoa(binary) })
  }
  return files
}

export async function restorePdfBackupFiles(files: PdfBackupFile[]): Promise<void> {
  for (const item of files) {
    const binary = atob(item.base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    await savePdfBlob(item.id, new Blob([bytes], { type: item.mime || 'application/pdf' }), item.name)
  }
}

export function parseBackup(raw: string): { data: AppData; files: PdfBackupFile[] } {
  let parsed: unknown
  try { parsed = JSON.parse(raw) } catch { throw new Error('O arquivo não é um JSON válido.') }
  const obj = parsed as { format?: unknown; version?: unknown; data?: unknown; files?: unknown }
  if (obj?.format !== 'tdahmed-academic-backup' || obj.version !== 1 || !obj.data) throw new Error('Este arquivo não é um backup válido do TDAHMED Acadêmico.')
  const data = obj.data as AppData
  if (data.version !== 1 || !Array.isArray(data.courses) || !Array.isArray(data.questions) || !Array.isArray(data.events)) throw new Error('O backup está incompleto ou tem uma estrutura incompatível.')
  if (!Array.isArray(data.mistakeIds) || typeof data.profileName !== 'string' || !Array.isArray(data.courses)) throw new Error('O backup não contém todas as informações necessárias.')
  const files = Array.isArray(obj.files) ? obj.files.filter((f): f is PdfBackupFile => !!f && typeof f.id === 'string' && typeof f.base64 === 'string' && typeof f.name === 'string') : []
  const totalEncodedBytes = files.reduce((sum, f) => sum + Math.floor(f.base64.length * 3 / 4), 0)
  if (totalEncodedBytes > 26 * 1024 * 1024) throw new Error('Este backup contém mais de 25 MB de PDFs. Remova arquivos ou use backups menores para restaurar.')
  return { data, files }
}

export function makeId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}

export const todayString = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
export const addDateDays = (dateString: string, days: number) => {
  const d = new Date(`${dateString}T12:00:00`)
  d.setDate(d.getDate() + days)
  return todayString(d)
}
