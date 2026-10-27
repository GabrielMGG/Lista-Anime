# Coleção Insomnia e reprodução em outro computador

Arquivo: [Anime-Mood.insomnia.json](Anime-Mood.insomnia.json). É uma coleção portátil JSON v4, formato ainda aceito para importação pelo Insomnia. Referências oficiais: [importação e exportação](https://developer.konghq.com/insomnia/import-export/) e [ambientes](https://developer.konghq.com/insomnia/environments/).

## Pré-requisitos e execução

1. Instalar JDK 21 e MySQL; selecionar JDK 21 em JAVA_HOME e no executor Maven do IntelliJ. MySQL deve estar em execução.
2. Obter o código completo publicado ou o pacote de fontes; na raiz executar `backend/database/init.sql` pelo Workbench ou `mysql -u root -p -e "source backend/database/init.sql"`.
3. Definir DB_USER e DB_PASSWORD somente no ambiente local. A URL JDBC padrão é jdbc:mysql://localhost:3306/anime_mood; SPRING_DATASOURCE_URL permite outra configuração. Spring Boot não carrega .env automaticamente. Nunca importar/compartilhar as configurações privadas do autor.
4. Em backend, executar `.\mvnw.cmd -B package` e `.\mvnw.cmd spring-boot:run`, ou `java -jar target/backend-0.0.1-SNAPSHOT.jar`. O primeiro acesso do Wrapper exige internet para dependências. `package` executa os testes, incluindo o contexto com MySQL.
5. Se a porta 8080 estiver ocupada, definir SERVER_PORT no processo do backend e usar a mesma porta em base_url da coleção. Não é necessário interromper outro serviço.

MAL_CLIENT_ID **não é necessário para os requisitos obrigatórios de API própria, CRUD, autenticação, validação e persistência**. Configure um Client ID próprio apenas no backend para pesquisa, detalhes e sorteio global do MyAnimeList. Sem ele essas rotas retornam 503; CRUD e histórico pessoal continuam disponíveis. Nenhum Client ID do autor está nesta coleção. Não usar Jikan ou dados simulados como fallback.

## Importar e configurar

No Insomnia, usar Import > File e selecionar Anime-Mood.insomnia.json. Selecionar a coleção Anime Mood e editar o ambiente local antes de enviar requisições. Os nomes dos menus podem variar por versão.

| Variável | Configuração local |
| --- | --- |
| base_url | http://localhost:8080/api; ajustar se usar outra porta |
| api_name | Nome da conta criada para avaliação |
| api_email | Escolher e-mail exclusivo para a nova conta; o exemplo @example.com não é credencial do autor |
| api_password | Definir uma senha local com pelo menos 8 caracteres; está vazia no arquivo compartilhado |
| anime_id | Substituir 0 pelo id devolvido pela criação POST desta avaliação |
| missing_id | ID inexistente para demonstrar 404; ajustar se necessário |
| mal_id | 20 no exemplo Naruto; usado somente nos testes opcionais MAL |
| mood | ACTION no exemplo; FUN, RELAXED, ACTION, EMOTIONAL ou DARK |
| frontend_origin | http://localhost:5173, origem permitida pelo CORS |

O campo api_email é o usuário do HTTP Basic. As requisições protegidas usam Basic com api_email/api_password; o Insomnia gera o header. Cadastro, hello e a requisição de 401 não enviam autenticação. Cookies estão desativados nos exemplos. Não há JWT ou endpoint de login.

Preencha a senha somente em ambiente privado/local do Insomnia e não reexporte valores reais. Se a versão do Insomnia oferecer armazenamento privado de segredos, utilize-o. O arquivo compartilhado mantém api_password vazio. Se usar caracteres que exijam escape em JSON, confira o preview do corpo de cadastro antes de enviar.

## Ordem da demonstração obrigatória

Execute manualmente, sem rodar a pasta inteira em lote:

1. 00: GET hello → 200.
2. 01: cadastro com e-mail novo e senha local válida → 201 sem corpo.
3. 02: GET sem autenticação → 401. Essa requisição não contém Basic; não habilitar autenticação herdada/global nela.
4. 03: GET lista autenticada → 200 (pode estar vazia).
5. 04: POST anime → 201. Copiar **o id da resposta** para anime_id antes de continuar. Não usar um ID de registro preexistente.
6. 05: GET individual → 200.
7. 06: PUT completo com 12 de 12 episódios → 200 e status COMPLETED. Conferir que sinopse/notas permanecem conforme o corpo enviado.
8. 07: histórico → 200, podendo estar vazio; a coleção não inventa histórico.
9. Na pasta de erros, 10/11/14/15 → 400 (título vazio, contagem inválida, enum inválido, JSON ilegível); 12 → 409 após repetir o e-mail cadastrado; 13 → 404 para ID inexistente.
10. Retornar ao CRUD: 08 DELETE apenas do anime criado na etapa 5 → 204 sem corpo; 09 GET do mesmo ID → 404.

A criação de conta permanece no banco porque a API não oferece exclusão de usuário. Não excluir dados anteriores. As requisições de exclusão não são executadas automaticamente pela importação.

PUT exige o DTO completo; não é PATCH. Score pessoal opcional é de 0 a 10; total e assistidos são inteiros não negativos. Ao alcançar total positivo, o backend define COMPLETED. HTTP Basic requer HTTPS em publicação; para avaliação local usa-se localhost.

## Pasta opcional MyAnimeList

Contém pesquisa, detalhes, sorteio com/sem mood e exemplo de mood inválido. Consulta e sorteio válidos exigem Client ID no **backend** e internet. POST draws grava histórico, sem adicionar à biblioteca; não enviar em lote se não quiser esses registros. Ausência de candidatos retorna 404, serviço não configurado/rate limit 503, falha externa 502, falha de acesso/timeout 504. A API externa não substitui as operações CRUD próprias.

## Testes automatizados existentes

Em backend, `.\mvnw.cmd -B package`. Em frontend, instalar Node 22.18+ e executar `npm ci`, `npm test`, `npm run typecheck`, `npm run build`.

Opcionalmente, com o backend já executando, `npm run test:integration` em frontend; pode-se definir VITE_API_BASE_URL para outra porta. Esse script existente cria uma conta QA e seu próprio anime, faz 12 requisições e remove somente o anime criado; a conta fica no banco. Não é necessário para importar a coleção. O frontend visual também é opcional para a disciplina.

## Evidências e estado da coleção

Os 73 testes Java, 36 frontend e 12 requisições reais registrados em [EVIDENCIAS_TESTES.md](../EVIDENCIAS_TESTES.md) são resultados anteriores verificados. A geração desta coleção não transforma exemplos em novos resultados aprovados. A coleção foi validada como JSON e por estrutura/referências/ausência de credenciais reais; a execução/importação manual no Insomnia de outro computador deve ser confirmada pelo avaliador.

Não existe captura original de cada requisição no Insomnia. Capture seus próprios resultados reais, com método/URL, status e corpo relevante, ocultando Authorization/Basic, senhas, ambiente privado e qualquer chave. Não exportar cookies ou ambientes com segredos.
