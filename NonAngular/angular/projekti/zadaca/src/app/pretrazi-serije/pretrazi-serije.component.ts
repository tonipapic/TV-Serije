import { Component } from '@angular/core';
import { JWTService } from '../Servisi/jwt.service';
import { environment } from '../../environments/environment';
import { SerijeService } from '../Servisi/serije.service';
import { Router } from '@angular/router';
import { SerijeBaseI } from '../Interface/SerijeBasicI';

@Component({
  selector: 'app-pretrazi-serije',
  templateUrl: './pretrazi-serije.component.html',
  styleUrl: './pretrazi-serije.component.scss',
})
export class PretraziFilmoveComponent {
  seriesList?: Array<SerijeBaseI>;
  constructor(private router: Router) {}

  async SearchSeries(searchValue: Event): Promise<void> {
    let searchBox: HTMLInputElement = document.getElementById(
      'searchBox'
    ) as HTMLInputElement;
    if (searchBox.value.length < 3) return;
    this.seriesList = await new SerijeService().getSeriesContainingString(
      searchBox.value
    );
    console.log(this.seriesList);
   /* let divList: HTMLElement = document.getElementById('list') as HTMLElement;
    divList.innerHTML = '';
    for (var item of await new SerijeService().getSeriesContainingString(
      searchBox.value
    )) {
      divList.innerHTML += `<div>
					<h3 class="">${item.name}</h3>
          <button onclick="redirect(${item.id})">Detalji</button>
				
					<p class="d-block">Opis: ${item.overview}</p>
					</div>`;
    }*/
  }

  redirect(id: number) {
    console.log(id);
     this.router.navigate(['/detalji',id]).then(() => {
      window.location.reload();
    });
  }
}
//	<button class=" mb-3 btn btn-primary" onclick="openSeriesDetail(${item.id})">Detalji</button>
