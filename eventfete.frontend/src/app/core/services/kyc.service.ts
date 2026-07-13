import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type KycStatut = 'NON_SOUMIS' | 'EN_ATTENTE' | 'APPROUVEE' | 'REJETEE';

export interface UserAdminResponse {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
  role: 'ROLE_CLIENT' | 'ROLE_PROPRIO' | 'ROLE_ADMIN';
  actif: boolean;
  entreprise: string | null;
  kycStatut: KycStatut;
  documentsKyc: string[];
  motifRejetKyc: string | null;
  dateSoumissionKyc: string | null;
  createdAt: string;
}

export interface KycSubmissionPayload {
  entreprise: string;
  documents: string[];
}

@Injectable({ providedIn: 'root' })
export class KycService {
  private readonly API = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  // --- Côté propriétaire ---
  soumettre(payload: KycSubmissionPayload): Observable<UserAdminResponse> {
    return this.http.post<UserAdminResponse>(`${this.API}/proprietaire/kyc`, payload);
  }

  // --- Côté admin ---
  listerDemandes(): Observable<UserAdminResponse[]> {
    return this.http.get<UserAdminResponse[]>(`${this.API}/admin/kyc`);
  }

  approuver(userId: number): Observable<UserAdminResponse> {
    return this.http.put<UserAdminResponse>(`${this.API}/admin/kyc/${userId}/approuver`, {});
  }

  rejeter(userId: number, motif: string): Observable<UserAdminResponse> {
    return this.http.put<UserAdminResponse>(`${this.API}/admin/kyc/${userId}/rejeter`, { motif });
  }
}
