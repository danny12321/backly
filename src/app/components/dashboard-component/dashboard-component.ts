import { Component, inject } from '@angular/core';

import { AzureDevopsService } from '../../services/azure-devops-service';
import { groupBy, map, mergeMap, Observable, of, reduce, toArray } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { Lane } from "../lane/lane";

@Component({
  selector: 'app-dashboard-component',
  imports: [AsyncPipe, Lane],
  templateUrl: './dashboard-component.html',
  styleUrl: './dashboard-component.scss',
})
export class DashboardComponent {
  azureDevopsService = inject(AzureDevopsService);
  workItems$: Observable<WorkItem[]> = this.azureDevopsService.GetWorkItems();

  lanes$: Observable<{ state: WorkItemState, items: WorkItem[] }[]> = this.workItems$.pipe(
    mergeMap(items => items),              // flatten array
    groupBy(item => item.state),           // group by state
    mergeMap(group$ => group$.pipe(        // group$ is a grouped observable
      toArray(),                           // collect items of this group
      map(items => ({ state: items[0].state, items: items })) // take state from any item
    )),
    toArray()
  );
}
