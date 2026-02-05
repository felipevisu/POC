package org.example;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Long>{
    List<Document> findByIdGreaterThanOrderByIdAsc(Long id, org.springframework.data.domain.Pageable pageable);
    List<Document> findAllByOrderByIdAsc(org.springframework.data.domain.Pageable pageable);
}