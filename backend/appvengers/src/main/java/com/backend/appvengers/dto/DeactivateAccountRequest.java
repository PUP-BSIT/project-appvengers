package com.backend.appvengers.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeactivateAccountRequest {

    @NotBlank(message = "Password is required to deactivate account")
    private String password;

    @Size(max = 500, message = "Reason must be at most 500 characters")
    private String reason;
}
