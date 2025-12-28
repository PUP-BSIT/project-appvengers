package com.backend.appvengers.security;

import com.backend.appvengers.entity.User;
import com.backend.appvengers.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // Assign ROLE_USER by default
        // Handle null/empty passwords for OAuth users (they don't have local passwords)
        // Use a placeholder that will never match a real password hash
        String password = (user.getPassword() != null && !user.getPassword().isEmpty()) 
                ? user.getPassword() 
                : "{noop}OAUTH_USER_NO_PASSWORD";
        
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                password,
                List.of(new SimpleGrantedAuthority("ROLE_USER"))
        );
    }
}