-- Evolução ADITIVA opcional para MySQL. Não executar se ddl-auto=update já criou as colunas.
-- Verifique SHOW COLUMNS FROM draw_history antes. Execute uma única vez, com backup.
-- Todos os campos são nulos nos registros antigos. Nenhuma tabela ou dado é removido.
ALTER TABLE draw_history
    ADD COLUMN mal_id BIGINT NULL,
    ADD COLUMN synopsis TEXT NULL,
    ADD COLUMN catalog_genres TEXT NULL,
    ADD COLUMN total_episodes INT NULL,
    ADD COLUMN release_year INT NULL,
    ADD COLUMN public_score DOUBLE NULL,
    ADD COLUMN identified_mood VARCHAR(32) NULL;
