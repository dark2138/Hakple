package com.golden_dobakhe.HakPle.security;


import com.golden_dobakhe.HakPle.security.jwt.JwtAuthFilter;
import com.golden_dobakhe.HakPle.security.jwt.JwtTokenizer;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@Slf4j
@RequiredArgsConstructor
public class SecurityConfig {
    private final JwtTokenizer jwtTokenizer;
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity security) throws Exception {
        //접근 제한
        security
                .addFilterBefore(new JwtAuthFilter(jwtTokenizer), UsernamePasswordAuthenticationFilter.class)
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/", "/failure", "/login",
                                "/oauth2/authorization/kakao?redirectUrl=http://localhost:3000", //카카오 로그인
                                "/swagger-ui/**",            // Swagger UI
                                "/v3/api-docs/**",           // OpenAPI JSON
                                "/swagger-resources/**",     // Swagger 리소스
                                "/webjars/**",               // Swagger static
                                "/api/v1/**"
                                         ).permitAll()
                        .anyRequest().authenticated())
                .sessionManagement(session -> session
                        //세션을 저장하지 않는다 -> 세션을 사용하지 않겠다는 뜻 jwt인증을 쓸거니까
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                //http베이직은 헤더에서 보안에 취약하고 쟤를 빼버리고, 다른 인증수단인 베어러(얜 이거 빼면 자동으로 지정됨)으로 한다고 한다
                //이후 요청시 헤더에 Authorization
                .httpBasic(httpBasic -> httpBasic.disable())
                //.oauth2Login( oauth -> oauth )
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .formLogin(form -> form.disable()
                );
        //문제가 생기면 .anyRequest().permitAll() // 🔓 모든 요청 허용로 일단은 바꿔보고 해보세요, 필터는 jwt로 바꾸었습니다
        return security.build();

    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.addAllowedOrigin("*");
        config.addAllowedHeader("*");
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}

