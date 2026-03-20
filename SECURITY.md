# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly.

**Do not open a public GitHub issue.** Instead, use one of these channels:

1. **Preferred:** [GitHub Private Vulnerability Reporting](https://github.com/Devansh-365/hisaab/security/advisories/new)
2. **Email:** devansh@trymetis.app

Include:
- A description of the vulnerability and its potential impact
- Steps to reproduce
- Affected component (parser, export, UI, dependency)

### Response Timeline

| Step | Timeframe |
|---|---|
| Acknowledgment of your report | Within 48 hours |
| Initial assessment and severity rating | Within 5 business days |
| Fix developed and tested | Within 14 business days (severity dependent) |
| Public disclosure | After fix is deployed, coordinated with reporter |

### Responsible Disclosure

We ask that you give us a reasonable window (up to 90 days) to address the issue before any public disclosure. We will coordinate the disclosure timeline with you and credit you in the release notes (unless you prefer anonymity).

If we are unresponsive for more than 14 days, you may escalate by opening a private advisory on this repository.

## Architecture and Attack Surface

Hisaab is a **fully client-side** application. There is no backend, no API, no server, no database, and no authentication. All trade data is stored in the browser's IndexedDB and never transmitted over the network.

This architecture significantly limits the attack surface:

| Area | Risk Level | Notes |
|---|---|---|
| Server-side attacks | None | No server exists |
| SQL/NoSQL injection | None | No database queries |
| Authentication bypass | None | No authentication |
| CSRF/session hijacking | None | No sessions |
| CSV/XLSX parsing | Low | Malformed input handling |
| CSV export | Medium | Formula injection in spreadsheets |
| XSS | Low | React auto-escapes, no `dangerouslySetInnerHTML` |
| Supply chain | Medium | Third-party npm dependencies |

## Mitigations in Place

- **CSV formula injection:** All exported cells starting with `=`, `+`, `-`, `@`, `\t`, `\r` are prefixed with `'` to prevent execution in Excel/Google Sheets
- **No unsafe APIs:** No use of `dangerouslySetInnerHTML`, `eval()`, or `Function()`
- **No outbound data:** Zero network requests carry user trade data. Verifiable via browser DevTools Network tab
- **External links:** All use `rel="noopener noreferrer"` and link to hardcoded, verified URLs only
- **Dependency lock:** `package-lock.json` ensures reproducible installs

## Scope

### In Scope

- Vulnerabilities in Hisaab's source code
- CSV/XLSX parsing that could lead to data corruption or code execution
- Export functionality that could be exploited when files are opened externally
- Dependencies with known CVEs that affect Hisaab's usage

### Out of Scope

- Vulnerabilities in the browser's IndexedDB implementation
- Social engineering attacks
- Physical access to the user's device
- Denial of service (client-side app, user can just close the tab)
- Vulnerabilities in third-party services (report those to their maintainers directly)

## Supported Versions

Only the latest deployment on `main` at [hisaab.trymetis.app](https://hisaab.trymetis.app) is supported. There are no versioned releases at this time.

## Recognition

We will credit security researchers in the changelog and README (with your permission). Significant findings will be acknowledged in the project's security advisories.

## References

This policy is informed by the [OpenSSF Vulnerability Disclosure Guide](https://github.com/ossf/oss-vulnerability-guide) and [GitHub's coordinated disclosure documentation](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/about-coordinated-disclosure-of-security-vulnerabilities).
