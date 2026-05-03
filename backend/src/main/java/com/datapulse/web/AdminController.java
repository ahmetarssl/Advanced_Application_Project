package com.datapulse.web;

import com.datapulse.service.AdminService;
import com.datapulse.web.dto.StoreAdminResponse;
import com.datapulse.web.dto.UserAdminResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserAdminResponse>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @GetMapping("/stores")
    public ResponseEntity<List<StoreAdminResponse>> getAllStores() {
        return ResponseEntity.ok(adminService.getAllStores());
    }
}
