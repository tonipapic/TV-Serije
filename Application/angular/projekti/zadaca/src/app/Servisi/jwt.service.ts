import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class JWTService {
  constructor() {}

  async dodajToken(parametri: any = {}): Promise<any> {
    let zaglavlje: Headers = new Headers();

    let token: string = await this.dajToken();
    console.log('TOKEN ' + token);
    zaglavlje.set('Authorization', token);
    parametri.headers = zaglavlje;

    return parametri;
  }

  async dodajTokenIParametre(tijelo: any): Promise<any> {
    let zaglavlje: Headers = new Headers();
  
    zaglavlje.set("Content-Type", "application/json");
  
    let token: string = await this.dajToken();
    zaglavlje.set("Authorization", token);
    let parametri: RequestInit = {
      method: "POST",
      body: JSON.stringify(tijelo),
      headers: zaglavlje,
    };
  
    return parametri;
  }

  async dajToken(): Promise<string> {
    return (
      (
        await fetch(environment.restServis + `/baza/korisnici/token/prijava`)
      ).headers.get('Authorization') ?? 'null'
    );
  }
}
