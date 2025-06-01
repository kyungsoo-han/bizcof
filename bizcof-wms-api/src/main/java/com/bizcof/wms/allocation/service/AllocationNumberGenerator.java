package com.bizcof.wms.allocation.service;

import lombok.RequiredArgsConstructor;
import org.redisson.api.RAtomicLong;
import org.redisson.api.RedissonClient;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@RequiredArgsConstructor
@Service
public class AllocationNumberGenerator {
    private final RedissonClient redissonClient;

    public String generateAllocationNo() {
        String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String key = "trx_seq:ALLOCATION:" + "ALO" + today;

        RAtomicLong counter = redissonClient.getAtomicLong(key);
        long next = counter.incrementAndGet();

        if (counter.remainTimeToLive() == -1) {
            counter.expire(Duration.ofDays(2));
        }

        return "ALO" + today + String.format("%05d", next);
    }
}