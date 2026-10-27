# Checklist final — GitHub e AVA

Disciplina: Arquitetura e Desenvolvimento de APIs / Uninter. Identificação pessoal reservada à entrega privada no AVA.

Preparação local concluída em 26/10/2026. Este checklist orienta ações do autor; não significa que publicação ou envio já ocorreram. Não houve commit/push pelo assistente.

## Antes da publicação

- [x] Conferir o PDF oficial: API própria, CRUD, ORM/banco, validação, HTTP, autenticação, CORS, testes e documentação.
- [x] Revisar relatório nos 12 tópicos e tabela com 11 endpoints reais.
- [x] Executar Maven package com JDK 21 e MySQL: 73 testes aprovados.
- [x] Executar frontend: 36 testes, TypeScript e build aprovados.
- [x] Executar script HTTP existente: 12 respostas reais aprovadas.
- [x] Conferir exemplos de ambiente, init.sql, Wrapper e package-lock.json.
- [x] Conferir exclusão Git de configurações privadas, segredos e artefatos.
- [ ] Ler o relatório e conseguir explicar arquitetura, PUT completo, JPA, Basic, CORS e códigos HTTP.
- [ ] Caso exigido pelo professor, capturar demonstrações complementares conforme EVIDENCIAS_TESTES.md, sem segredos.

## Publicar no GitHub — executar manualmente após revisar

Confira o remoto com `git remote -v` antes de publicar. Muitos arquivos funcionais ainda estão **não rastreados**; publicar apenas o que já está no Git deixará o projeto incompleto.

Antes de publicar, consultar [Privacidade e inventário](PRIVACIDADE_PUBLICACAO.md). Os dois commits existentes contêm e-mail não anonimizado nos metadados; decidir sobre essa exposição antes do push. O relatório Word identificado deve permanecer exclusivamente local/AVA.

1. Conferir `git status --short`, `git diff --check` e o remoto. Não usar force push nem publicar logs/credenciais.
2. Revisar os diretórios backend/src, backend/database, docs e frontend/src; incluir também testes, scripts existentes, configurações de build, frontend/package-lock.json, README, exemplos .env e Maven Wrapper.
3. Preparar o índice somente depois da revisão, por exemplo:

```powershell
git add .gitignore README.md backend frontend docs
git diff --cached --name-only
git diff --cached --check
```

4. Conferir que o índice **não** contém o relatório Word identificado, `.idea/`, `.run/`, `.env` real, `.env.local`, senhas/chaves/Client ID, target, node_modules, dist ou logs. `.env.example` vazio/de exemplo deve constar. Se um arquivo privado estiver rastreado, interromper e remover somente do índice após revisão, preservando o arquivo local; não fazer exclusão indiscriminada.
5. Somente o autor realiza commit e push após essa conferência. Verificar a branch real com `git branch --show-current` e respeitar o fluxo já existente. Nenhum desses comandos de publicação foi executado nesta preparação.
6. Abrir o GitHub no navegador e verificar que fontes, README, documentação técnica pública, exemplos, SQL e testes estão visíveis no commit publicado. Para repositório privado, garantir acesso efetivo ao professor; seguir as orientações do AVA sobre acesso.
7. Testar a reprodução por clone em **outra pasta**, sem remover/alterar a pasta de desenvolvimento: configurar banco/variáveis próprias, Maven package e, opcionalmente, npm ci/test/build. Não copiar configurações privadas do IntelliJ para o remoto.

## Enviar no AVA

- [ ] Informar nome completo e RU somente no envio privado ao AVA; modalidade individual.
- [ ] Informar link remoto acessível com o código completo publicado.
- [ ] Anexar o relatório Word local identificado somente no AVA, conforme o modelo oficial. Não incluir esse arquivo no GitHub.
- [ ] Incluir evidências sanitizadas ou indicar os testes/documentos no repositório, conforme o formulário da atividade. Não enviar target/surefire-reports sem revisão porque pode conter propriedades locais.
- [ ] Verificar que README, exemplos de ambiente e script/instruções de banco estão no repositório acessível.
- [ ] Reabrir o envio, conferir anexos/links, confirmar a submissão definitiva e guardar recibo/protocolo antes do prazo.

Não é obrigatório implantar em nuvem ou acrescentar Swagger no roteiro fornecido. Frontend é opcional e não substitui a demonstração da API. Não gastar o prazo restante com funcionalidades ou design.

## Prioridade no tempo restante

1. Revisar e publicar todo o código local com segurança.
2. Conferir acesso remoto e formato do relatório no AVA.
3. Anexar relatório/evidências e finalizar envio.
4. Se houver tempo, fazer clone de reprodução e capturas complementares; não adiar o envio por melhorias opcionais.

## Bloqueios reais

Não houve falha impeditiva nos testes finais. O erro de MySQL anterior foi resolvido usando a configuração local; não é mais uma pendência técnica. A porta padrão ocupada exige liberar a porta por decisão do autor ou definir SERVER_PORT e VITE_API_BASE_URL de forma correspondente. A publicação completa, acesso do professor e confirmação do formato/envio no AVA ainda dependem do autor.


A coleção do Insomnia está em [insomnia/Anime-Mood.insomnia.json](insomnia/Anime-Mood.insomnia.json). Importar e preencher somente variáveis locais; senha/Client ID do autor não são distribuídos. Roteiro: [insomnia/README.md](insomnia/README.md).
