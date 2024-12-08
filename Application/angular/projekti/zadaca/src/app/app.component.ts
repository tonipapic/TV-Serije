import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './Servisi/auth.service';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  authService?: AuthService;
  currentRole: string = '';

  async ngOnInit(): Promise<void> {
    this.authService = new AuthService();
    await this.authService.LoginAsGuest(false);
    this.currentRole =
      (await (await this.authService?.getRole()!).text()) ?? 'Unknown';
    environment.currentRole = this.currentRole;
  }
  isLoggedIn(): boolean {
    console.log('Enviroment role: ' + environment.currentRole);
    return this.currentRole != 'Gost';
  }
  title = 'zadaca';
}
