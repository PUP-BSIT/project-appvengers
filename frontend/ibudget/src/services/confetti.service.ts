import { Injectable } from '@angular/core';
import confetti from 'canvas-confetti';

@Injectable({
  providedIn: 'root'
})
export class ConfettiService {
  
  /**
   * Celebrate with confetti for savings goal completion
   * Green/gold theme with lots of particles
   */
  celebrate() {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      colors: ['#27ae60', '#2ecc71', '#f1c40f', '#f39c12'],
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });

    fire(0.2, {
      spread: 60,
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  }

  /**
   * Subtle confetti for milestone achievements (50%, 75%)
   * Purple/blue theme with fewer particles
   */
  milestone() {
    const count = 100;
    const defaults = {
      origin: { y: 0.7 },
      colors: ['#9b59b6', '#8e44ad', '#3498db', '#2980b9'],
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 45,
    });

    fire(0.2, {
      spread: 60,
    });

    fire(0.35, {
      spread: 80,
      decay: 0.91,
      scalar: 0.8,
    });

    fire(0.2, {
      spread: 100,
      startVelocity: 25,
      decay: 0.92,
    });
  }

  /**
   * Clear all confetti from screen
   */
  clear() {
    confetti.reset();
  }
}
