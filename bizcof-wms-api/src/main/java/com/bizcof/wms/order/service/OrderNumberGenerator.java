package com.bizcof.wms.order.service;

import lombok.RequiredArgsConstructor;
import org.redisson.api.RAtomicLong;
import org.redisson.api.RedissonClient;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@RequiredArgsConstructor
@Component
public class OrderNumberGenerator {

    private final RedissonClient redissonClient;

    public String generateOrderNo() {
        String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String key = "trx_seq:ORDER:" + "ORD" + today;

        RAtomicLong counter = redissonClient.getAtomicLong(key);
        long next = counter.incrementAndGet();

        if (counter.remainTimeToLive() == -1) {
            counter.expire(Duration.ofDays(2));
        }

        return "ORD" + today + String.format("%05d", next);
    }
}