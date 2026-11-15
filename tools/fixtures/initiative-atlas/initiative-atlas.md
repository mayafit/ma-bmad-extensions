---
type: initiative
title: Atlas fixture shop
parent: none
status: in-progress
---

# Atlas fixture shop

A small storefront used as the CI fixture of `ma-knowledge-atlas` (ma-agents Story 37.4, FR305): three epics in
`tickets/tickets.toml`, tickets with every plan status the ticket tree knows, one ticket without a plan, one plan
naming no ticket, and an `archive-v6/` folder a migration left behind, which the Atlas must never read.

## Outcome

A shopper prices, carts and pays for an order on the live site.

## Requirements

- R1: every price comes from one pricing function.
- R2: discount codes apply or are refused with a reason.
- R3: a shopper adds, changes and removes items.
- R4: a paid order gets a receipt.
