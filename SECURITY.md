# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | Yes                |
| < 1.0   | No                 |

## Reporting a Vulnerability

If you discover a security vulnerability in the Maximo MCP Server, please report it responsibly. **Do not open a public issue.**

Send an email to **swetamsh009@icloud.com** with the following information:

- **Description**: A clear summary of the vulnerability.
- **Steps to Reproduce**: Detailed steps to reproduce the issue.
- **Impact Assessment**: The potential impact and severity of the vulnerability.
- **Suggested Fix**: Any recommendations for remediation, if available.

### Response Timeline

- **Acknowledgment**: Within 48 hours of receiving your report.
- **Status Update**: Within 7 days with an initial assessment and remediation plan.
- **Resolution**: A patch will be developed and released as quickly as possible, with credit given to the reporter (unless anonymity is requested).

## Responsible Disclosure

We ask that you:

1. Allow us a reasonable amount of time to address the issue before public disclosure.
2. Avoid exploiting the vulnerability beyond what is necessary to demonstrate it.
3. Do not access, modify, or delete data belonging to other users.
4. Act in good faith to avoid degradation of service.

We commit to working with security researchers in good faith and will not pursue legal action against individuals who follow this responsible disclosure policy.

## Security Best Practices for Users

When deploying and operating the Maximo MCP Server, follow these practices:

- **Never commit API keys or credentials** to version control. Treat all authentication material as secret.
- **Use environment variables** for all sensitive configuration values (`MAXIMO_API_KEY`, `MAXIMO_HOST`, etc.).
- **Use `.env` files** for local development. The `.env` file is included in `.gitignore` and must never be committed.
- **Validate SSL certificates** in production environments. Do not disable TLS verification.
- **Prefer API key authentication** over basic (username/password) authentication when your Maximo instance supports it.
- **Keep dependencies updated**. Run `npm audit` regularly and apply security patches promptly.

## Known Security Considerations

- **HTTPS communication**: All communication with Maximo REST APIs occurs over HTTPS. The server does not support unencrypted HTTP connections to Maximo.
- **API key transmission**: API keys are passed via HTTP headers (`apikey` header), not in URLs or query parameters.
- **Log sanitization**: The server uses `sanitizeLogData()` to strip sensitive data (API keys, passwords, tokens) from all log output.
- **No credential caching**: Authentication credentials are never written to disk or cached in memory beyond the active session.
