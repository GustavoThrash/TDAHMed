import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import type { AppData } from '../types'
import { getPdfBackupFiles, parseBackup, restorePdfBackupFiles } from '../storage'
import { Button, Icon, PageTitle } from './UI'

interface Props { data: AppData; updateData: (updater: (current: AppData) => AppData) => void; replaceData: (data: AppData) => void; notify: (message: string) => void }

export default function Backup({ data, updateData, replaceData, notify }: Props) {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)
  const importRef = useRef<HTMLInputElement>(null)
  const questionCount = data.questions.length
  const eventCount = data.events.length
  const topicCount = data.courses.reduce((sum, c) => sum + c.topics.length, 0)
  const pdfCount = data.courses.reduce((sum, c) => sum + c.materials.filter(m => m.kind === 'pdf').length, 0)
  const linkCount = data.courses.reduce((sum, c) => sum + c.materials.filter(m => m.kind === 'link').length, 0)

  const exportBackup = async () => {
    setBusy(true); setMessage(null)
    try {
      const files = await getPdfBackupFiles(data)
      const payload = { format: 'tdahmed-academic-backup', version: 1, exportedAt: new Date().toISOString(), data, files }
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = `tdahmed-backup-${new Date().toISOString().slice(0, 10)}.json`; document.body.appendChild(a); a.click(); a.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 30000)
      setMessage({ kind: 'success', text: `Backup gerado com ${data.courses.length} disciplinas, ${questionCount} questões, ${eventCount} compromissos e ${files.length} PDF(s). Guarde o arquivo em um local seguro.` })
      notify('Backup exportado com sucesso.')
    } catch (error) {
      setMessage({ kind: 'error', text: error instanceof Error ? error.message : 'Não foi possível gerar o backup.' })
    } finally { setBusy(false) }
  }

  const importFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setMessage(null)
    if (!window.confirm('Importar este backup substituirá os dados atuais do TDAHMED neste navegador. Exporte o estado atual antes de continuar, caso queira preservá-lo. Deseja continuar?')) return
    setBusy(true)
    try {
      const parsed = parseBackup(await file.text())
      if (parsed.files.length) await restorePdfBackupFiles(parsed.files)
      replaceData(parsed.data)
      setMessage({ kind: 'success', text: `Backup restaurado: ${parsed.data.courses.length} disciplinas, ${parsed.data.questions.length} questões e ${parsed.data.events.length} compromissos. ${parsed.files.length} arquivo(s) PDF importado(s).` })
      notify('Backup restaurado neste navegador.')
    } catch (error) {
      setMessage({ kind: 'error', text: error instanceof Error ? error.message : 'Não foi possível importar este arquivo.' })
    } finally { setBusy(false) }
  }

  return <div className="backup-page"><PageTitle eyebrow="SEUS DADOS" title="Backup e preferências" description="Proteja seu planejamento e leve seus dados com você quando necessário."/>
    <section className="backup-hero"><div className="backup-hero-icon"><Icon name="archive" size={27}/></div><div className="backup-hero-copy"><span className="eyebrow">CONTROLE DOS SEUS DADOS</span><h2>Seu semestre, sempre protegido.</h2><p>Exporte uma cópia de suas disciplinas, questões, calendário e materiais para restaurar em outro navegador.</p></div><span className="backup-shield">✦</span></section>
    <div className="backup-grid"><section className="panel backup-card"><div className="backup-card-head"><div className="backup-action-icon"><Icon name="download" size={21}/></div><span className="soft-chip">Recomendado</span></div><h2>Exportar backup</h2><p>Gera um arquivo JSON que inclui seus dados acadêmicos e os PDFs anexados, até o limite de exportação.</p><div className="backup-content-counts"><span><Icon name="layers" size={15}/>{data.courses.length} disciplinas</span><span><Icon name="book-open" size={15}/>{questionCount} questões</span><span><Icon name="calendar" size={15}/>{eventCount} compromissos</span><span><Icon name="file" size={15}/>{pdfCount} PDFs</span></div><Button variant="primary" className="full-width" onClick={exportBackup} disabled={busy}><Icon name="download" size={17}/>{busy ? 'Preparando arquivo...' : 'Baixar backup completo'}</Button></section>
    <section className="panel backup-card"><div className="backup-card-head"><div className="backup-action-icon backup-import-icon"><Icon name="upload" size={21}/></div><span className="soft-chip">Transferir</span></div><h2>Restaurar backup</h2><p>Carregue um backup exportado anteriormente para recuperar as informações em um navegador compatível.</p><div className="backup-import-note"><Icon name="alert" size={16}/><span>A restauração substitui os dados atuais deste navegador. Faça uma exportação antes de substituir.</span></div><input ref={importRef} type="file" accept="application/json,.json" className="visually-hidden" onChange={importFile}/><Button className="full-width" onClick={() => importRef.current?.click()} disabled={busy}><Icon name="upload" size={17}/>{busy ? 'Restaurando...' : 'Escolher arquivo de backup'}</Button></section></div>
    {message && <div className={`backup-message ${message.kind}`} role={message.kind === 'error' ? 'alert' : 'status'}><Icon name={message.kind === 'success' ? 'circle-check' : 'alert'} size={19}/><span>{message.text}</span></div>}
    <section className="panel profile-settings"><div className="settings-section-heading"><div className="settings-icon"><Icon name="graduation" size={20}/></div><div><h2>Personalizar seu espaço</h2><p>Use seu nome no painel inicial e mantenha a área acadêmica com a sua cara.</p></div></div><label className="field profile-field"><span>Como você quer ser chamada(o)?</span><div className="profile-input-row"><input maxLength={48} value={data.profileName} onChange={e => updateData(old => ({ ...old, profileName: e.target.value }))} placeholder="Ex.: Samy"/><span className="input-save-indicator"><Icon name="check" size={14}/> Salvo automaticamente</span></div></label></section>
    <section className="data-limitations"><div className="limitations-icon"><Icon name="alert" size={19}/></div><div><h3>Entenda onde seus dados ficam</h3><p>O GitHub Pages hospeda o site, mas não é um banco de dados pessoal. Neste momento, suas informações ficam no armazenamento local do navegador em que você as criou. Celular, tablet e computador não sincronizam automaticamente. Para transferir dados, use o backup completo; para sincronização automática no futuro, será necessário conectar um serviço de banco de dados e autenticação.</p><p>Os PDFs anexados ficam no armazenamento local do navegador. Backups podem ficar grandes; se o conjunto de PDFs ultrapassar 25 MB, exporte menos arquivos por vez ou guarde os PDFs originais separadamente.</p></div></section>
    <section className="backup-inventory"><div><h3>O que está guardado neste navegador</h3><p>Contagem atual dos seus registros.</p></div><div className="inventory-list"><span><strong>{data.courses.length}</strong> disciplinas</span><span><strong>{topicCount}</strong> tópicos</span><span><strong>{questionCount}</strong> questões</span><span><strong>{eventCount}</strong> eventos</span><span><strong>{pdfCount + linkCount}</strong> materiais</span><span><strong>{data.mistakeIds.length}</strong> para revisar</span></div></section>
  </div>
}
