package com.backend.appvengers.security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import org.springframework.stereotype.Component;
import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class LoginRateLimiter {

    private final ConcurrentHashMap<String, Bucket> buckets = new ConcurrentHashMap<>();

    public Bucket resolveBucket(String key) {
        return buckets.computeIfAbsent(key, this::newBucket);
    }

    private Bucket newBucket(String ignored) {
        Bandwidth limit = Bandwidth.builder()
                .capacity(5) 
                .refillIntervally(5, Duration.ofMinutes(15)) 
                .build();

        return Bucket.builder()
                .addLimit(limit)
                .build();
    }
}