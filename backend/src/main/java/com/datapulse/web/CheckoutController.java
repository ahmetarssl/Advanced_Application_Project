package com.datapulse.web;

import com.datapulse.service.CheckoutService;
import com.datapulse.web.dto.CheckoutDtos.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/checkout")
@RequiredArgsConstructor
public class CheckoutController {

    private final CheckoutService checkoutService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CheckoutResponse> checkout(
            @Valid @RequestBody CheckoutRequest req,
            Authentication auth) {
        String email = ((UserDetails) auth.getPrincipal()).getUsername();
        return ResponseEntity.ok(checkoutService.checkout(req, email));
    }
}