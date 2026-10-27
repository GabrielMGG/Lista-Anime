package com.animemood.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "draw_history")
public class DrawHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private User user;

    @Column(nullable = false)
    private String animeTitle;

    private String coverUrl;

    @Enumerated(EnumType.STRING)
    private Mood mood;

    @Column(nullable = false)
    private LocalDateTime drawnAt;

    // Nullable snapshot fields preserve all pre-existing history rows.
    private Long malId;
    @Column(columnDefinition = "TEXT")
    private String synopsis;
    @Column(columnDefinition = "TEXT")
    private String catalogGenres;
    private Integer totalEpisodes;
    private Integer releaseYear;
    private Double publicScore;
    @Enumerated(EnumType.STRING)
    private Mood identifiedMood;

    public Long getMalId() { return malId; }
    public void setMalId(Long value) { malId = value; }
    public String getSynopsis() { return synopsis; }
    public void setSynopsis(String value) { synopsis = value; }
    public String getCatalogGenres() { return catalogGenres; }
    public void setCatalogGenres(String value) { catalogGenres = value; }
    public Integer getTotalEpisodes() { return totalEpisodes; }
    public void setTotalEpisodes(Integer value) { totalEpisodes = value; }
    public Integer getReleaseYear() { return releaseYear; }
    public void setReleaseYear(Integer value) { releaseYear = value; }
    public Double getPublicScore() { return publicScore; }
    public void setPublicScore(Double value) { publicScore = value; }
    public Mood getIdentifiedMood() { return identifiedMood; }
    public void setIdentifiedMood(Mood value) { identifiedMood = value; }

    @PrePersist
    public void onCreate() {
        drawnAt = LocalDateTime.now();
    }

    public Long getId() { return id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getAnimeTitle() { return animeTitle; }
    public void setAnimeTitle(String animeTitle) { this.animeTitle = animeTitle; }

    public String getCoverUrl() { return coverUrl; }
    public void setCoverUrl(String coverUrl) { this.coverUrl = coverUrl; }

    public Mood getMood() { return mood; }
    public void setMood(Mood mood) { this.mood = mood; }

    public LocalDateTime getDrawnAt() { return drawnAt; }
}
