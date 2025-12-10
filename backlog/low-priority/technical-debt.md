# Technical Debt

- [x] **Update dependencies**
  - ✅ Checked for security vulnerabilities (pnpm audit)
  - ✅ Updated esbuild to latest version (0.25.0)
  - ⚠️ Some transitive dependencies have vulnerabilities (glob, nanoid, js-yaml) - mostly in dev dependencies

- [x] **Remove unused code**
  - ✅ Removed unused imports (Link, MdArrowBack from blog slug page)
  - ✅ Cleaned up dead code

- [x] **Refactor duplicate code**
  - ✅ Created reusable components (Breadcrumbs, Skeleton)
  - ✅ Extracted common patterns

- [x] **Improve type safety**
  - ✅ Added stricter types (Blog interface with tags and readingTime)
  - ✅ Remaining `any` types are in third-party integrations (web-vitals, MDX) which are acceptable


