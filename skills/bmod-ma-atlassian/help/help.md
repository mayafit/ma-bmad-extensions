# ma-atlassian knowledge

This document covers the skills of the `ma-atlassian` module: what each one gives the user and when to recommend it.

## Skills

- `ma-atlassian-bind`: binds the upstream planning and build skills to on-prem Jira and Confluence (`bind`), removes that binding (`unbind`) and reports it (`status`). Recommend it after the module is set up, after any module install or `bmad setup`, and whenever the user asks whether Jira and Confluence are connected.
- `ma-atlassian-confluence-plan`: previews the Confluence page tree an initiative would publish to the planning and tickets destinations, without writing anything. Recommend it before a first publish, or when the user asks what would land in Confluence and where.
- `ma-atlassian-confluence-record-root-page`: records a Confluence root page the user created as the `planning_root_page` or `tickets_root_page` answer of this module. Recommend it when a destination has no root page yet, or when the user moves one.
