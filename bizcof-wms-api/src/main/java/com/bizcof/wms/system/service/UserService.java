package com.bizcof.wms.system.service;

import com.bizcof.wms.system.domain.User;
import com.bizcof.wms.system.dto.UserDto;
import com.bizcof.wms.system.dto.request.SearchUserRequest;
import com.bizcof.wms.system.dto.request.UserCreateRequest;
import com.bizcof.wms.system.dto.request.UserUpdateRequest;
import com.bizcof.wms.system.repository.UserRepository;
import com.bizcof.wms.system.repository.querydsl.UserQueryRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@RequiredArgsConstructor
@Service
@Transactional(readOnly = true)
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final UserQueryRepository userQueryRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * 사용자 목록 조회
     */
    public List<UserDto> findAllUsers(SearchUserRequest request) {
        return userQueryRepository.findAllUsers(request);
    }

    /**
     * 사용자 단건 조회
     */
    public UserDto findById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다. ID: " + id));
        return UserDto.from(user);
    }

    /**
     * 사용자 등록
     */
    @Transactional
    public String createUser(UserCreateRequest request) {
        // 중복 체크
        if (userRepository.findByLoginId(request.getUserId()).isPresent()) {
            throw new IllegalArgumentException("이미 존재하는 사용자 ID입니다: " + request.getUserId());
        }

        // 비밀번호 인코딩
        String encodedPassword = passwordEncoder.encode(request.getPassword());

        User user = request.toEntity(encodedPassword);
        userRepository.save(user);

        log.info("사용자 등록 완료: {}", request.getUserId());
        return request.getUserId();
    }

    /**
     * 사용자 수정
     */
    @Transactional
    public void updateUser(UserUpdateRequest request) {
        User user = userRepository.findById(request.getId())
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다. ID: " + request.getId()));

        user.update(
                request.getUserName(),
                request.getEmail(),
                request.getTel(),
                request.getDepartment(),
                request.getPosition(),
                request.getRole(),
                request.getUseYn()
        );

        log.info("사용자 수정 완료: {}", user.getLoginId());
    }

    /**
     * 사용자 삭제
     */
    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다. ID: " + id));

        userRepository.delete(user);
        log.info("사용자 삭제 완료: {}", user.getLoginId());
    }

    /**
     * 비밀번호 초기화 (기본값: 1234)
     */
    @Transactional
    public void resetPassword(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다. ID: " + id));

        String encodedPassword = passwordEncoder.encode("1234");
        user.changePassword(encodedPassword);

        log.info("비밀번호 초기화 완료: {}", user.getLoginId());
    }

    /**
     * Spring Security UserDetailsService 구현
     * User 엔티티를 직접 반환하여 AuditorAware에서 user ID를 얻을 수 있도록 함
     */
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        log.info("=== loadUserByUsername 호출: {}", username);

        User user = userRepository.findByLoginId(username)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + username));

        log.info("=== 사용자 조회 성공: loginId={}, userId={}", user.getLoginId(), user.getId());

        return user;
    }
}
