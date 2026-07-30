# Content Management System (CMS) Editorial Workflows

The CMS workspace handles public informational pages (Terms, Privacy, Help Guides, blog posts) with version control.

## 1. Editorial Lifecycles

Pages transition through standard draft and publishing stages:
- **Draft**: Local edits stored in the DB (version incremented).
- **Published**: The page is marked active, rendering the slug public on the site router.

## 2. Page Version Control & Rollbacks

Each time an article is edited:
1. The current database page state is snapshotted into the `CmsPageVersion` ledger.
2. The snapshot records title, markdown content, metadata JSON, version index, and the editing author's ID.
3. **Rollback**: Operators can review the version history list and trigger a rollback. Doing so updates the current page title and content to match the historical snapshot, creating a clean audit log entry.
