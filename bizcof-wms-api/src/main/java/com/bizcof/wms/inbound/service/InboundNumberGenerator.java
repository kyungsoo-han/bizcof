package com.bizcof.wms.inbound.service;

import lombok.RequiredArgsConstructor;
import org.redisson.api.RAtomicLong;
import org.redisson.api.RedissonClient;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@RequiredArgsConstructor
@Service
public class InboundNumberGenerator {
    private final RedissonClient redissonClient;

    public String generateInboundNo() {
        String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")); // 오늘 날짜
        String key = "trx_seq:INBOUND:" + "INB" +today; // Redis 키: trx_seq:INBOUND:20250506

        RAtomicLong counter = redissonClient.getAtomicLong(key); // Redis의 숫자 카운터 객체
        long next = counter.incrementAndGet(); // thread-safe, 원자적으로 1 증가

        // TTL이 설정되지 않았을 경우 2일 설정 (자동 만료)
        if (counter.remainTimeToLive() == -1) {
            counter.expire(Duration.ofDays(2));
        }

        // 최종 입고번호: INB2025050600001 형식
        return "INB" + today + String.format("%05d", next);
    }
}
