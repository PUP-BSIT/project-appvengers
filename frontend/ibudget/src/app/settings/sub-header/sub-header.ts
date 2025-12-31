import { Component, inject, OnInit, output, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-sub-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sub-header.html',
  styleUrl: './sub-header.scss',
})
export class SubHeader implements OnInit{
  userId = signal(0);
  router = inject(Router);
  authService = inject(AuthService);

  ngOnInit(): void {
    this.getUserId();
    if (!environment.production) {
      console.log(this.userId());
    }
  }

  getUserId() {
    this.authService.getProfile().subscribe((res) => {
      if (res.success && res.data) {
        this.userId.set(res.data.id);
      }
    })
  }
}
