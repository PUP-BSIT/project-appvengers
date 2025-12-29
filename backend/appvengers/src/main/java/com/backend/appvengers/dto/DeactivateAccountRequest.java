package com.backend.appvengers.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeactivateAccountRequest {

    // Password is optional - required only for local (non-OAuth) users
    private String password;

    @Size(max = 500, message = "Reason must be at most 500 characters")
    private String reason;

    // Email confirmation is optional - required only for OAuth users who don't have a password
    @Email(message = "Email should be valid")
    private String confirmEmail;
}
