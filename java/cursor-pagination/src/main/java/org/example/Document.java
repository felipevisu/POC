package org.example;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name="document_document", schema="visualize")
public class Document {
    @Id
    private Long id;
    private String name;
    private LocalDateTime created;
    private LocalDateTime updated;

    @Column(name="is_published")
    private Boolean isPublished;

    // Getters
    public Long getId(){ return id; }
    public String getName(){ return name; }
    public LocalDateTime getCreated(){ return created; }
    public LocalDateTime getUpdated(){ return updated; }
    public Boolean getIsPublished(){ return isPublished; }

    // Setters
    public void setId(Long id){ this.id = id; }
    public void setName(String name){ this.name = name; }
    public void setCreated(LocalDateTime created) { this.created = created; }
    public void setUpdated(LocalDateTime updated) { this.updated = updated; }
    public void setIsPublished(Boolean isPublished){ this.isPublished = isPublished; }

}
