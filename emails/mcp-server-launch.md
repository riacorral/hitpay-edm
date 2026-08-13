---
template: product-launch
subject: "Build with AI - HitPay MCP Now Available For You To Easily Connect to Your Business"
previewText: "Query sales, payouts, and balances or create payment links - right from chat."
eyebrowText: "🚀 New · MCP Server"
productName: "Build with AI -\nHitPay MCP Now Available"
subtitle: "Query sales, transactions, payouts, and balances, or create payment links and invoices for your business - all from an AI assistant."
heroImage: "img/mcp-hero.png"
ctaText: "Try Connecting Your HitPay Account to AI Now"
ctaUrl: "https://docs.hitpayapp.com/apis/guide/mcp-server?utm_source=email&utm_medium=email&utm_campaign=mcp-server-launch&utm_content=1-try-connecting-your-hitpay-account-to-ai-now"
---

Hi {firstName},

We've shipped a hosted MCP server. You can now connect Claude - also Codex, Cursor, or any MCP client - to your HitPay account and ask about sales, transactions, payouts, and balances, or create payment links and invoices right from chat.

You sign in with your dashboard login (owner or admin), approve a consent screen, and the connection is scoped to that one business. No API keys involved.

---

### How to Connect

Add the HitPay MCP server to your AI client of choice:

**Claude Code** - then run `/mcp`, select hitpay, and choose Authenticate.

```
claude mcp add --transport http hitpay https://mcp.hit-pay.com/
```

**Codex**

```
codex mcp add hitpay --url https://mcp.hit-pay.com/
```

**Cursor** - add this to `~/.cursor/mcp.json`

```
{
  "mcpServers": {
    "hitpay": {
      "url": "https://mcp.hit-pay.com/"
    }
  }
}
```

::: image-row
img/mcp-connect-terminal.png | Claude Code connected to hitpay-prod after running /mcp
img/mcp-connect-browser-success.png | Browser confirmation after approving access
:::

[Try Connecting Your HitPay Account to AI Now](https://docs.hitpayapp.com/apis/guide/mcp-server?utm_source=email&utm_medium=email&utm_campaign=mcp-server-launch&utm_content=1-try-connecting-your-hitpay-account-to-ai-now){.cta}

---

### Just ask

- "What were my total sales last month, and how do they compare to the month before?"
- "Show my top-selling products this quarter"
- "When is my next payout, and what's my current balance?"
- "Create a payment link for SGD 49.90 for a consultation session"
- "Invoice a customer SGD 1,200 and email it to them"

---

### Built to be safe with your live business

::: bullets
**Signed in with your HitPay login**
No API keys - approve access with the login you already use, on dashboard.hit-pay.com.
**Scoped to one business**
Each connection only ever sees the business you authorized.
**Owner and admin only**
Other team roles can't authorize a connection.
**No destructive actions**
It can't refund, cancel, transfer money, or change settings - the only writes are creating payment links, invoices, products, and recurring plans.
**Revoke anytime**
Remove the connector from your client to cut off access instantly.
:::

[Connect to HitPay's MCP Today](https://docs.hitpayapp.com/apis/guide/mcp-server?utm_source=email&utm_medium=email&utm_campaign=mcp-server-launch&utm_content=2-connect-to-hitpays-mcp-today){.cta}

---

### See what Claude can build once it's connected

Ask Claude to analyze your sales, channel, and product data, and it can turn the answer into a shareable Claude Artifact - a dashboard like this one, built entirely from live data pulled through the MCP connection.

![Claude Artifact showing a HitPay business growth-levers analysis](img/mcp-artifact-demo.png)

---

Questions or feedback? Reply to this email - happy to help!

Best,
**Aditya**
