import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { forkJoin, map, mergeMap, Observable, of, switchMap } from 'rxjs';

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

  /** Public API: get work items for all stored configs */
  GetWorkItems(): Observable<WorkItem[]> {
    // If you prefer: return per-config results instead of flattening everything.
    const requests = this.configs.map(config => this.getWorkItemsForConfig(config));
    return forkJoin(requests).pipe(
      map(results => results.flat().map(wi => wi.result.map(item => ({
        id: item.id.toString(),
        title: item.fields['System.Title'],
        state: item.fields['System.State'],
        assignedTo: item.fields['System.AssignedTo']?.displayName || 'Unassigned',
        organization: wi.organization,
        project: wi.project,
        type: item.fields['System.WorkItemType'],
        url: `https://dev.azure.com/${wi.organization}/${wi.project}/_workitems/edit/${item.id}`,
        content: item.fields['System.Description'] || '',
      })
      )).flat())
    );
  }

  /** Get work items for a single Azure DevOps config */
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
                AND [System.WorkItemType] = "User Story"`
    };

    console.log('Fetching work items for config:', config);
    // 1) Run WIQL to get IDs
    return this.http.post<WiqlResponse>(wiqlUrl, wiqlBody, { headers }).pipe(
      switchMap(response => {
        const ids = response.workItems?.map(w => w.id) ?? [];

        if (!ids.length) {
          return [];
        }

        // 2) Fetch details for those IDs in batches of 200
        const chunks: number[][] = [];
        for (let i = 0; i < ids.length; i += 200) {
          chunks.push(ids.slice(i, i + 200));
        }

        const requests = chunks.map(chunk => {
          const idsParam = chunk.join(',');
          const detailsUrl =
            `https://dev.azure.com/${config.organization}/${config.project}/_apis/wit/workitems` +
            `?ids=${idsParam}&$expand=relations&api-version=7.1`;

          return this.http.get<DevOpsWorkItemsResponse>(detailsUrl, { headers }).pipe(
            map(r => ({ result: r.value, organization: config.organization, project: config.project }))
          );
        });

        return forkJoin(requests).pipe(
          mergeMap(result => result),
        );
      })
    );
  }
}

interface IAzureDevOpsConfig {
  organization: string;
  project: string;
  personalAccessToken: string;
  // whatever else you have
}

interface WiqlResponse {
  workItems: { id: number; url: string }[];
}

interface DevOpsWorkItem {
  id: number;
  url: string;
  fields: {
    'System.Title': string;
    'System.WorkItemType': string;
    'System.State': string;
    // add what you need
    [key: string]: any;
  };
}

interface DevOpsWorkItemsResponse {
  value: DevOpsWorkItem[];
}