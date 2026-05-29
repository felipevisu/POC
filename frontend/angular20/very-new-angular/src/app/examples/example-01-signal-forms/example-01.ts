import { JsonPipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { email, form, FormField, min, minLength, required, submit } from '@angular/forms/signals';

interface SignupModel {
  name: string;
  email: string;
  age: number | null;
}

@Component({
  selector: 'app-example-01',
  imports: [FormField, JsonPipe],
  templateUrl: './example-01.html',
  styleUrl: './example-01.css'
})
export class Example01SignalForms {
  // 1) Model is a plain writable signal.
  private readonly model = signal<SignupModel>({ name: '', email: '', age: null });

  // 2) form() wraps the model and a schema of validation logic.
  //    The schema fn receives a path; validators attach to each field path.
  protected readonly f = form(this.model, (path) => {
    required(path.name, { message: 'Name is required' });
    minLength(path.name, 2, { message: 'At least 2 characters' });
    required(path.email, { message: 'Email is required' });
    email(path.email, { message: 'Must be a valid email' });
    required(path.age, { message: 'Age is required' });
    min(path.age, 18, { message: 'Must be 18 or older' });
  });

  protected readonly submitted = signal<SignupModel | null>(null);

  // 3) Field state is signals: f().valid(), f.name().errors(), .touched()...
  async onSubmit() {
    const ok = await submit(this.f, async () => {
      // pretend server call
      this.submitted.set(this.f().value());
      return undefined; // no server errors
    });
    if (!ok) this.submitted.set(null);
  }
}
