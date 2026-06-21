package com.datapulse.web;

import com.datapulse.domain.User;
import com.datapulse.repository.UserRepository;
import com.datapulse.service.ProductService;
import com.datapulse.web.dto.PageResponse;
import com.datapulse.web.dto.ProductResponse;

import io.swagger.v3.oas.annotations.parameters.RequestBody;
import jakarta.transaction.Transactional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@Transactional
public class ProductController {

    private final ProductService productService;
    private final UserRepository userRepository;

    public ProductController(ProductService productService, UserRepository userRepository) {
        this.productService = productService;
        this.userRepository = userRepository;
    }

    @PostMapping("/decrease-stock")
public ResponseEntity<?> decreaseStock(@RequestBody List<Map<String, Object>> items) {
    for (Map<String, Object> item : items) {
        Long productId = Long.valueOf(item.get("productId").toString());
        Integer quantity = Integer.valueOf(item.get("quantity").toString());
        productService.decreaseStock(productId, quantity);
    }
    return ResponseEntity.ok().build();
}

    @GetMapping
    public ResponseEntity<PageResponse<ProductResponse>> getProducts(Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(productService.getProducts(user));
    }
}
