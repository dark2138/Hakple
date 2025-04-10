package com.golden_dobakhe.HakPle.domain.user.entity;

import com.golden_dobakhe.HakPle.domain.resource.image.entity.Image;
import com.golden_dobakhe.HakPle.global.entity.BaseEntity;
import com.golden_dobakhe.HakPle.global.entity.Status;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@Entity
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@ToString
public class User extends BaseEntity {
    @Column(length = 100, nullable = false)
    private String userName;

    @Column(nullable = false)
    private String password;

    @Column(length = 50)
    private String socialProvider;

    @Column(nullable = false)
    private String nickName;

    @Column(length = 20, nullable = false)
    private String phoneNum;

    @Column(length = 100, nullable = false)
    private String academyId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status; // ENUM('active', 'inactive', 'pending', 'admin')

    @Column(length = 255)
    private String refreshToken; // JWT 리프레시 토큰

    @OneToOne
    @JoinColumn(name = "profile_image_id", referencedColumnName = "id")
    private Image profileImage; // 프로필 이미지 (Image 엔티티와 연결)
}
