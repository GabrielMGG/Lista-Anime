package com.animemood.backend.service;

import java.util.*;

/** MAL's English genre/theme labels, including aliases used by older records. */
public final class GenreDictionary {
    private GenreDictionary() {}
    private static final Map<String, String> LABELS;
    static {
        Map<String, String> labels = new LinkedHashMap<>();
        String[][] pairs = {
            {"Action","Ação"}, {"Adventure","Aventura"}, {"Avant Garde","Vanguarda"},
            {"Award Winning","Premiado"}, {"Boys Love","Romance entre homens"}, {"Comedy","Comédia"},
            {"Drama","Drama"}, {"Fantasy","Fantasia"}, {"Girls Love","Romance entre mulheres"},
            {"Gourmet","Gastronomia"}, {"Horror","Terror"}, {"Mystery","Mistério"}, {"Romance","Romance"},
            {"Sci-Fi","Ficção científica"}, {"Slice of Life","Cotidiano"}, {"Sports","Esportes"},
            {"Supernatural","Sobrenatural"}, {"Suspense","Suspense"}, {"Ecchi","Ecchi"},
            {"Erotica","Erótico"}, {"Hentai","Hentai"}, {"Adult Cast","Elenco adulto"},
            {"Anthropomorphic","Antropomorfismo"}, {"CGDCT","Garotas fofas fazendo coisas fofas"},
            {"Childcare","Cuidados com crianças"}, {"Combat Sports","Esportes de combate"},
            {"Crossdressing","Travestimento"}, {"Delinquents","Delinquentes"}, {"Detective","Detetives"},
            {"Educational","Educativo"}, {"Gag Humor","Humor absurdo"}, {"Gore","Violência gráfica"},
            {"Harem","Harém"}, {"High Stakes Game","Jogos de alto risco"}, {"Historical","Histórico"},
            {"Idols (Female)","Ídolos femininos"}, {"Idols (Male)","Ídolos masculinos"},
            {"Isekai","Outro mundo"}, {"Iyashikei","Relaxante"}, {"Love Polygon","Polígono amoroso"},
            {"Love Status Quo","Relacionamentos sem evolução"}, {"Magical Sex Shift","Mudança mágica de sexo"},
            {"Mahou Shoujo","Garotas mágicas"}, {"Martial Arts","Artes marciais"}, {"Mecha","Robôs gigantes"},
            {"Medical","Medicina"}, {"Military","Militar"}, {"Music","Música"}, {"Mythology","Mitologia"},
            {"Organized Crime","Crime organizado"}, {"Otaku Culture","Cultura otaku"}, {"Parody","Paródia"},
            {"Performing Arts","Artes cênicas"}, {"Pets","Animais de estimação"}, {"Psychological","Psicológico"},
            {"Racing","Corridas"}, {"Reincarnation","Reencarnação"}, {"Reverse Harem","Harém reverso"},
            {"Samurai","Samurais"}, {"School","Escolar"}, {"Showbiz","Indústria do entretenimento"},
            {"Space","Espaço"}, {"Strategy Game","Jogos de estratégia"}, {"Super Power","Superpoderes"},
            {"Survival","Sobrevivência"}, {"Team Sports","Esportes coletivos"}, {"Time Travel","Viagem no tempo"},
            {"Urban Fantasy","Fantasia urbana"}, {"Vampire","Vampiros"}, {"Video Game","Videogames"},
            {"Villainess","Vilãs"}, {"Visual Arts","Artes visuais"}, {"Workplace","Ambiente de trabalho"},
            {"Josei","Josei"}, {"Kids","Infantil"}, {"Seinen","Seinen"}, {"Shoujo","Shoujo"},
            {"Shounen","Shounen"}, {"Shonen","Shounen"}, {"Shoujo Ai","Romance entre mulheres"},
            {"Shounen Ai","Romance entre homens"}, {"Gender Bender","Troca de gênero"},
            {"Game","Jogos"}, {"Demons","Demônios"}, {"Dementia","Experimental"}, {"Police","Policial"}
        };
        for (String[] pair : pairs) labels.put(normalize(pair[0]), pair[1]);
        LABELS = Collections.unmodifiableMap(labels);
    }
    public static String normalize(String label) { return label.strip().toLowerCase(Locale.ROOT).replaceAll("\\s+", " "); }
    public static String localize(String label) { return label == null ? null : LABELS.getOrDefault(normalize(label), label); }
    public static boolean known(String label) { return label != null && (LABELS.containsKey(normalize(label)) || LABELS.containsValue(label)); }
    public static String mediaType(String value) {
        if (value == null) return null;
        return switch (value) {
            case "tv" -> "TV"; case "movie" -> "Filme"; case "ova" -> "OVA"; case "ona" -> "ONA";
            case "special" -> "Especial"; case "tv_special" -> "Especial de TV"; case "music" -> "Vídeo musical";
            case "cm" -> "Comercial"; case "pv" -> "Vídeo promocional"; case "unknown" -> "Não informado";
            default -> value;
        };
    }
    public static String airingStatus(String value) {
        if (value == null) return null;
        return switch (value) {
            case "finished_airing" -> "Exibição concluída"; case "currently_airing" -> "Em exibição";
            case "not_yet_aired" -> "Ainda não estreou"; default -> value;
        };
    }
}
