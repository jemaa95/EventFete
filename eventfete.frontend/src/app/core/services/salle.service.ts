import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export type StatutSalle = 'DISPONIBLE' | 'INDISPONIBLE' | 'EN_ATTENTE';

export interface SalleResponse {
  id: number;
  nom: string;
  description: string;
  ville: string;
  adresse: string;
  prixJour: number;
  capacite: number;
  latitude: number | null;
  longitude: number | null;
  statut: StatutSalle;
  photos: string[];
  note: number | null;
  nbAvis: number;
  nomProprietaire: string;
}

export interface SalleRecherche {
  ville?: string;
  capacite?: number;
  tri?: string;      // ex: 'prix'
  keyword?: string;
}

@Injectable({ providedIn: 'root' })
export class SalleService {
  private readonly API = 'http://localhost:8080/api/salles';

  constructor(private http: HttpClient) {}

  // GET /api/salles/search?ville=...&capacite=...&tri=...&keyword=...
  rechercher(criteres: SalleRecherche): Observable<SalleResponse[]> {
    let params = new HttpParams();
    if (criteres.ville) params = params.set('ville', criteres.ville);
    if (criteres.capacite != null) params = params.set('capacite', criteres.capacite);
    if (criteres.tri) params = params.set('tri', criteres.tri);
    if (criteres.keyword) params = params.set('keyword', criteres.keyword);

    return this.http.get<SalleResponse[]>(`${this.API}/search`, { params });
  }

  // GET /api/salles/{id}
  getById(id: number): Observable<SalleResponse> {
    return this.http.get<SalleResponse>(`${this.API}/${id}`);
  }

  // POST /api/salles (PROPRIETAIRE) — multipart: salle (JSON) + photos (fichiers)
  creer(salle: Record<string, unknown>, photos: File[]): Observable<SalleResponse> {
    const form = new FormData();
    form.append('salle', new Blob([JSON.stringify(salle)], { type: 'application/json' }));
    photos.forEach(photo => form.append('photos', photo));
    return this.http.post<SalleResponse>(this.API, form);
  }

  // PUT /api/salles/{id} (PROPRIETAIRE)
  modifier(id: number, salle: Record<string, unknown>): Observable<SalleResponse> {
    return this.http.put<SalleResponse>(`${this.API}/${id}`, salle);
  }

  // DELETE /api/salles/{id} (PROPRIETAIRE)
  supprimer(id: number): Observable<string> {
    return this.http.delete(`${this.API}/${id}`, { responseType: 'text' });
  }

  // GET /api/salles/mes-salles (PROPRIETAIRE)
  getMesSalles(): Observable<SalleResponse[]> {
    return this.http.get<SalleResponse[]>(`${this.API}/mes-salles`);
  }
}
