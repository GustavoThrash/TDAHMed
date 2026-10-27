import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type IconName = 'home' | 'book' | 'calendar' | 'layers' | 'archive' | 'search' | 'plus' | 'close' | 'left' | 'right' | 'clock' | 'check' | 'file' | 'heart' | 'filter' | 'edit' | 'trash' | 'target' | 'chart' | 'graduation' | 'refresh' | 'play' | 'sparkles' | 'download' | 'upload' | 'external' | 'menu' | 'arrow' | 'pin' | 'more' | 'chevron' | 'bookmark' | 'book-open' | 'circle-check' | 'alert' | 'calendar-plus' | 'folder' | 'settings' | 'sun'

export function Icon({ name, size = 20, stroke = 1.8 }: { name: IconName; size?: number; stroke?: number }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: stroke, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  let drawing: ReactNode
  switch (name) {
    case 'home': drawing = <><path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9"/><path d="M9 20v-6h6v6"/></>; break
    case 'book': drawing = <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 1 4 17.5z"/><path d="M4 16.5A2.5 2.5 0 0 1 6.5 14H20"/><path d="M8 7h8"/></>; break
    case 'calendar': drawing = <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01"/></>; break
    case 'layers': drawing = <><path d="m12 3 9 5-9 5-9-5z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/></>; break
    case 'archive': drawing = <><rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v12h14V8M10 12h4"/></>; break
    case 'search': drawing = <><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></>; break
    case 'plus': drawing = <><path d="M12 5v14M5 12h14"/></>; break
    case 'close': drawing = <><path d="m6 6 12 12M18 6 6 18"/></>; break
    case 'left': drawing = <><path d="m14 18-6-6 6-6"/></>; break
    case 'right': drawing = <><path d="m10 18 6-6-6-6"/></>; break
    case 'clock': drawing = <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>; break
    case 'check': drawing = <><path d="m5 12 4 4L19 6"/></>; break
    case 'file': drawing = <><path d="M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10z"/><path d="M13 3v7h7M8 14h8M8 17h6"/></>; break
    case 'heart': drawing = <path d="M20.8 8.8c0 5.2-8.8 10.2-8.8 10.2S3.2 14 3.2 8.8A4.8 4.8 0 0 1 12 6.1a4.8 4.8 0 0 1 8.8 2.7Z"/>; break
    case 'filter': drawing = <><path d="M4 6h16M7 12h10M10 18h4"/><circle cx="8" cy="6" r="1" fill="currentColor"/><circle cx="15" cy="12" r="1" fill="currentColor"/></>; break
    case 'edit': drawing = <><path d="M12 20h9"/><path d="m16.5 3.5 4 4L8 20l-5 1 1-5z"/></>; break
    case 'trash': drawing = <><path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15M10 10v7M14 10v7"/></>; break
    case 'target': drawing = <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1" fill="currentColor"/></>; break
    case 'chart': drawing = <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></>; break
    case 'graduation': drawing = <><path d="m2 9 10-5 10 5-10 5z"/><path d="M6 11v5c4 3 8 3 12 0v-5M22 9v7"/></>; break
    case 'refresh': drawing = <><path d="M20 7v5h-5M4 17v-5h5"/><path d="M5.5 9A7 7 0 0 1 18 6l2 6M4 12l2 6a7 7 0 0 0 12.5-3"/></>; break
    case 'play': drawing = <path d="m8 5 11 7-11 7z"/>; break
    case 'sparkles': drawing = <><path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5z"/><path d="m19 15 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7z"/></>; break
    case 'download': drawing = <><path d="M12 3v12m-5-5 5 5 5-5"/><path d="M5 17v4h14v-4"/></>; break
    case 'upload': drawing = <><path d="M12 16V4m-5 5 5-5 5 5"/><path d="M5 16v5h14v-5"/></>; break
    case 'external': drawing = <><path d="M14 4h6v6M20 4l-9 9"/><path d="M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6"/></>; break
    case 'menu': drawing = <><path d="M4 6h16M4 12h16M4 18h16"/></>; break
    case 'arrow': drawing = <><path d="M5 12h14M13 6l6 6-6 6"/></>; break
    case 'pin': drawing = <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>; break
    case 'more': drawing = <><circle cx="5" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="19" cy="12" r="1" fill="currentColor"/></>; break
    case 'chevron': drawing = <path d="m9 18 6-6-6-6"/>; break
    case 'bookmark': drawing = <path d="M6 4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17l-6-4-6 4z"/>; break
    case 'book-open': drawing = <><path d="M3 5.5A2.5 2.5 0 0 1 5.5 3H11v17H5.5A2.5 2.5 0 0 0 3 22z"/><path d="M21 5.5A2.5 2.5 0 0 0 18.5 3H13v17h5.5a2.5 2.5 0 0 1 2.5 2z"/></>; break
    case 'circle-check': drawing = <><circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/></>; break
    case 'alert': drawing = <><path d="M10.3 4.3 2.6 18a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/></>; break
    case 'calendar-plus': drawing = <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18M12 13v5M9.5 15.5h5"/></>; break
    case 'folder': drawing = <><path d="M3 6a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></>; break
    case 'settings': drawing = <><circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a7.4 7.4 0 0 1-1.5.9l-.3 1.8h-2.8l-.3-1.8a7.4 7.4 0 0 1-1.5-.9l-1.7.7-1.4-2.4 1.4-1.1a7.5 7.5 0 0 1 0-1.8l-1.4-1.1 1.4-2.4 1.7.7a7.4 7.4 0 0 1 1.5-.9l.3-1.8h2.8l.3 1.8a7.4 7.4 0 0 1 1.5.9l1.7-.7 1.4 2.4-1.4 1.1a7.5 7.5 0 0 1 0 1.8Z" transform="translate(-1 -2) scale(1.04)"/></>; break
    case 'sun': drawing = <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></>; break
    default: drawing = <circle cx="12" cy="12" r="8"/> 
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...common}>{drawing}</svg>
}

export function Button({ children, variant = 'secondary', className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger' }) {
  return <button className={`button button-${variant} ${className}`.trim()} {...props}>{children}</button>
}

export function PageTitle({ eyebrow, title, description, action }: { eyebrow?: string; title: ReactNode; description?: string; action?: ReactNode }) {
  return <div className="page-title-row"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1 className="page-title">{title}</h1>{description && <p className="page-description">{description}</p>}</div>{action && <div className="page-title-action">{action}</div>}</div>
}

export function EmptyState({ icon = 'sparkles', title, description, action }: { icon?: IconName; title: string; description: string; action?: ReactNode }) {
  return <div className="empty-state"><div className="empty-icon"><Icon name={icon} size={24}/></div><h3>{title}</h3><p>{description}</p>{action}</div>
}

export function Modal({ title, description, onClose, children, wide = false }: { title: string; description?: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}><section className={`modal ${wide ? 'modal-wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}><header className="modal-header"><div><h2>{title}</h2>{description && <p>{description}</p>}</div><button className="icon-button" onClick={onClose} aria-label="Fechar"><Icon name="close"/></button></header>{children}</section></div>
}

export const fmtDate = (date: string, options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }) => {
  if (!date) return ''
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d, 12).toLocaleDateString('pt-BR', options).replace('.', '')
}

export const daysUntil = (date: string) => {
  const [y, m, d] = date.split('-').map(Number)
  const target = new Date(y, m - 1, d)
  const now = new Date(); now.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - now.getTime()) / 86400000)
}

export const prettyDay = (date: string) => {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d, 12).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
}
