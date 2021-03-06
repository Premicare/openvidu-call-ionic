import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError as observableThrowError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OpenViduService {

  OPENVIDU_SERVER_URL = 'https://openvidu.daking.se';
  MY_SECRET = '4b302879-b53d-41ac-8899-6c67fc83f102';

  constructor(private http: HttpClient) { }

  getToken(mySessionId: string): Promise<string> {
    return this.createSession(mySessionId, this.OPENVIDU_SERVER_URL, this.MY_SECRET).then(
      (sessionId: string) => {
        return this.createToken(sessionId, this.OPENVIDU_SERVER_URL, this.MY_SECRET);
      });
  }

  createSession(sessionId: string, openviduServerUrl: string, openviduSecret: string) {
    return new Promise((resolve, reject) => {

      const body = JSON.stringify({ customSessionId: sessionId });
      const options = {
        headers: new HttpHeaders({
          'Authorization': 'Basic ' + btoa('OPENVIDUAPP:' + openviduSecret),
          'Content-Type': 'application/json',
        })
       };
      return this.http.post<any>(openviduServerUrl + '/api/sessions', body, options)
        .pipe(
          catchError(error => {
            error.status === 409 ? resolve(sessionId) : reject(error);
            return observableThrowError(error);
          })
        )
        .subscribe(response => {
          console.log(response);
          resolve(response.id);
        });
    });
  }

  createToken(sessionId: string,  openviduServerUrl: string, openviduSecret: string): Promise<string> {
    return new Promise((resolve, reject) => {

      const body = JSON.stringify({ session: sessionId });
      const options = {
        headers: new HttpHeaders({
          'Authorization': 'Basic ' + btoa('OPENVIDUAPP:' + openviduSecret),
          'Content-Type': 'application/json',
        })
      };
      return this.http.post<any>(openviduServerUrl + '/api/tokens', body, options)
        .pipe(
          catchError(error => {
            reject(error);
            return observableThrowError(error);
          })
        )
        .subscribe(response => {
          console.log(response);
          resolve(response.token);
        });
    });
  }

  public getRandomAvatar(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.http.get('https://randomuser.me/api/?lego').subscribe((data: any) => {
        resolve(data.results[0].picture.thumbnail);
      });
    });
  }

}
