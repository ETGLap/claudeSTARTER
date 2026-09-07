# Security

Proportional to risk.

- [ ] Inputs validated.
- [ ] Authentication and authorization checked separately — passing the first says nothing
      about the second, and every route verifies its own.
- [ ] Credentials stored only as a slow one-way hash; sessions expire and can be revoked.
- [ ] Auth endpoints rate-limited; failures reveal nothing about which factor was wrong.
- [ ] No secrets in code, logs, or output; env vars handled safely.
- [ ] File/DB/API access safe (injection, traversal, unsafe exec).
- [ ] Dependencies reviewed for risk.
