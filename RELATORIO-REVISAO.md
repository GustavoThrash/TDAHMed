# TDAHMED — relatório da versão Academic Studio

## Escopo entregue

O antigo painel com tarefas foi ampliado para um organizador acadêmico com três áreas principais: Banco de Questões, Calendário Acadêmico e Painel de Disciplinas. A estrutura foi separada por componentes para facilitar a manutenção e cada recurso principal possui interações de cadastro, atualização, busca/filtro e remoção onde se aplica.

## Funcionalidades implementadas

- Questões de múltipla escolha, explicação da resposta, dificuldade, tags, favoritas, pesquisa por texto e disciplina, prática com feedback e fila de erros.
- Calendário mensal, seleção de dia, filtro por categoria, cadastro/edição/exclusão de eventos, conclusão de compromissos e resumo de próximos dias.
- Sete disciplinas de início, personalização de nome/ícone/cor, professor/sala, tópicos com notas e estados, grade semanal, links e PDFs locais.
- Backup e restauração dos dados e dos PDFs associados (arquivos PDF até 25 MB no conjunto por exportação; cada PDF até 10 MB).
- Layout responsivo, navegação móvel, mensagens de erro, PWA e publicação por GitHub Actions.

## Armazenamento e publicação

A publicação usa Vite e GitHub Pages. Os registros estruturados ficam no localStorage e os arquivos PDF no IndexedDB do navegador. Não há servidor próprio nem autenticação nessa versão; dados não sincronizam entre dispositivos. O backup é a forma de transferência manual.

## Verificações realizadas nesta sessão

- Os arquivos `.ts` e `.tsx` passaram por transpilation de sintaxe do TypeScript sem erros de parsing.
- Revisadas as rotas de navegação, as formas de estado e a configuração relativa do Vite para funcionar em uma URL de projeto do GitHub Pages.
- A compilação completa (`tsc --noEmit && vite build`) não pôde ser executada no ambiente desta sessão porque o acesso ao registro npm expirou durante a instalação das dependências. O GitHub Actions realizará a instalação e compilação na publicação. Se o workflow falhar, a mensagem na aba Actions indicará o erro restante.

## Limitações conhecidas

- Os dados são locais a cada navegador; sincronização em nuvem exigirá serviço de backend e autenticação.
- PDFs anexados são armazenados no dispositivo/browser, não dentro do repositório GitHub. O espaço disponível depende do navegador e aparelho.
- Dados iniciais de exemplo são editáveis e não representam a grade oficial da faculdade.
