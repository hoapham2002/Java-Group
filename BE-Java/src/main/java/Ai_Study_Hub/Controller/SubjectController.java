package Ai_Study_Hub.Controller;

import Ai_Study_Hub.Domain.dto.SubjectDto;
import Ai_Study_Hub.Service.SubjectService;
import Ai_Study_Hub.Util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import Ai_Study_Hub.Domain.dto.SubjectRequest;

import java.util.List;

@RestController
@RequestMapping("/api/v1/subjects")
@RequiredArgsConstructor
public class SubjectController {

    private final SubjectService subjectService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SubjectDto>>> getAllSubjects() {
        List<SubjectDto> subjects = subjectService.getAllSubjects();
        return ResponseEntity.ok(ApiResponse.success("Success", subjects));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SubjectDto>> createSubject(@RequestBody SubjectRequest request) {
        SubjectDto subject = subjectService.createSubject(request.getName());
        return ResponseEntity.ok(ApiResponse.success("Subject created successfully", subject));
    }

    @PutMapping("/{id}/rename")
    public ResponseEntity<ApiResponse<SubjectDto>> renameSubject(
            @PathVariable Integer id, 
            @RequestBody SubjectRequest request) {
        SubjectDto subject = subjectService.renameSubject(id, request.getName());
        return ResponseEntity.ok(ApiResponse.success("Subject renamed successfully", subject));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSubject(@PathVariable Integer id) {
        subjectService.deleteSubject(id);
        return ResponseEntity.ok(ApiResponse.success("Subject deleted successfully", null));
    }
}
