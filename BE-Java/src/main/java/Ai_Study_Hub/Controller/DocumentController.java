package Ai_Study_Hub.Controller;

import Ai_Study_Hub.Domain.dto.DocumentUploadRequest;
import Ai_Study_Hub.Domain.dto.UploadResponse;
import Ai_Study_Hub.Domain.Document;
import Ai_Study_Hub.Domain.dto.DocumentDto;
import Ai_Study_Hub.Domain.dto.RenameDocumentRequest;
import Ai_Study_Hub.Domain.dto.MoveDocumentRequest;
import Ai_Study_Hub.Service.DocumentService;
import Ai_Study_Hub.Util.ApiResponse;
import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/documents")
@RequiredArgsConstructor
public class DocumentController {
    private final DocumentService documentService;

    @PostMapping
    public ResponseEntity<ApiResponse<UploadResponse>> uploadDocument(@ModelAttribute DocumentUploadRequest request)
            throws Exception {
        UploadResponse response = documentService.uploadDocument(request);
        return ResponseEntity.ok(ApiResponse.success("Upload successful", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DocumentDto>>> getUserDocuments() {
        List<DocumentDto> documents = documentService.getUserDocuments();
        return ResponseEntity.ok(ApiResponse.success("Success", documents));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDocument(@PathVariable Integer id) {
        documentService.deleteDocument(id);
        return ResponseEntity.ok(ApiResponse.success("Document deleted successfully", null));
    }

    @GetMapping("/{id}/url")
    public ResponseEntity<ApiResponse<String>> getDocumentUrl(@PathVariable("id") Integer id) {
        String url = documentService.getDocumentUrl(id);
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

    @GetMapping("/getFile/{accountID}")
    public ResponseEntity<ApiResponse<List<DocumentDto>>> getFileByAccountId(
            @PathVariable Integer accountID) {
        List<DocumentDto> documents = this.documentService.getFilesByAccountId(accountID);
        return ResponseEntity.ok(
                ApiResponse.success("Lấy danh sách file theo tài khoản thành công", documents));
    }

    @GetMapping("/admin")
    public ResponseEntity<ApiResponse<List<DocumentDto>>> getAllDocumentsForAdmin() {
        List<DocumentDto> documents = documentService.getAllDocumentsForAdmin();
        return ResponseEntity.ok(ApiResponse.success("Success", documents));
    }

}
