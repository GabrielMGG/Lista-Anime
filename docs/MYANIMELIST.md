# Catálogo oficial MyAnimeList e classificação de mood

## Configuração

A integração usa exclusivamente a [MyAnimeList API v2](https://myanimelist.net/apiconfig/references/api/v2), cuja documentação oficial foi consultada nesta revisão. Cadastre uma aplicação na [área de configuração do MyAnimeList](https://myanimelist.net/apiconfig) e obtenha seu próprio Client ID. Para consultas públicas, a documentação permite o header `X-MAL-CLIENT-ID`, sem login OAuth do usuário. Este projeto não altera listas da conta MAL nem vincula contas Anime Mood a contas MAL.

Defina **somente no processo do backend** a variável `MAL_CLIENT_ID`. `backend/.env.example` contém apenas a chave vazia. No PowerShell, antes de iniciar o Spring Boot:

```powershell
$env:MAL_CLIENT_ID = Read-Host 'Client ID da sua aplicação MyAnimeList'
Set-Location backend
.\mvnw.cmd spring-boot:run
```

Configure também DB_USER/DB_PASSWORD conforme o README. No IntelliJ: Run > Edit Configurations > configuração de BackendApplication > Environment variables > MAL_CLIENT_ID. Reinicie o backend após configurar. O Spring Boot **não carrega `.env` automaticamente**. Não adicione o Client ID a variáveis `VITE_*`, configurações compartilhadas, logs, arquivos rastreados ou código frontend. O backend só usa o ID no header de suas próprias requisições HTTPS ao host fixo `api.myanimelist.net`. Nenhum segredo é devolvido nos DTOs.

Sem configuração, pesquisa, detalhes e sorteio global retornam **503**, sem chamadas externas, resultados artificiais ou fallback Jikan. O contexto pode iniciar sem esse ID; biblioteca, autenticação e CRUD não dependem dele. O frontend exibe a indisponibilidade e mantém o cadastro manual para compatibilidade com o CRUD existente.

## Fluxo e endpoints

Navegador → backend Anime Mood (Basic existente) → MyAnimeList (Client ID no servidor).

| Método | Rota própria | Entrada | Resposta |
| --- | --- | --- | --- |
| GET | `/api/catalog/anime` | `q` com 2–100 caracteres após trim; `offset` opcional de 0 a 10000 | 200 `{items, offset, limit:20, hasNext}` |
| GET | `/api/catalog/anime/{malId}` | ID MAL positivo | 200 `CatalogAnimeResponse` |

Ambas exigem Basic; SecurityConfig e CORS foram preservados. Parâmetros inválidos retornam 400; ausência de autenticação, 401; detalhe inexistente no MAL, 404; ID não configurado ou limite externo 429, 503; falha de autenticação externa/servidor ou payload inválido, 502; falha de conexão/leitura, 504. Mensagens externas, headers e causas não são repassados. Timeout de conexão: 5 segundos; leitura: 10 segundos. Redirecionamentos externos não são seguidos. Pesquisa explícita, paginada de 20 em 20, sem disparos a cada tecla ou retries automáticos.

`CatalogAnimeResponse`: malId, title, coverUrl, synopsis, genres (lista de nomes), totalEpisodes, publicScore, mediaType, airingStatus, suggestedMood, moodScores, moodReasons e year. Campos MAL solicitados incluem start_season e start_date para o ano, além de id, title, main_picture, synopsis, genres, num_episodes, mean, media_type e status. A imagem large tem preferência, com fallback medium; ausência de episódios vira 0 (total desconhecido). Metadados ausentes continuam vazios/nulos. Capas carregam da URL do catálogo, sem consultas frontend à API MAL ou credenciais nos pedidos de imagens.

O usuário pesquisa e seleciona um anime; a tela consulta os detalhes pelo backend. O formulário recebe título, capa, sinopse, gêneros, total e sugestão de mood automaticamente, permitindo revisão e alteração manual do mood. A inclusão usa **o POST existente `/api/anime-list`**, com o mesmo AnimeRequest, status inicial PLAN_TO_WATCH, 0 assistidos, nota pessoal nula e observações nulas. Não há novo endpoint de persistência. PUT completo, DELETE e regra COMPLETED foram preservados.

`mean` aparece como **Nota pública MAL** na seleção. Nunca preenche `score`, exclusivamente a nota pessoal de 0 a 10. AnimeListEntry não possui campo de nota pública ou ID MAL; esses dados não são persistidos na biblioteca. O histórico global guarda seu próprio snapshot com ID e nota pública, sem sincronização ou vínculo de conta com o MAL.

## Classificação centralizada

`MoodClassifier` aplica as mesmas regras em pesquisa e detalhes. Os nomes são normalizados para minúsculas, com trim e espaços repetidos normalizados. Cada rótulo conta uma única vez. Os pontos dos rótulos reconhecidos são somados por mood:

| Rótulo recebido | Mood | Pontos |
| --- | --- | --- |
| Comedy | FUN | 4 |
| Gag Humor | FUN | 5 |
| Parody | FUN | 4 |
| Slice of Life | RELAXED | 4 |
| Iyashikei | RELAXED | 6 |
| Action | ACTION | 4 |
| Adventure | ACTION | 2 |
| Martial Arts | ACTION | 4 |
| Combat Sports | ACTION | 4 |
| Mecha | ACTION | 2 |
| Drama | EMOTIONAL | 4 |
| Romance | EMOTIONAL | 3 |
| Horror | DARK | 5 |
| Psychological | DARK | 4 |
| Suspense | DARK | 3 |
| Gore | DARK | 5 |

O maior total positivo, quando único, define a sugestão principal. **Empate no maior total ou nenhuma regra reconhecida → mood nulo**. Exemplo da regra, não resultado do catálogo: Action + Adventure + Comedy soma ACTION 6 e FUN 4, sugerindo ACTION; Action + Comedy empata em 4 e permanece indefinido. Pontuações secundárias e motivos são retornados para transparência; apenas o mood principal escolhido é enviado ao CRUD e armazenado no campo existente.

A API v2 documenta `genres`, sem `themes` separado nos endpoints usados. Regras de temas são aplicadas apenas quando seus nomes vierem nos rótulos recebidos; não é criado um campo fictício. Sinopse, nota pública, demografia (Shounen etc.), popularidade e título não são usados para adivinhar mood. Fantasy, School e Supernatural isolados não o determinam. É uma **heurística editorial**, não aprendizado de máquina ou verdade sobre a obra. Gêneros amplos podem não representar o tom predominante; metadados incompletos reduzem a cobertura. A revisão manual permanece necessária.

## Preservação e limites

- Entidades da biblioteca, enums, autenticação e regras do CRUD foram preservados. O histórico recebeu apenas campos opcionais de snapshot; dados antigos não são reclassificados.
- O sorteio agora utiliza o catálogo global, independente da biblioteca. A estratégia de rankings, temporadas, cache, histórico aditivo e apresentação cinematográfica está em [SORTEIO_GLOBAL.md](SORTEIO_GLOBAL.md).
- A integração copia metadados na inclusão; não faz sincronização, vinculação de contas ou deduplicação por ID MAL. Dados antigos são preservados.
- Os limites existentes de título (200) e capa/gêneros (255) são verificados no formulário. Metadados longos exigem revisão; não são truncados silenciosamente e nenhuma coluna é alterada.
- Sem Client ID válido não é possível afirmar sucesso de pesquisa real no MAL. Fixtures validam os contratos apenas nos testes e não geram resultados na aplicação.

Resultados executados: [VALIDACAO_FRONTEND.md](VALIDACAO_FRONTEND.md).

## Exibição em português brasileiro

A localização usa somente o dicionário Java para gêneros e metadados; sinopses e títulos permanecem originais. A integração de tradução automática e seus caches foram removidos, sem migrações ou regravação de registros. Mood usa os gêneros originais. Biblioteca, histórico, sorteio global e animação gacha permanecem preservados. Veja [LOCALIZACAO_PT_BR.md](LOCALIZACAO_PT_BR.md) e [VALIDACAO_FRONTEND.md](VALIDACAO_FRONTEND.md). As evidências manuais anteriores permanecem históricas.
