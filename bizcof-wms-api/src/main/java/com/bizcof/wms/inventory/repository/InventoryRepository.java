package com.bizcof.wms.inventory.repository;

import com.bizcof.wms.inventory.domain.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    /**
     * DB의 유니크 키(item_id + location_code + lot_no + make_date + expire_date + make_no)에 해당하는 재고 조회
     * - 재고가 존재하면 수정, 없으면 신규 생성 시 사용
     */
    Optional<Inventory> findByItemIdAndLocationCodeAndLotNoAndMakeDateAndExpireDateAndMakeNo(
            Long itemId,
            String locationCode,
            String lotNo,
            String makeDate,
            String expireDate,
            String makeNo
    );

    // Optional<Inventory> findByUniqueKey(...) 로 보기 좋게 래핑하고 싶다면 아래처럼 default 메서드 정의 가능
    default Optional<Inventory> findByUniqueKey(
            Long itemId,
            String locationCode,
            String lotNo,
            String makeDate,
            String expireDate,
            String makeNo
    ) {
        return findByItemIdAndLocationCodeAndLotNoAndMakeDateAndExpireDateAndMakeNo(
                itemId, locationCode, lotNo, makeDate, expireDate, makeNo
        );
    }
}