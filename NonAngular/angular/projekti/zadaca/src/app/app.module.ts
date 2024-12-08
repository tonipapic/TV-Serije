import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PretraziFilmoveComponent } from './pretrazi-serije/pretrazi-serije.component';

import { AppComponent } from './app.component';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { DokumentacijaComponent } from './dokumentacija/dokumentacija.component';
import { PrijavaComponent } from './prijava/prijava.component';
import { DetaljiSerijeComponent } from './detalji-serije/detalji-serije.component';

const routes: Routes = [
  { path: '', component: PretraziFilmoveComponent, pathMatch: 'full' },
  { path: 'dokumentacija', component: DokumentacijaComponent },
  { path: 'prijava', component: PrijavaComponent },
  { path: 'detalji/:id', component: DetaljiSerijeComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    PretraziFilmoveComponent,
    DokumentacijaComponent,
    PrijavaComponent,
    DetaljiSerijeComponent
  ],
  imports: [BrowserModule, FormsModule, RouterModule.forRoot(routes)],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
