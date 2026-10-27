# Anime Mood

API própria para organizar uma biblioteca pessoal de animes, acompanhar episódios e descobrir o que assistir por humor. O backend Java/Spring Boot persiste usuários, animes e histórico no MySQL; o frontend React fica em uma pasta separada.

**Para avaliar o projeto, basta executar o backend com MySQL.** Frontend, IDE e integração MyAnimeList são opcionais. Escolha uma forma de execução e um cliente HTTP; não é necessário instalar todas as ferramentas citadas.

## Guia rápido — backend no Windows

1. Instale o **JDK 21**, configure `JAVA_HOME`/`PATH` e confira `java -version` e `javac -version`.
2. Inicie o **MySQL** em `localhost:3306`. Execute [backend/database/init.sql](backend/database/init.sql) no Workbench ou no cliente MySQL para criar `anime_mood` sem apagar dados existentes.
3. Na raiz do projeto, abra o **PowerShell** e informe as credenciais da sua própria conta MySQL:

```powershell
$env:DB_USER = Read-Host 'Usuário MySQL'
$dbCredential = Get-Credential -UserName $env:DB_USER -Message 'Credenciais MySQL'
$env:DB_PASSWORD = $dbCredential.GetNetworkCredential().Password
Set-Location backend
.\mvnw.cmd spring-boot:run
```

O **Maven Wrapper** baixa o Maven e as dependências na primeira execução; não é necessário Maven global. O projeto não carrega `.env` automaticamente. `MAL_CLIENT_ID`(MAL = My Anime List😅) é opcional para executar e avaliar o CRUD; pesquisa, detalhes e sorteio global do MyAnimeList exigem um Client ID próprio.

4. Com o backend iniciado, teste em outro terminal:

```powershell
Invoke-RestMethod -Uri 'http://localhost:8080/api/hello'
```

Resposta esperada: HTTP **200**, com o texto `Anime Mood API esta on!`, sem autenticação. Ao encerrar a execução, remova a senha do ambiente com `Remove-Item Env:DB_PASSWORD` no primeiro terminal e descarte a variável com `Remove-Variable dbCredential`.

As seções abaixo mantêm as instruções completas de banco, permissões, variáveis, outras plataformas e IDEs.

## Índice

- [Guia rápido — backend no Windows](#guia-rápido--backend-no-windows)

1. [Apresentação do Anime Mood](#1-apresentação-do-anime-mood)
2. [Funcionalidades principais](#2-funcionalidades-principais)
3. [Tecnologias utilizadas](#3-tecnologias-utilizadas)
4. [Pré-requisitos](#4-pré-requisitos)
5. [Como baixar o projeto](#5-como-baixar-o-projeto)
6. [Configuração do MySQL](#6-configuração-do-mysql)
7. [Configuração das variáveis de ambiente](#7-configuração-das-variáveis-de-ambiente)
8. [Como executar o backend](#8-como-executar-o-backend)
9. [Como executar o frontend](#9-como-executar-o-frontend)
10. [Como testar a API](#10-como-testar-a-api)
11. [Integração opcional com MyAnimeList](#11-integração-opcional-com-myanimelist)
12. [Testes automatizados](#12-testes-automatizados)
13. [Tabela de endpoints](#13-tabela-de-endpoints)
14. [Solução de problemas comuns](#14-solução-de-problemas-comuns)
15. [Estrutura do repositório](#15-estrutura-do-repositório)
16. [Documentação técnica e entrega acadêmica](#16-documentação-técnica-e-entrega-acadêmica)

## 1. Apresentação do Anime Mood

Desenvolvido para a disciplina de **Arquitetura e Desenvolvimento de APIs**, o Anime Mood disponibiliza endpoints próprios para criar, consultar, atualizar e excluir animes pessoais, com autenticação e persistência real.

MyAnimeList complementa essa API com pesquisa, detalhes e sorteio global; não substitui o CRUD próprio. A interface é uma aplicação de organização e descoberta, sem streaming ou leitura de conteúdo.

## 2. Funcionalidades principais

- Cadastro e acesso por HTTP Basic, com senhas armazenadas como hash BCrypt.
- CRUD pessoal com status, humor, nota, observações e progresso de episódios.
- Conclusão automática ao atingir o total positivo de episódios: status `COMPLETED`.
- Histórico pessoal com snapshots dos resultados sorteados.
- Com MAL configurado: pesquisa, detalhes, importação de metadados e sorteio global com mood opcional.
- Frontend opcional com filtros locais, formulários e apresentação gacha com opção de pular e movimento reduzido.

Títulos mantêm o campo principal `title` do MAL; títulos salvos não são renomeados. Sinopses permanecem originais, inclusive em inglês. Gêneros/metadados usam o dicionário Java. Não há serviço de tradução automática.

## 3. Tecnologias utilizadas

| Área | Tecnologias presentes |
| --- | --- |
| Backend | Java 21, Spring Boot 4.1.2, Spring Web MVC |
| Persistência | MySQL, Connector/J, Spring Data JPA e Hibernate |
| Segurança/validação | Spring Security, HTTP Basic, BCrypt, Jakarta Bean Validation |
| Build backend | Maven Wrapper; distribuição Maven 3.10.0 definida no projeto |
| Frontend opcional | React, TypeScript, Vite, Tailwind CSS, React Router, Lucide React e Fetch |
| Testes | JUnit, Spring Boot Test, MockMvc/Mockito, Vitest, Testing Library e script HTTP Node |
| Integração opcional | API oficial MyAnimeList v2 via RestClient no backend |

Não há Docker, Swagger/OpenAPI, JWT ou servidor Node de aplicação configurados. Os contratos estão neste guia e no [relatório técnico](docs/RELATORIO_TECNICO.md).

## 4. Pré-requisitos

| Requisito | Quando é necessário |
| --- | --- |
| **JDK 21**, incluindo java e javac | Compilar, testar e executar o backend |
| **MySQL Server** em execução; este guia usa MySQL 8.x | Persistência e teste de contexto Spring |
| Cliente MySQL de terminal **ou** Workbench | Executar o script inicial e conferir acesso |
| Internet na primeira compilação | Baixar Maven e dependências pelo Wrapper |
| Git **ou** download ZIP | Obter os arquivos |
| Node.js/npm; recomendado **Node 22.18+** compatível com o lockfile | Somente frontend e script HTTP Node |
| Client ID próprio MAL e internet | Somente pesquisa, detalhes e sorteio global |

O Vite instalado declara Node `^20.19.0 || >=22.12.0`; a recomendação 22.18+ evita versões antigas no fluxo documentado. O conjunto de dependências é fixado pelo `frontend/package-lock.json`.

**Terminal do sistema:**

```text
java -version
javac -version
```

Ambos devem apontar para JDK 21. Configure `JAVA_HOME` para a pasta do JDK, sem `bin`, e inclua seu `bin` no `PATH`. Abra novo terminal após mudanças no ambiente. Maven global e IntelliJ não são obrigatórios.

## 5. Como baixar o projeto

Clone o repositório ou baixe o código em ZIP.

**Terminal com Git — Windows, Linux ou macOS:**

```sh
git clone https://github.com/GabrielMGG/Lista-Anime.git Lista-Anime
cd Lista-Anime
```

Alternativa: no GitHub, **Code > Download ZIP**, extrair e abrir a pasta com `backend/`, `frontend/` e `docs/`. O nome extraído pode variar; ajuste a navegação.

Os exemplos partem dessa raiz, salvo indicação contrária. Não copie configurações privadas do autor. Se houver falha de acesso ao remoto, confirme a URL e as permissões de acesso ao repositório.

## 6. Configuração do MySQL

### Instalar e iniciar

1. Instale **MySQL Server** para seu sistema conforme o [guia oficial](https://dev.mysql.com/doc/refman/8.4/en/installing.html). Workbench é um cliente, não substitui o servidor.
2. Inicialize a instância e configure sua conta administrativa e senha.
3. Inicie o servidor: no Windows, pelo serviço criado na instalação em **Serviços**; no Linux, pelo gerenciador de serviços da distribuição; no macOS, pelo controle disponibilizado pelo instalador. O nome do serviço varia, não é necessariamente MySQL80/mysql.
4. Confira host e porta. O padrão da aplicação é `localhost:3306`.

### Pelo MySQL Workbench

Abra a conexão administrativa, use **File > Open SQL Script**, selecione [backend/database/init.sql](backend/database/init.sql), execute e atualize os schemas. Deve aparecer `anime_mood`.

### Pelo terminal MySQL

Na **raiz do repositório**, no PowerShell, CMD ou shell Linux/macOS, substitua o usuário administrativo:

```sh
mysql -h localhost -P 3306 -u seu_usuario_admin -p
```

Digite a senha no prompt. Dentro do **prompt mysql>**, execute:

```sql
SOURCE backend/database/init.sql;
SHOW DATABASES LIKE 'anime_mood';
```

`SOURCE` usa o diretório em que o cliente foi aberto; ajuste o caminho se necessário. Referência: [execução de scripts no cliente MySQL](https://dev.mysql.com/doc/refman/8.4/en/mysql-batch-commands.html).

### Conta da aplicação e permissões

Utilize uma conta própria; **não é obrigatório usar root**. Ela precisa de SELECT/INSERT/UPDATE/DELETE no banco e, com `ddl-auto=update`, permissões de estrutura como CREATE, ALTER, INDEX e REFERENCES.

<details>
<summary>Exemplo opcional para o administrador de um ambiente novo</summary>

Após criar o banco, substitua a senha abaixo localmente. Estes comandos são orientações de configuração, não fazem parte do script do projeto. Não altere contas existentes de outras pessoas.

```sql
CREATE USER IF NOT EXISTS 'anime_mood_app'@'localhost'
    IDENTIFIED BY 'SUBSTITUA_POR_UMA_SENHA_LOCAL_FORTE';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, REFERENCES
    ON anime_mood.* TO 'anime_mood_app'@'localhost';
```

Se a conta já existir, esse exemplo não redefine sua senha. Em banco remoto, o host autorizado da conta deve corresponder ao cliente; solicite a configuração ao administrador.

</details>

Confira o acesso com a **mesma conta do backend**, substituindo o usuário se escolheu outro:

**Terminal do sistema:**

```sh
mysql -h localhost -P 3306 -u anime_mood_app -p -D anime_mood -e "SELECT DATABASE(), CURRENT_USER(); SHOW TABLES;"
```

O banco pode estar sem tabelas antes do primeiro início do backend.

**Banco e tabelas são etapas diferentes:** `init.sql` apenas cria o banco ausente em utf8mb4, sem apagar dados. Hibernate cria/atualiza as tabelas pelas entidades ao iniciar, pois `spring.jpa.hibernate.ddl-auto=update` está ativo. Isso pode alterar o esquema e não substitui migrações versionadas. Não reaplique o script aditivo opcional em `database/migrations/` se suas colunas já existirem; veja o relatório.

## 7. Configuração das variáveis de ambiente

**O backend não carrega automaticamente .env ou .env.example.** [backend/.env.example](backend/.env.example) é uma referência. Configure o ambiente no terminal que iniciará o Java ou na execução da IDE; variáveis de outro terminal não são transferidas para uma IDE já aberta.

| Variável | Finalidade | Obrigatória? | Exemplo sem segredo real |
| --- | --- | --- | --- |
| DB_USER | Conta MySQL do backend | Recomendado definir; padrão do código: root | anime_mood_app |
| DB_PASSWORD | Senha dessa conta MySQL | **Sim**, definir localmente | Sua senha no processo/IDE |
| SPRING_DATASOURCE_URL | Sobrescrever URL JDBC | Não | jdbc:mysql://localhost:3306/anime_mood |
| SERVER_PORT | Porta do backend | Não; padrão 8080 | 18080 |
| MAL_CLIENT_ID | Acesso do backend ao catálogo oficial | Não para CRUD; sim para funções MAL | Seu Client ID próprio, somente local |
| VITE_API_BASE_URL | URL do backend no frontend/script HTTP | Não; padrão http://localhost:8080/api | http://localhost:18080/api |

URL/porta são configurações externas reconhecidas pelo Spring Boot. `VITE_API_BASE_URL` pertence ao frontend e não substitui a conexão JDBC. **Usuário MySQL e usuário cadastrado na API são contas diferentes.** Não há conta padrão cadastrada para o professor.

Os métodos abaixo mostram a configuração por terminal/IDE. No frontend, o Vite lê `.env.local`; toda variável `VITE_*` é exposta ao cliente e não deve conter senha ou Client ID. Mantenha segredos fora do Git.

## 8. Como executar o backend

**Escolha somente um método A–F.** Todos precisam de MySQL acessível e ambiente configurado. URL padrão: `http://localhost:8080`. Encerre uma execução de terminal com Ctrl+C.

### Método A — Terminal no Windows

**PowerShell**, na raiz; a senha não aparece no prompt de credenciais:

```powershell
$env:DB_USER = Read-Host 'Usuário MySQL'
$dbCredential = Get-Credential -UserName $env:DB_USER -Message 'Credenciais MySQL'
$env:DB_PASSWORD = $dbCredential.GetNetworkCredential().Password
$env:SPRING_DATASOURCE_URL = 'jdbc:mysql://localhost:3306/anime_mood'
Set-Location backend
.\mvnw.cmd spring-boot:run
```

As variáveis valem para esse terminal e seus filhos. Após encerrar o backend:

```powershell
Remove-Item Env:DB_PASSWORD
Remove-Variable dbCredential
```

**CMD**, na raiz:

```bat
set /p "DB_USER=Usuario MySQL: "
set /p "DB_PASSWORD=Senha MySQL (entrada visivel): "
set "SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/anime_mood"
cd backend
mvnw.cmd spring-boot:run
```

O `set /p` do CMD **mostra o que foi digitado**. Para entrada oculta, prefira o PowerShell. Não compartilhe a tela ao digitar. Ao encerrar, use `set "DB_PASSWORD="` ou feche o CMD. O Wrapper usa `mvnw.cmd`, sem exigir Maven global.

### Método B — Terminal Linux/macOS

Exemplo para **Bash ou Zsh**, na raiz; entrada de senha silenciosa:

```sh
printf 'Usuário MySQL: '
read -r DB_USER
export DB_USER
printf 'Senha MySQL: '
read -r -s DB_PASSWORD
printf '\n'
export DB_PASSWORD
export SPRING_DATASOURCE_URL='jdbc:mysql://localhost:3306/anime_mood'
cd backend
chmod +x mvnw
./mvnw spring-boot:run
```

Após encerrar, execute `unset DB_PASSWORD`. `chmod` só é necessário se faltar permissão de execução. Os exemplos não são para Fish ou para o prompt SQL.

### Método C — IntelliJ IDEA

1. Abra ou importe [backend/pom.xml](backend/pom.xml) como projeto Maven e aguarde as dependências.
2. Em **Project Structure > Project SDK**, selecione JDK 21; escolha JDK 21 também no importador/executor Maven.
3. Abra `com.animemood.backend.BackendApplication` e crie uma configuração **Application** ou **Spring Boot**, conforme os recursos disponíveis.
4. Em **Run > Edit Configurations > Environment variables**, defina DB_USER/DB_PASSWORD e, se necessário, URL/porta opcionais.
5. Execute o `main` pela configuração preparada.

Java Application é suficiente; recursos específicos de Spring não são obrigatórios. Configure o ambiente também na execução Maven/JUnit se usar esses testes na IDE. Não compartilhe configurações com senha. Referência: [variáveis no IntelliJ](https://www.jetbrains.com/help/idea/program-arguments-and-environment-variables.html).

### Método D — VS Code

1. Instale **Extension Pack for Java**, com suporte à linguagem, depuração e Maven. **Spring Boot Extension Pack** é opcional; extensões são recursos da IDE, não novas dependências do projeto.
2. Abra a raiz, importe `backend/pom.xml` e aguarde o carregamento Maven.
3. Use **Java: Configure Java Runtime** para escolher JDK 21.
4. Em **Run and Debug**, crie uma configuração Java para a classe principal. Exemplo de `.vscode/launch.json` **local** quando a raiz aberta é o repositório inteiro:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "java",
      "name": "Anime Mood local",
      "request": "launch",
      "mainClass": "com.animemood.backend.BackendApplication",
      "cwd": "${workspaceFolder}/backend",
      "env": {
        "DB_USER": "anime_mood_app",
        "DB_PASSWORD": "SUBSTITUA_SOMENTE_NA_CONFIGURACAO_LOCAL"
      }
    }
  ]
}
```

5. Preencha somente sua configuração local e execute. Se abriu diretamente `backend`, use `"cwd": "${workspaceFolder}"`.

Não versione o arquivo com senha; `.vscode/` é ignorada. Alternativa: usar o terminal integrado com o método A/B e suas variáveis nesse terminal. Referências: [Java/Spring Boot](https://code.visualstudio.com/docs/java/java-spring-boot) e [depuração Java](https://code.visualstudio.com/docs/java/java-debugging).

### Método E — Eclipse ou IDE compatível

1. Em Eclipse com Java 21 e Maven/m2e, selecione **File > Import > Maven > Existing Maven Projects** e a pasta `backend`.
2. Configure JDK 21 em **Installed JREs** e no build path/ambiente de execução do projeto; atualize o projeto Maven se necessário.
3. Em **Run Configurations > Java Application**, selecione `com.animemood.backend.BackendApplication` e JDK 21 na aba JRE.
4. Na aba **Environment**, defina DB_USER/DB_PASSWORD e variáveis opcionais.
5. Execute. Para testes na IDE, configure o ambiente também na execução Maven/JUnit.

Em outra IDE, importe o POM, selecione JDK 21 e execute a classe principal com o ambiente preparado. Menus variam por versão. Referências: [Maven/m2e](https://eclipse.dev/m2e/documentation/m2e-documentation.html) e [execução Java no Eclipse](https://help.eclipse.org/latest/topic/org.eclipse.jdt.doc.user/tasks/tasks-java-local-configuration.htm).

### Método F — Arquivo JAR

Para este método, configure as variáveis como no método A/B, mas **não execute spring-boot:run**: o JAR será o processo do backend. Na pasta **backend**, gere o pacote e execute:

**Windows — PowerShell ou CMD:**

```bat
.\mvnw.cmd -B package
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

**Linux/macOS — Bash ou Zsh:**

```sh
chmod +x mvnw
./mvnw -B package
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

`package` executa testes e precisa do banco configurado. O plugin Spring Boot gera um JAR com dependências; use `.jar`, não `.jar.original`. A máquina de destino precisa de Java 21, MySQL e variáveis. Quem recebe um JAR pronto não precisa de Maven para executá-lo.

## 9. Como executar o frontend

Instale [Node.js](https://nodejs.org/en/download), incluindo npm, conforme os pré-requisitos; confira `node --version` e `npm --version`.

**Backend e frontend são processos separados.** Mantenha o backend ativo e abra outro terminal na raiz do repositório.

**Windows — PowerShell ou CMD:**

```bat
cd frontend
npm ci
```

Copie o exemplo **somente se .env.local ainda não existir**:

**PowerShell:**

```powershell
if (-not (Test-Path .env.local)) { Copy-Item .env.example .env.local }
```

**CMD:**

```bat
if not exist .env.local copy .env.example .env.local
```

**Linux/macOS — Bash ou Zsh:**

```sh
cd frontend
npm ci
# Somente se o arquivo ainda não existir:
test -e .env.local || cp .env.example .env.local
```

Configure `frontend/.env.local`:

```dotenv
VITE_API_BASE_URL=http://localhost:8080/api
```

Se o backend usar 18080, troque para `http://localhost:18080/api`. Não coloque credenciais aqui. Reinicie o Vite após mudar a variável.

**Na pasta frontend, em qualquer sistema:**

```sh
npm run dev
```

Acesse `http://localhost:5173` ou `http://127.0.0.1:5173`. `strictPort: true` impede troca automática de porta. Cadastre uma conta pela interface/API. A entrada valida Basic com GET `/api/anime-list`; credenciais ficam somente em memória, recarga exige novo acesso e logout limpa a sessão.

## 10. Como testar a API

Base padrão: `http://localhost:8080/api`; ajuste se mudou SERVER_PORT. Não é obrigatório instalar Insomnia ou executar o frontend.

### Autenticação e fluxo básico

Cadastro é público e retorna **201 sem corpo**. Nome é obrigatório até 100 caracteres; e-mail deve ser válido; senha deve ter pelo menos 8 caracteres. Nas rotas protegidas, configure **Basic Auth** com a conta cadastrada na API, não com a conta MySQL. O cliente envia `Authorization: Basic <base64(email:senha)>`; não existe login/JWT. Base64 não cifra a senha: use HTTPS em publicação.

| Etapa | Requisição | Resposta esperada |
| --- | --- | --- |
| 1 | GET `/api/hello` | 200, texto de disponibilidade |
| 2 | POST `/api/auth/register` | 201, conta criada |
| 3 | GET `/api/anime-list` sem Basic | 401, rota protegida |
| 4 | GET `/api/anime-list` com Basic | 200, biblioteca pessoal (pode estar vazia) |
| 5 | POST `/api/anime-list` | 201; guardar o id devolvido |
| 6 | GET `/api/anime-list/{id}` | 200, item criado |
| 7 | PUT `/api/anime-list/{id}` com DTO completo | 200, item atualizado |
| 8 | DELETE `/api/anime-list/{id}` | 204 sem corpo; GET posterior retorna 404 |

Use apenas IDs criados na própria avaliação. A conta permanece porque não há endpoint de exclusão de usuário; também não há exclusão de histórico.

### Insomnia

Importe [Anime-Mood.insomnia.json](docs/insomnia/Anime-Mood.insomnia.json). Preencha localmente base_url, api_email e api_password; após o POST, copie o id para anime_id. O arquivo compartilhado tem senha vazia. O [roteiro](docs/insomnia/README.md) descreve a ordem e exemplos de 400/404/409. A coleção foi validada estruturalmente. No teste manual informado pelo usuário no Insomnia, o envio de humor inválido retornou **HTTP 409**, embora o esperado fosse **400**. Trata-se de uma divergência registrada; esta revisão não repetiu a requisição nem alterou a API.

### Postman

Crie as requisições da tabela acima e um ambiente local para URL, e-mail, senha e ID. Nas rotas protegidas, use **Basic Auth**; em POST/PUT, **Body > raw > JSON**, com Content-Type `application/json`. Cadastro e demonstração de 401 devem usar **No Auth**. Não compartilhe/reexporte o ambiente com segredos. Não há coleção Postman pronta no projeto.

### cURL — Bash/Zsh no Linux/macOS

Em uma pasta local de avaliação, fora do conteúdo a publicar, crie `cadastro.json`. Substitua os exemplos por e-mail exclusivo e senha local:

```json
{"name":"Avaliador","email":"avaliador@example.com","password":"SUBSTITUA_POR_SENHA_LOCAL"}
```

Crie `anime.json` com o DTO completo:

```json
{
  "title": "Anime de avaliação",
  "coverUrl": null,
  "synopsis": "Original synopsis for the CRUD demonstration.",
  "genres": "Adventure",
  "totalEpisodes": 12,
  "episodesWatched": 0,
  "status": "PLAN_TO_WATCH",
  "mood": "ACTION",
  "score": null,
  "notes": "Registro criado por esta avaliação"
}
```

Execute nessa pasta, ajustando o e-mail se usou outro. `--user` com apenas e-mail solicita a senha interativamente:

```sh
API='http://localhost:8080/api'
curl -i "$API/hello"
curl -i -H 'Content-Type: application/json' --data-binary @cadastro.json "$API/auth/register"
curl -i "$API/anime-list"
curl -i --user avaliador@example.com "$API/anime-list"
curl -i --user avaliador@example.com -H 'Content-Type: application/json' --data-binary @anime.json "$API/anime-list"
printf 'ID devolvido pelo POST anterior: '
read -r ANIME_ID
curl -i --user avaliador@example.com "$API/anime-list/$ANIME_ID"
```

Edite **somente seu anime.json de teste**, mantendo os campos e mudando episodesWatched para 12. Depois:

```sh
curl -i --user avaliador@example.com -X PUT -H 'Content-Type: application/json' --data-binary @anime.json "$API/anime-list/$ANIME_ID"
curl -i --user avaliador@example.com -X DELETE "$API/anime-list/$ANIME_ID"
curl -i --user avaliador@example.com "$API/anime-list/$ANIME_ID"
```

Esperados: PUT 200 com COMPLETED, DELETE 204, último GET 404. Não publique cadastro.json preenchido. No Windows, use `curl.exe` para evitar o alias do PowerShell; o fluxo PowerShell independente está abaixo.

### PowerShell — Invoke-RestMethod

Compatível com Windows PowerShell/PowerShell 7. Informe e-mail ainda não cadastrado e senha de avaliação no prompt:

```powershell
$ErrorActionPreference = 'Stop'
$api = 'http://localhost:8080/api'
Invoke-RestMethod -Uri "$api/hello"
$apiCredential = Get-Credential -Message 'Nova conta da API (e-mail e senha)'
$registration = @{
    name = 'Avaliador'
    email = $apiCredential.UserName
    password = $apiCredential.GetNetworkCredential().Password
} | ConvertTo-Json
Invoke-RestMethod -Uri "$api/auth/register" -Method Post -ContentType 'application/json' -Body $registration
# Deve retornar 401 sem autenticação.
try {
    Invoke-RestMethod -Uri "$api/anime-list" -ErrorAction Stop
} catch {
    [int]$_.Exception.Response.StatusCode
}
$basicValue = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes(
    $apiCredential.UserName + ':' + $apiCredential.GetNetworkCredential().Password))
$headers = @{ Authorization = "Basic $basicValue" }
Invoke-RestMethod -Uri "$api/anime-list" -Headers $headers
$anime = @{
    title = 'Anime de avaliacao'
    coverUrl = $null
    synopsis = 'Original synopsis for the CRUD demonstration.'
    genres = 'Adventure'
    totalEpisodes = 12
    episodesWatched = 0
    status = 'PLAN_TO_WATCH'
    mood = 'ACTION'
    score = $null
    notes = 'Registro criado por esta avaliacao'
}
$created = Invoke-RestMethod -Uri "$api/anime-list" -Headers $headers -Method Post -ContentType 'application/json' -Body ($anime | ConvertTo-Json)
$animeId = $created.id
Invoke-RestMethod -Uri "$api/anime-list/$animeId" -Headers $headers
$anime.episodesWatched = 12
Invoke-RestMethod -Uri "$api/anime-list/$animeId" -Headers $headers -Method Put -ContentType 'application/json' -Body ($anime | ConvertTo-Json)
# Exclui somente o item cujo ID veio deste POST.
Invoke-RestMethod -Uri "$api/anime-list/$animeId" -Headers $headers -Method Delete
Remove-Variable apiCredential, registration, basicValue, headers
```

Invoke-RestMethod mostra o corpo; 201/204 sem corpo pode não imprimir conteúdo. Consulte os status na tabela ou no cliente HTTP. O exemplo limpa suas variáveis de autenticação; não imprima seus valores.

**Regras do DTO:** título, total, assistidos e status são obrigatórios. Contagens: inteiros não negativos; score pessoal: inteiro opcional de 0 a 10. Status: PLAN_TO_WATCH, WATCHING, COMPLETED, ON_HOLD, DROPPED. Humores: FUN, RELAXED, ACTION, EMOTIONAL, DARK. Total positivo não pode ser menor que assistidos; igualdade define COMPLETED. PUT exige os campos que deseja preservar. Nota pública MAL não é nota pessoal.

## 11. Integração opcional com MyAnimeList

**MAL_CLIENT_ID é opcional para os requisitos obrigatórios:** CRUD próprio, autenticação, validação e persistência. É necessário somente para **pesquisa, detalhes e sorteio global do MyAnimeList**.

Obtenha seu ID na [configuração oficial MAL](https://myanimelist.net/apiconfig) e defina a variável exclusivamente no processo/configuração do backend, antes de iniciar:

- PowerShell: `$env:MAL_CLIENT_ID = Read-Host 'Seu Client ID MyAnimeList'`.
- CMD: `set /p MAL_CLIENT_ID=Seu Client ID MyAnimeList:`.
- Bash/Zsh: `export MAL_CLIENT_ID='SEU_CLIENT_ID_LOCAL'`.
- IDE: campo de ambiente da configuração Java, como nos métodos C–E.

Esses campos não ocultam o valor; não os compartilhe por tela/histórico nem versione a configuração preenchida. Reinicie o backend. Nunca use VITE_* para o ID. **O Client ID pessoal do autor não é distribuído.** Sem configuração, essas funções retornam 503; CRUD, cadastro e consulta do histórico próprio continuam disponíveis. Não há fallback Jikan ou resultados fictícios.

O sorteio global usa uma amostra temporária real do MAL e **não exige animes na biblioteca pessoal**. Pode filtrar por humor, grava histórico e não adiciona à biblioteca automaticamente. Mood é sugerido pelos gêneros originais, fica indefinido em empate/dados insuficientes e pode ser alterado ao salvar. Detalhes: [integração](docs/MYANIMELIST.md) e [sorteio](docs/SORTEIO_GLOBAL.md).

## 12. Testes automatizados

### Java — MySQL configurado

Na pasta **backend**, com JDK 21 e ambiente válido:

**Windows — PowerShell ou CMD:**

```bat
.\mvnw.cmd -B test
```

**Linux/macOS — Bash ou Zsh:**

```sh
./mvnw -B test
```

`BackendApplicationTests.contextLoads` precisa do MySQL real. Os demais testes exercitam catálogo, moods, localização e rotas com respostas/dependências controladas. `package` também executa testes e gera o JAR. Relatórios ficam em `backend/target/surefire-reports/`; não publique propriedades locais sem revisão.

### Frontend

Em **frontend**, após npm ci, em qualquer terminal compatível:

```sh
npm test
npm run typecheck
npm run build
```

O build fica em frontend/dist. Para visualizá-lo, execute `npm run preview`, também em 5173; encerre o dev antes. Hospedagem estática com React Router exige fallback das rotas para index.html.

### Integração HTTP real opcional

Com backend ativo e Node instalado, execute `npm run test:integration` em **frontend**. Para outra URL, defina a variável no terminal desse script:

**PowerShell:**

```powershell
$env:VITE_API_BASE_URL = 'http://localhost:18080/api'
npm run test:integration
```

**CMD:**

```bat
set "VITE_API_BASE_URL=http://localhost:18080/api"
npm run test:integration
```

**Bash/Zsh:**

```sh
VITE_API_BASE_URL='http://localhost:18080/api' npm run test:integration
```

O script cria conta QA e anime, verifica 12 requisições e remove somente seu próprio anime. **A conta permanece**, pois não existe exclusão de usuário. Ele verifica CRUD/CORS/progresso, não o sorteio MAL ao vivo. Prefira banco de avaliação se não quiser criar essa conta no banco pessoal. O script Node não carrega automaticamente o .env.local utilizado pelo Vite.

### Resultados já registrados

Na validação acadêmica de **26/10/2026**, documentada em [EVIDENCIAS_TESTES.md](docs/EVIDENCIAS_TESTES.md): 73 testes Java aprovados com JDK 21/MySQL e pacote gerado; 36 testes frontend, TypeScript/build e 12 requisições reais aprovados. **Esta revisão do README não reexecutou as suítes.** Os dez testes históricos via PowerShell são relatos manuais separados, não dez testes JUnit. O teste manual de humor inválido no Insomnia foi informado pelo usuário e retornou 409, em divergência com o esperado 400; não integra os totais anteriores. A execução completa da coleção e a reprodução em outro computador não estão declaradas como realizadas.

## 13. Tabela de endpoints

Base: `http://localhost:8080`. A tabela descreve os controllers reais; permitir um método no CORS não cria uma rota.

| Método | Endpoint | Finalidade e entrada | Sucesso | Erros relevantes |
| --- | --- | --- | --- | --- |
| GET | `/api/hello` | Disponibilidade pública; sem corpo | 200 texto | — |
| POST | `/api/auth/register` | Cadastro público; JSON name, email, password | 201 vazio | 400; 409 e-mail duplicado |
| GET | `/api/anime-list` | Biblioteca pessoal; Basic | 200 array AnimeResponse | 401 |
| GET | `/api/anime-list/{id}` | Item pessoal; Basic e ID | 200 AnimeResponse | 400 ID inválido; 401; 404 |
| POST | `/api/anime-list` | Criar item pessoal; Basic e AnimeRequest | 201 AnimeResponse | 400; 401 |
| PUT | `/api/anime-list/{id}` | Atualização completa; Basic, ID e AnimeRequest | 200 AnimeResponse | 400; 401; 404 |
| DELETE | `/api/anime-list/{id}` | Excluir item pessoal; Basic e ID | 204 vazio | 400 ID inválido; 401; 404 |
| POST | `/api/draws` | Sorteio global; Basic, query mood opcional, sem JSON | 201 DrawResponse | 400 esperado para humor inválido (409 observado no Insomnia); 401; 404 sem candidatos; 502/503/504 externos |
| GET | `/api/draws/history` | Histórico pessoal, recente primeiro; Basic | 200 array DrawResponse | 401 |
| GET | `/api/catalog/anime` | Pesquisa MAL; Basic, q de 2–100 caracteres, offset opcional 0–10000 | 200 CatalogSearchResponse | 400; 401; 502/503/504 externos |
| GET | `/api/catalog/anime/{malId}` | Detalhes MAL; Basic, malId positivo | 200 CatalogAnimeResponse | 400; 401; 404; 502/503/504 externos |

Não existem PATCH, login com token, exclusão de usuário ou exclusão de histórico. Item inexistente ou de outro proprietário retorna 404 na consulta pessoal. POST/PUT usam o DTO descrito acima. `localization` aplica o dicionário aos rótulos, sem traduzir sinopses. DTOs e campos completos: [relatório técnico](docs/RELATORIO_TECNICO.md).

## 14. Solução de problemas comuns

| Sintoma | O que conferir |
| --- | --- |
| Java não encontrado/versão incorreta | Instalar JDK 21; conferir JAVA_HOME/PATH e java/javac no terminal correto. Na IDE, selecionar JDK 21 no projeto e no executor Maven. Abrir novo terminal após mudanças. |
| Conexão MySQL recusada | Conferir servidor ativo, host/porta JDBC, banco criado e rede. Testar a conta no cliente MySQL antes do Java. |
| Access denied for user | Conferir DB_USER/DB_PASSWORD, host permitido e permissões. Variáveis precisam estar no processo Java/teste da IDE; não redefinir senhas de outras pessoas. |
| Porta 8080 ocupada | Definir SERVER_PORT, por exemplo 18080, e atualizar URL do cliente HTTP/VITE_API_BASE_URL. Não interromper processos desconhecidos. |
| Porta 5173 ocupada | Encerrar sua outra instância de Vite/preview ou liberar a porta. strictPort impede troca automática; CORS permite somente as origens 5173 configuradas. |
| HTTP 401 | Cadastrar conta na API e enviar Basic com e-mail/senha; não usar conta MySQL. Recarregar frontend exige entrar novamente. |
| HTTP 400 | Conferir JSON, Content-Type, campos obrigatórios, enums e contagens; PUT precisa do DTO completo. Conferir q/offset na pesquisa MAL. |
| HTTP 404 | Conferir ID da criação e usuário proprietário. Item excluído/de outra conta não fica disponível. Sorteio pode não ter candidatos do mood na amostra. |
| HTTP 409 no cadastro | E-mail já existe; entrar com a conta ou usar outro e-mail de avaliação. |
| HTTP 503 nas funções MAL | Esperado sem MAL_CLIENT_ID. Configurar ID próprio no backend e reiniciar; rate limit também pode produzir 503. CRUD não precisa dele. |
| HTTP 502/504 MAL | Conferir configuração/conectividade: 502 para falha/resposta externa inválida; 504 para falha de acesso/timeout. Não usar respostas fictícias como contorno. |
| Frontend não comunica com API | Conferir GET /api/hello, VITE_API_BASE_URL com /api e reiniciar Vite após mudar .env.local. Usar localhost:5173 ou 127.0.0.1:5173; IP de rede/outra origem não está liberado no CORS atual. |
| Wrapper não baixa dependências | Conferir internet, proxy/certificados e configuração Maven local. Maven 3.10.0 e Spring Boot 4.1.2 declarados precisam estar acessíveis. Usar .\mvnw.cmd no Windows e ./mvnw em Linux/macOS, dentro de backend. Não trocar versões ou desativar TLS como tentativa genérica. |

Para porta alternativa, configure **antes de iniciar o backend**:

- PowerShell: `$env:SERVER_PORT = '18080'`.
- CMD: `set "SERVER_PORT=18080"`.
- Bash/Zsh: `export SERVER_PORT=18080`.

CORS em /api/** permite http://localhost:5173 e http://127.0.0.1:5173, headers Authorization/Content-Type, métodos GET/POST/PUT/PATCH/DELETE/OPTIONS e allowCredentials=false. CORS não substitui autenticação; Basic exige HTTPS em publicação.

## 15. Estrutura do repositório

```text
Lista-Anime/
├── README.md
├── backend/
│   ├── pom.xml
│   ├── mvnw e mvnw.cmd
│   ├── .mvn/wrapper/
│   ├── .env.example
│   ├── database/init.sql
│   ├── database/migrations/002_global_draw_history.sql
│   └── src/
│       ├── main/java/com/animemood/backend/
│       │   ├── controller/  dto/  service/  repository/
│       │   └── entity/  config/  exception/
│       ├── main/resources/application.properties
│       └── test/java/
├── frontend/
│   ├── package.json e package-lock.json
│   ├── .env.example
│   ├── vite.config.ts
│   ├── src/
│   └── scripts/check-api.mjs
└── docs/
    ├── RELATORIO_TECNICO.md
    ├── EVIDENCIAS_TESTES.md
    ├── CHECKLIST_ENTREGA.md
    └── insomnia/
        ├── Anime-Mood.insomnia.json
        └── README.md
```

Target, node_modules, dist, .env reais e configurações locais de IDE ficam fora do Git. Preserve exemplos sem segredos, Wrapper e lockfile na publicação.

## 16. Documentação técnica e entrega acadêmica

O relatório Word com identificação pessoal é privado e deve ser enviado separadamente ao AVA. Ele não faz parte do repositório público. Consulte também o [inventário de privacidade](docs/PRIVACIDADE_PUBLICACAO.md).

**Curso:** Análise e Desenvolvimento de Sistemas. Trabalho individual — Uninter, Arquitetura e Desenvolvimento de APIs.

| Documento | Conteúdo |
| --- | --- |
| [Relatório técnico Markdown](docs/RELATORIO_TECNICO.md) | Arquitetura, ORM, segurança, contratos e limitações. |
| [Evidências dos testes](docs/EVIDENCIAS_TESTES.md) | Resultados registrados e demonstrações complementares não realizadas. |
| [Validação atual](docs/VALIDACAO_FRONTEND.md) | Resumo das validações existentes. |
| [Guia e coleção Insomnia](docs/insomnia/README.md) | Importação, variáveis e sequência de avaliação. |
| [Integração MAL](docs/MYANIMELIST.md) | Catálogo e classificação de humor. |
| [Sorteio global e animação](docs/SORTEIO_GLOBAL.md) | Amostragem, histórico e apresentação. |
| [Localização de metadados](docs/LOCALIZACAO_PT_BR.md) | Dicionário Java e sinopses originais. |
| [Guia do frontend](frontend/README.md) | Organização e operação do cliente React. |
| [Checklist GitHub/AVA](docs/CHECKLIST_ENTREGA.md) | Conferência do código completo, publicação e submissão pelo autor. |

O professor deve receber acesso ao repositório completo e usar suas próprias configurações. Não publicar senhas, headers Basic, Client IDs pessoais ou relatórios brutos com propriedades privadas. A revisão deste guia não realiza commit, push ou publicação.
