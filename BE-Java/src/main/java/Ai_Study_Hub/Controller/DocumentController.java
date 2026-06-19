package Ai_Study_Hub.Controller;

import Ai_Study_Hub.Domain.dto.DocumentUploadRequest;
import Ai_Study_Hub.Domain.dto.UploadResponse;
import Ai_Study_Hub.Domain.dto.DocumentDto;
import Ai_Study_Hub.Domain.dto.RenameDocumentRequest;
import Ai_Study_Hub.Domain.dto.MoveDocumentRequest;
import Ai_Study_Hub.Service.DocumentService;
import Ai_Study_Hub.Util.ApiResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @PostMapping
    public ResponseEntity<ApiResponse<UploadResponse>> uploadDocument(@ModelAttribute DocumentUploadRequest request) throws Exception {
        UploadResponse response = documentService.uploadDocument(request);
        return ResponseEntity.ok(ApiResponse.success("Upload successful", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DocumentDto>>> getAllDocuments() {
        List<DocumentDto> documents = documentService.getAllDocuments();
        return ResponseEntity.ok(ApiResponse.success("Success", documents));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDocument(@PathVariable Integer id) {
        documentService.deleteDocument(id);
        return ResponseEntity.ok(ApiResponse.success("Document deleted successfully", null));
    }

    @GetMapping("/{id}/url")
    public ResponseEntity<ApiResponse<String>> viewDocument(@PathVariable Integer id) throws Exception {
        String url = documentService.getDocumentViewUrl(id);
        return ResponseEntity.ok(ApiResponse.success("Success", url));
    }

    @PutMapping("/{id}/rename")
    public ResponseEntity<ApiResponse<DocumentDto>> renameDocument(
            @PathVariable Integer id, 
            @RequestBody RenameDocumentRequest request) {
        DocumentDto updatedDoc = documentService.renameDocument(id, request.getNewName());
        return ResponseEntity.ok(ApiResponse.success("Document renamed successfully", updatedDoc));
    }

    @PutMapping("/{id}/move")
    public ResponseEntity<ApiResponse<DocumentDto>> moveDocument(
            @PathVariable Integer id, 
            @RequestBody MoveDocumentRequest request) {
        DocumentDto updatedDoc = documentService.moveDocument(id, request.getSubjectId());
        return ResponseEntity.ok(ApiResponse.success("Document moved successfully", updatedDoc));
    }
}
