# ClientApp

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 6.1.3.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

This project now uses Playwright for UI tests.

1. Install the browser used by the test suite with `npm run e2e:install`.
2. Run the public smoke tests with `npm run e2e`.

When no explicit base URL is provided, Playwright automatically starts both required local processes:

- `dotnet run --project ..\\HomeReadingLibraryWeb.csproj --launch-profile HomeReadingLibraryWeb`
- `ng serve --host 127.0.0.1 --port 4200`

The suite waits for `https://localhost:5001` and `http://localhost:4200/home` before running browser tests.

By default the suite targets `https://localhost:5001`. Override that with `PLAYWRIGHT_BASE_URL` or `BAGGY_E2E_BASE_URL` when the app is hosted elsewhere.

Set `BAGGY_E2E_USE_LOCAL_STACK=false` to skip managed local process startup.

### Real-login smoke tests

Authenticated smoke tests are enabled for volunteer role by default.

Set `BAGGY_E2E_ROLE=admin` to validate admin login flows; in admin mode `BAGGY_E2E_USERNAME` and `BAGGY_E2E_PASSWORD` are required.

For this repository's custom `/account/signin` page:

- `BAGGY_E2E_ROLE=volunteer` signs in by selecting the first teacher and clicking the first volunteer.
- `BAGGY_E2E_ROLE=admin` signs in through the `Admin Login` form using `BAGGY_E2E_USERNAME` and `BAGGY_E2E_PASSWORD`.

Optional environment variables:

- `BAGGY_E2E_ROLE=admin` to enable the admin route smoke checks. Omit it or set any other value to validate volunteer access.
- `BAGGY_E2E_LOGIN_URL` if sign-in should start directly on the identity provider page instead of clicking the app's `Sign in as Volunteer` button.
- `BAGGY_E2E_USERNAME_SELECTOR`, `BAGGY_E2E_PASSWORD_SELECTOR`, `BAGGY_E2E_NEXT_SELECTOR`, `BAGGY_E2E_SUBMIT_SELECTOR`, and `BAGGY_E2E_POST_LOGIN_CONFIRM_SELECTOR` if the identity provider uses selectors that differ from the built-in defaults.

Examples:

```powershell
$env:PLAYWRIGHT_BASE_URL = 'https://localhost:5001'
npm run e2e
```

```powershell
$env:PLAYWRIGHT_BASE_URL = 'https://localhost:5001'
$env:BAGGY_E2E_USERNAME = 'volunteer@example.com'
$env:BAGGY_E2E_PASSWORD = 'replace-me'
npm run e2e:headed
```

```powershell
$env:PLAYWRIGHT_BASE_URL = 'https://localhost:5001'
$env:BAGGY_E2E_USERNAME = 'admin@example.com'
$env:BAGGY_E2E_PASSWORD = 'replace-me'
$env:BAGGY_E2E_ROLE = 'admin'
npm run e2e:headed
```

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
