package com.bizcof.wms.system.domain;

import com.bizcof.common.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Entity(name = "t_user")
public class User extends BaseEntity implements UserDetails {


    @Column(name = "user_id")
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "login_id", unique = true, nullable = false)
    private String loginId;

    @Column(name = "name")
    private String name;

    @Column(name = "password")
    private String password;

    @Column(name = "email")
    private String email;

    @Column(name = "tel")
    private String tel;

    @Column(name = "department")
    private String department;

    @Column(name = "position")
    private String position;

    @Column(name = "role")
    private String role;

    @Column(name = "memo")
    private String memo;

    @Column(name = "use_yn")
    private String useYn;

    @lombok.Builder
    private User(String loginId, String name, String password, String email, String tel,
                 String department, String position, String role, String memo, String useYn) {
        this.loginId = loginId;
        this.name = name;
        this.password = password;
        this.email = email;
        this.tel = tel;
        this.department = department;
        this.position = position;
        this.role = role;
        this.memo = memo;
        this.useYn = useYn;
    }

    public static User of(String name, String loginId, String memo, String useYn) {
        return User.builder()
                .name(name)
                .loginId(loginId)
                .memo(memo)
                .useYn(useYn)
                .build();
    }

    // 사용자 정보 수정
    public void update(String name, String email, String tel, String department,
                       String position, String role, String useYn) {
        this.name = name;
        this.email = email;
        this.tel = tel;
        this.department = department;
        this.position = position;
        this.role = role;
        this.useYn = useYn;
    }

    // 비밀번호 변경
    public void changePassword(String newPassword) {
        this.password = newPassword;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        String userRole = this.role != null ? this.role : "USER";
        return List.of(new SimpleGrantedAuthority("ROLE_" + userRole));
    }

    @Override
    public String getUsername() {
        return this.loginId;
    }
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
