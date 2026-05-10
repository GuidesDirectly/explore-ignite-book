# 4. guide_profiles_public view with security_invoker=false

## Status

Accepted

## Context

Need to expose guide data to unauthenticated users.

## Decision

Create explicit column allowlist view.

## Consequences

Public data exposure controlled, requires PR review on schema changes.
