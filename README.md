```
npm install
npm run dev
```

```
open http://localhost:3000
```

## Scripts

- **dev**: Runs the server in development mode with hot-reload using `tsx watch` on `src/index.ts`.
- **build**: Compiles TypeScript source code to JavaScript using `tsc`.
- **start**: Runs the built application from `dist/index.js` using Node.js.
- **db:push**: Generates migrations and pushes schema changes to the database using Drizzle Kit (`npx drizzle-kit generate && npx drizzle-kit push`).
- **lint**: Lints the codebase using Biome.
- **fix**: Automatically formats and fixes code using Biome (`biome format --write`).
