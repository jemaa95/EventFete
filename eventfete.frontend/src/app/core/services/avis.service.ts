import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AvisResponse {
  id: number;
  salleId: number;
  clientNom: string;
  note: number;
  commentaire: string | null;
  reponseProprio: string | null;
  createdAt: string;
}

export interface AvisPayload {
  reservationId: number;
  note: number;
  commentaire?: string;
}

@Injectable({ providedIn: 'root' })
export class AvisService {
  private readonly API = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  creer(payload: AvisPayload): Observable<AvisResponse> {
    return this.http.post<AvisResponse>(`${this.API}/avis`, payload);
  }

  getBySalle(salleId: number): Observable<AvisResponse[]> {
    return this.http.get<AvisResponse[]>(`${this.API}/salles/${salleId}/avis`);
  }

  repondre(avisId: number, reponse: string): Observable<AvisResponse> {
    return this.http.post<AvisResponse>(`${this.API}/avis/${avisId}/reponse`, { reponse });
  }
}
