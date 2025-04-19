package com.golden_dobakhe.HakPle.domain.user.myInfo.service;

import com.golden_dobakhe.HakPle.domain.user.exception.UserErrorCode;
import com.golden_dobakhe.HakPle.domain.user.exception.UserException;
import com.golden_dobakhe.HakPle.domain.user.myInfo.dto.MyInfoResponseDto;
import com.golden_dobakhe.HakPle.domain.user.myInfo.dto.MyInfoUpdateRequestDto;
import com.golden_dobakhe.HakPle.domain.user.myInfo.validator.NickNameValidator;
import com.golden_dobakhe.HakPle.domain.user.myInfo.validator.PhoneNumValidator;
import com.golden_dobakhe.HakPle.domain.user.user.entity.User;
import com.golden_dobakhe.HakPle.domain.user.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MyInfoService {
    private final UserRepository userRepository;

    //사용자 정보 가져오기
    public MyInfoResponseDto getMyInfo(String userName) {
        User user = userRepository.findByUserName(userName)
                .orElseThrow(() -> new UserException(UserErrorCode.ACADEMY_ID_NOT_FOUND));

        return MyInfoResponseDto.builder()
                .nickName(user.getNickName())
                .userName(user.getUserName())
                .phoneNum(user.getPhoneNum())
                .creationTime(user.getCreationTime())
                .academyCode(user.getAcademyId())
                .build();
    }

    //사용자 정보 수정
    @Transactional
    public void updateMyInfo(String userName, MyInfoUpdateRequestDto requestDto) {
        User user = userRepository.findByUserName(userName)
                .orElseThrow(() -> new UserException(UserErrorCode.USERNAME_DUPLICATE));

        //nickName 변경
        String newNickName = requestDto.getNickName();
        if (newNickName != null && !newNickName.equals(user.getNickName())) {
            NickNameValidator.validateNickName(newNickName, user.getNickName(), userRepository);
            user.setNickName(newNickName);
        }

        //PhoneNum 변경
        String newPhoneNum = requestDto.getPhoneNum();
        if (newPhoneNum != null && !newPhoneNum.equals(user.getPhoneNum())) {
            PhoneNumValidator.validatePhoneNum(newPhoneNum, user.getPhoneNum(), userRepository);
            user.setPhoneNum(newPhoneNum);
        }
    }
}