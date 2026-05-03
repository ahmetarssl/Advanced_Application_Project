package com.datapulse.service;

import com.datapulse.domain.Product;
import com.datapulse.domain.Store;
import com.datapulse.domain.User;
import com.datapulse.domain.enums.Role;
import com.datapulse.repository.ProductRepository;
import com.datapulse.repository.StoreRepository;
import com.datapulse.web.dto.PageResponse;
import com.datapulse.web.dto.ProductResponse;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final StoreRepository storeRepository;

    public ProductService(ProductRepository productRepository, StoreRepository storeRepository) {
        this.productRepository = productRepository;
        this.storeRepository = storeRepository;
    }

    public PageResponse<ProductResponse> getProducts(User user) {
        List<Product> products;

        if (user.getRoleType() == Role.ADMIN) {
            products = productRepository.findAll();
        } else if (user.getRoleType() == Role.CORPORATE) {
            List<Store> stores = storeRepository.findByOwner(user);
            if (stores.isEmpty()) return PageResponse.of(List.of());
            products = productRepository.findByStore(stores.get(0));
        } else {
            products = productRepository.findAll();
        }

        List<ProductResponse> responses = products.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return PageResponse.of(responses);
    }

    private ProductResponse toResponse(Product p) {
        String categoryName = (p.getCategory() != null) ? p.getCategory().getName() : "Uncategorized";
        String icon = (p.getIcon() != null) ? p.getIcon() : "📦";
        return new ProductResponse(p.getId(), p.getName(), categoryName, p.getSku(),
                p.getUnitPrice(), p.getStock() != null ? p.getStock() : 0, icon);
    }
}
