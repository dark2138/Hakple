package com.golden_dobakhe.HakPle.security.service;
//이 부분은 테스트를 위한 것이며 추후 어딘가에 병합이 될 수 있음


import com.golden_dobakhe.HakPle.domain.user.user.entity.Role;
import com.golden_dobakhe.HakPle.domain.user.user.entity.User;
import com.golden_dobakhe.HakPle.domain.user.user.repository.UserRepository;
import com.golden_dobakhe.HakPle.global.Status;
import com.golden_dobakhe.HakPle.security.dto.LoginDto;
import com.golden_dobakhe.HakPle.security.jwt.JwtTokenizer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    private final UserRepository userRepository;
    private final JwtTokenizer jwtTokenizer;

    //일단 간단하게 있는지 없는지 체크
    public User findByUserName(String userName) {
        return userRepository.findByUserName(userName).get();
    }

    public Optional<User> findById(Long userId) {
        return userRepository.findById(userId);
    }

    public String genAccessToken(User user) {
        return jwtTokenizer.createAccessToken(
            user.getId(), 
            user.getUserName(), 
            user.getNickName(), 
            user.getPhoneNum(), 
            user.getStatus(), 
            user.getRoles(),
            user.getAcademyId()
        );
    }
    public String genRefreshToken(User user) {
        return jwtTokenizer.createRefreshToken(
            user.getId(), 
            user.getUserName(), 
            user.getNickName(), 
            user.getPhoneNum(), 
            user.getStatus(), 
            user.getRoles(),
            user.getAcademyId()
        );
    }

    public void addRefreshToken(User user, String refreshToken) {
        user.setRefreshToken(refreshToken);
        userRepository.save(user);
    }

    //소셜로그인에 가입한 유저를 새로 만들기
    public User join(String username, String password, String nickname) {

        if (userRepository.existsByUserName(username)) {
            throw new RuntimeException("해당 username은 이미 사용중입니다.");
        };


        Date currentDate = new Date();
        //전화번호 난수 추가
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyMMddmmss");
        String formattedDateTime = dateFormat.format(currentDate);
        //나중에 프사 추가 하십셔
        User user = User.builder()
                .userName(username)
                .password(password)
                .nickName(nickname)
                .socialProvider("kakao")
                .roles(new HashSet<>(Set.of(Role.USER)))
                .phoneNum("KA" + formattedDateTime + (int)(Math.random() * 1000) + 1)
                .status(Status.ACTIVE)
                .build();

        return userRepository.save(user);
    }

    public User modifyOrJoin(String username, String nickname) {
        User user = userRepository.findByUserName(username).orElse(null);

        //만약에 있다면 수정
        if (user != null) {
            user.setNickName(nickname);
            return user;
        }
        //핸드폰 번호는 없다
        //소셜로그인계정으로 로그인시 아이디,비밀번호를 까먹었다면 해당 소셜 서비스에서 바꾸는게 나을듯
        //없으면 참가
        return join(username, "", nickname);
    }

}
