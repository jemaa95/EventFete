package com.eventfete.service;

import com.eventfete.dto.request.ChangePasswordRequest;
import com.eventfete.dto.request.UpdateProfileRequest;
import com.eventfete.dto.response.UserProfileResponse;

public interface UserService {

    UserProfileResponse getProfile(String email);

    UserProfileResponse updateProfile(String email, UpdateProfileRequest request);

    void changePassword(String email, ChangePasswordRequest request);
}