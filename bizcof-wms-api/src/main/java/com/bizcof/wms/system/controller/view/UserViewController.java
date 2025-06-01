package com.bizcof.wms.system.controller.view;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;


@Controller
@RequiredArgsConstructor
@RequestMapping("/view/system/user")
public class UserViewController {

    @GetMapping
    public String signupForm(){
        return "system/user/user-manage";
    }

    @GetMapping("/form-modal")
    public String itemFormModal() {
        return "system/user/user-form-modal :: modal"; // `th:fragment="modal"`로 정의된 부분
    }

}
