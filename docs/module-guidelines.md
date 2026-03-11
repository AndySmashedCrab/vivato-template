# Module Guidelines

Modules are full-stack feature units that package their backend and frontend concerns together.

- Place future modules under `modules/<module-name>/backend` and `modules/<module-name>/frontend`.
- Backend modules should use `Controllers/`, `Models/`, `Services/`, and `ViewModels/`.
- Frontend modules should use `components/`, `models/`, and optional `contexts/` or `hooks/`.
- Register modules explicitly in both hosts during v1 rather than relying on discovery or reflection.
- Promote code into the template only when it is clearly shared platform behavior rather than business behavior.
