package com.datapulse.web;

import com.datapulse.service.ReviewService;
import com.datapulse.web.dto.PageResponse;
import com.datapulse.web.dto.ReviewResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping
    public ResponseEntity<PageResponse<ReviewResponse>> getReviews() {
        return ResponseEntity.ok(reviewService.getReviews());
    }
}
