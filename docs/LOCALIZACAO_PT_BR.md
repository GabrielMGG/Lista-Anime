# Localização pt-BR e sinopses originais

A tradução automática de sinopses foi removida por lentidão e qualidade insuficiente. O aplicativo não inicia Python, Argos Translate ou qualquer outro processo de tradução e não chama serviços externos de tradução.

## Comportamento atual

- Títulos vêm exclusivamente do campo principal `title` do MyAnimeList. Títulos já salvos não são renomeados.
- Sinopses permanecem exatamente como recebidas no campo original, inclusive em inglês. O frontend usa `synopsis` diretamente, sem substituir por texto localizado, avisos de tradução ou botões de alternância.
- O dicionário Java `GenreDictionary` permanece intacto: localiza gêneros, temas, formato e status. Valores desconhecidos continuam originais.
- Mood continua sendo classificado pelos gêneros originais, antes da localização dos rótulos.
- Pesquisa, biblioteca, detalhes, sorteio global e histórico seguem a mesma regra. Dados pessoais, notas, progresso e snapshots existentes não são regravados.
- A estrutura `localization` foi preservada para os metadados. Sua sinopse repete o original, com `synopsisStatus=ORIGINAL` ou `EMPTY`. O campo `language=pt-BR` identifica os rótulos de metadados e não declara que a sinopse está em português.

## Remoção da integração offline

Foram removidos o conector de processo Java, o tradutor e seu cache em memória, a proteção XML exclusiva da tradução, os scripts, requisitos Python, ambiente virtual, modelos e cache SQLite que existiam em `backend/local-translator/`. Os testes exclusivos do tradutor foram retirados; testes de localização verificam agora a preservação literal das sinopses.

Não existem variáveis de configuração de tradução em `application.properties` ou `.env.example`. Variáveis antigas `ARGOS_*` ou `TRANSLATION_*` eventualmente mantidas na configuração local do IntelliJ/PowerShell podem ser removidas: não são mais lidas pelo projeto. Não é necessário instalar ou executar um tradutor.

Nenhuma instalação global do Python ou Argos foi alterada. Nenhuma dependência foi adicionada. Os caches de catálogo e candidatos do sorteio permanecem intactos. Para substituir processos antigos em execução pelo código atualizado, reinicie o backend e o frontend.

## Validação

Os testes verificam que a sinopse inglesa e seus espaços/quebras de linha permanecem inalterados no catálogo, biblioteca e histórico. O frontend também ignora qualquer sinopse alternativa presente na camada de metadados, exibe o original e mantém o estado vazio quando necessário. O caminho de localização consiste apenas em operações de dicionário em memória, sem espera por processo externo.

Resultados e limitação de acesso ao MySQL estão em [VALIDACAO_FRONTEND.md](VALIDACAO_FRONTEND.md).
