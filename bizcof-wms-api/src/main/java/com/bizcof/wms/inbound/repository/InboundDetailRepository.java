package com.bizcof.wms.inbound.repository;

import com.bizcof.wms.inbound.domain.InboundDetail;
import com.bizcof.wms.inbound.domain.InboundDetailId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;


/**
 * InboundDetail 엔티티용 JPA Repository
 * - 복합키(InboundNo, SeqNo)를 사용하는 엔티티
 */
public interface InboundDetailRepository extends JpaRepository<InboundDetail, InboundDetailId> {

    /**
     * 특정 입고번호로 모든 상세 품목 조회
     * @param inboundNo 입고번호
     */
    List<InboundDetail> findByInboundNo(String inboundNo);

    /**
     * 특정 입고번호 기준 현재 최대 순번(seqNo) 조회
     * @param inboundNo 입고번호
     * @return 최대 seqNo (없으면 0)
     */
    @Query("SELECT COALESCE(MAX(d.seqNo), 0) FROM InboundDetail d WHERE d.inboundNo = :inboundNo")
    int findMaxSeqNo(@Param("inboundNo") String inboundNo);

    //@Query("DELETE FROM InboundDetail d WHERE d.inboundNo = :inboundNo")
    void deleteByInboundNo(@Param("inboundNo") String inboundNo);
}

