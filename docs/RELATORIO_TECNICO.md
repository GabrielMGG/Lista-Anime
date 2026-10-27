# Relatório técnico — Anime Mood

**Disciplina:** Arquitetura e Desenvolvimento de APIs — Centro Universitário Internacional Uninter  
**Modalidade:** individual  
**Data da validação final:** 26/10/2026

Estrutura organizada nos 12 tópicos sugeridos no roteiro oficial de 2026, páginas 6–7 impressas (9–10 do PDF). Este documento descreve o código real revisado; não declara funcionalidades planejadas como implementadas. O roteiro admite testes automatizados ou ferramentas equivalentes como evidências e torna frontend e deploy em nuvem opcionais.

## 1. Introdução

O Anime Mood resolve a necessidade de organizar uma biblioteca pessoal de animes, registrar episódios assistidos, status e notas, e descobrir o que assistir por meio de um sorteio opcionalmente filtrado por humor. Destina-se a usuários que desejam acompanhar seus próprios títulos e consultar sugestões do catálogo oficial MyAnimeList.

O núcleo é uma **API própria**, com cadastro, autenticação, CRUD pessoal e persistência real no MySQL. O consumo de MyAnimeList é complementar e não substitui o recurso principal exigido pela atividade. A biblioteca e a autenticação funcionam sem Client ID MAL. O frontend React, separado do backend, permite demonstrar esses recursos e o histórico.

## 2. Tecnologias utilizadas

| Tecnologia | Aplicação observada |
| --- | --- |
| Java 21 / Amazon Corretto 21.0.13 na validação | Linguagem do backend; DTOs com records; alvo Maven release 21 |
| Spring Boot 4.1.2 / Spring Web MVC | Inicialização, injeção de dependências, controllers REST e JSON |
| Spring Data JPA / Hibernate | ORM, entidades relacionais e repositórios |
| MySQL / Connector/J | Persistência real de usuários, biblioteca e histórico |
| Spring Security / BCrypt | HTTP Basic, rotas protegidas e hash de senha |
| Jakarta Bean Validation | Restrições declarativas dos DTOs |
| Maven Wrapper | Maven 3.10.0 definido em `.mvn/wrapper/maven-wrapper.properties` |
| JUnit, Spring Boot Test, MockMvc, Mockito | Testes de contexto, controllers e serviços |
| React / TypeScript / Vite / Tailwind / React Router | Frontend separado com navegação, formulários e componentes |
| Vitest / Testing Library / script Node com Fetch | Testes frontend e integração HTTP real |
| Fetch, Spring RestClient / MyAnimeList v2 | Comunicação HTTP interna e catálogo externo oficial |

O projeto não depende de Python, Argos, DeepL, JWT ou serviços de tradução. Lucide React é usado apenas na interface existente. Não foram acrescentadas dependências nesta preparação.

## 3. Justificativa das escolhas

Java e Spring permitem separar transporte HTTP, regras e persistência com tipos explícitos. DTOs evitam expor entidades, hashes e relacionamentos internos diretamente. Spring Data JPA reduz o código de acesso a dados e permite consultas delimitadas pelo proprietário; MySQL atende à persistência relacional exigida e possui driver integrado ao ecossistema Spring.

HTTP Basic é um mecanismo simples, aceito pelo enunciado, suficiente para demonstrar autenticação e endpoint protegido. BCrypt evita armazenar senhas em texto. Como Base64 não é criptografia, HTTPS é necessário ao publicar o backend fora do ambiente local.

Foi escolhido **PUT completo**, pois o cliente envia todos os campos editáveis do anime. Não há PATCH implementado; o roteiro exige PUT **ou** PATCH, não ambos. Campos opcionais omitidos podem tornar-se nulos, por isso o frontend preserva os originais no PUT de progresso.

MyAnimeList amplia a descoberta de títulos, mas não é necessário para demonstrar CRUD, autenticação e persistência próprios. O cache temporário do pool limita consultas externas; não substitui o banco da aplicação. Sinopses e títulos são mantidos originais, evitando custo e latência de tradução automática. Apenas rótulos de gêneros/metadados usam o dicionário Java existente.

## 4. Arquitetura da API

Estrutura principal: `backend/src/main/java/com/animemood/backend/`.

| Camada | Responsabilidade |
| --- | --- |
| `controller` | Rotas, DTOs, status HTTP e identificação do usuário autenticado |
| `service` | Cadastro, regras de progresso, biblioteca, sorteio e consulta ao catálogo |
| `repository` | Acesso JPA e consultas por ID/proprietário |
| `entity` | Mapeamento de usuários, biblioteca e histórico |
| `dto` | Contratos de entrada/saída e localização de metadados |
| `config` | Spring Security, CORS e cliente HTTP MAL |
| `exception` | Respostas para erros de validação e aplicação |

Fluxo: cliente → filtro de segurança → controller → service → repository/Hibernate → MySQL → DTO/JSON. Para catálogo: service → RestClient → API oficial MAL → classificação de mood → DTO. O frontend chama o backend; não recebe o Client ID MAL.

O usuário é obtido do e-mail autenticado. GET/PUT/DELETE individuais usam `findByIdAndUserId`, impedindo selecionar um proprietário arbitrário na requisição. Não há camada de streaming, leitor, comunidade ou ranking próprio.

O sorteio atual é **global**, não restrito a animes PLAN_TO_WATCH/WATCHING da biblioteca. `GlobalDrawPool` reúne até três páginas reais de ranking/temporada, deduplica IDs e mantém uma amostra de até 300 títulos por 15 minutos. Em falha usa a última amostra por até uma hora e aguarda 60 segundos antes de nova tentativa. A seleção usa SecureRandom, filtra mood e evita repetição imediata se existirem alternativas. A amostra não é uniforme sobre todo o MAL. O histórico é gravado transacionalmente; chamadas externas ocorrem fora da transação. A biblioteca pode estar vazia.

## 5. Banco de dados e ORM

`@Entity` associa classes a tabelas; `@Id`/`IDENTITY` geram as chaves no banco. `@ManyToOne` associa cada entrada de biblioteca/histórico a um usuário. `@Enumerated(STRING)` persiste nomes dos enums em vez de suas posições. Repositórios estendem `JpaRepository`, e Hibernate transforma as operações em SQL. Eventos `@PrePersist`/`@PreUpdate` preenchem datas.

| Entidade / tabela | Campos principais e restrições | Relacionamento |
| --- | --- | --- |
| `User` / `users` | id, name (100, obrigatório), email (150, obrigatório e único), password_hash obrigatório, created_at | Um usuário possui várias entradas e sorteios |
| `AnimeListEntry` / `anime_list_entries` | id, title (200, obrigatório), coverUrl, synopsis TEXT, genres String, totalEpisodes, episodesWatched, status obrigatório, mood, score pessoal, notes TEXT, createdAt, updatedAt | Muitos animes para um usuário; `user_id` obrigatório, LAZY |
| `DrawHistory` / `draw_history` | id, animeTitle obrigatório, coverUrl, mood solicitado, drawnAt, malId, synopsis TEXT, catalogGenres TEXT, totalEpisodes, releaseYear, publicScore, identifiedMood | Muitos snapshots para um usuário; vínculo obrigatório, LAZY |

O histórico guarda um snapshot, não uma FK para a entrada da biblioteca. Editar ou excluir um anime não remove os sorteios anteriores. Campos novos do snapshot aceitam nulo, preservando registros legados; `source` é calculado no DTO (`MYANIMELIST` ou `PERSONAL_LEGACY`). Nota pública MAL e nota pessoal são conceitos e campos diferentes.

`backend/database/init.sql` usa `CREATE DATABASE IF NOT EXISTS anime_mood`, charset utf8mb4 e não apaga dados. `spring.jpa.hibernate.ddl-auto=update` permite criar/atualizar as tabelas na inicialização. Há script aditivo manual opcional em `backend/database/migrations/002_global_draw_history.sql`; não é executado automaticamente e não deve ser repetido se as colunas já existirem. Não há Flyway/Liquibase. A persistência não depende dos caches em memória, mas a comprovação visual entre reinícios está listada como demonstração complementar pendente.

## 6. Endpoints e HTTP

Base local padrão: `http://localhost:8080`. JSON nas rotas de dados; `/api/hello` retorna texto. Nas rotas protegidas: `Authorization: Basic <base64(email:senha)>`. Não existe endpoint de login/JWT; o frontend valida credenciais com GET `/api/anime-list`.

| Método | Endpoint | Finalidade | Entrada principal | Respostas esperadas |
| --- | --- | --- | --- | --- |
| GET | `/api/hello` | Verificar disponibilidade (público) | Sem corpo | 200 texto |
| POST | `/api/auth/register` | Cadastrar usuário (público) | JSON `name`, `email`, `password` | 201 vazio; 400 entrada inválida; 409 e-mail duplicado |
| GET | `/api/anime-list` | Listar biblioteca do usuário autenticado | Header Basic; sem corpo | 200 array `AnimeResponse`; 401 |
| GET | `/api/anime-list/{id}` | Consultar anime pessoal | Header Basic; ID Long | 200 `AnimeResponse`; 400 ID inválido; 401; 404 ausente/de outro usuário |
| POST | `/api/anime-list` | Criar anime na biblioteca pessoal | Header Basic; JSON `AnimeRequest` | 201 `AnimeResponse`; 400; 401 |
| PUT | `/api/anime-list/{id}` | Substituir dados editáveis do anime pessoal | Header Basic; ID e JSON completo `AnimeRequest` | 200 `AnimeResponse`; 400; 401; 404 |
| DELETE | `/api/anime-list/{id}` | Excluir anime pessoal | Header Basic; ID | 204 vazio; 400 ID inválido; 401; 404 |
| POST | `/api/draws` | Sortear anime global e registrar snapshot pessoal | Header Basic; query `mood` opcional; sem JSON | 201 `DrawResponse`; 400 enum inválido; 401; 404 sem candidatos; 502/503/504 integração |
| GET | `/api/draws/history` | Listar histórico pessoal em ordem decrescente | Header Basic; sem corpo | 200 array `DrawResponse`; 401 |
| GET | `/api/catalog/anime` | Pesquisar catálogo oficial MAL | Header Basic; query `q` (2–100 caracteres), `offset` opcional (0–10000, padrão 0) | 200 `CatalogSearchResponse`; 400; 401; 502/503/504 integração |
| GET | `/api/catalog/anime/{malId}` | Consultar detalhes oficiais de um anime | Header Basic; `malId` positivo | 200 `CatalogAnimeResponse`; 400; 401; 404; 502/503/504 integração |

**Entradas:** `RegisterRequest`: name obrigatório até 100 caracteres, email obrigatório válido, password obrigatório com mínimo de 8. `AnimeRequest`: title obrigatório; coverUrl, synopsis e genres opcionais; totalEpisodes e episodesWatched inteiros obrigatórios não negativos; status obrigatório; mood opcional; score inteiro opcional de 0 a 10; notes opcional.

Enums: `WatchStatus` = PLAN_TO_WATCH, WATCHING, COMPLETED, ON_HOLD, DROPPED. `Mood` = FUN, RELAXED, ACTION, EMOTIONAL, DARK.

**Saídas:** `AnimeResponse` acrescenta id, createdAt, updatedAt e localization aos campos do anime. `CatalogSearchResponse` contém items, offset, limit (20), hasNext. `CatalogAnimeResponse` contém malId, title, coverUrl, synopsis, genres (array), totalEpisodes, publicScore, mediaType, airingStatus, suggestedMood, moodScores, moodReasons, year, studios e localization. `DrawResponse` contém id, animeTitle, coverUrl, mood (filtro solicitado), drawnAt, malId, synopsis, genres, totalEpisodes, year, publicScore, identifiedMood, source e localization. Datas usam LocalDateTime, sem offset explícito.

`localization` mantém os rótulos em pt-BR e repete a sinopse original, com status ORIGINAL/EMPTY. Não é tradução de sinopse. A nota pública pode ser nula e nunca preenche automaticamente a nota pessoal.

200 significa leitura/atualização; 201, criação; 204, exclusão sem corpo; 400, entrada/conversão inválida; 401, autenticação ausente/incorreta; 404, recurso ausente ou não acessível ao usuário; 409, conflito de e-mail. Integração MAL: 502 para falha/resposta inválida externa, 503 para Client ID ausente ou rate limit, 504 para falha de acesso/timeout. A tabela não promete interceptar toda exceção de infraestrutura.

## 7. Validação e erros

`@Valid` nos controllers aciona Bean Validation. JSON ilegível ou enum inválido gera 400. `GlobalExceptionHandler` produz timestamp, status, error e path nos erros tratados; validação acrescenta fields. As respostas do filtro de segurança e conversão de query não necessariamente usam o mesmo corpo. IllegalArgumentException é tratada como 409; o cadastro a utiliza para e-mail já existente.

Regras de progresso: total > 0 e assistidos > total gera 400. Ao igualar o total positivo, o status é definido como COMPLETED. Total zero representa quantidade desconhecida e não aciona essa conclusão. Não há regra inversa que obrigue todo COMPLETED a ter contagens iguais. PUT atualiza todos os campos editáveis. Consultas pessoais inexistentes ou de outro proprietário geram 404.

O classificador de mood é centralizado em `MoodClassifier`, usa somente gêneros/temas originais MAL e soma pesos: Comedy +4 FUN, Gag Humor +5 FUN, Parody +4 FUN; Slice of Life +4 RELAXED, Iyashikei +6 RELAXED; Action/Martial Arts/Combat Sports +4 ACTION, Adventure/Mecha +2 ACTION; Drama +4 EMOTIONAL, Romance +3 EMOTIONAL; Horror/Gore +5 DARK, Psychological +4 DARK, Suspense +3 DARK. Sem pontos ou em empate, mood fica nulo; usuário pode alterar a sugestão ao adicionar. Trata-se de heurística, não análise semântica nem raridade de gacha.

Limitações não impeditivas conhecidas: DTOs não replicam todos os limites de comprimento das colunas (por exemplo, título de 200/e-mail de 150); entradas muito longas podem provocar erro de persistência. A corrida de cadastros duplicados não tem tratamento específico além da restrição única. Biblioteca e histórico não são paginados. A lógica foi preservada nesta preparação; não se declara validação de todos os casos possíveis.

## 8. Autenticação e CORS

Spring Security configura HTTP Basic, sessão STATELESS e BCrypt. `CustomUserDetailsService` busca por e-mail e fornece o papel USER. Cadastro e GET `/api/hello` são públicos; demais requisições exigem autenticação. Hash/senha não aparecem nos DTOs. O cliente React mantém o header Basic somente em memória; recarregar exige nova autenticação, e logout apaga esse estado.

CORS em `/api/**`: origens `http://localhost:5173` e `http://127.0.0.1:5173`; métodos GET, POST, PUT, PATCH, DELETE, OPTIONS; cabeçalhos Authorization e Content-Type; allowCredentials=false. Permitir PATCH no CORS não cria endpoint PATCH. CORS controla leitura por navegadores de outra origem, não substitui autenticação nem impede clientes diretos. O Vite usa 5173 com strictPort.

CSRF está desativado na configuração existente. Embora o cliente envie Basic explicitamente, navegadores podem reutilizar credenciais Basic; stateless por si só não elimina esse risco. A decisão deve ser revista em implantação pública. O escopo avaliado é local. Segredos MySQL/MAL são variáveis do backend, sem valores reais nos exemplos ou `VITE_*`. Não há autenticação por cookies, JWT ou refresh token.

## 9. Testes e evidências

Validação final em 26/10/2026:

- `.\mvnw.cmd -B package`, com Corretto 21.0.13 e variáveis locais do IntelliJ: **73 testes aprovados, zero falhas/erros, BUILD SUCCESS e JAR gerado**. Inclui 1 contexto com MySQL, 4 controller/CORS/autenticação, 22 localização, 20 mood, 16 cliente MAL, 8 pool e 2 sorteio/histórico.
- `npm test`: **36 testes aprovados** em 5 arquivos; `npm run typecheck` e `npm run build`: aprovados.
- `npm run test:integration`: **12 requisições HTTP reais aprovadas**, com conta isolada, CORS conferido e regra COMPLETED validada; a conta QA permanece porque não há endpoint de exclusão de usuário. Apenas o anime criado pelo teste foi removido. Nenhum registro preexistente foi excluído.

O erro anterior de MySQL foi superado ao reutilizar DB_PASSWORD da configuração local do IntelliJ, somente no ambiente do processo, sem mudar credenciais nem expô-las. O pacote foi validado em JDK 21. A porta 8080 estava ocupada; a prova real usou 18080 por variável de processo, mantendo o padrão do projeto.

Os 10 testes **manuais via PowerShell** previamente aprovados continuam registrados como relato do responsável: GET lista 200, POST 201, GET por ID 200, PUT 200, regra COMPLETED, POST inválido 400, GET inexistente 404, GET sem autenticação 401, e-mail duplicado 409, DELETE 204. Não são testes JUnit; não há capturas originais anexadas. A nova prova HTTP automatizada registra esses comportamentos separadamente, sem renomear o relato manual como teste automatizado.

Veja [EVIDENCIAS_TESTES.md](EVIDENCIAS_TESTES.md) para resultados sanitizados, matriz dos requisitos e demonstrações ainda úteis: persistência após reinício, isolamento entre dois usuários, preflight/origem rejeitada e catálogo/sorteio externo ao vivo. Os testes MAL usam respostas controladas; esta preparação não declara que todas as telas foram verificadas manualmente ou que houve auditoria visual em celular.

## 10. Execução do projeto

1. Instalar JDK 21 e MySQL 8 compatível; selecionar JDK 21 também no executor Maven/IntelliJ. Instalar Node 22.18+ e npm somente se usar frontend.
2. Clonar/baixar o repositório completo. Executar `backend/database/init.sql` no Workbench ou `mysql -u root -p -e "source backend/database/init.sql"` a partir da raiz.
3. Definir DB_USER e DB_PASSWORD no PowerShell ou na configuração de execução do IntelliJ. URL padrão: `jdbc:mysql://localhost:3306/anime_mood`; sobrescrever com SPRING_DATASOURCE_URL se necessário. `backend/.env.example` é documentação; Spring Boot não carrega `.env` automaticamente.
4. Em `backend/`: `.\mvnw.cmd -B package` e `.\mvnw.cmd spring-boot:run`, ou `java -jar target/backend-0.0.1-SNAPSHOT.jar`. URL padrão `http://localhost:8080`; SERVER_PORT permite outra porta. O Wrapper baixa Maven/dependências na primeira utilização.
5. Cadastrar usuário pela API ou frontend e enviar Basic nas rotas pessoais. Não existe conta/senha padrão compartilhada.
6. Opcional: fornecer MAL_CLIENT_ID próprio no backend para pesquisa/detalhes/sorteio global. Sem ele essas rotas retornam 503; CRUD e autenticação próprios continuam disponíveis. Não colocar a chave no frontend. A API oficial requer internet.
7. Opcional: em `frontend/`, `npm ci`, copiar `.env.example` para `.env.local` e `npm run dev`. VITE_API_BASE_URL padrão `http://localhost:8080/api`. Se o backend usar outra porta, atualizar essa URL local. Acessar `http://localhost:5173`.

Não há Swagger/OpenAPI instalado nem rota `/swagger-ui`; os contratos estão neste relatório/README e as evidências vêm dos testes existentes. Requisições de exemplo e instruções de segredo seguro estão no [README](../README.md). Em Linux/macOS usar `./mvnw`, concedendo permissão de execução se necessário.

## 11. Repositório

**Endereço público do GitHub: pendente até a publicação e conferência do acesso pelo professor.** Esta revisão não fez commit, push ou publicação e não garante que o remoto já contenha o estado local completo. Há código e documentação ainda não rastreados: precisam integrar o commit que o autor realizará após revisão.

Devem constar fontes backend/frontend, testes, scripts SQL, README, docs, `.env.example`, Maven Wrapper e package-lock.json. Devem ficar fora senhas, Client ID MAL, `.env.local`, `.idea`, `.run`, target, node_modules e dist. A configuração local do IntelliJ permanece ignorada. A varredura dos arquivos candidatos não encontrou segredos reais; a única senha literal sinalizada é uma fixture artificial de teste. A conferência do histórico por nomes sensíveis não substitui auditoria completa de cada conteúdo histórico.

O relatório no modelo Word oficial, com identificação acadêmica, permanece local e será enviado separadamente ao AVA; não integra o repositório público. A coleção importável e seu roteiro estão em [insomnia/README.md](insomnia/README.md). O professor pode reproduzir a aplicação conforme o README, usando suas próprias credenciais. O checklist está em [CHECKLIST_ENTREGA.md](CHECKLIST_ENTREGA.md).

## 12. Considerações finais

O código revisado atende ao núcleo obrigatório: API HTTP própria, organização por recursos, CRUD completo, MySQL/JPA, validação, erros/status coerentes, autenticação e CORS explícito. A prova HTTP real demonstra operações próprias, portanto a solução não se resume a consumir uma API externa. O frontend e o catálogo MAL são complementares.

Dificuldades da validação resolvidas: variáveis presentes somente no IntelliJ, primeira pasta JDK 21 sem executável e porta 8080 ocupada. A execução final utilizou a instalação JDK 21 efetiva, preservou credenciais e usou porta temporária. Não houve alteração de funcionalidade, design, regra de negócio ou dependência nesta preparação, nem exclusão de arquivos da pasta de desenvolvimento.

Pendências de entrega: publicar o conteúdo local completo e conferir acesso do professor; anexar/exportar este relatório no formato solicitado no AVA (o PDF fornecido não fixa uma extensão); reunir capturas se o professor as solicitar; informar autor/RU e confirmar envio/recibo. Deploy em nuvem é opcional no enunciado, salvo instrução posterior. Não há defeito impeditivo observado nos testes executados.

Possíveis melhorias futuras, fora do escopo encerrado: limites de comprimento nos DTOs coerentes com o banco, tratamento específico de conflitos concorrentes, paginação e migrações automatizadas. Não são apresentadas como implementadas ou necessárias para demonstrar o mínimo exigido.

**Referência acadêmica:** roteiro “Atividade Prática — Arquitetura e Desenvolvimento de APIs”, Uninter, 2026, professores Pedro Henrique Flores e Osmar Dias Jr.; requisitos/entregáveis e estrutura sugerida, páginas impressas 2–9. Referências técnicas do projeto e da integração: [MYANIMELIST.md](MYANIMELIST.md), [SORTEIO_GLOBAL.md](SORTEIO_GLOBAL.md), [LOCALIZACAO_PT_BR.md](LOCALIZACAO_PT_BR.md).
