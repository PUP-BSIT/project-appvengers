package com.backend.appvengers.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String SECRET_KEY;

    /**
     * Validates JWT secret key on application startup.
     * Ensures the secret meets minimum security requirements for HS256 algorithm.
     * 
     * @throws IllegalStateException if secret is too short or missing
     */
    @PostConstruct
    public void validateSecretKey() {
        if (SECRET_KEY == null || SECRET_KEY.trim().isEmpty()) {
            throw new IllegalStateException(
                "JWT secret key is not configured. Please set JWT_SECRET environment variable."
            );
        }

        byte[] keyBytes = SECRET_KEY.getBytes(StandardCharsets.UTF_8);
        int minBytesForHS256 = 32; // 256 bits = 32 bytes (industry standard)
        int recommendedBytes = 64;  // 512 bits = 64 bytes (best practice)

        if (keyBytes.length < minBytesForHS256) {
            throw new IllegalStateException(
                String.format(
                    "JWT secret key is too short (%d bytes). Minimum required: %d bytes (256 bits). " +
                    "Recommended: %d+ bytes (512 bits). Generate a secure key with: " +
                    "PowerShell: $bytes = New-Object byte[] 48; (New-Object Security.Cryptography.RNGCryptoServiceProvider).GetBytes($bytes); [Convert]::ToBase64String($bytes)",
                    keyBytes.length, minBytesForHS256, recommendedBytes
                )
            );
        }

        if (keyBytes.length < recommendedBytes) {
            System.err.println(
                String.format(
                    "WARNING: JWT secret key length (%d bytes) is below recommended size (%d bytes). " +
                    "Consider generating a stronger secret for production use.",
                    keyBytes.length, recommendedBytes
                )
            );
        }
    }

    private Key getSigningKey() {
        byte[] keyBytes = SECRET_KEY.getBytes(StandardCharsets.UTF_8);
        return new SecretKeySpec(keyBytes, SignatureAlgorithm.HS256.getJcaName());
    }

    public String generateToken(UserDetails userDetails) {
        return Jwts.builder()
                .setSubject(userDetails.getUsername())
                .claim("role", "USER")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24)) 
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    private boolean isTokenExpired(String token) {
        return extractAllClaims(token).getExpiration().before(new Date());
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}