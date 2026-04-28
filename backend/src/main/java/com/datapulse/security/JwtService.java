package com.datapulse.security;

import com.datapulse.domain.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${app.jwt.secret}")
    private String secret;

    @Value("${app.jwt.access-token-expiration}")
    private long accessExp;

    @Value("${app.jwt.refresh-token-expiration}")
    private long refreshExp;

    private SecretKey key() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
    }

    public String generateAccessToken(User user) {
        return build(user, accessExp, "access");
    }

    public String generateRefreshToken(User user) {
        return build(user, refreshExp, "refresh");
    }

    private String build(User user, long ttl, String type) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .subject(user.getEmail())
                .claim("uid",  user.getId())
                .claim("role", user.getRoleType().name())
                .claim("typ",  type)
                .issuedAt(new Date(now))
                .expiration(new Date(now + ttl))
                .signWith(key())
                .compact();
    }

    public String extractEmail(String token) { return extract(token, Claims::getSubject); }

    public boolean isValid(String token, String email) {
        try {
            Claims c = parse(token);
            return c.getSubject().equals(email) && c.getExpiration().after(new Date());
        } catch (Exception e) { return false; }
    }

    private <T> T extract(String token, Function<Claims, T> fn) { return fn.apply(parse(token)); }

    private Claims parse(String token) {
        return Jwts.parser().verifyWith(key()).build().parseSignedClaims(token).getPayload();
    }
}