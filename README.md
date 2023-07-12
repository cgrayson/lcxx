# lcxx

_an admin UI for LeadConduit_ 

## Run

1. `export LC_API_SUPER=YourUserAPIKeyAsASuperUser`
2. `npm run build` (only needed the first time, or after UI changes)
3. `npm start` (`ctrl-c` to stop server)

Adding an account to an allowlist requires having that account's API key from SSO. Looking up the account info in the "lookup" box adds that account's name to the local cache, and allows you to add it to integrations' allowlists.

Don't forget to "save changes" after adding or deleting accounts from an allowlist.

## Develop

- Build UI: `npm run watch`
