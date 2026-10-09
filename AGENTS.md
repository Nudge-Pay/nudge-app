# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

## Agent Skills Architecture

Vendored agent skills are located exclusively under `.agents/skills/`.
`.claude/skills/` contains symlinks pointing back to `.agents/skills/` to provide a single source of truth and prevent configuration drift across AI coding assistants.

When editing or updating skills:

- Make changes directly in `.agents/skills/<skill-name>/`.
- Do not commit duplicate file trees in `.claude/skills/`.
