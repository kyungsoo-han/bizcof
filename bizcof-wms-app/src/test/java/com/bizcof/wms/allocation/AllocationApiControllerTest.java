package com.bizcof.wms.allocation;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest(properties = "spring.profiles.active=local")
@TestPropertySource(properties = {"spring.config.location=classpath:application.yml"})
class AllocationApiControllerTest {


    @Test
    public void test(){

    }


}