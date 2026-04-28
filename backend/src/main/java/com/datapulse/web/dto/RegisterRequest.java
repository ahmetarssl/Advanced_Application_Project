package com.datapulse.web.dto;

import com.datapulse.domain.enums.Role;

public class RegisterRequest {
    private String email;
    private String password;
    private Role roleType;

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public Role getRoleType() { return roleType; }
    public void setRoleType(Role roleType) { this.roleType = roleType; }
}