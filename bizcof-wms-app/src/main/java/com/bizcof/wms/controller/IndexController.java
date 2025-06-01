package com.bizcof.wms.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Slf4j
@Controller
public class IndexController {

    @GetMapping("/")
    public String index(Model model) {
        String accessToken = "a";
        try {
            if (accessToken == null) {
                return "redirect:/user/loginForm";
            }
            log.info(accessToken);
            model.addAttribute("accessToken", accessToken);
            //model.addAttribute("userName", userName);
        } catch (Exception e) {
            log.error("accessToken error: {}", e.getMessage());
        }

        return "index";
    }

    @GetMapping("/login")
    public String loginForm(){
        return "system/user/login";
    }
}
