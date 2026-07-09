import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  capacity: number;
  price: number;
  imageUrl?: string;
  bookedCount: number;
  organizer: string;
}

export interface CreateEventPayload {
  title: string;
  description: string;
  date: string;
  location: string;
  capacity: number;
  price: number;
  image?: File;
}

@Injectable({ providedIn: 'root' })
export class EventService {
  private readonly API = 'http://localhost:8080/api/events';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Event[]> {
    return this.http.get<Event[]>(this.API);
  }

  getById(id: string): Observable<Event> {
    return this.http.get<Event>(`${this.API}/${id}`);
  }

  create(payload: CreateEventPayload): Observable<Event> {
    const form = new FormData();
    Object.entries(payload).forEach(([k, v]) => {
      if (v !== undefined) form.append(k, v instanceof File ? v : String(v));
    });
    return this.http.post<Event>(this.API, form);
  }

  book(id: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API}/${id}/book`, {});
  }
}
