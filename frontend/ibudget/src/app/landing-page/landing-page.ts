import { Component, OnInit, OnDestroy, ViewChild, ElementRef, signal } from '@angular/core';
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
  @ViewChild('aboutSection', { static: false })
    aboutSection!: ElementRef<HTMLElement> | null;

  ngOnInit(): void {
    this.typeEffect();
  }

  private typeEffect(): void {
    if (this.textIndex < this.fullText.length) {
      const nextChar = this.fullText.charAt(this.textIndex);
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
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  // Scroll to About section when navbar link is clicked
  scrollToAbout(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    const el = this.aboutSection?.nativeElement;
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
