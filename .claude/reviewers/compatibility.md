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
