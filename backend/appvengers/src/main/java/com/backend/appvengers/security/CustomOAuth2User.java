package com.backend.appvengers.security;

import com.backend.appvengers.entity.User;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.Map;

/**
 * Custom OAuth2User that wraps the original OAuth2User and includes our User entity.
 * This allows us to access our User entity in the success handler.
 */
@Getter
public class CustomOAuth2User implements OAuth2User {

    private final OAuth2User oAuth2User;
    private final User user;

    public CustomOAuth2User(OAuth2User oAuth2User, User user) {
        this.oAuth2User = oAuth2User;
        this.user = user;
    }

    @Override
    public Map<String, Object> getAttributes() {
        return oAuth2User.getAttributes();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return oAuth2User.getAuthorities();
    }

    @Override
    public String getName() {
        return oAuth2User.getAttribute("name");
    }

    /**
     * Get the email from the OAuth2 user attributes.
     */
    public String getEmail() {
        return oAuth2User.getAttribute("email");
    }
}
