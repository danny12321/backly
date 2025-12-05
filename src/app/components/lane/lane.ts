import { Component,input } from '@angular/core';

@Component({
  selector: 'app-lane',
  imports: [],
  templateUrl: './lane.html',
  styleUrl: './lane.scss',
})
export class Lane {
  Name = input.required<string>();
  Items = input.required<WorkItem[]>();
}
