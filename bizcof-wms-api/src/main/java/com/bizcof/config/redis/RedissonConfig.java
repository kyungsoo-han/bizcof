package com.bizcof.config.redis;

import org.redisson.Redisson;
import org.redisson.api.RedissonClient;
import org.redisson.config.Config;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.ByteArrayInputStream;
import java.io.IOException;

@Configuration
public class RedissonConfig {

    private final RedissonProperties props;

    public RedissonConfig(RedissonProperties props) {
        this.props = props;
    }

    @Bean(destroyMethod = "shutdown")
    public RedissonClient redissonClient() throws IOException {
        Config config = Config.fromYAML(new ByteArrayInputStream(props.getConfig().getBytes()));
        return Redisson.create(config);
    }
}