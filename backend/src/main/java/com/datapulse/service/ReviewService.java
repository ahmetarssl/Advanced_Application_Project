package com.datapulse.service;

import com.datapulse.domain.Review;
import com.datapulse.repository.ReviewRepository;
import com.datapulse.web.dto.PageResponse;
import com.datapulse.web.dto.ReviewResponse;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;

    public ReviewService(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    public PageResponse<ReviewResponse> getReviews() {
        List<Review> reviews = reviewRepository.findAll();
        List<ReviewResponse> responses = reviews.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return PageResponse.of(responses);
    }

    private ReviewResponse toResponse(Review r) {
        String customer = "Unknown";
        if (r.getUser() != null) customer = deriveNameFromEmail(r.getUser().getEmail());
        String initials = buildInitials(customer);
        String product = (r.getProduct() != null) ? r.getProduct().getName() : "Unknown Product";
        int rating = r.getStarRating() != null ? r.getStarRating() : 0;
        String comment = r.getComment() != null ? r.getComment() : "";
        String date = (r.getReviewDate() != null)
                ? r.getReviewDate().format(DateTimeFormatter.ofPattern("MMM d, yyyy")) : "";
        int helpful = r.getHelpfulVotes() != null ? r.getHelpfulVotes() : 0;

        return new ReviewResponse(r.getId(), customer, initials, product, rating, comment, date, helpful);
    }

    private String deriveNameFromEmail(String email) {
        String localPart = email.split("@")[0];
        String[] parts = localPart.replace(".", " ").replace("_", " ").split(" ");
        StringBuilder sb = new StringBuilder();
        for (String part : parts) {
            if (!part.isEmpty()) {
                sb.append(Character.toUpperCase(part.charAt(0)))
                  .append(part.substring(1).toLowerCase()).append(" ");
            }
        }
        return sb.toString().trim();
    }

    private String buildInitials(String name) {
        String[] parts = name.split(" ");
        if (parts.length >= 2) return "" + parts[0].charAt(0) + parts[1].charAt(0);
        return name.isEmpty() ? "?" : String.valueOf(name.charAt(0));
    }
}
