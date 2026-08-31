# Security Policy & Secret Hygiene

## 1. Secrets & Environment Variables
- Never hardcode API keys, passwords, or tokens in source code.
- Always use `.env` for secrets and provide template keys in `.env.example`.
- Ensure `.env` is listed in `.gitignore`.

## 2. Defensive Coding
- Sanitize and validate all user inputs against XSS and Injection attacks.
- Prevent Cross-Site Request Forgery (CSRF) on state-mutating requests.
