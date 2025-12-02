import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { AzureDevopsService } from '../../services/azure-devops-service';

@Component({
  selector: 'app-dashboard-component',
  imports: [],
  templateUrl: './dashboard-component.html',
  styleUrl: './dashboard-component.scss',
})
export class DashboardComponent implements OnInit {
  azureDevopsService = inject(AzureDevopsService);
  workItems: WorkItem[] = [];
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.azureDevopsService.GetWorkItems().subscribe({
      next: items => {
        console.log('Work items:', items);
        this.workItems = items;
        this.cdr.detectChanges();
      },
      error: err => console.error(err),
    });
  }
}
