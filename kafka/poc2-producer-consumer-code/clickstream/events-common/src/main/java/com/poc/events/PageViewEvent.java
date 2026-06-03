package com.poc.events;

/**
 * The contract shared between producer and consumer.
 * Both services depend on this module, so the shape of an event
 * is defined in exactly one place.
 */
public record PageViewEvent(String userId, String page, long timestamp) {
}
