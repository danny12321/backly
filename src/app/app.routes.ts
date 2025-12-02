import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'settings',
        loadComponent: () =>
            import('./components/settings-component/settings-component').then(c => c.SettingsComponent)
    },{
        path: '',
        loadComponent: () =>
            import('./components/dashboard-component/dashboard-component').then(c => c.DashboardComponent)
    }
];
