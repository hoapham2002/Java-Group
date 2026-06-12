package Ai_Study_Hub.Domain;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterDTO {
    @NotBlank(message = "Email không được để trống")
    private String email;

    @NotBlank(message = "Tên không được để trống")
    private String userName;

    @NotBlank(message = "Password không được để trống")
    private String password;

    @NotBlank(message = "First name không được để trống")
    private String firstName;

    @NotBlank(message = "Last name không được để trống")
    private String lastName;
}