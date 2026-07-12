import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserProfile {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
  role: 'ROLE_CLIENT' | 'ROLE_PROPRIO' | 'ROLE_ADMIN';
  createdAt: string;
  entreprise: string | null;
  kycStatut: 'NON_SOUMIS' | 'EN_ATTENTE' | 'APPROUVEE' | 'REJETEE';
  documentsKyc: string[];
  motifRejetKyc: string | null;
}

export interface UpdateProfilePayload {
  nom: string;
  prenom: string;
  telephone?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly API = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient) {}

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.API}/me`);
  }

  updateProfile(payload: UpdateProfilePayload): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.API}/me`, payload);
  }

  changePassword(payload: ChangePasswordPayload): Observable<string> {
    return this.http.put(`${this.API}/me/password`, payload, { responseType: 'text' });
  }
}
