---
name: EthioBiz i18n pattern and Orval hook naming
description: Multilingual field access helper and non-obvious Orval-generated hook names
---

**Rule:** Use `getLocalizedField(obj, 'fieldBase', language)` to access multilingual fields; be aware that Orval generates `useList*` not `useGet*` for collection endpoints.

**Why:** DB stores `name_en`, `name_am`, `name_orm`. Frontend must pick the right locale dynamically. Orval uses the OpenAPI `operationId` naming — list endpoints become `useListBusinesses`, `useListCategories` (not `useGetBusinesses`/`useGetCategories`).

**How to apply:**
- Import `getLocalizedField` from `@/lib/i18n`
- For collection hooks: `useListBusinesses`, `useListCategories`
- For single-item hooks: `useGetBusiness(id: number)` — id must be a number, not string
- Mutation variable shapes: `useVerifyBusiness` / `useDeleteBusiness` take `{ id: number }`, `useClaimBusiness` takes `{ id: number; data: ClaimInput }`

Languages: `'EN' | 'AM' | 'ORM'`. Suffix map: EN→En, AM→Am, ORM→Orm.
