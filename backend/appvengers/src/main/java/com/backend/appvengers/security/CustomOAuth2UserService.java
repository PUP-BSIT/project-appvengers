package com.backend.appvengers.security;

import com.backend.appvengers.entity.AuthProvider;
import com.backend.appvengers.entity.User;
import com.backend.appvengers.repository.UserRepository;
import com.backend.appvengers.service.CategoryService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Custom OAuth2 User Service that processes OAuth2 login responses.
 * Finds existing users or creates new ones based on Google account info.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;
    private final CategoryService categoryService;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        // Extract user info from Google's response
        String googleId = oAuth2User.getAttribute("sub");
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String pictureUrl = oAuth2User.getAttribute("picture");
        Boolean emailVerified = oAuth2User.getAttribute("email_verified");

        log.debug("Processing OAuth2 login for email: {}", email);

        // Find or create user
        User user = processOAuthUser(googleId, email, name, pictureUrl, emailVerified);

        // Return a custom OAuth2User that includes our User entity
        return new CustomOAuth2User(oAuth2User, user);
    }

    /**
     * Process OAuth2 user - find existing or create new.
     * Handles account linking when email already exists.
     */
    private User processOAuthUser(String googleId, String email, String name, 
                                   String pictureUrl, Boolean emailVerified) {
        
        // First, try to find by Google ID (returning user)
        Optional<User> existingByGoogleId = userRepository.findByGoogleId(googleId);
        if (existingByGoogleId.isPresent()) {
            User user = existingByGoogleId.get();
            // Update profile picture if changed
            if (pictureUrl != null && !pictureUrl.equals(user.getProfilePictureUrl())) {
                user.setProfilePictureUrl(pictureUrl);
                userRepository.save(user);
            }
            log.info("Existing Google user logged in: {}", email);
            return user;
        }

        // Check if user exists by email (account linking scenario)
        Optional<User> existingByEmail = userRepository.findByEmail(email);
        if (existingByEmail.isPresent()) {
            User user = existingByEmail.get();
            
            if (user.getAuthProvider() == AuthProvider.LOCAL) {
                // Link Google account to existing local account
                user.setGoogleId(googleId);
                user.setAuthProvider(AuthProvider.GOOGLE);
                user.setProfilePictureUrl(pictureUrl);
                
                // Mark email as verified since Google verified it
                if (Boolean.TRUE.equals(emailVerified) && !user.isEmailVerified()) {
                    user.setEmailVerified(true);
                    user.setEmailVerificationToken(null);
                    user.setEmailVerificationExpiration(null);
                }
                
                userRepository.save(user);
                log.info("Linked Google account to existing LOCAL user: {}", email);
            }
            return user;
        }

        // Create new user
        User newUser = new User();
        newUser.setUsername(generateUniqueUsername(name, email));
        newUser.setEmail(email);
        newUser.setPassword(null); // OAuth users don't have passwords
        newUser.setAuthProvider(AuthProvider.GOOGLE);
        newUser.setGoogleId(googleId);
        newUser.setProfilePictureUrl(pictureUrl);
        newUser.setEmailVerified(Boolean.TRUE.equals(emailVerified));
        newUser.setActive(true);

        userRepository.save(newUser);

        // Seed default categories for new user
        categoryService.seedDefaultsIfMissing(newUser.getId());

        log.info("Created new user from Google OAuth: {}", email);
        return newUser;
    }

    /**
     * Generate unique username from name or email prefix.
     */
    private String generateUniqueUsername(String name, String email) {
        // Use name if available, otherwise use email prefix
        String baseUsername = (name != null && !name.isBlank()) 
            ? name.replaceAll("[^a-zA-Z0-9]", "") 
            : email.split("@")[0];

        // Ensure minimum length
        if (baseUsername.length() < 3) {
            baseUsername = "user" + baseUsername;
        }

        // Truncate if too long
        if (baseUsername.length() > 40) {
            baseUsername = baseUsername.substring(0, 40);
        }

        String username = baseUsername;
        int counter = 1;

        while (userRepository.existsByUsername(username)) {
            username = baseUsername + counter;
            counter++;
        }

        return username;
    }
}
