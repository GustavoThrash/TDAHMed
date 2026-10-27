export type EventType = 'exam' | 'assignment' | 'presentation' | 'class' | 'important'
export type Difficulty = 'easy' | 'medium' | 'hard'
export type TopicStatus = 'todo' | 'studying' | 'done'

export interface Topic {
  id: string
  title: string
  notes: string
  status: TopicStatus
}

export interface ScheduleEntry {
  id: string
  day: number // 0 Sunday, 1 Monday, ... 6 Saturday
  start: string
  end: string
  room: string
}

export interface Material {
  id: string
  title: string
  kind: 'pdf' | 'link'
  fileId?: string
  url?: string
  size?: number
  addedAt: number
}

export interface Course {
  id: string
  name: string
  shortName: string
  icon: string
  color: string
  professor: string
  room: string
  description: string
  topics: Topic[]
  schedule: ScheduleEntry[]
  materials: Material[]
}

export interface Question {
  id: string
  courseId: string
  prompt: string
  options: string[]
  correctIndex: number
  explanation: string
  difficulty: Difficulty
  tags: string[]
  favorite: boolean
  attempts: number
  correctCount: number
  createdAt: number
}

export interface CalendarEvent {
  id: string
  title: string
  date: string // local YYYY-MM-DD
  type: EventType
  courseId: string
  time: string
  location: string
  notes: string
  completed: boolean
  createdAt: number
}

export interface AppData {
  version: 1
  profileName: string
  courses: Course[]
  questions: Question[]
  events: CalendarEvent[]
  mistakeIds: string[]
  welcomeDismissed: boolean
}

export interface PdfBackupFile {
  id: string
  name: string
  mime: string
  base64: string
}
