import type { AppData, CalendarEvent, Course, Question, Topic } from './types'

const uid = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`
const dateOffset = (days: number) => {
  const d = new Date()
  d.setHours(12, 0, 0, 0)
  d.setDate(d.getDate() + days)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
const topicList = (titles: string[]): Topic[] => titles.map(title => ({ id: uid(), title, notes: '', status: 'todo' }))

export const makeSeedData = (): AppData => {
  const courses: Course[] = [
    {
      id: 'anatomia', name: 'Anatomia', shortName: 'AN', icon: '🦴', color: 'burgundy', professor: '', room: '', description: 'Estruturas do corpo humano, relações anatômicas e topografia.',
      topics: topicList(['Cabeza y cuello', 'Tórax y abdomen', 'Miembro superior e inferior']), schedule: [], materials: [],
    },
    {
      id: 'biologia', name: 'Biologia', shortName: 'BI', icon: '🧬', color: 'sage', professor: '', room: '', description: 'Biologia celular, membranas, organelas e processos celulares.',
      topics: topicList(['Membrana plasmática', 'Citosol e organelas', 'Ciclo celular']), schedule: [], materials: [],
    },
    {
      id: 'histologia', name: 'Histologia', shortName: 'HI', icon: '🔬', color: 'rose', professor: '', room: '', description: 'Tecidos, organização microscópica e relação entre estrutura e função.',
      topics: topicList(['Tejido epitelial', 'Tejido conjuntivo y adiposo', 'Tejido óseo y muscular']), schedule: [], materials: [],
    },
    {
      id: 'psicologia', name: 'Psicologia Médica', shortName: 'PM', icon: '🧠', color: 'lavender', professor: '', room: '', description: 'Comunicação clínica, comportamento e aspectos psicossociais da saúde.',
      topics: topicList(['Comunicação médico-paciente', 'Desenvolvimento e comportamento', 'Saúde mental']), schedule: [], materials: [],
    },
    {
      id: 'primeiros-auxilios', name: 'Primeiros Auxílios', shortName: 'PA', icon: '🩹', color: 'blue', professor: '', room: '', description: 'Avaliação inicial, suporte básico de vida e atendimento emergencial.',
      topics: topicList(['Avaliação inicial', 'RCP básica', 'Hemorragias e trauma']), schedule: [], materials: [],
    },
    {
      id: 'castelhano', name: 'Língua Castelhana', shortName: 'LC', icon: '✍️', color: 'amber', professor: '', room: '', description: 'Leitura, gramática, vocabulário e comunicação acadêmica em espanhol.',
      topics: topicList(['Gramática e ortografia', 'Compreensão leitora', 'Redação acadêmica']), schedule: [], materials: [],
    },
    {
      id: 'biofisica', name: 'Biofísica', shortName: 'BF', icon: '⚛️', color: 'teal', professor: '', room: '', description: 'Princípios físicos aplicados aos sistemas biológicos e à medicina.',
      topics: topicList(['Mecânica e biomecânica', 'Fluidos e pressão', 'Bioeletricidade e imagemologia']), schedule: [], materials: [],
    },
  ]

  const questions: Question[] = [{
    id: uid(), courseId: 'biologia', prompt: 'Qual mecanismo transporta glicose para dentro da célula a favor do gradiente, sem gasto direto de ATP?',
    options: ['Bomba de sódio e potássio', 'Difusão facilitada por GLUT', 'Endocitose mediada por receptor', 'Transporte ativo primário'],
    correctIndex: 1, explanation: 'Os transportadores GLUT permitem a difusão facilitada da glicose a favor do gradiente de concentração, sem consumo direto de ATP.',
    difficulty: 'medium', tags: ['membrana', 'transporte', 'GLUT'], favorite: false, attempts: 0, correctCount: 0, createdAt: Date.now(),
  }]

  const event = (title: string, days: number, type: CalendarEvent['type'], courseId: string, time: string): CalendarEvent => ({
    id: uid(), title, date: dateOffset(days), type, courseId, time, location: '', notes: 'Evento demonstrativo. Edite com as informações reais da sua turma ou exclua.', completed: false, createdAt: Date.now(),
  })
  const events: CalendarEvent[] = [
    event('Exemplo · Prova de Citologia', 6, 'exam', 'biologia', '08:00'),
    event('Exemplo · Seminário', 8, 'presentation', 'histologia', '10:00'),
    event('Exemplo · Prática de Anatomia', 13, 'exam', 'anatomia', '14:00'),
  ]

  return { version: 1, profileName: '', courses, questions, events, mistakeIds: [], welcomeDismissed: false }
}

export const EVENT_LABELS: Record<CalendarEvent['type'], string> = {
  exam: 'Prova', assignment: 'Trabalho / entrega', presentation: 'Apresentação', class: 'Aula', important: 'Data importante',
}

export const EVENT_COLORS: Record<CalendarEvent['type'], string> = {
  exam: 'burgundy', assignment: 'pink', presentation: 'sage', class: 'blue', important: 'amber',
}
