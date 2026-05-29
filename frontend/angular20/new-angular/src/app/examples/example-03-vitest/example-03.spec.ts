import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { Example03Vitest } from './example-03';

// Component test under Vitest + jsdom. No Karma, no browser.
describe('Example03Vitest', () => {
  it('renders the live sum', async () => {
    await TestBed.configureTestingModule({
      imports: [Example03Vitest],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();
    const fixture = TestBed.createComponent(Example03Vitest);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    // defaults a=2, b=3
    expect(el.querySelector('.sum')?.textContent).toContain('5');
  });
});
