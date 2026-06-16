package Ai_Study_Hub.Controller;

import Ai_Study_Hub.Domain.dto.DocumentUploadRequest;
import Ai_Study_Hub.Domain.dto.UploadResponse;
import Ai_Study_Hub.Domain.dto.DocumentDto;
import Ai_Study_Hub.Service.DocumentService;
import Ai_Study_Hub.Util.ApiResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<UploadResponse>> uploadDocument(@ModelAttribute DocumentUploadRequest request) {
        try {
            UploadResponse response = documentService.uploadDocument(request);
            return ResponseEntity.ok(ApiResponse.success("Upload successful", response));
        } catch (IllegalArgumentException e) {
            log.error("Validation error during file upload: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.error(400, e.getMessage()));
        } catch (Exception e) {
            log.error("Internal error during file upload", e);
            return ResponseEntity.internalServerError().body(ApiResponse.error(500, "Internal Server Error: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DocumentDto>>> getAllDocuments() {
        try {
            List<DocumentDto> documents = documentService.getAllDocuments();
            return ResponseEntity.ok(ApiResponse.success("Success", documents));
        } catch (Exception e) {
            log.error("Error fetching documents", e);
            return ResponseEntity.internalServerError().body(ApiResponse.error(500, "Error fetching documents"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDocument(@PathVariable Integer id) {
        try {
            documentService.deleteDocument(id);
            return ResponseEntity.ok(ApiResponse.success("Document deleted successfully", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, e.getMessage()));
        } catch (Exception e) {
            log.error("Error deleting document", e);
            return ResponseEntity.internalServerError().body(ApiResponse.error(500, "Error deleting document"));
        }
    }

    @GetMapping("/{id}/view")
    public ResponseEntity<ApiResponse<String>> viewDocument(@PathVariable Integer id) {
        try {
            String url = documentService.getDocumentViewUrl(id);
            return ResponseEntity.ok(ApiResponse.success("Success", url));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, e.getMessage()));
        } catch (Exception e) {
            log.error("Error getting view URL", e);
            return ResponseEntity.internalServerError().body(ApiResponse.error(500, "Error getting view URL"));
        }
    }
}
