# Bizcof WMS 개발 가이드

> 새로운 화면(기능)을 개발할 때 따라야 할 순서와 각 단계별 파일 위치를 설명합니다.

---

## 개발 순서 요약

```
1. Domain (Entity)           → 데이터 구조 정의
2. Repository                → 데이터 접근 계층
3. DTO (Request/Response)    → API 요청/응답 객체
4. Service                   → 비즈니스 로직
5. Controller                → API 엔드포인트
6. Frontend API Service      → 백엔드 API 호출
7. Frontend Component        → UI 컴포넌트
8. Frontend Route            → 페이지 라우팅
```

---

## 1단계: Domain (Entity)

**위치**: `bizcof-wms-api/src/main/java/com/bizcof/wms/{도메인}/domain/`

**예시**: 입고 관리 Entity

```java
package com.bizcof.wms.inbound.domain;

@Entity
@Table(name = "tb_inbound")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Inbound extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "inbound_no", nullable = false, unique = true)
    private String inboundNo;

    @Column(name = "inbound_date")
    private LocalDate inboundDate;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private InboundStatus status;

    // ... 생략
}
```

---

## 2단계: Repository

**위치**: `bizcof-wms-api/src/main/java/com/bizcof/wms/{도메인}/repository/`

### JPA Repository

```java
package com.bizcof.wms.inbound.repository;

public interface InboundRepository extends JpaRepository<Inbound, Long> {
    Optional<Inbound> findByInboundNo(String inboundNo);
    List<Inbound> findByInboundDateBetween(LocalDate start, LocalDate end);
}
```

### QueryDSL Repository (복잡한 쿼리용)

**위치**: `bizcof-wms-api/src/main/java/com/bizcof/wms/{도메인}/repository/querydsl/`

```java
package com.bizcof.wms.inbound.repository.querydsl;

@Repository
@RequiredArgsConstructor
public class InboundQueryRepository {

    private final JPAQueryFactory queryFactory;

    public List<InboundResponse> searchInbounds(InboundSearchRequest request) {
        return queryFactory
            .select(Projections.constructor(InboundResponse.class,
                inbound.id,
                inbound.inboundNo,
                inbound.inboundDate
            ))
            .from(inbound)
            .where(
                inboundDateBetween(request.getStartDate(), request.getEndDate()),
                statusEq(request.getStatus())
            )
            .fetch();
    }
}
```

---

## 3단계: DTO

**위치**: `bizcof-wms-api/src/main/java/com/bizcof/wms/{도메인}/dto/`

### Request DTO

```java
package com.bizcof.wms.inbound.dto.request;

@Getter
@NoArgsConstructor
public class InboundCreateRequest {
    private LocalDate inboundDate;
    private Long customerId;
    private List<InboundDetailRequest> details;
}
```

### Response DTO

```java
package com.bizcof.wms.inbound.dto.response;

@Getter
@AllArgsConstructor
public class InboundResponse {
    private Long id;
    private String inboundNo;
    private LocalDate inboundDate;
    private String customerName;
    private String statusName;
}
```

---

## 4단계: Service

**위치**: `bizcof-wms-api/src/main/java/com/bizcof/wms/{도메인}/service/`

```java
package com.bizcof.wms.inbound.service;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InboundService {

    private final InboundRepository inboundRepository;
    private final InboundQueryRepository inboundQueryRepository;

    // 조회
    public List<InboundResponse> getInbounds(InboundSearchRequest request) {
        return inboundQueryRepository.searchInbounds(request);
    }

    // 등록
    @Transactional
    public Long createInbound(InboundCreateRequest request) {
        Inbound inbound = Inbound.create(request);
        return inboundRepository.save(inbound).getId();
    }

    // 수정
    @Transactional
    public void updateInbound(Long id, InboundUpdateRequest request) {
        Inbound inbound = inboundRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("입고 정보를 찾을 수 없습니다."));
        inbound.update(request);
    }

    // 삭제
    @Transactional
    public void deleteInbound(Long id) {
        inboundRepository.deleteById(id);
    }
}
```

---

## 5단계: Controller

**위치**: `bizcof-wms-api/src/main/java/com/bizcof/wms/{도메인}/controller/api/`

```java
package com.bizcof.wms.inbound.controller.api;

@RestController
@RequestMapping("/api/inbound")
@RequiredArgsConstructor
public class InboundApiController {

    private final InboundService inboundService;

    // 목록 조회
    @GetMapping
    public BaseResponse<List<InboundResponse>> getInbounds(InboundSearchRequest request) {
        return BaseResponse.success(inboundService.getInbounds(request));
    }

    // 단건 조회
    @GetMapping("/{id}")
    public BaseResponse<InboundResponse> getInbound(@PathVariable Long id) {
        return BaseResponse.success(inboundService.getInbound(id));
    }

    // 등록
    @PostMapping
    public BaseResponse<Long> createInbound(@RequestBody InboundCreateRequest request) {
        return BaseResponse.success(inboundService.createInbound(request));
    }

    // 수정
    @PutMapping("/{id}")
    public BaseResponse<Void> updateInbound(
            @PathVariable Long id,
            @RequestBody InboundUpdateRequest request) {
        inboundService.updateInbound(id, request);
        return BaseResponse.success();
    }

    // 삭제
    @DeleteMapping("/{id}")
    public BaseResponse<Void> deleteInbound(@PathVariable Long id) {
        inboundService.deleteInbound(id);
        return BaseResponse.success();
    }
}
```

---

## 6단계: Frontend API Service

**위치**: `bizcof-wms-web/src/services/api/{도메인}.ts`

```typescript
// bizcof-wms-web/src/services/api/inbound.ts

import { api } from './client';

// 타입 정의
export interface Inbound {
  id: number;
  inboundNo: string;
  inboundDate: string;
  customerName: string;
  statusName: string;
}

export interface InboundSearchParams {
  startDate?: string;
  endDate?: string;
  status?: string;
}

export interface InboundCreateRequest {
  inboundDate: string;
  customerId: number;
  details: InboundDetailRequest[];
}

// API 함수
export const inboundApi = {
  // 목록 조회
  getInbounds: (params: InboundSearchParams) =>
    api.get<Inbound[]>('inbound', params),

  // 단건 조회
  getInbound: (id: number) =>
    api.get<Inbound>(`inbound/${id}`),

  // 등록
  createInbound: (data: InboundCreateRequest) =>
    api.post<number>('inbound', data),

  // 수정
  updateInbound: (id: number, data: InboundUpdateRequest) =>
    api.put<void>(`inbound/${id}`, data),

  // 삭제
  deleteInbound: (id: number) =>
    api.delete<void>(`inbound/${id}`),
};
```

---

## 7단계: Frontend Component

**위치**: `bizcof-wms-web/src/components/{도메인}/`

### Form Dialog 컴포넌트

```tsx
// bizcof-wms-web/src/components/inbound/InboundFormDialog.tsx

import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { inboundApi } from '@/services/api/inbound';

interface InboundFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inboundId?: number;
}

export function InboundFormDialog({ open, onOpenChange, inboundId }: InboundFormDialogProps) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm();

  const isEditMode = !!inboundId;

  const createMutation = useMutation({
    mutationFn: inboundApi.createInbound,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inbounds'] });
      onOpenChange(false);
      reset();
    },
  });

  const onSubmit = (data) => {
    createMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? '입고 수정' : '입고 등록'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* 폼 필드 */}
          <Button type="submit">저장</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 8단계: Frontend Route (페이지)

**위치**: `bizcof-wms-web/src/routes/_layout/view/{도메인}/`

```tsx
// bizcof-wms-web/src/routes/_layout/view/inbound/manage.tsx

import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { DataGrid } from '@/components/common/DataGrid';
import { InboundFormDialog } from '@/components/inbound/InboundFormDialog';
import { inboundApi } from '@/services/api/inbound';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export const Route = createFileRoute('/_layout/view/inbound/manage')({
  component: InboundManagePage,
});

function InboundManagePage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number>();

  // 데이터 조회
  const { data: inbounds = [], isLoading } = useQuery({
    queryKey: ['inbounds'],
    queryFn: () => inboundApi.getInbounds({}),
  });

  // 등록 버튼
  const handleCreate = () => {
    setSelectedId(undefined);
    setIsFormOpen(true);
  };

  // 수정 버튼
  const handleEdit = (id: number) => {
    setSelectedId(id);
    setIsFormOpen(true);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-bold">입고 관리</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2 text-blue-500" />
            입고 등록
          </Button>
        </div>
      </div>

      <DataGrid
        columns={columns}
        data={inbounds}
        isLoading={isLoading}
      />

      <InboundFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        inboundId={selectedId}
      />
    </div>
  );
}
```

---

## 디렉토리 구조 요약

### Backend (bizcof-wms-api)

```
bizcof-wms-api/src/main/java/com/bizcof/wms/
├── inbound/                    # 입고 도메인
│   ├── controller/
│   │   └── api/
│   │       └── InboundApiController.java
│   ├── domain/
│   │   ├── Inbound.java
│   │   └── InboundDetail.java
│   ├── dto/
│   │   ├── request/
│   │   │   └── InboundCreateRequest.java
│   │   └── response/
│   │       └── InboundResponse.java
│   ├── repository/
│   │   ├── InboundRepository.java
│   │   └── querydsl/
│   │       └── InboundQueryRepository.java
│   └── service/
│       └── InboundService.java
├── outbound/                   # 출고 도메인
├── inventory/                  # 재고 도메인
├── master/                     # 기준정보 도메인
├── order/                      # 주문 도메인
└── system/                     # 시스템 도메인
```

### Frontend (bizcof-wms-web)

```
bizcof-wms-web/src/
├── components/
│   ├── common/                 # 공통 컴포넌트
│   │   ├── DataGrid.tsx
│   │   └── SearchDialog.tsx
│   ├── inbound/                # 입고 컴포넌트
│   │   └── InboundFormDialog.tsx
│   ├── layout/                 # 레이아웃
│   │   ├── MainLayout.tsx
│   │   └── Sidebar.tsx
│   └── ui/                     # UI 컴포넌트 (shadcn/ui)
├── routes/
│   ├── __root.tsx
│   ├── _layout.tsx
│   ├── login.tsx
│   └── _layout/
│       └── view/
│           ├── inbound/
│           │   └── manage.tsx
│           ├── outbound/
│           ├── inventory/
│           └── master/
├── services/
│   └── api/
│       ├── client.ts           # API 클라이언트
│       ├── inbound.ts
│       ├── outbound.ts
│       └── item.ts
├── hooks/                      # 커스텀 훅
├── stores/                     # Zustand 스토어
└── types/                      # TypeScript 타입
```

---

## 개발 시 주의사항

### Backend

1. **Entity 설계 시 연관관계 최소화**: N+1 문제 방지
2. **QueryDSL 활용**: 복잡한 조회는 QueryRepository 사용
3. **트랜잭션 관리**: Service 계층에서 `@Transactional` 적용
4. **DTO 분리**: Request/Response 분리하여 유지보수성 향상

### Frontend

1. **React Query 활용**: 서버 상태 관리
2. **Form 관리**: react-hook-form 사용
3. **컴포넌트 분리**: 페이지와 Form Dialog 분리
4. **타입 정의**: API 응답 타입 명시

---

## 참고 자료

- [Spring Boot 공식 문서](https://spring.io/projects/spring-boot)
- [TanStack Query 공식 문서](https://tanstack.com/query)
- [TanStack Router 공식 문서](https://tanstack.com/router)
- [shadcn/ui 공식 문서](https://ui.shadcn.com)
