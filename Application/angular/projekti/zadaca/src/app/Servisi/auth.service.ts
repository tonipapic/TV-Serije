import { Injectable } from '@angular/core';
import { JWTService } from './jwt.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private jwtService: JWTService;
  constructor() {
    this.jwtService = new JWTService();
  }

  async Login(username: String, password: String): Promise<Response> {
    let tijelo: { korime: String; lozinka: String } = {
      korime: username,
      lozinka: password,
    };

    let parametri: RequestInit = this.pripremiParametre(tijelo);
    let odgovor: Response = await fetch(
      environment.restServis + `/baza/korisnici/${username}/prijava`,
      parametri
    );
      return odgovor;
  }

  async LoginAsGuest(logout: boolean): Promise<void> {
    if ((await this.getRole()).status === 400 || logout) {
      console.log("Prijavi kao guest");
      await this.prijaviKaoGuest();
    } else {
      return;
    }
  }


async prijaviKaoGuest(): Promise<boolean> {
  let tijelo: { korime: string; lozinka: string } = { korime: "guest", lozinka: "rwa" };
  let parametri: RequestInit = this.pripremiParametre(tijelo);
  console.log("Logging in as guest");
  let odgovor: Response = await fetch(`/baza/korisnici/guest/prijava`, parametri);
  console.log(await odgovor.text());
  return true;
}

async getRole(): Promise<Response> {
  return await fetch(`/userrole`);
}

  pripremiParametre(tijelo: any): any {
    let zaglavlje: Headers = new Headers();

    zaglavlje.set('Content-Type', 'application/json');

    let parametri: any = {
      method: 'POST',
      body: JSON.stringify(tijelo),
      headers: zaglavlje,
    };

    return parametri;
  }
  
}
