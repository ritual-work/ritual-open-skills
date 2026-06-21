---
type: API Convention
title: New paginated endpoints return next_cursor, not page numbers
description: Shared API convention surfaced during an api-change-review.
resource: ./src/api/orders.ts
tags: [api, pagination, backend, convention]
timestamp: 2026-06-21T00:00:00Z
---

# Summary

New REST endpoints should paginate with an opaque `next_cursor` rather than
page/offset numbers. Existing offset-based endpoints stay as-is until a deliberate
migration.

# Applies to

- New REST endpoints
- Generated SDK clients
- API change reviews

# Evidence

- Observed in `orders`, `customers`, and `invoices` — all cursor-based.
- An offset-based draft on `payments` was flagged in review and switched.

# Use in future agent work

When reviewing or designing a paginated endpoint, check it returns `next_cursor`;
flag page/offset on anything new as inconsistent with the house convention.

---

*This is an EXAMPLE note showing the OKF shape. Delete it once your own notes
land here.*
