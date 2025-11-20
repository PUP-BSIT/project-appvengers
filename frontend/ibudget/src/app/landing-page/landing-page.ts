import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing-page',
  imports: [RouterLink, CommonModule],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss'
})
export class LandingPage implements OnInit, OnDestroy {
  displayedText = signal('');

  private fullText: string = 'Simple tracking. Smarter spending.';
  private textIndex: number = 0;
  private typingSpeed = 80;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.typeEffect();
  }

  private typeEffect(): void {
    if (this.textIndex < this.fullText.length) {
      const nextChar = this.fullText.charAt(this.textIndex);
      // Update the signal with the new text slice
      this.displayedText.update(current => current + nextChar);
      this.textIndex++;
      this.timeoutId = setTimeout(() => this.typeEffect(), this.typingSpeed);
    } else {
      this.timeoutId = setTimeout(() => {
        this.displayedText.set('');
        this.textIndex = 0;
        this.typeEffect();
      }, 1500);
    }
  }

  ngOnDestroy(): void {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId as number);
      this.timeoutId = null;
    }
  }

  // Scroll to About section when navbar link is clicked
  scrollToAbout(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    const el = document.getElementById('about');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
