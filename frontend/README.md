# Anime Mood — frontend

React, TypeScript, Vite, Tailwind CSS, React Router, Lucide React e Fetch. Aplicação estática; o Vite serve desenvolvimento/preview, sem servidor Node de aplicação. O backend Spring Boot é iniciado separadamente.

## Instalar e iniciar

Node.js 22.18+ e npm. Na pasta `frontend`:

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Abra `http://localhost:5173` ou `http://127.0.0.1:5173`. O Vite usa porta fixa e strictPort; não muda automaticamente se ela estiver ocupada. Configure `VITE_API_BASE_URL=http://localhost:8080/api` em .env.local (também é o padrão). O Vite carrega esse arquivo no frontend; o backend não carrega .env automaticamente. Reinicie o Vite após alterar variáveis. Nunca coloque Client ID MAL, senha ou outros segredos em variáveis VITE_*.

## Catálogo oficial

Configure MAL_CLIENT_ID exclusivamente no processo do backend e reinicie-o. Consulte [MYANIMELIST.md](../docs/MYANIMELIST.md). O frontend chama GET /api/catalog/anime e GET /api/catalog/anime/{malId}, sempre com o Basic existente. Não acessa a API MAL diretamente. Sem configuração, exibe o erro real 503 e não inventa resultados.

Pesquise pelo nome e selecione um anime. Os detalhes preenchem título, capa, sinopse, gêneros e total automaticamente. O mood principal é sugerido pelo backend; pode alterá-lo ou deixá-lo indefinido. A nota pública MAL é exibida separadamente e nunca preenche sua nota pessoal. A inclusão usa o POST /api/anime-list existente. O cadastro manual continua disponível, assim como a edição dos registros antigos. Não há sincronização de conta MAL ou migração dos dados pessoais.

## Páginas

- `/entrar`, `/cadastro`: entrada Basic validada em GET da lista e cadastro público.
- `/`: Assistindo, biblioteca em grade compacta com filtros locais e acesso ao sorteio.
- `/descobrir`: página própria de pesquisa oficial; os resultados não ocupam a biblioteca.
- `/animes/novo?malId=...`: detalhes importados e formulário de acompanhamento.
- `/animes/novo`: pesquisa e alternativa manual.
- `/animes/:id`, `/animes/:id/editar`: detalhes, edição, progresso e exclusão confirmada.
- `/sorteio`: sorteio global MAL, independente da biblioteca, com ou sem filtro de mood e apresentação cinematográfica de jogo.
- `/historico`: resultados, sem exclusão de histórico.

O PUT envia todos os campos do DTO, preservando os dados ao incrementar episódios. Formulários validam inteiros, limites existentes do banco e contagem assistida; COMPLETED automático respeita total positivo. Total zero é desconhecido. Ausência/falha de capa recebe placeholder textual, sem animes fictícios. Não há upload, streaming ou leitura de mangás.

## Verificar e gerar build

```powershell
npm test
npm run typecheck
npm run build
npm run preview
```

Saída em dist/, ignorada pelo Git. Entregue também package-lock.json para reprodução com npm ci. Preview usa 5173 com strictPort; encerre o dev antes. Em hospedagem estática, configure fallback das rotas para index.html. Em publicação, HTTP Basic exige HTTPS e a origem deve ser autorizada no CORS do backend pelo responsável; esta revisão não o altera.

`npm run test:integration` verifica CRUD contra um backend de avaliação. Ele cria uma conta QA e um anime novo, removendo somente o anime da execução; a conta fica no banco porque não há endpoint para excluí-la. Foi executado na preparação final em 26/10/2026: 12 requisições reais aprovadas na porta temporária 18080. Não testa sorteio global; os testes isolados desse fluxo foram executados separadamente. Use apenas quando essa criação de registros for desejada.

## Segurança e organização

Authorization fica somente em memória React. Logout e recarga removem a sessão; não há JWT, refresh token, cookies de autenticação, localStorage ou sessionStorage. Fetch usa credentials:omit e cache:no-store. HTTP 401 em rota protegida encerra a sessão; indisponibilidade 503 do catálogo não encerra. Senhas/headers não são registrados em logs.

src/components: UI, formulário, cards e pesquisa; src/pages: telas; src/context: sessão; src/hooks: carregamento/cancelamento; src/services: HTTP; src/types: contratos/enums; src/test: fixtures isoladas e testes. A aplicação nunca usa fixtures como fallback de API.

Visual de catálogo em grafite, com roxo moderado, cabeçalho simples e grades de capas. Referências de organização: Komiwa, MyAnimeList e AniList; sem copiar marcas, conteúdo ou código. O sorteio possui Canvas de energia e carta em perspectiva com cinco fases coordenadas, pré-carregamento, skip/Esc, bloqueio de cliques simultâneos, limpeza de recursos e movimento reduzido. O resultado vem sempre do backend. Não usa Three.js ou biblioteca pesada. Regras e timing: [SORTEIO_GLOBAL.md](../docs/SORTEIO_GLOBAL.md). Resultados executados e limites: [VALIDACAO_FRONTEND.md](../docs/VALIDACAO_FRONTEND.md).

## Textos em pt-BR

Títulos continuam no campo principal MAL `title`; títulos salvos não são renomeados. Gêneros e metadados usam o dicionário Java existente. Sinopses são exibidas exatamente como recebidas, mesmo em inglês, sem tradução automática nem dependência de Python. POST/PUT preservam os dados originais e pessoais. A nota pública mantém a formatação brasileira, separada da nota pessoal. Biblioteca, detalhes, sorteio, histórico e animação seguem preservados. Consulte [LOCALIZACAO_PT_BR.md](../docs/LOCALIZACAO_PT_BR.md).
