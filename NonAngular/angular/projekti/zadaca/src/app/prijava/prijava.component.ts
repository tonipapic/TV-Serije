import { Component, OnInit } from '@angular/core';
import { AuthService } from '../Servisi/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-prijava',
  templateUrl: './prijava.component.html',
  styleUrl: './prijava.component.scss',
})
export class PrijavaComponent implements OnInit {
  private loginService?: AuthService;

  protected username: String = '';
  protected password: String = '';

  constructor(private router: Router) {}

  async ngOnInit(): Promise<void> {
    this.loginService = new AuthService();
    await this.Odjava();
  }

  private async Odjava() {
    if (await (await this.loginService!.getRole()).text() != "Gost") {
      this.loginService!.LoginAsGuest(true).then(() => {
        this.router.navigate(['/']).then(() => {
          window.location.reload();
        });
      });
    }
  }

  async Login(event: Event) {
    event.preventDefault();
    let odg = await this.loginService?.Login(this.username, this.password);
    console.log(await(await this.loginService?.getRole()!).text());
    if (odg?.status == 201) {
      this.router.navigate(['/']).then(() => {
        window.location.reload();
      });
    }
  }
}
