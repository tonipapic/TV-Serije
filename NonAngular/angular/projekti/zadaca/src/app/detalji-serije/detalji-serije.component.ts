import { Component, OnInit } from '@angular/core';
import { SerijeService } from '../Servisi/serije.service';
import { environment } from '../../environments/environment';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs';
import { SerijeDetailI } from '../Interface/SerijeDetailI';

@Component({
  selector: 'app-detalji-serije',
  templateUrl: './detalji-serije.component.html',
  styleUrl: './detalji-serije.component.scss',
})
export class DetaljiSerijeComponent implements OnInit {


  serijeService?: SerijeService;
  id?: number;
  podaci?: SerijeDetailI;
  currRole?:string
  constructor(private route: ActivatedRoute) {
    this.serijeService = new SerijeService();
  }

  async ngOnInit(): Promise<void> {
    this.id = this.route.snapshot.params['id'];
    console.log(this.id!);
    await this.getDetails();
    this.currRole=environment.currentRole;
  }

  async getDetails() {
    this.podaci = await this.serijeService!.DetaljiTMDB(this.id!);
    this.podaci.poster_path=environment.posteriPutanja+this.podaci.poster_path;
   
  }
  async addToFavourite() {
    await this.serijeService!.addToFavourite(this.podaci!.id)
  }
  async removeFromFavourite(){
    await this.serijeService!.removeFromFavourite(this.podaci!.id);
  }
  async postojiUFavoritima(): Promise<boolean> {
    return await this.serijeService!.provjeriUFavoritima(this.id!);

  }
}
