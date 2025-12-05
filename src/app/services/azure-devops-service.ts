import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { bufferCount, forkJoin, from, map, mergeMap, Observable, switchMap, } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AzureDevopsService {
  private http = inject(HttpClient);
  configs: IAzureDevOpsConfig[] = [];

  private azureDevOpsConfigsKey = 'azureDevOpsConfigs';

  constructor() {
    this.configs = this.loadConfig() ?? [];
  }

  loadConfig(): IAzureDevOpsConfig[] | null {
    const configJson = localStorage.getItem(this.azureDevOpsConfigsKey);
    return configJson ? JSON.parse(configJson) : null;
  }

  addConfig(config: IAzureDevOpsConfig) {
    this.configs.push(config);
    this.saveConfig();
  }

  deleteConfig(index: number) {
    this.configs.splice(index, 1);
    this.saveConfig();
  }

  saveConfig() {
    localStorage.setItem(this.azureDevOpsConfigsKey, JSON.stringify(this.configs));
  }

  GetWorkItems(): Observable<WorkItem[]> {
    const requests = forkJoin(this.configs.map(config => this.getWorkItemsForConfig(config)));
    return requests.pipe(
      map(results => results.map(item => item.result.map(wi => ({
        id: wi.id.toString(),
        title: wi.fields['System.Title'],
        state: wi.fields['System.State'] as WorkItemState,
        assignedTo: wi.fields['System.AssignedTo']?.displayName || 'Unassigned',
        organization: item.organization,
        project: item.project,
        type: wi.fields['System.WorkItemType'] as WorkItemType,
        url: `https://dev.azure.com/${item.organization}/${item.project}/_workitems/edit/${wi.id}`,
        content: wi.fields['System.Description'] || '',
      }))).flat())
    );
  }

  private getWorkItemsForConfig(config: IAzureDevOpsConfig) {
    const headers = new HttpHeaders({
      Authorization: `Basic ${btoa(':' + config.personalAccessToken)}`,
      Accept: 'application/json',
    });

    const wiqlUrl = `https://dev.azure.com/${config.organization}/${config.project}/_apis/wit/wiql?api-version=7.1`;

    const wiqlBody = {
      query: `Select [System.Id]
              From WorkItems
              Where [System.TeamProject] = "${config.project}"
                And [System.State] IN ("Active", "New")
                AND [System.WorkItemType] IN ("User Story", "Bug")`
    };

    return this.http.post<WiqlResponse>(wiqlUrl, wiqlBody, { headers }).pipe(
      switchMap(response => {
        const ids = response.workItems?.map(w => w.id) ?? [];

        if (!ids.length) {
          return [];
        }

        // 2) Fetch details for those IDs in batches of 200
        const chunkSize = 200;

        return from(ids).pipe(
          bufferCount(chunkSize)
        ).pipe(
          map(chunk => {
            const idsParam = chunk.join(',');
            const detailsUrl =
              `https://dev.azure.com/${config.organization}/${config.project}/_apis/wit/workitems` +
              `?ids=${idsParam}&$expand=relations&api-version=7.1`;

            return this.http.get<DevOpsWorkItemsResponse>(detailsUrl, { headers });
          }),
          mergeMap(result => result),
          map(itemsResponse => ({
            organization: config.organization,
            project: config.project,
            result: itemsResponse.value
          }))
        )
      }));
  }
}

interface IAzureDevOpsConfig {
  organization: string;
  project: string;
  personalAccessToken: string;
}

interface WiqlResponse {
  workItems: { id: number; url: string }[];
}

interface DevOpsWorkItemsResponse {
  value: DevOpsWorkItem[];
}

interface DevOpsWorkItem {
  id: number;
  url: string;
  fields: {

    'System.Title': string;
    'System.BoardColumn': string;
    'System.WorkItemType': string;
    'System.State': string;
    'System.Description': string;
    'System.AssignedTo'?: {
      displayName: string;
      imageUrl: string;
    };
  };
}
