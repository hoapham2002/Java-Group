package Ai_Study_Hub.Controller;

import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import Ai_Study_Hub.Domain.dto.UpdateProfileRequest;
import Ai_Study_Hub.Domain.dto.UserProfileDTO;
import Ai_Study_Hub.Service.UserProfileService;
import Ai_Study_Hub.Util.ApiResponse;

@RequestMapping("/api/v1/userProfile")
@RestController
public class UserProfileController {
    private final UserProfileService userProfileService;

    public UserProfileController(UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserProfileDTO>> getUserProfileByID(@PathVariable("id") Integer accountID) {
        Optional<UserProfileDTO> userProfileDTO = userProfileService.getUserProfile(accountID);

        if (userProfileDTO.isPresent()) {
            return ResponseEntity.ok(
                    ApiResponse.success("Lấy thông tin hồ sơ người dùng thành công", userProfileDTO.get()));
        } else {
            return ResponseEntity.status(404).body(
                    ApiResponse.error(404, "Không tìm thấy hồ sơ người dùng với ID: " + accountID));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserProfileDTO>> updateUserProfile(@PathVariable("id") Integer accountID, @RequestBody UpdateProfileRequest request) {
        try {
            UserProfileDTO updatedProfile = userProfileService.updateProfile(accountID, request);
            return ResponseEntity.ok(ApiResponse.success("Cập nhật thông tin thành công", updatedProfile));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(ApiResponse.error(400, "Lỗi cập nhật: " + e.getMessage()));
        }
    }
}
