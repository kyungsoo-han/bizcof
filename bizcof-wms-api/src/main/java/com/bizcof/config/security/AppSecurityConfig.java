package com.bizcof.config.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.firewall.DefaultHttpFirewall;
import org.springframework.security.web.firewall.HttpFirewall;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class AppSecurityConfig {

    //private final CustomAuthFailureHandler customFailureHandler;
    private final CustomLoginSuccessHandler customLoginSuccessHandler;

    /*
    @Bean
    public BCryptPasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }*/

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .headers(headers -> headers
                       .frameOptions(frameOptions -> frameOptions
                           .sameOrigin() // 같은 도메인에서만 iframe 허용
                       )
                   )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/plugins/**", "/common/**", "/bsrp/**", "/dist/**", "/css/**", "/js/**",
                                "/api-docs/**","/api/api-docs/**","/swagger-ui/**","/swagger-ui.html","/swagger-resources/**").permitAll()
                        .requestMatchers("/user/login", "/user/loginForm", "/").permitAll()
                        //.requestMatchers("/**/*.html").permitAll()
                        .requestMatchers( "/**").permitAll()
//                                        String requestURI = context.getRequest().getRequestURI();
//                                        if (requestURI.startsWith("/") && requestURI.endsWith(".html")) {
//                                            return new AuthorizationDecision(true); // ✅ HTML 페이지 요청만 허용
//                                        }
//                                        return new AuthorizationDecision(false); // ❌ API 요청은 인증 필요
//                                    })

                        .anyRequest().authenticated()
                )
           /*     .formLogin(form -> form
                        .loginPage("/user/loginForm")
                        //.loginProcessingUrl("/user/login")  //로그인 API 커스텀으로 지정
                        .usernameParameter("loginId")
                        .passwordParameter("password")
                        //.successHandler(customLoginSuccessHandler)
                        //.defaultSuccessUrl("/", true)
                        .failureUrl("/user/loginForm?error=true")
                        //.failureHandler(customFailureHandler)
                        .permitAll()
                )*/
                .formLogin(AbstractHttpConfigurer::disable) // ❌ 기본 로그인 폼 비활성화
                .httpBasic(AbstractHttpConfigurer::disable) // ❌ 기본 HTTP Basic 인증 비활성화
                .logout(logout -> logout
                        .logoutUrl("/logout")
                        .logoutSuccessUrl("/user/loginForm")
                        .permitAll()
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                        .sessionFixation().none()  // 로그인 후 세션 ID 변경 방지 -> successHandler에서 IndexCOntroller로 accessToken 전달 안돼서 설정
                )
                .csrf(AbstractHttpConfigurer::disable); //로컬 환경에서 확인을 위해 disable;


        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public HttpFirewall allowUrlEncodedSlashHttpFirewall() {
        return new DefaultHttpFirewall();
    }
}
