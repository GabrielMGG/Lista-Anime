# Privacidade e inventário de publicação

Inventário local revisado em 26/10/2026. Nenhum commit ou push foi executado nesta preparação. Os arquivos não rastreados precisam ser incluídos pelo responsável após a revisão; esta lista não significa que já estejam no índice.

## Pendência antes de publicar o histórico

Os commits existentes `f761f4b` e `a5f9250` contêm endereço de e-mail não anonimizado nos metadados de autoria/commit. A limpeza dos documentos e o `.gitignore` não removem esses metadados. O responsável deve decidir se aceita essa exposição ou anonimiza o histórico antes da publicação. Nenhum histórico foi reescrito nesta preparação. Não publique antes dessa conferência.

## Arquivos privados preservados localmente

- `docs/Relatorio_Final_Anime_Mood_Uninter.docx`: relatório identificado destinado exclusivamente ao AVA; não rastreado e ignorado. A regra também protege exportações com o mesmo nome-base.
- `.idea/`, `.run/`, configurações locais e arquivos `.env` reais: podem conter credenciais; não publicar.
- `backend/target/`, `frontend/node_modules/`, `frontend/dist/`, cobertura e logs: saídas locais ignoradas, incluindo relatórios brutos que podem conter propriedades privadas.
- `privado/` e `docs/privado/`: reservados para documentos privados futuros.

O relatório Word local foi preservado sem alterações. Os exemplos `.env.example`, o Maven Wrapper e o lockfile continuam publicáveis. A coleção Insomnia utiliza variáveis e não distribui credenciais reais. Senhas artificiais de testes não são contas reais.

## Arquivos públicos previstos

Código-fonte, testes, configurações reproduzíveis, exemplos seguros, SQL não destrutivo, documentação técnica, imagem de teste visual e coleção Insomnia:

- `.gitignore`
- `README.md`
- `backend/.env.example`
- `backend/.gitattributes`
- `backend/.gitignore`
- `backend/.mvn/wrapper/maven-wrapper.properties`
- `backend/database/init.sql`
- `backend/database/migrations/002_global_draw_history.sql`
- `backend/mvnw`
- `backend/mvnw.cmd`
- `backend/pom.xml`
- `backend/src/main/java/com/animemood/backend/BackendApplication.java`
- `backend/src/main/java/com/animemood/backend/config/MyAnimeListConfig.java`
- `backend/src/main/java/com/animemood/backend/config/SecurityConfig.java`
- `backend/src/main/java/com/animemood/backend/controller/AnimeListController.java`
- `backend/src/main/java/com/animemood/backend/controller/AuthController.java`
- `backend/src/main/java/com/animemood/backend/controller/CatalogController.java`
- `backend/src/main/java/com/animemood/backend/controller/DrawController.java`
- `backend/src/main/java/com/animemood/backend/controller/HelloController.java`
- `backend/src/main/java/com/animemood/backend/dto/AnimeRequest.java`
- `backend/src/main/java/com/animemood/backend/dto/AnimeResponse.java`
- `backend/src/main/java/com/animemood/backend/dto/CatalogAnimeResponse.java`
- `backend/src/main/java/com/animemood/backend/dto/CatalogSearchResponse.java`
- `backend/src/main/java/com/animemood/backend/dto/DrawResponse.java`
- `backend/src/main/java/com/animemood/backend/dto/LocalizationView.java`
- `backend/src/main/java/com/animemood/backend/dto/RegisterRequest.java`
- `backend/src/main/java/com/animemood/backend/entity/AnimeListEntry.java`
- `backend/src/main/java/com/animemood/backend/entity/DrawHistory.java`
- `backend/src/main/java/com/animemood/backend/entity/Mood.java`
- `backend/src/main/java/com/animemood/backend/entity/User.java`
- `backend/src/main/java/com/animemood/backend/entity/WatchStatus.java`
- `backend/src/main/java/com/animemood/backend/exception/GlobalExceptionHandler.java`
- `backend/src/main/java/com/animemood/backend/repository/AnimeListRepository.java`
- `backend/src/main/java/com/animemood/backend/repository/DrawHistoryRepository.java`
- `backend/src/main/java/com/animemood/backend/repository/UserRepository.java`
- `backend/src/main/java/com/animemood/backend/service/AnimeListService.java`
- `backend/src/main/java/com/animemood/backend/service/AuthService.java`
- `backend/src/main/java/com/animemood/backend/service/CustomUserDetailsService.java`
- `backend/src/main/java/com/animemood/backend/service/DrawService.java`
- `backend/src/main/java/com/animemood/backend/service/GenreDictionary.java`
- `backend/src/main/java/com/animemood/backend/service/GlobalDrawPool.java`
- `backend/src/main/java/com/animemood/backend/service/LocalizationService.java`
- `backend/src/main/java/com/animemood/backend/service/MoodClassifier.java`
- `backend/src/main/java/com/animemood/backend/service/MyAnimeListService.java`
- `backend/src/main/resources/application.properties`
- `backend/src/test/java/com/animemood/backend/BackendApplicationTests.java`
- `backend/src/test/java/com/animemood/backend/controller/CatalogControllerTests.java`
- `backend/src/test/java/com/animemood/backend/service/DrawServiceTests.java`
- `backend/src/test/java/com/animemood/backend/service/GlobalDrawPoolTests.java`
- `backend/src/test/java/com/animemood/backend/service/LocalizationTests.java`
- `backend/src/test/java/com/animemood/backend/service/MoodClassifierTests.java`
- `backend/src/test/java/com/animemood/backend/service/MyAnimeListServiceTests.java`
- `docs/CHECKLIST_ENTREGA.md`
- `docs/EVIDENCIAS_TESTES.md`
- `docs/LOCALIZACAO_PT_BR.md`
- `docs/MYANIMELIST.md`
- `docs/RELATORIO_TECNICO.md`
- `docs/SORTEIO_GLOBAL.md`
- `docs/VALIDACAO_FRONTEND.md`
- `docs/insomnia/Anime-Mood.insomnia.json`
- `docs/insomnia/README.md`
- `docs/previews/summon-reveal-test.png`
- `frontend/.env.example`
- `frontend/README.md`
- `frontend/index.html`
- `frontend/package-lock.json`
- `frontend/package.json`
- `frontend/preview-desktop.png`
- `frontend/public/favicon.svg`
- `frontend/scripts/check-api.mjs`
- `frontend/src/App.tsx`
- `frontend/src/components/AnimeCard.tsx`
- `frontend/src/components/AnimeForm.tsx`
- `frontend/src/components/CatalogSearch.tsx`
- `frontend/src/components/Layout.tsx`
- `frontend/src/components/LocalizedText.tsx`
- `frontend/src/components/SummonStage.tsx`
- `frontend/src/components/UI.tsx`
- `frontend/src/context/AuthContext.tsx`
- `frontend/src/hooks/useDrawSequence.ts`
- `frontend/src/hooks/useResource.ts`
- `frontend/src/main.tsx`
- `frontend/src/pages/AnimeDetailsPage.tsx`
- `frontend/src/pages/AnimeEditorPage.tsx`
- `frontend/src/pages/AuthPage.tsx`
- `frontend/src/pages/DiscoverPage.tsx`
- `frontend/src/pages/DrawPage.tsx`
- `frontend/src/pages/HistoryPage.tsx`
- `frontend/src/pages/LibraryPage.tsx`
- `frontend/src/pages/draw.css`
- `frontend/src/services/api.ts`
- `frontend/src/styles.css`
- `frontend/src/test/api.test.ts`
- `frontend/src/test/catalog.test.tsx`
- `frontend/src/test/draw-sequence.test.tsx`
- `frontend/src/test/flows.test.tsx`
- `frontend/src/test/localization.test.tsx`
- `frontend/src/test/setup.ts`
- `frontend/src/types/index.ts`
- `frontend/test/visual/poster.svg`
- `frontend/test/visual/summon.html`
- `frontend/test/visual/summon.tsx`
- `frontend/tsconfig.json`
- `frontend/vite.config.ts`
- `frontend/vitest.config.ts`
- `docs/PRIVACIDADE_PUBLICACAO.md`

## Conferência final pelo responsável

Antes do commit, conferir `git diff --cached --name-only` e o conteúdo de `git diff --cached`. Não adicionar arquivos ignorados com `git add -f`. O relatório privado deve continuar ausente de `git ls-files`. Revisar metadados históricos conforme a pendência acima. O índice estava vazio nesta preparação; a publicação não foi realizada.
