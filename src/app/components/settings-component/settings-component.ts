import { Component, inject, signal } from '@angular/core';
import { form, Field } from '@angular/forms/signals'
import { AzureDevopsService } from '../../services/azure-devops-service';

@Component({
  selector: 'app-settings-component',
  imports: [Field],
  templateUrl: './settings-component.html',
  styleUrl: './settings-component.scss',
})
export class SettingsComponent {
  // TODO make private
  devopsService = inject(AzureDevopsService);

  azureDevOpsModel = signal<IAzureDevOpsConfig>({
    organization: '',
    project: '',
    personalAccessToken: '',
  });

  azureDevOpsForm = form(this.azureDevOpsModel);

  onSubmit() {
    const config = {
      organization: this.azureDevOpsForm.organization().value(),
      project: this.azureDevOpsForm.project().value(),
      personalAccessToken: this.azureDevOpsForm.personalAccessToken().value()
    }
    this.devopsService.addConfig(config);
  }

  onDelete(index: number) {
    this.devopsService.deleteConfig(index);
  }
}
