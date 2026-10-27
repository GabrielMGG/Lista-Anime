package com.animemood.backend.service;

import com.animemood.backend.entity.Mood;
import org.springframework.stereotype.Service;
import java.util.*;

/** Deterministic heuristic over MAL genre/theme labels, never over public scores. */
@Service
public class MoodClassifier {
    private static final Map<String, Map<Mood, Integer>> RULES = Map.ofEntries(
            Map.entry("comedy", Map.of(Mood.FUN, 4)),
            Map.entry("gag humor", Map.of(Mood.FUN, 5)),
            Map.entry("parody", Map.of(Mood.FUN, 4)),
            Map.entry("slice of life", Map.of(Mood.RELAXED, 4)),
            Map.entry("iyashikei", Map.of(Mood.RELAXED, 6)),
            Map.entry("action", Map.of(Mood.ACTION, 4)),
            Map.entry("adventure", Map.of(Mood.ACTION, 2)),
            Map.entry("martial arts", Map.of(Mood.ACTION, 4)),
            Map.entry("combat sports", Map.of(Mood.ACTION, 4)),
            Map.entry("mecha", Map.of(Mood.ACTION, 2)),
            Map.entry("drama", Map.of(Mood.EMOTIONAL, 4)),
            Map.entry("romance", Map.of(Mood.EMOTIONAL, 3)),
            Map.entry("horror", Map.of(Mood.DARK, 5)),
            Map.entry("psychological", Map.of(Mood.DARK, 4)),
            Map.entry("suspense", Map.of(Mood.DARK, 3)),
            Map.entry("gore", Map.of(Mood.DARK, 5))
    );

    public record Classification(Mood principal, Map<Mood, Integer> scores, List<String> reasons) {}

    public Classification classify(Collection<String> labels) {
        EnumMap<Mood, Integer> scores = new EnumMap<>(Mood.class);
        for (Mood mood : Mood.values()) scores.put(mood, 0);
        List<String> reasons = new ArrayList<>();
        Set<String> seen = new HashSet<>();
        if (labels != null) for (String label : labels) {
            if (label == null) continue;
            String key = label.strip().toLowerCase(Locale.ROOT).replaceAll("\\s+", " ");
            if (!seen.add(key)) continue;
            Map<Mood, Integer> points = RULES.get(key);
            if (points != null) points.forEach((mood, value) -> {
                scores.merge(mood, value, Integer::sum);
                reasons.add(label.strip() + ": " + mood + " +" + value);
            });
        }
        int highest = scores.values().stream().mapToInt(Integer::intValue).max().orElse(0);
        List<Mood> winners = scores.entrySet().stream().filter(e -> e.getValue() == highest)
                .map(Map.Entry::getKey).toList();
        Mood principal = highest > 0 && winners.size() == 1 ? winners.getFirst() : null;
        return new Classification(principal, Collections.unmodifiableMap(scores), List.copyOf(reasons));
    }
}
