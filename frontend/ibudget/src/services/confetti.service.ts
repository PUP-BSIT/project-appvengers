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
    const duration = 3000; // 3 seconds
    const animationEnd = Date.now() + duration;
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 9999,
      colors: ['#27ae60', '#2ecc71', '#f1c40f', '#f39c12', '#FFD700', '#32CD32']
    };

    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 100 * (timeLeft / duration);

      // Confetti from left
      confetti({
        ...defaults,
        particleCount,
        origin: { x: Math.random() * 0.3, y: Math.random() - 0.2 }
      });

      // Confetti from right
      confetti({
        ...defaults,
        particleCount,
        origin: { x: Math.random() * 0.3 + 0.7, y: Math.random() - 0.2 }
      });

      // Confetti from center
      confetti({
        ...defaults,
        particleCount: particleCount * 2,
        origin: { x: 0.5, y: 0.5 },
        spread: 180,
        startVelocity: 45
      });
    }, 250);
  }

  /**
   * Subtle confetti for milestone achievements (50%, 75%)
   * Purple/blue theme with fewer particles
   */
  milestone() {
    const duration = 2000; // 2 seconds
    const animationEnd = Date.now() + duration;
    const defaults = {
      startVelocity: 25,
      spread: 360,
      ticks: 50,
      zIndex: 9999,
      colors: ['#9b59b6', '#8e44ad', '#3498db', '#2980b9', '#BB86FC', '#6200EE']
    };

    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      // Confetti from random positions
      confetti({
        ...defaults,
        particleCount,
        origin: { x: Math.random(), y: Math.random() * 0.5 }
      });

      // Center burst
      confetti({
        ...defaults,
        particleCount: particleCount * 1.5,
        origin: { x: 0.5, y: 0.4 },
        spread: 120,
        startVelocity: 35
      });
    }, 250);
  }

  /**
   * Clear all confetti from screen
   */
  clear() {
    confetti.reset();
  }
}
