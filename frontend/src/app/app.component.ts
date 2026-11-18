import { Component } from '@angular/core';
import { ScanComponent } from './features/scan/scan.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ScanComponent],
  template: '<app-scan />',
})
export class AppComponent {}
