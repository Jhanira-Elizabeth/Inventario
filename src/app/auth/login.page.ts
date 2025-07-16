import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardContent, 
  IonItem, 
  IonLabel, 
  IonInput, 
  IonButton, 
  IonIcon,
  IonToast,
  IonSpinner,
  IonFab,
  IonFabButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { person, lockClosed, business, refresh } from 'ionicons/icons';
import { AuthService } from '../shared/services/auth.service';
import { LoginCredentials } from '../shared/models/user.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonIcon,
    IonToast,
    IonSpinner,
    IonFab,
    IonFabButton
  ]
})
export class LoginPage {
  // ...existing code...
  credentials: LoginCredentials = {
    username: '',
    password: ''
  };

  isLoading = false;
  showToast = false;
  toastMessage = '';
  toastColor = 'danger';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    addIcons({refresh,business,person,lockClosed});
  }

  async resetDatabase() {
    this.isLoading = true;
    try {
      await this.authService.resetDatabase();
      this.showSuccessToast('Base de datos reseteada');
    } catch (e) {
      this.showErrorToast('Error al resetear la base de datos');
    } finally {
      this.isLoading = false;
    }
  }

  async onLogin() {
    if (!this.credentials.username || !this.credentials.password) {
      this.showErrorToast('Por favor, complete todos los campos');
      return;
    }

    this.isLoading = true;
    try {
      const authResponse = await this.authService.login(this.credentials);
      this.showSuccessToast(`Bienvenido, ${authResponse.user.firstName}!`);
      this.router.navigate(['/tabs'], { replaceUrl: true });
    } catch (error: any) {
      this.showErrorToast(error.message || 'Error al iniciar sesión');
    } finally {
      this.isLoading = false;
    }
  }

  private showErrorToast(message: string) {
    this.toastMessage = message;
    this.toastColor = 'danger';
    this.showToast = true;
  }

  private showSuccessToast(message: string) {
    this.toastMessage = message;
    this.toastColor = 'success';
    this.showToast = true;
  }

  onToastDismiss() {
    this.showToast = false;
  }
}
