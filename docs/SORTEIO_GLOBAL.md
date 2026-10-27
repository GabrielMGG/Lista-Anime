# Sorteio global e apresentação cinematográfica

## Mudança de comportamento

`POST /api/draws?mood=...` agora consulta uma amostra real do catálogo público **MyAnimeList v2**, pelo backend. Não usa AnimeListRepository nem exige biblioteca preenchida, status PLAN_TO_WATCH/WATCHING ou qualquer título pessoal. O usuário continua autenticado por HTTP Basic; MAL_CLIENT_ID permanece exclusivamente no servidor. Sem filtro, participam também animes sem classificação suficiente. Com filtro, só participam aqueles cujo mood principal identificado corresponde ao solicitado.

Não há endpoint oficial de sorteio por humor. A documentação oficial de `/anime/ranking` e `/anime/season/{year}/{season}` foi consultada antes de implementar. Ambos retornam itens com `node`, aceitam projeção `fields` e permitem solicitar `genres`, sinopse, imagem, episódios, nota pública e início da exibição. Não é necessário fazer uma consulta de detalhes por candidato. Os rótulos disponíveis são classificados pelo `MoodClassifier` existente; não se inventa campo `themes` ou classificação a partir do título/nota.

## Seleção, diversidade e limites

O `GlobalDrawPool` faz no máximo **três requisições por renovação**, sem lista fixa de IDs:

1. Ranking `all`, em página aleatória com offset de 0 a 950, em passos de 50.
2. Ranking `bypopularity`, em página aleatória com offset de 200 a 3950, em passos de 50, para incluir títulos fora do topo.
3. Uma temporada escolhida aleatoriamente entre 2000 e o ano atual, com um dos quatro trimestres. Para o ano atual, não escolhe trimestre futuro.

Cada consulta pede até 100 itens com metadados. O conjunto é deduplicado por ID MAL, com até 300 candidatos por renovação. Uma temporada histórica ajuda a reduzir a concentração em lançamentos e sucessos atuais. A amostra **não é uniforme sobre todo o catálogo MAL**, não garante cobertura de todos os humores em toda renovação e não promete que todos os animes têm a mesma probabilidade global. O sorteio é uniforme entre os candidatos elegíveis da amostra atual, usando SecureRandom no servidor.

Cache compartilhado em memória: 15 minutos, com renovação sincronizada para evitar consultas simultâneas duplicadas. Se a renovação falhar, reaproveita apenas dados reais previamente obtidos com menos de uma hora; nunca cria candidatos. Sem cache utilizável, propaga o erro. Uma falha impõe pausa de 60 segundos antes de outra tentativa de renovação. A implementação para na primeira falha, sem retries ou dezenas de pedidos por sorteio. Limites e falhas externas mantêm os códigos 502/503/504 já documentados; Client ID ausente retorna 503 sem consulta HTTP.

Se o filtro não encontrar candidatos, retorna 404 e explica que o conjunto é temporário; isso não afirma inexistência desse mood no catálogo inteiro. Quando existem alternativas elegíveis, o último ID sorteado para o usuário é excluído da próxima seleção. Com um único candidato, ele pode repetir. O último ID vem do histórico, sobrevivendo à reinicialização do processo. A renovação da amostra ocorre após o TTL, inclusive entre humores.

Operações por usuário são serializadas por locks de tamanho fixo dentro da instância. A consulta externa acontece fora da transação de banco; seleção considerando o último histórico e gravação acontecem dentro de uma transação, concluída antes de liberar o lock. A prevenção de corrida não é um lock distribuído entre múltiplas réplicas; em publicação com várias instâncias, será necessário coordená-las.

## Resposta e histórico compatível

As URLs permanecem:

- `POST /api/draws`, com query mood opcional: 201 com resultado global registrado.
- `GET /api/draws/history`: 200 com histórico pessoal, inclusive registros antigos.

DrawResponse mantém `id`, `animeTitle`, `coverUrl`, `mood` (filtro solicitado) e `drawnAt`. Acrescenta `malId`, `synopsis`, `genres`, `totalEpisodes`, `year`, `publicScore`, `identifiedMood` e `source`. `source` distingue MYANIMELIST de PERSONAL_LEGACY. Os campos novos são opcionais/nulos nos registros antigos; não se inventam IDs, notas ou classificação retroativa. Ano vem de start_season.year ou, se necessário, do ano de start_date, nunca de uma data estimada.

DrawHistory já tinha apenas relação obrigatória com User e cópias de título/capa, sem relação com AnimeListEntry. Foram adicionadas sete colunas **nullable** para o snapshot do catálogo. Nenhuma tabela, relacionamento ou registro antigo foi removido. O `ddl-auto=update` existente adiciona as colunas ao iniciar com credenciais válidas. Para administração manual, há script aditivo opcional em `backend/database/migrations/002_global_draw_history.sql`, de execução única: confira SHOW COLUMNS e backup antes; não o execute se o Hibernate já adicionou as colunas. A revisão não executou o script ou migrações manualmente e não alterou dados de usuários.

Sortear grava somente o histórico, **nunca adiciona à biblioteca**. A ação Adicionar à biblioteca abre o formulário existente preenchido com o snapshot retornado, sem nova seleção ou consulta externa obrigatória. O usuário confirma o POST CRUD normalmente. A nota pública não preenche a nota pessoal. Ver no MyAnimeList abre `https://myanimelist.net/anime/{malId}` em outra aba.

## Sequência visual de jogo

A composição usa Canvas 2D para partículas/linhas de energia e transformações CSS 3D para profundidade, enquadramento e iluminação da carta. Não foi adicionada biblioteca 3D ou dependência de animação. Não é apenas um flip: há deslocamento em profundidade, chegada com overshoot controlado, carga nas bordas, feixe de concentração, partículas convergentes, pulso de revelação, varredura luminosa e entrada progressiva das informações.

`useDrawSequence` controla os estados. A consulta HTTP tem duração própria; nada é revelado em falha. Depois de uma resposta válida, há pré-carregamento da capa por até 800 ms (melhor esforço, sem bloquear indefinidamente), seguido de:

| Intervalo após preparo da capa | Estado | Apresentação |
| --- | --- | --- |
| 0–450 ms | preparing | Fundo escurece e o conteúdo perde foco |
| 450–2350 ms | invoking | Energia converge e a carta se aproxima em perspectiva |
| 2350–3350 ms | suspense | Carta estabilizada, bordas carregando luz |
| 3350–5100 ms | revealing | Pulso, giro coordenado e capa real |
| A partir de 5100 ms | result | Capa em destaque e dados entram em sequência |

O tempo principal é 5,1 segundos, mais até 0,8 segundo de preparo da imagem, sem contar a API. A composição segue identidade violeta/azul própria; não usa assets de Genshin/Honkai nem atribui raridades ou poderes aos animes. Falha de imagem usa o placeholder textual existente; não substitui o título por outro anime.

Pular apresentação e Esc mostram o mesmo resultado confirmado. Se o backend ainda não respondeu, o pedido de pular fica pendente até a resposta. Em prefers-reduced-motion, não há Canvas/apresentação e o resultado é mostrado diretamente. A preferência também é observada se mudar durante a sessão. Um lock em ref bloqueia cliques simultâneos antes do próximo render. AbortController, timers, requestAnimationFrame, ResizeObserver e carregamento de imagem são limpos ao desmontar. Cancelar a visualização não desfaz um histórico que o servidor já tenha confirmado.

O Canvas usa 85 partículas, DPR limitado a 1,75 e apenas traços leves; a carta usa transformações compostas. Existem ajustes para celular e telas de pouca altura. A janela imersiva restringe o foco ao controle de pular, impede rolagem do fundo e restaura os estados ao sair. Não houve benchmark universal de FPS ou teste em celular físico.

## Validação visual isolada

`frontend/test/visual/summon.html` é uma bancada local de teste com capa vetorial explicitamente identificada como fixture. Serve para conferir partículas, moldura, iluminação, timing e skip sem credenciais. Não integra o entrypoint ou o build de produção; a aplicação real não importa esses dados. A sequência completa foi executada no navegador e voltou ao estado concluído. A imagem em `docs/previews/summon-reveal-test.png` é evidência de teste visual, **não** consulta real ao MAL.

Para testar dados reais, configure MAL_CLIENT_ID e credenciais MySQL, reinicie o backend para carregar o código e adicionar as colunas, entre no frontend e sorteie com biblioteca vazia. Sem Client ID válido esta revisão não afirma sucesso desse fluxo ao vivo. Veja [VALIDACAO_FRONTEND.md](VALIDACAO_FRONTEND.md) para resultados executados.

## Localização posterior

A localização usa somente o dicionário Java para gêneros e metadados; sinopses e títulos permanecem originais. A integração de tradução automática e seus caches foram removidos, sem migrações ou regravação de registros. Mood usa os gêneros originais. Biblioteca, histórico, sorteio global e animação gacha permanecem preservados. Veja [LOCALIZACAO_PT_BR.md](LOCALIZACAO_PT_BR.md) e [VALIDACAO_FRONTEND.md](VALIDACAO_FRONTEND.md). As evidências manuais anteriores permanecem históricas.
