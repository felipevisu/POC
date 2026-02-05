package org.example;

import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/documents")
public class DocumentController {

    private final DocumentRepository repository;

    public DocumentController(DocumentRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public PageResponse<Document> getDocuments(
        @RequestParam(required = false) Long cursor,
        @RequestParam(defaultValue = "10") int limit
    ) {
        List<Document> documents;
        if (cursor == null) {
            documents = repository.findAllByOrderByIdAsc(PageRequest.of(0, limit + 1));
        } else {
            documents = repository.findByIdGreaterThanOrderByIdAsc(cursor, PageRequest.of(0, limit + 1));
        }
        boolean hasMore = documents.size() > limit;

        if (hasMore) {
            documents = documents.subList(0, limit);
        }

        Long nextCursor = hasMore ? documents.get(documents.size() - 1).getId() : null;

        return new PageResponse<>(documents, nextCursor, hasMore);
    }
}