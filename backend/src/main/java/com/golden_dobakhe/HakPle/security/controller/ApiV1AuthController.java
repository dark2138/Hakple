package com.golden_dobakhe.HakPle.security.controller;


import com.golden_dobakhe.HakPle.domain.user.user.entity.User;
import com.golden_dobakhe.HakPle.security.service.AuthService;
import com.golden_dobakhe.HakPle.security.dto.LoginDto;
import com.golden_dobakhe.HakPle.security.dto.LoginResponseDto;
import com.golden_dobakhe.HakPle.security.jwt.JwtTokenizer;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/auth")
public class ApiV1AuthController {
    private final AuthService authService;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/home")
    public ResponseEntity<String> home() {
        return ResponseEntity.ok("여기는 집");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDto req, HttpServletResponse response) {
        User user= authService.findByUserName(req);
        //일단은 유저가 있는지 없는지 확인
        //없으면 나가리
        if (user == null)
            return ResponseEntity.status(404).body("님 없음");
        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("비밀번호가 틀렸습니다.");
        }
        //있다면? 토큰 만들고
        String accessToken = authService.genAccessToken(user);
        String refreshToken = authService.genRefreshToken(user);

        //토큰을 저장하고
        authService.addRefreshToken(user, refreshToken);


        //만든걸 보내야지
        LoginResponseDto loginResponseDto = new LoginResponseDto(accessToken, refreshToken, user.getId(), user.getUserName());



        //만약 쿠키에도 저장하고 싶다면?
        Cookie accesTokenCookie = new Cookie("accessToken", accessToken);
        accesTokenCookie.setHttpOnly(true); //보안, 자바스크립트로는 안되고 http로만
        accesTokenCookie.setPath("/"); //쿠키 경로 지정, "/"는 모든 경로 "/아무개"는 특정 경로에만 쿠키가 전달된다
        //쿠키의 시간단위는 초단위 ,따라서 ms인 jwt단위에 1000을 나눠야한다
        accesTokenCookie.setMaxAge(Math.toIntExact(JwtTokenizer.ACCESS_TOKEN_EXPIRE_COUNT / 1000));


        //이는 refresh에도 적용시킨다
        Cookie refreshTokenCookie = new Cookie("refreshToken", refreshToken);
        refreshTokenCookie.setHttpOnly(true);
        refreshTokenCookie.setPath("/");
        refreshTokenCookie.setMaxAge(Math.toIntExact(JwtTokenizer.REFRESH_TOKEN_EXPIRE_COUNT/1000));


        //그리고 응답객체에 그 쿠키를 넣어준다
        response.addCookie(accesTokenCookie);
        response.addCookie(refreshTokenCookie);


        return ResponseEntity.ok(loginResponseDto);
    }

}
