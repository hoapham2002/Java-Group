package Ai_Study_Hub.Domain;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginDTO {
    @NotBlank(message = "email không được để trống")
    private String email;

    @NotBlank(message = "password không được để trống")
    private String password;
}
