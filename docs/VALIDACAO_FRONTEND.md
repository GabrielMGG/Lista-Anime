# Validação atual — Anime Mood

Validação final: 26/10/2026, preparação acadêmica Uninter. Resultados anteriores de erro de banco são históricos; a configuração local do IntelliJ foi reutilizada somente nos processos, sem mudar ou expor credenciais.

| Comando | Resultado final desta preparação |
| --- | --- |
| backend: .\mvnw.cmd -B package | 73 testes aprovados, zero falhas/erros/pulados; BUILD SUCCESS; JDK 21.0.13; MySQL disponível; JAR gerado |
| frontend: npm test | 36 testes aprovados em 5 arquivos |
| frontend: npm run typecheck | Aprovado |
| frontend: npm run build | Aprovado |
| frontend: npm run test:integration | 12 requisições HTTP reais aprovadas em porta temporária 18080, com CORS e COMPLETED conferidos |

O script criou uma conta QA exclusiva, que permanece por não haver endpoint de exclusão de usuário, e removeu somente seu próprio anime. Nenhum registro preexistente ou arquivo de desenvolvimento foi excluído. A porta 8080 estava ocupada; a configuração padrão dos arquivos permaneceu intacta. Não houve commit/push, funcionalidade nova, alteração de design/lógica ou dependência adicionada.

Sinopses continuam originais. Não existem classes/processos, caches ou dependências de tradução offline; o dicionário Java e o cache de candidatos do sorteio permanecem.

Veja [evidências detalhadas, matriz de requisitos e limitações](EVIDENCIAS_TESTES.md), [relatório técnico](RELATORIO_TECNICO.md) e [checklist de entrega](CHECKLIST_ENTREGA.md). A preparação não declara nova validação visual completa, consulta externa MAL ao vivo ou persistência demonstrada entre reinícios; são demonstrações complementares ainda disponíveis ao autor.
