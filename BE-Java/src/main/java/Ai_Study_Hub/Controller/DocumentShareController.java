package Ai_Study_Hub.Controller;

import Ai_Study_Hub.Domain.dto.DocumentDto;
import Ai_Study_Hub.Domain.dto.ShareDocumentRequest;
import Ai_Study_Hub.Service.DocumentShareService;
import Ai_Study_Hub.Util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/documents")
@RequiredArgsConstructor
public class DocumentShareController {

    private final DocumentShareService documentShareService;

    @PostMapping("/share")
    public ResponseEntity<ApiResponse<String>> shareDocument(@Valid @RequestBody ShareDocumentRequest request) {
        String response = documentShareService.shareDocument(request);
        return ResponseEntity.ok(ApiResponse.success("Success", response));
    }

    @GetMapping("/sharedWithMe")
    public ResponseEntity<ApiResponse<List<DocumentDto>>> getSharedDocuments() {
        List<DocumentDto> sharedDocuments = documentShareService.getSharedDocuments();
        return ResponseEntity.ok(ApiResponse.success("Success", sharedDocuments));
    }
}
