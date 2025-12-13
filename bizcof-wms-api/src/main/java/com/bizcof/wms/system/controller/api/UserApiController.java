package com.bizcof.wms.system.controller.api;

import com.bizcof.common.dto.response.BaseResponse;
import com.bizcof.wms.system.dto.UserDto;
import com.bizcof.wms.system.dto.request.SearchUserRequest;
import com.bizcof.wms.system.dto.request.UserCreateRequest;
import com.bizcof.wms.system.dto.request.UserUpdateRequest;
import com.bizcof.wms.system.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/system/user")
public class UserApiController {

    private final UserService userService;

    /**
     * 사용자 목록 조회
     */
    @GetMapping("/list")
    public BaseResponse<List<UserDto>> findAllUsers(SearchUserRequest request) {
        List<UserDto> users = userService.findAllUsers(request);
        return BaseResponse.success(users);
    }

    /**
     * 사용자 단건 조회
     */
    @GetMapping("/{id}")
    public BaseResponse<UserDto> findById(@PathVariable Long id) {
        UserDto user = userService.findById(id);
        return BaseResponse.success(user);
    }

    /**
     * 사용자 등록
     */
    @PostMapping
    public BaseResponse<String> createUser(@RequestBody UserCreateRequest request) {
        String userId = userService.createUser(request);
        return BaseResponse.success(userId);
    }

    /**
     * 사용자 수정
     */
    @PutMapping
    public BaseResponse<Void> updateUser(@RequestBody UserUpdateRequest request) {
        userService.updateUser(request);
        return BaseResponse.success();
    }

    /**
     * 사용자 삭제
     */
    @DeleteMapping("/{id}")
    public BaseResponse<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return BaseResponse.success();
    }

    /**
     * 비밀번호 초기화
     */
    @PostMapping("/{id}/reset-password")
    public BaseResponse<Void> resetPassword(@PathVariable Long id) {
        userService.resetPassword(id);
        return BaseResponse.success();
    }
}
