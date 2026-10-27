package com.animemood.backend.service;

import com.animemood.backend.entity.Mood;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;

class MoodClassifierTests {
    private final MoodClassifier classifier = new MoodClassifier();

    @ParameterizedTest
    @CsvSource({"Comedy,FUN", "Gag Humor,FUN", "Parody,FUN", "Slice of Life,RELAXED", "Iyashikei,RELAXED",
            "Action,ACTION", "Adventure,ACTION", "Martial Arts,ACTION", "Combat Sports,ACTION", "Mecha,ACTION",
            "Drama,EMOTIONAL", "Romance,EMOTIONAL", "Horror,DARK", "Psychological,DARK", "Suspense,DARK", "Gore,DARK"})
    void classifiesKnownLabels(String label, Mood expected) {
        assertEquals(expected, classifier.classify(List.of(label)).principal());
    }

    @Test void leavesMissingAndUnknownDataUndefined() {
        assertNull(classifier.classify(null).principal());
        assertNull(classifier.classify(List.of()).principal());
        assertNull(classifier.classify(List.of("Fantasy", "School", "Shounen", "Supernatural")).principal());
    }
    @Test void sumsSeveralLabelsAndKeepsSecondaryScores() {
        var result = classifier.classify(List.of("Action", "Adventure", "Comedy"));
        assertEquals(Mood.ACTION, result.principal());
        assertEquals(6, result.scores().get(Mood.ACTION));
        assertEquals(4, result.scores().get(Mood.FUN));
        assertEquals(3, result.reasons().size());
    }
    @Test void abstainsOnTiedHighestScore() {
        assertNull(classifier.classify(List.of("Action", "Comedy")).principal());
    }
    @Test void normalizesAndDoesNotCountDuplicates() {
        var result = classifier.classify(Arrays.asList(" Comedy ", "COMEDY", null, "slice   of life"));
        assertEquals(4, result.scores().get(Mood.FUN));
        assertEquals(4, result.scores().get(Mood.RELAXED));
        assertNull(result.principal());
    }
}
