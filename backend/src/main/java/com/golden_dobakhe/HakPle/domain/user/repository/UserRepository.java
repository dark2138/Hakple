package com.golden_dobakhe.HakPle.domain.user.repository;

import com.golden_dobakhe.HakPle.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Integer> {
}
