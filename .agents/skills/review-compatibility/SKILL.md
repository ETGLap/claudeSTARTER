---
name: review-compatibility
description: Compatibility gates for projects targeting more than one platform (web, mobile, desktop, or multiple runtimes) — keeping business logic shared and platform-agnostic, isolating platform-specific code behind interfaces, and recording feature-parity divergences.
when_to_use: The project ships to multiple platforms or runtimes and the change touches shared logic, a platform-specific implementation, or responsive/adaptive behavior.
---

# Compatibility

Shared by default; platform-specific only when required.
Applies only when the project targets multiple platforms (web/mobile/desktop);
otherwise skip and note.

- [ ] Business logic stays platform-agnostic and shared.
- [ ] Platform-specific code exists only when explicitly required, isolated behind an
      interface.
- [ ] No platform-only APIs leak into shared code.
- [ ] Responsive/adaptive behavior verified per target platform.
- [ ] Feature-parity divergences recorded in the spec or an ADR.
