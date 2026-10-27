# Evidências de validação final — Anime Mood

Disciplina: Arquitetura e Desenvolvimento de APIs / Uninter. Data: 26/10/2026.

## 1. Ambiente e procedência

Código local revisado e testes efetivamente executados nesta preparação. Backend com Amazon Corretto 21.0.13 e Maven Wrapper 3.10.0; frontend com Node/npm instalados. MySQL local acessado com as mesmas variáveis da configuração Spring Boot do IntelliJ. Nenhum valor de senha/Client ID/header Basic é incluído neste documento. Os logs brutos permanecem locais/ignorados; relatórios Surefire podem conter propriedades da máquina e não devem ser enviados sem revisão.

O caminho de uma pasta JDK inicialmente encontrada não continha java.exe; foi usado o diretório da instalação efetiva. Uma primeira tentativa HTTP não alcançou o servidor; o log do servidor mostrou 8080 ocupada. A execução final usou SERVER_PORT=18080 e VITE_API_BASE_URL=http://localhost:18080/api somente nos processos. Nenhuma dessas tentativas iniciais foi registrada como aprovação.

## 2. Testes Java e pacote — aprovados

Comando na pasta backend, com ambiente local válido e JAVA_HOME apontando para JDK 21:

```powershell
.\mvnw.cmd -B package
```

| Classe de teste | Casos | Falhas | Erros |
| --- | ---: | ---: | ---: |
| BackendApplicationTests | 1 | 0 | 0 |
| CatalogControllerTests | 4 | 0 | 0 |
| DrawServiceTests | 2 | 0 | 0 |
| GlobalDrawPoolTests | 8 | 0 | 0 |
| LocalizationTests | 22 | 0 | 0 |
| MoodClassifierTests | 20 | 0 | 0 |
| MyAnimeListServiceTests | 16 | 0 | 0 |
| **Total** | **73** | **0** | **0** |

Resultado: BUILD SUCCESS; nenhum teste pulado; pacote `backend/target/backend-0.0.1-SNAPSHOT.jar` gerado com testes habilitados. O contexto Spring conectou ao MySQL: **não permanece o bloqueio de credenciais registrado nas revisões anteriores**. As credenciais foram reutilizadas do ambiente privado do IntelliJ, sem alteração.

Os testes de catálogo usam respostas MAL controladas, não simulam resultados na aplicação. O teste de contexto comprova carregamento com banco; sozinho não cobre CRUD funcional. A prova HTTP da próxima seção complementa essa lacuna.

## 3. Frontend — aprovado

Comandos existentes em frontend:

```powershell
npm test
npm run typecheck
npm run build
```

- Vitest: 36 testes aprovados em 5 arquivos, zero falhas.
- TypeScript: código de saída 0.
- Build Vite: sucesso; arquivos em frontend/dist; JS 308,05 kB (96,79 kB gzip), CSS 30,95 kB (8,24 kB gzip), conforme saída desta execução.
- Cobertura de cenários: cliente Basic, formulários/fluxos, catálogo, localização original e sequência gacha. Testes de componentes não equivalem a uma nova demonstração manual em navegador/celular.

## 4. Integração HTTP real — aprovada

O JAR gerado foi iniciado temporariamente em 18080, com JDK 21 e configurações locais válidas. Executado o script já existente:

```powershell
$env:VITE_API_BASE_URL = 'http://localhost:18080/api'
npm run test:integration
```

Saída sanitizada desta execução (nenhum header ou credencial):

```text
GET /anime-list: 401
POST /auth/register: 201
GET /anime-list: 200
POST /auth/register: 409
POST /anime-list: 201
GET /anime-list/7: 200
GET /draws/history: 200
PUT /anime-list/7: 200
POST /anime-list: 400
GET /anime-list/7: 200
DELETE /anime-list/7: 204
GET /anime-list/7: 404
```

São **12 requisições reais** via Fetch/script Node. O script também conferiu Access-Control-Allow-Origin para a origem http://127.0.0.1:5173 em todas essas respostas, biblioteca inicialmente vazia, status COMPLETED ao completar episódios e preservação de notas/sinopse no PUT.

Foi criada uma conta QA exclusiva com nome indicativo de avaliação e e-mail aleatório @example.com. A conta permanece, pois não há exclusão de usuário na API. Somente o anime criado e identificado pelo próprio teste foi removido pelo endpoint DELETE; nenhum dado preexistente foi apagado. Não foram excluídos arquivos de desenvolvimento.

## 5. Dez testes manuais históricos — relato separado

Antes desta revisão, o responsável informou aprovação dos casos abaixo por PowerShell. Não há transcrição/captura original anexada; esta tabela registra o relato, não uma execução manual nova ou dez testes JUnit.

| Nº | Cenário manual informado | Resultado relatado | Evidência automatizada atual equivalente |
| --- | --- | --- | --- |
| 1 | GET lista | 200 | Integração HTTP real |
| 2 | POST válido | 201 | Integração HTTP real |
| 3 | GET por ID | 200 | Integração HTTP real |
| 4 | PUT | 200 | Integração HTTP real |
| 5 | Conclusão ao atingir total positivo | COMPLETED | Asserção do script HTTP após PUT |
| 6 | POST inválido | 400 | Integração HTTP real |
| 7 | GET inexistente | 404 | Integração HTTP após remover sua própria fixture |
| 8 | GET sem autenticação | 401 | Integração HTTP real |
| 9 | E-mail duplicado | 409 | Integração HTTP real |
| 10 | DELETE | 204 | Integração HTTP real |

## 6. Conferência do enunciado obrigatório

| Requisito | Implementação/evidência observada | Situação |
| --- | --- | --- |
| API HTTP própria e recursos REST | Controllers próprios; tabela com 11 rotas no relatório | Atendido |
| GET coleção e individual | Biblioteca /api/anime-list e /{id}; prova HTTP | Atendido |
| POST, PUT ou PATCH, DELETE | POST/PUT/DELETE da biblioteca; prova HTTP | Atendido com PUT completo, justificado no relatório |
| Banco persistente e ORM | MySQL, @Entity, @ManyToOne, JpaRepository/Hibernate, contexto e CRUD reais | Atendido; demonstração visual entre reinícios ainda pode ser anexada |
| Validação e erros HTTP | Bean Validation, regra de episódios, advice; 400/401/404/409 reais | Atendido |
| Autenticação e rota protegida | Basic/BCrypt; 401 anônimo e 200 autenticado | Atendido |
| CORS explicado/configurado | SecurityConfig, testes controller, headers na prova HTTP | Atendido |
| Documentação e reprodução | README, .env.example, init.sql e relatório com 12 tópicos | Preparado localmente |
| Testes e evidências | Suítes Java/frontend e integração HTTP desta execução | Atendido com os limites discriminados |
| Repositório remoto acessível | Origin configurado; parte do código ainda não rastreada | Publicação e acesso do professor pendentes do autor |
| Relatório no formato solicitado | Relatório Word identificado reservado ao AVA; Markdown público sem identificação | Conferir formato exigido no AVA e exportar se necessário |

Não se promete nota ou aprovação acadêmica; a decisão cabe ao avaliador.

## 7. Demonstrações manuais complementares ainda não feitas nesta revisão

O roteiro aceita testes automatizados, portanto não há imposição no PDF de um vídeo ou de usar Swagger. Se o professor exigir capturas/vídeo ou para reforçar a apresentação, priorizar:

1. Cadastro, entrada, GET sem Basic e GET com Basic (ocultar credenciais).
2. Criar um anime de demonstração, consultar, editar/progredir até COMPLETED, excluir somente esse item e obter 404.
3. Criar outro item, reiniciar o backend e comprovar que permanece no MySQL; não tocar em dados pessoais anteriores.
4. Acessar item da conta A com conta B e comprovar 404, além de histórico pessoal separado.
5. Mostrar CORS/preflight da origem permitida e rejeição de outra origem, explicando que clientes diretos não são bloqueados por CORS.
6. Opcional: pesquisa MAL, seleção/importação, sinopse original, sorteio global com mood, skip/reduced-motion e histórico. O catálogo externo ao vivo e navegação completa não foram revalidados nesta preparação; os respectivos testes isolados passaram.

Guardar método, rota, status, entrada sanitizada e resultado esperado. Capturas não podem incluir Environment variables do IntelliJ, Authorization/Basic, senha do banco ou MAL_CLIENT_ID. Não exportar o ambiente privado do cliente HTTP. A animação não precisa de alteração nem de demonstração para cumprir o mínimo da API.

## 8. Conferência de publicação e limites

Varredura dos caminhos candidatos à publicação: nenhum .env privado, arquivo de chave, .idea, .run, target, node_modules ou dist incluído. A busca por padrões de segredos em fontes/configurações sinalizou somente `frontend/src/test/api.test.ts`, cuja senha literal é uma fixture artificial, sem conta real. Não foi feita auditoria exaustiva de conteúdo de todos os commits históricos; a busca por nomes de arquivos sensíveis no histórico local não encontrou ocorrências.

Wrapper e package-lock.json presentes. Dependências declaradas correspondem às tecnologias utilizadas; não há conector/modelo/script Argos, Python ou API de tradução. Não foi acrescentada dependência nem executado npm install/ci desnecessariamente, pois as dependências existentes permitiram testar/buildar. Nenhum arquivo da pasta de desenvolvimento foi excluído.

Limites: frontend sem nova auditoria visual, chamadas externas MAL não exercidas ao vivo, persistência entre reinícios e isolamento entre duas contas não demonstrados manualmente nesta revisão. A reprodução em outro computador depende da instalação de JDK/MySQL/Node e configuração própria conforme README. A publicação GitHub e submissão no AVA não foram executadas.

## 9. Artefatos acadêmicos no modelo oficial

O relatório acadêmico identificado foi preenchido no modelo Word oficial, com 11 páginas renderizadas e revisadas. Ele permanece somente no computador para envio privado ao AVA e está excluído da publicação. O original fornecido permanece intacto. O endereço GitHub deve ser atualizado na cópia privada após a publicação.

Os números 73/36/12 referem-se às execuções verificadas e descritas acima, não a uma nova rodada feita para montar o Word. A captura incluída é a imagem real da bancada visual isolada existente, explicitamente identificada como fixture; não é evidência de consulta MAL ou de resposta CRUD. As provas da API são os registros textuais reais existentes, sem capturas de Insomnia inventadas.

A coleção [insomnia/Anime-Mood.insomnia.json](insomnia/Anime-Mood.insomnia.json) tem 21 requisições e variáveis para URL, conta e IDs. Foi conferida como JSON, em suas referências/hierarquia, corpos válidos (exceto o exemplo intencional de JSON ilegível), Basic das rotas protegidas e ausência de autenticação no exemplo 401. Não foi importada/executada manualmente em um cliente Insomnia nesta preparação. Senha do exemplo está vazia; nenhum valor real de senha/Client ID consta no Word, coleção ou instruções conferidas. A reprodução está em [insomnia/README.md](insomnia/README.md) e no README principal. Nenhuma funcionalidade foi alterada.
