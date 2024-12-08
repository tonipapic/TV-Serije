import { Injectable } from '@angular/core';
import { JWTService } from './jwt.service';
import { SerijeBaseI } from '../Interface/SerijeBasicI';
import { SerijeDetailForDBI, SerijeDetailI } from '../Interface/SerijeDetailI';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SerijeService {
 
 jwtService?:JWTService
  constructor() {   
    this.jwtService=new JWTService();

  }

  async getSeriesContainingString(string:String):Promise<Array<SerijeBaseI>>{
    let parametri = await this.jwtService!.dodajToken();
    let odg: Response = await fetch(
      '/series?filter=' + string,
      parametri
    );
      return JSON.parse(await odg.text()).results;
  }

  async DetaljiTMDB(id: number):Promise<SerijeDetailI> {
    let parametri = await this.jwtService!.dodajToken();
    let odg = await fetch(`/series/${id}`, parametri);
    let podaci = JSON.parse(await odg.text());
    return podaci;
  
  }
  async provjeriUFavoritima(serijaID: number): Promise<boolean> {
      let param: any = await this.jwtService!.dodajToken();
      
      let odg: Response = await fetch(`/baza/favoriti/${serijaID}`, param);
      console.log("U BAZI:");
      let odgovor: any = await odg.json();
      console.log(odgovor.podaci);
      return odgovor.podaci;
  }
  async addToFavourite(podaci: any): Promise<void> {
  
    let serija: SerijeDetailForDBI = {
      TMDB_ID_serije: podaci.id,
      Naziv: podaci.name,
      Opis: podaci.overview,
      Slika: environment.posteriPutanja+podaci.poster_path,
      Broj_sezona: podaci.number_of_seasons,
      Broj_epizoda: podaci.number_of_episodes,
      Popularnost: podaci.popularity,
      Homepage: podaci.homepage ?? "",
      Seasons: podaci.seasons,
    };
    
      let param: any = await this.jwtService!.dodajTokenIParametre(serija);
      param.method = "POST";
      let odg: Response = await fetch("/baza/favoriti", param);
      console.log(odg.status);
  
  }
  async removeFromFavourite(serijaID: number):Promise<void>{
    
      let param: any = await this.jwtService!.dodajToken();
      param.method = "DELETE";
      let odg: Response = await fetch(`/baza/favoriti/${serijaID}`, param);
      window.location.reload();
    
  }
}
