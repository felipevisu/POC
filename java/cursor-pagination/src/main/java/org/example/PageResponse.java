package org.example;
import java.util.List;

public record PageResponse<T>(
    List<T> data,
    Long nextCursor,
    boolean hasMore
) {}
