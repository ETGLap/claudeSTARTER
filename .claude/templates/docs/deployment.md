# Deployment

> How this project reaches an environment, and how to undo it. Links [[setup]], [[architecture]].

## Environments

| Environment | URL | Branch | Notes |
| --- | --- | --- | --- |
| local | | | |
| staging | | | |
| production | | | |

## Pipeline

What runs on push/merge, in order, and what gates a deploy.

## Configuration

Required env vars per environment — **names and purpose only, never values**. Where the
real values live (secret manager, CI settings) and who can read them.

## Release

How a release is cut, versioned, and tagged.

## Rollback

The exact steps to undo the last deploy, and how long they take. Write this before you need
it — the middle of an incident is the wrong time to work it out.

## Monitoring

Where logs, metrics, and alerts live. What "healthy" looks like.
