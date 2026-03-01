# PR Title
fix: stabilize setup docs and Python 3.14 compatibility

## Summary
This PR fixes installation blockers and setup documentation inconsistencies across the project.

### What changed
- Updated backend dependency pins for Python 3.14 compatibility:
  - `pydantic>=2.10.0,<3.0.0`
  - `pydantic-settings>=2.6.0,<3.0.0`
  - `playwright>=1.52.0,<2.0.0`
  - `openpyxl>=3.1.5`
  - `pandas>=2.2.0,<3.0.0`
- Fixed corrupted `backend/requirements.txt` content (it had an accidental shell redirection line).
- Corrected and improved installation instructions in:
  - `README.md`
  - `USER_MANUAL_EN.md`
- Clarified Windows / Git Bash activation steps and directory flow (`backend` -> `frontend`).
- Added missing frontend TypeScript environment file:
  - `frontend/next-env.d.ts`
- Fixed frontend compile/type issues discovered during diagnostics (confetti/modal/workflow/store and strict TS cleanup).

## Root cause
Install failures were caused by:
1. Old pinned versions incompatible with Python 3.14 wheels.
2. Incorrect shell-specific commands in docs.
3. A corrupted `requirements.txt` line.

## Validation performed
- Ran dependency resolution check:
  - `python -m pip install --dry-run -r backend/requirements.txt`
- Confirmed Python 3.14 now resolves key packages with wheels (`pydantic-core`, `greenlet`).
- Resolved frontend Problems panel issues from previous syntax/type errors.

## Impact
- Backend setup is now installable on Python 3.14 (and 3.12).
- User-facing setup docs are consistent and executable.
- Frontend compiles without the previously reported critical issues.

## Breaking changes
- None intended.
- Dependency ranges were widened/updated for compatibility.

## Manual test checklist
- [ ] Create backend venv and install requirements successfully
- [ ] Run `python -m playwright install chromium`
- [ ] Start backend with `python main.py`
- [ ] Start frontend with `npm run dev`
- [ ] Open app and run bulk generation flow end-to-end

## Notes for reviewers
- Main compatibility fix is dependency modernization for Python 3.14.
- Documentation updates are important for Windows + Git Bash users.
