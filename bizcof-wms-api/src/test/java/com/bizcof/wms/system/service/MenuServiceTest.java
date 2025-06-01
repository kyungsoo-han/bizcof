package com.bizcof.wms.system.service;

import com.bizcof.wms.system.domain.Menu;
import com.bizcof.wms.system.repository.MenuRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@TestPropertySource(properties = {"spring.config.location=classpath:application.yml"})
class MenuServiceTest {

    @Autowired
    private MenuRepository menuRepository;


    @Test
    void createMenu() {
    }

    @Test
    void updateMenu() {
    }

    @Test
    void getMnueList() {
        List<Menu> all = menuRepository.findAll();
        assertNotNull(all);
    }
}