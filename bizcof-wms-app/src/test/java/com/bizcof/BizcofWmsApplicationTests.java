package com.bizcof;

import com.bizcof.wms.system.repository.MenuRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
class BizcofWmsApplicationTests {

    @Autowired
    private MenuRepository menuRepository;


    @Test
      void getMnueList() {
      }
}
