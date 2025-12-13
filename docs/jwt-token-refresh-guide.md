# JWT Access Token과 Refresh Token 완벽 이해하기

> JWT 기반 인증에서 Access Token과 Refresh Token이 어떻게 동작하는지, 왜 두 개의 토큰이 필요한지 알아봅니다.

## 왜 두 개의 토큰이 필요할까?

### 하나의 토큰만 사용한다면?

**긴 만료 시간 (예: 7일)**
- 토큰이 탈취되면 7일 동안 악용 가능
- 보안 취약

**짧은 만료 시간 (예: 15분)**
- 15분마다 재로그인 필요
- 사용자 경험 최악

### 해결책: 두 개의 토큰

| 토큰 | 만료 시간 | 용도 | 저장 위치 |
|------|----------|------|----------|
| **Access Token** | 15분 | API 호출 | 메모리/localStorage |
| **Refresh Token** | 7일 | Access Token 갱신 | HttpOnly Cookie |

- **Access Token**: 짧은 만료 → 탈취되어도 피해 최소화
- **Refresh Token**: 긴 만료 → 사용자 편의성 유지

---

## 토큰 발급 및 갱신 흐름

### 1단계: 로그인

```
[사용자] ──── ID/PW ────→ [서버]
                           │
         ←── Access Token ─┤ (15분 유효)
         ←── Refresh Token ┘ (7일 유효, HttpOnly Cookie)
```

```java
// 서버 - 로그인 API
@PostMapping("/auth/login")
public Response login(String username, String password) {
    // 1. 인증
    authenticate(username, password);

    // 2. Access Token 생성 (15분)
    String accessToken = jwtProvider.generateAccessToken(username);

    // 3. Refresh Token 생성 (7일)
    String refreshToken = jwtProvider.generateRefreshToken(username);

    // 4. Refresh Token을 Redis에 저장 (서버 측 검증용)
    redisService.save(username, refreshToken);

    // 5. Refresh Token을 HttpOnly Cookie로 설정
    response.addCookie(createHttpOnlyCookie(refreshToken));

    // 6. Access Token 반환
    return Response.ok(accessToken);
}
```

### 2단계: API 호출

```
[클라이언트] ── Access Token ──→ [서버]
                                  │
              ←── 데이터 ─────────┘
```

```javascript
// 클라이언트 - API 호출
const response = await fetch('/api/data', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

### 3단계: Access Token 만료 후 갱신

```
[15분 경과]

[클라이언트] ── 만료된 Access Token ──→ [서버]
              ←── 401 Unauthorized ────┘

[클라이언트] ── Refresh Token (Cookie) ──→ [서버]
              ←── 새 Access Token ────────┘

[클라이언트] ── 새 Access Token ──→ [서버]
              ←── 데이터 ───────────┘
```

```javascript
// 클라이언트 - 자동 토큰 갱신 (Axios Interceptor 예시)
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Refresh Token으로 새 Access Token 요청
      const { data } = await axios.post('/auth/refresh');

      // 새 토큰으로 원래 요청 재시도
      error.config.headers['Authorization'] = `Bearer ${data.accessToken}`;
      return axios(error.config);
    }
    return Promise.reject(error);
  }
);
```

### 4단계: Refresh Token 만료 (7일 후)

```
[7일 경과]

[클라이언트] ── Refresh Token (만료) ──→ [서버]
              ←── 401 Unauthorized ──────┘

→ 재로그인 필요!
```

---

## 전체 타임라인

```
Day 1, 09:00  로그인
              ├─ Access Token 발급 (만료: 09:15)
              └─ Refresh Token 발급 (만료: Day 8, 09:00)

Day 1, 09:15  Access Token 만료
              └─ Refresh Token으로 갱신 → 새 Access Token (만료: 09:30)

Day 1, 09:30  Access Token 만료
              └─ Refresh Token으로 갱신 → 새 Access Token (만료: 09:45)

... (15분마다 자동 갱신) ...

Day 7, 23:45  여전히 정상 동작
              └─ Refresh Token 아직 유효

Day 8, 09:00  Refresh Token 만료
              └─ 갱신 실패 → 재로그인 필요!
```

---

## 보안 포인트

### Access Token

```
저장: localStorage 또는 메모리
전송: Authorization 헤더
위험: XSS 공격에 노출 가능
대책: 짧은 만료 시간 (15분)
```

### Refresh Token

```
저장: HttpOnly Cookie
전송: 자동 (Cookie)
보호:
  - HttpOnly → JavaScript 접근 불가 (XSS 방어)
  - Secure → HTTPS만 전송
  - SameSite=Strict → 다른 사이트에서 전송 불가 (CSRF 방어)
```

### 서버 측 검증 (Redis)

```java
// Refresh Token 검증
public boolean validateRefreshToken(String username, String token) {
    String savedToken = redis.get("refresh_token:" + username);
    return savedToken != null && savedToken.equals(token);
}
```

- 로그아웃 시 Redis에서 삭제 → 즉시 무효화
- 새 로그인 시 덮어쓰기 → 이전 세션 자동 만료

---

## 자주 묻는 질문

### Q: Refresh Token이 탈취되면?

**A:** 여러 겹의 보안으로 보호됩니다.

1. **HttpOnly Cookie**: JavaScript로 접근 불가
2. **SameSite=Strict**: 다른 사이트에서 요청 시 전송 안 됨
3. **서버 검증**: Redis에 저장된 값과 비교

만약 탈취되어도:
- 새 로그인 시 기존 토큰 무효화 (Redis 덮어쓰기)
- 로그아웃 시 즉시 무효화

### Q: Access Token이 탈취되면?

**A:** 15분 후 만료되어 피해 최소화

### Q: 왜 401을 반환해야 하나?

**A:** 클라이언트가 토큰 갱신을 시도할 수 있도록

```
403 Forbidden → "권한 없음" → 갱신 시도 안 함
401 Unauthorized → "인증 필요" → 갱신 시도
```

---

## 구현 체크리스트

### 백엔드

- [ ] Access Token 생성 (짧은 만료: 15분)
- [ ] Refresh Token 생성 (긴 만료: 7일)
- [ ] Refresh Token을 HttpOnly Cookie로 설정
- [ ] Refresh Token을 Redis에 저장
- [ ] 토큰 갱신 API (`/auth/refresh`)
- [ ] 인증 실패 시 401 반환 (AuthenticationEntryPoint)

### 프론트엔드

- [ ] Access Token을 메모리/localStorage에 저장
- [ ] API 호출 시 Authorization 헤더에 토큰 추가
- [ ] 401 응답 시 자동으로 토큰 갱신
- [ ] 갱신 실패 시 로그인 페이지로 이동

---

## 마무리

JWT 기반 인증에서 두 개의 토큰을 사용하는 이유:

1. **보안**: Access Token은 짧게 → 탈취 피해 최소화
2. **편의성**: Refresh Token은 길게 → 자주 로그인할 필요 없음
3. **유연성**: 서버 측 검증으로 즉시 무효화 가능

이 패턴은 대부분의 모던 웹 애플리케이션에서 사용되는 표준적인 방식입니다.
