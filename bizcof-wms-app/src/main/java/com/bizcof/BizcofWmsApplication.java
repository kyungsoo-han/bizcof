package com.bizcof;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableJpaAuditing
@SpringBootApplication
public class BizcofWmsApplication {

    public static void main(String[] args) {
        SpringApplication.run(BizcofWmsApplication.class, args);
    }

}
