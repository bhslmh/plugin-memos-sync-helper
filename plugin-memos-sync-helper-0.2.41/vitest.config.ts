import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    cacheDir: './node_modules/.vitest-cache',
    test: {
        environment: 'node',
        include: ['tests/**/*.test.ts'],
    },
})
