-- =====================================================
-- V001: Audit 컬럼 마이그레이션
-- created_id, modified_id 컬럼 타입 -> BIGINT
-- 기본값(DEFAULT) 제거 후 타입 변경
-- =====================================================

SET search_path TO bizcof;

-- =====================================================
-- 1. t_user
-- =====================================================
ALTER TABLE t_user ALTER COLUMN created_id DROP DEFAULT;
ALTER TABLE t_user ALTER COLUMN modified_id DROP DEFAULT;
ALTER TABLE t_user ALTER COLUMN created_id TYPE BIGINT USING created_id::BIGINT;
ALTER TABLE t_user ALTER COLUMN modified_id TYPE BIGINT USING modified_id::BIGINT;

-- t_user 새 컬럼 추가
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'bizcof' AND table_name = 't_user' AND column_name = 'email') THEN
        ALTER TABLE t_user ADD COLUMN email VARCHAR(100);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'bizcof' AND table_name = 't_user' AND column_name = 'tel') THEN
        ALTER TABLE t_user ADD COLUMN tel VARCHAR(20);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'bizcof' AND table_name = 't_user' AND column_name = 'department') THEN
        ALTER TABLE t_user ADD COLUMN department VARCHAR(50);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'bizcof' AND table_name = 't_user' AND column_name = 'position') THEN
        ALTER TABLE t_user ADD COLUMN position VARCHAR(50);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'bizcof' AND table_name = 't_user' AND column_name = 'role') THEN
        ALTER TABLE t_user ADD COLUMN role VARCHAR(20);
    END IF;
END $$;

-- =====================================================
-- 2. t_menu
-- =====================================================
ALTER TABLE t_menu ALTER COLUMN created_id DROP DEFAULT;
ALTER TABLE t_menu ALTER COLUMN modified_id DROP DEFAULT;
ALTER TABLE t_menu ALTER COLUMN created_id TYPE BIGINT USING created_id::BIGINT;
ALTER TABLE t_menu ALTER COLUMN modified_id TYPE BIGINT USING modified_id::BIGINT;

-- =====================================================
-- 3. t_order
-- =====================================================
ALTER TABLE t_order ALTER COLUMN created_id DROP DEFAULT;
ALTER TABLE t_order ALTER COLUMN modified_id DROP DEFAULT;
ALTER TABLE t_order ALTER COLUMN created_id TYPE BIGINT USING created_id::BIGINT;
ALTER TABLE t_order ALTER COLUMN modified_id TYPE BIGINT USING modified_id::BIGINT;

-- =====================================================
-- 4. t_item
-- =====================================================
ALTER TABLE t_item ALTER COLUMN created_id DROP DEFAULT;
ALTER TABLE t_item ALTER COLUMN modified_id DROP DEFAULT;
ALTER TABLE t_item ALTER COLUMN created_id TYPE BIGINT USING created_id::BIGINT;
ALTER TABLE t_item ALTER COLUMN modified_id TYPE BIGINT USING modified_id::BIGINT;

-- =====================================================
-- 5. t_inventory_history
-- =====================================================
ALTER TABLE t_inventory_history ALTER COLUMN created_id DROP DEFAULT;
ALTER TABLE t_inventory_history ALTER COLUMN modified_id DROP DEFAULT;
ALTER TABLE t_inventory_history ALTER COLUMN created_id TYPE BIGINT USING created_id::BIGINT;
ALTER TABLE t_inventory_history ALTER COLUMN modified_id TYPE BIGINT USING modified_id::BIGINT;

-- =====================================================
-- 6. t_inbound_header
-- =====================================================
ALTER TABLE t_inbound_header ALTER COLUMN created_id DROP DEFAULT;
ALTER TABLE t_inbound_header ALTER COLUMN modified_id DROP DEFAULT;
ALTER TABLE t_inbound_header ALTER COLUMN created_id TYPE BIGINT USING created_id::BIGINT;
ALTER TABLE t_inbound_header ALTER COLUMN modified_id TYPE BIGINT USING modified_id::BIGINT;

-- =====================================================
-- 7. t_inbound_detail
-- =====================================================
ALTER TABLE t_inbound_detail ALTER COLUMN created_id DROP DEFAULT;
ALTER TABLE t_inbound_detail ALTER COLUMN modified_id DROP DEFAULT;
ALTER TABLE t_inbound_detail ALTER COLUMN created_id TYPE BIGINT USING created_id::BIGINT;
ALTER TABLE t_inbound_detail ALTER COLUMN modified_id TYPE BIGINT USING modified_id::BIGINT;

-- =====================================================
-- 8. t_outbound_request
-- =====================================================
ALTER TABLE t_outbound_request ALTER COLUMN created_id DROP DEFAULT;
ALTER TABLE t_outbound_request ALTER COLUMN modified_id DROP DEFAULT;
ALTER TABLE t_outbound_request ALTER COLUMN created_id TYPE BIGINT USING created_id::BIGINT;
ALTER TABLE t_outbound_request ALTER COLUMN modified_id TYPE BIGINT USING modified_id::BIGINT;

-- =====================================================
-- 9. t_outbound_header
-- =====================================================
ALTER TABLE t_outbound_header ALTER COLUMN created_id DROP DEFAULT;
ALTER TABLE t_outbound_header ALTER COLUMN modified_id DROP DEFAULT;
ALTER TABLE t_outbound_header ALTER COLUMN created_id TYPE BIGINT USING created_id::BIGINT;
ALTER TABLE t_outbound_header ALTER COLUMN modified_id TYPE BIGINT USING modified_id::BIGINT;

-- =====================================================
-- 10. t_outbound_detail
-- =====================================================
ALTER TABLE t_outbound_detail ALTER COLUMN created_id DROP DEFAULT;
ALTER TABLE t_outbound_detail ALTER COLUMN modified_id DROP DEFAULT;
ALTER TABLE t_outbound_detail ALTER COLUMN created_id TYPE BIGINT USING created_id::BIGINT;
ALTER TABLE t_outbound_detail ALTER COLUMN modified_id TYPE BIGINT USING modified_id::BIGINT;

-- =====================================================
-- 11. t_allocation_header
-- =====================================================
ALTER TABLE t_allocation_header ALTER COLUMN created_id DROP DEFAULT;
ALTER TABLE t_allocation_header ALTER COLUMN modified_id DROP DEFAULT;
ALTER TABLE t_allocation_header ALTER COLUMN created_id TYPE BIGINT USING created_id::BIGINT;
ALTER TABLE t_allocation_header ALTER COLUMN modified_id TYPE BIGINT USING modified_id::BIGINT;

-- =====================================================
-- 12. t_allocation_detail (존재하는 경우)
-- =====================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'bizcof' AND table_name = 't_allocation_detail') THEN
        EXECUTE 'ALTER TABLE t_allocation_detail ALTER COLUMN created_id DROP DEFAULT';
        EXECUTE 'ALTER TABLE t_allocation_detail ALTER COLUMN modified_id DROP DEFAULT';
        EXECUTE 'ALTER TABLE t_allocation_detail ALTER COLUMN created_id TYPE BIGINT USING created_id::BIGINT';
        EXECUTE 'ALTER TABLE t_allocation_detail ALTER COLUMN modified_id TYPE BIGINT USING modified_id::BIGINT';
    END IF;
END $$;

-- =====================================================
-- 13. t_common_code (존재하는 경우)
-- =====================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'bizcof' AND table_name = 't_common_code') THEN
        EXECUTE 'ALTER TABLE t_common_code ALTER COLUMN created_id DROP DEFAULT';
        EXECUTE 'ALTER TABLE t_common_code ALTER COLUMN modified_id DROP DEFAULT';
        EXECUTE 'ALTER TABLE t_common_code ALTER COLUMN created_id TYPE BIGINT USING created_id::BIGINT';
        EXECUTE 'ALTER TABLE t_common_code ALTER COLUMN modified_id TYPE BIGINT USING modified_id::BIGINT';
    END IF;
END $$;

-- =====================================================
-- 14. t_bom (존재하는 경우)
-- =====================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'bizcof' AND table_name = 't_bom') THEN
        EXECUTE 'ALTER TABLE t_bom ALTER COLUMN created_id DROP DEFAULT';
        EXECUTE 'ALTER TABLE t_bom ALTER COLUMN modified_id DROP DEFAULT';
        EXECUTE 'ALTER TABLE t_bom ALTER COLUMN created_id TYPE BIGINT USING created_id::BIGINT';
        EXECUTE 'ALTER TABLE t_bom ALTER COLUMN modified_id TYPE BIGINT USING modified_id::BIGINT';
    END IF;
END $$;

-- =====================================================
-- 15. t_customer (존재하는 경우)
-- =====================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'bizcof' AND table_name = 't_customer') THEN
        EXECUTE 'ALTER TABLE t_customer ALTER COLUMN created_id DROP DEFAULT';
        EXECUTE 'ALTER TABLE t_customer ALTER COLUMN modified_id DROP DEFAULT';
        EXECUTE 'ALTER TABLE t_customer ALTER COLUMN created_id TYPE BIGINT USING created_id::BIGINT';
        EXECUTE 'ALTER TABLE t_customer ALTER COLUMN modified_id TYPE BIGINT USING modified_id::BIGINT';
    END IF;
END $$;

-- =====================================================
-- 16. t_warehouse (존재하는 경우)
-- =====================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'bizcof' AND table_name = 't_warehouse') THEN
        EXECUTE 'ALTER TABLE t_warehouse ALTER COLUMN created_id DROP DEFAULT';
        EXECUTE 'ALTER TABLE t_warehouse ALTER COLUMN modified_id DROP DEFAULT';
        EXECUTE 'ALTER TABLE t_warehouse ALTER COLUMN created_id TYPE BIGINT USING created_id::BIGINT';
        EXECUTE 'ALTER TABLE t_warehouse ALTER COLUMN modified_id TYPE BIGINT USING modified_id::BIGINT';
    END IF;
END $$;

-- =====================================================
-- 17. t_inventory (존재하는 경우)
-- =====================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'bizcof' AND table_name = 't_inventory') THEN
        EXECUTE 'ALTER TABLE t_inventory ALTER COLUMN created_id DROP DEFAULT';
        EXECUTE 'ALTER TABLE t_inventory ALTER COLUMN modified_id DROP DEFAULT';
        EXECUTE 'ALTER TABLE t_inventory ALTER COLUMN created_id TYPE BIGINT USING created_id::BIGINT';
        EXECUTE 'ALTER TABLE t_inventory ALTER COLUMN modified_id TYPE BIGINT USING modified_id::BIGINT';
    END IF;
END $$;

-- =====================================================
-- 완료
-- =====================================================
SELECT 'Migration V001 completed successfully' AS status;
