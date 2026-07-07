# Security Policy

## Supported Versions

Only the latest published version of `check-package-lock` is supported with
security updates. Releases are automated, so fixes ship as soon as they land
on `main`.

| Version | Supported |
| ------- | --------- |
| latest  | yes       |
| older   | no        |

## Reporting a Vulnerability

Please do not report security vulnerabilities through public GitHub issues.

Instead, use one of these private channels:

- **GitHub private vulnerability reporting** (preferred):
  [Report a vulnerability](https://github.com/gemal/node-check-package-lock/security/advisories/new)
- **Email**: henrik@gemal.dk

Please include:

- A description of the vulnerability and its impact
- Steps to reproduce, ideally with a minimal example
- The version of `check-package-lock` affected

You can expect an acknowledgement within 7 days. Once the issue is confirmed,
a fix is developed and published, and the vulnerability is disclosed through a
GitHub security advisory with credit to the reporter (unless you prefer to
remain anonymous).

## Scope

`check-package-lock` is a read-only CLI: it reads a `package-lock.json` or
`npm-shrinkwrap.json` file, prints findings, and sets an exit code. It makes
no network requests and writes no files. Reports about the security of this
repository's release pipeline and GitHub Actions workflows are also welcome.
