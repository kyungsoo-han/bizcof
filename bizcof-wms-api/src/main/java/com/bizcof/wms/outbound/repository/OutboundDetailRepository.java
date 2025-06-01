package com.bizcof.wms.outbound.repository;

import com.bizcof.wms.outbound.domain.OutboundDetail;
import com.bizcof.wms.outbound.domain.OutboundDetailId;
import com.bizcof.wms.outbound.domain.OutboundDetail;
import com.bizcof.wms.outbound.domain.OutboundDetailId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;


/**
 * OutboundDetail 엔티티용 JPA Repository
 * - 복합키(OutboundNo, SeqNo)를 사용하는 엔티티
 */
public interface OutboundDetailRepository extends JpaRepository<OutboundDetail, OutboundDetailId> {

    /**
     * 특정 출고번호로 모든 상세 품목 조회
     * @param outboundNo 출고번호
     */
    List<OutboundDetail> findByOutboundNo(String outboundNo);

    /**
     * 특정 출고번호 기준 현재 최대 순번(seqNo) 조회
     * @param outboundNo 출고번호
     * @return 최대 seqNo (없으면 0)
     */
    @Query("SELECT COALESCE(MAX(d.seqNo), 0) FROM OutboundDetail d WHERE d.outboundNo = :outboundNo")
    int findMaxSeqNo(@Param("outboundNo") String outboundNo);

    //@Query("DELETE FROM OutboundDetail d WHERE d.outboundNo = :outboundNo")
    void deleteByOutboundNo(@Param("outboundNo") String outboundNo);
}

