import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type ModePaiement = 'CARTE' | 'VIREMENT' | 'SUR_PLACE' | 'PAYPAL';

export interface ReservationRequest {
  salleId: number;
  dateDebut: string; // format ISO, ex: '2026-08-15T14:00:00'
  dateFin: string;    // format ISO
  modePaiement: ModePaiement;
  // Champs optionnels collectés à l'étape "Informations" du tunnel de réservation
  typeEvenement?: string;
  nombreInvites?: number;
  entreprise?: string;
  informationsComplementaires?: string;
}

// Le backend renvoie des Map<String, Object> — la forme exacte des clés
// dépend de l'implémentation de ReservationService côté backend.
// À ajuster si besoin une fois le contenu réel observé (voir note ci-dessous).
export type ReservationResponse = Record<string, unknown>;

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private readonly API = 'http://localhost:8080/api/reservations';

  constructor(private http: HttpClient) {}

  // POST /api/reservations (CLIENT)
  creer(payload: ReservationRequest): Observable<ReservationResponse> {
    return this.http.post<ReservationResponse>(this.API, payload);
  }

  // DELETE /api/reservations/{id} (CLIENT)
  annuler(id: number): Observable<ReservationResponse> {
    return this.http.delete<ReservationResponse>(`${this.API}/${id}`);
  }

  // GET /api/reservations/mes-reservations (CLIENT)
  getMesReservations(): Observable<ReservationResponse[]> {
    return this.http.get<ReservationResponse[]>(`${this.API}/mes-reservations`);
  }

  // GET /api/reservations/proprio (PROPRIETAIRE)
  getReservationsProprio(): Observable<ReservationResponse[]> {
    return this.http.get<ReservationResponse[]>(`${this.API}/proprio`);
  }

  // PUT /api/reservations/{id}/accepter (PROPRIETAIRE)
  accepter(id: number): Observable<ReservationResponse> {
    return this.http.put<ReservationResponse>(`${this.API}/${id}/accepter`, {});
  }

  // PUT /api/reservations/{id}/refuser-proprio (PROPRIETAIRE)
  refuserProprio(id: number, motif?: string): Observable<ReservationResponse> {
    return this.http.put<ReservationResponse>(`${this.API}/${id}/refuser-proprio`, { motif });
  }

  // GET /api/reservations/{id}
  getById(id: number): Observable<ReservationResponse> {
    return this.http.get<ReservationResponse>(`${this.API}/${id}`);
  }
}
