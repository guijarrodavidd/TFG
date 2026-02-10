import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // AJAX
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  
  private API_URL = 'http://localhost/TFG/BACKEND/public/index.php/api';

  constructor(private http: HttpClient) { }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.API_URL}/login`, credentials);
  }
}