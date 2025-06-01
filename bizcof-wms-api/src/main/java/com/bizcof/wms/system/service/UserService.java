package com.bizcof.wms.system.service;

import com.bizcof.wms.system.domain.User;
import com.bizcof.wms.system.dto.UserDto;
import com.bizcof.wms.system.dto.request.SearchUserRequest;
import com.bizcof.wms.system.repository.UserRepository;
import com.bizcof.wms.system.repository.querydsl.UserQueryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
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

    public List<UserDto> findAllUsers(SearchUserRequest request){
        return userQueryRepository.findAllUsers(request);
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByLoginId(username)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + username));

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getLoginId())
                .password("{noop}"+user.getPassword())
                .roles("ADMIN")
                .build();
    }
}
