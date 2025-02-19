import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config.ts'

export default mergeConfig(viteConfig, defineConfig({
    test: {
        setupFiles: ['./setup.tests.ts'],
        globals: true,
        environment: 'jsdom',
        coverage: {
            provider: 'istanbul' // or 'v8'
        },
    },  
}))
