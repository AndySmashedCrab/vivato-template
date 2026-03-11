# Template Responsibilities

The template owns the application shell for the platform, not business functionality.

- Backend host composition and shared infrastructure live in `backend/VivatoTemplate.Api`.
- Frontend shell, providers, routing, and shared contexts live in `frontend/src/app` and `frontend/src/contexts`.
- Authentication scaffolding, theming, navigation, logging, and error handling are template concerns.
- Business modules do not belong in the template; real functionality is added per project under `modules/`.
