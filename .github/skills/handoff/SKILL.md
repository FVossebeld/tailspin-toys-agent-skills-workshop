---
name: handoff
description: Write a concise handoff so another engineer or a fresh agent session can continue the current work. Use when the user asks for a handoff, a summary for someone else, or to continue in a new session.
license: MIT
---

# Handoff

Workshop adaptation of Matt Pocock's `handoff` skill (MIT): <https://github.com/mattpocock/skills>.

- Write for a reader who has **no access** to this conversation.
- Reference existing artifacts by path, test name, commit or URL. Do not paste their content.
- Redact secrets, tokens and personal data.
- Keep it under 40 lines. Print it in the session; write a file only when the user asks, and never commit it.

## Format

```markdown
## Objective
<one or two lines>

## Current state
- Done: ...
- Not done: ...

## Root cause and decision
<what was wrong, what was decided, and why>

## Changed files
- path — one-line reason

## Verification evidence
- `<exact command>` — <result, with pass/fail counts>

## Remaining uncertainty
- ...

## Suggested next step
<one concrete action, and which skill or agent to use for it>
```
