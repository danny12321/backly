# Backly 🔍

Backly is an Angular-based web application designed to provide a comprehensive dashboard for managing and tracking work items across various projects and organizations. It offers a user-friendly interface to visualize tasks, bugs, and features, making project management more efficient.

## Important design note 🎨

- The application does not access any backend services directly apart from Azure DevOps APIs. The users credentials are therefor only stored in the browser's local storage.
- The application is built with Angular and deployed as a static site on GitHub Pages, because it's low costs.

## Development server 💻

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.
