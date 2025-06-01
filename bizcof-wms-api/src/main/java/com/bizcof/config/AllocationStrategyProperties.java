package com.bizcof.config;
import com.bizcof.wms.inventory.strategy.constants.AllocationStrategyType;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "wms.allocation")
public class AllocationStrategyProperties {
    private com.bizcof.wms.inventory.strategy.constants.AllocationStrategyType strategy = AllocationStrategyType.MAKE_DATE;
}
