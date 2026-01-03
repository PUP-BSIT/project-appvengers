import { Component, OnInit, OnDestroy, AfterViewInit,
  ViewChild, ElementRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss'
})
export class LandingPage implements OnInit, OnDestroy, AfterViewInit {
  showScrollTop = false;
  showNavbar = true;
  private lastScrollTop = 0;
  private homeObserver?: IntersectionObserver;
    ngAfterViewInit(): void {
      // Fade-in animation for sections
      const fadeSections = document.querySelectorAll('.fade-in-section');
      if (fadeSections.length > 0) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              (entry.target as HTMLElement).classList.add('visible');
            }
          });
        }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });
        fadeSections.forEach(section => observer.observe(section));
      }

      // Show scroll-to-top button when #home is NOT visible
      const homeSection = document.getElementById('home');
      if (homeSection) {
        this.homeObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            this.showScrollTop = !entry.isIntersecting;
          });
        }, { threshold: 0.1 });
        this.homeObserver.observe(homeSection);
      }
    }
   displayedText = signal('');

  menuOpen = false;

  isMobile(): boolean {
    return window.innerWidth < 992;
  }

  private fullText: string = 'Simple tracking. Smarter spending.';
  private textIndex: number = 0;
  private typingSpeed = 80;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  @ViewChild('aboutSection', { static: false })
    aboutSection!: ElementRef<HTMLElement> | null;

  ngOnInit(): void {
    this.typeEffect();
    window.addEventListener('scroll', this.onScroll.bind(this));
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
    if (this.homeObserver) {
      this.homeObserver.disconnect();
    }
    window.removeEventListener('scroll', this.onScroll.bind(this));
  }

  private onScroll(): void {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > this.lastScrollTop && scrollTop > 100) {
      // Scrolling down
      this.showNavbar = false;
    } else {
      // Scrolling up
      this.showNavbar = true;
    }
    
    this.lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
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

  // Scroll to Features section when navbar link is clicked
  scrollToFeatures(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    const section = document.getElementById('features');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Scroll to top when Home navbar link is clicked
  scrollToTop(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    const section = document.getElementById('home');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setTimeout(() => {
      this.showScrollTop = false;
    }, 500);
  }
}
