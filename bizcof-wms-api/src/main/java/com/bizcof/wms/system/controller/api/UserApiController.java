package com.bizcof.wms.system.controller.api;

import com.bizcof.common.dto.response.BaseResponse;
import com.bizcof.config.security.JwtTokenProvider;
import com.bizcof.wms.system.dto.LoginUserRequest;
import com.bizcof.wms.system.dto.UserDto;
import com.bizcof.wms.system.dto.request.SearchUserRequest;
import com.bizcof.wms.system.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/system/user")
public class UserApiController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserService userService;

    @GetMapping("/list")
    public BaseResponse<List<UserDto>> findAllUsers(SearchUserRequest request){
        List<UserDto> allUsers = userService.findAllUsers(request);
        return BaseResponse.success(allUsers);
    }

    @PostMapping("/login")
    public ResponseEntity<BaseResponse<?>>login(@RequestBody LoginUserRequest request){
        System.out.println("request = " + request);
        Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getLoginId(), request.getPassword()));
        System.out.println("authentication = " + authentication);
        String token = jwtTokenProvider.generateAccessToken(request.getLoginId());
        System.out.println("token = " + token);
        //userService.loadUserByUsername()


        return ResponseEntity.ok().body(BaseResponse.success(Map.of("token", token, "userName","TEST")));
    }

    @PostMapping("/logout")
    public String logout(HttpServletRequest request, HttpServletResponse response) {
        // 세션 무효화
        request.getSession().invalidate();

        // Refresh Token 쿠키 삭제
        ResponseCookie deleteCookie = ResponseCookie.from("refreshToken", "")
                .path("/")
                .httpOnly(true)
                //.secure(true)
                .maxAge(0) // 즉시 만료
                .build();
        response.setHeader("Set-Cookie", deleteCookie.toString());

        return "redirect:user/loginForm";
    }
}
