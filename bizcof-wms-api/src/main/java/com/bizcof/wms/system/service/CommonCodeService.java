package com.bizcof.wms.system.service;

import com.bizcof.wms.system.domain.CommonCode;
import com.bizcof.wms.system.dto.CommonCodeResponse;
import com.bizcof.wms.system.repository.querydsl.CommonCodeQueryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class CommonCodeService {

    private final CommonCodeQueryRepository commonCodeQueryRepository;
    private final RedisTemplate<String, Object> redisTemplate;
    private static final String CODE_PREFIX = "COMMON_CODE:";

    @Transactional(readOnly = true)
    public List<CommonCodeResponse> getCodes(String groupCode) {
        String redisKey = CODE_PREFIX + groupCode;

        // Redis 조회
        Object cached = redisTemplate.opsForValue().get(redisKey);
        if (cached != null) {
            return (List<CommonCodeResponse>) cached;
        }

        // DB 조회 + Redis 저장
        List<CommonCodeResponse> codes = commonCodeQueryRepository.findCodes(groupCode);
        redisTemplate.opsForValue().set(redisKey, codes, 6, TimeUnit.HOURS); // TTL 6시간

        return codes;
    }

    /**
     * 캐시 초기화 메서드 (필요 시 호출)
     */
    public void evictCache(String groupCode) {
        redisTemplate.delete(CODE_PREFIX + groupCode);
    }

}