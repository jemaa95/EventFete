import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SalleResponse } from './salle.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminSalleService {
  private readonly API = `${environment.apiUrl}/admin/salles`;

  constructor(private http: HttpClient) {}

  getEnAttente(): Observable<SalleResponse[]> {
    return this.http.get<SalleResponse[]>(`${this.API}/en-attente`);
  }

  valider(id: number): Observable<SalleResponse> {
    return this.http.put<SalleResponse>(`${this.API}/${id}/valider`, {});
  }

  refuser(id: number): Observable<SalleResponse> {
    return this.http.put<SalleResponse>(`${this.API}/${id}/refuser`, {});
  }
}
