import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-medal',
  standalone: true,
  templateUrl: './medal.component.html',
  styleUrls: ['./medal.component.scss']
})
export class MedalComponent {
  @Input() medals: string[] = []; 
}
