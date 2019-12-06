package com.itechnews.service.impl;

import com.itechnews.entity.User;
import com.itechnews.repository.UserRepository;
import com.itechnews.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public User findOneByEmail(String email) {
        return userRepository.findOneByEmail(email);
    }

    @Override
    public User findOneById(Integer id) {
        return userRepository.findById(id).get();
    }

    @Override
    public User findOneByUsername(String username) {
        return userRepository.findOneByUsername(username);
    }

    @Override
    public User findOneByPasswordResetToken(String token) {
        return userRepository.findOneByPasswordResetToken(token);
    }

    @Override
    public User save(User user) {
        return userRepository.save(user);
    }

    @Override
    public List<User> findTopUsers(Integer quantity) {
        return userRepository.findTopUsers(PageRequest.of(0, quantity));
    }
}
