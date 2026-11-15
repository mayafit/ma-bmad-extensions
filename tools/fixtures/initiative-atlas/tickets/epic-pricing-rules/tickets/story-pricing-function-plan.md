---
title: 'Pricing function'
type: 'feature'
ticket: '1'
created: '2026-02-01'
status: 'done' # draft | ready-for-dev | in-progress | in-review | built | done | blocked | dropped
baseline_revision: 'abc1234'
route: 'full'
---

## Intent

**Problem:** prices are computed in three places.

**Approach:** one `price()` function, every page calls it.
