import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true,
                secure: false,
            }
        }
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            'react': path.resolve(__dirname, 'node_modules/react'),
            'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
            '@mui/system': path.resolve(__dirname, 'node_modules/@mui/system'),
            '@mui/material': path.resolve(__dirname, 'node_modules/@mui/material'),
            '@emotion/react': path.resolve(__dirname, 'node_modules/@emotion/react'),
            '@emotion/styled': path.resolve(__dirname, 'node_modules/@emotion/styled'),
            'date-fns': path.resolve(__dirname, 'node_modules/date-fns'),
        },
    },
    optimizeDeps: {
        include: [
            'date-fns',
            'date-fns/locale',
            'date-fns/_lib/format/longFormatters',
            'hoist-non-react-statics',
            'prop-types',
            'react-is',
            'react',
            'react-dom',
            '@mui/system',
            '@mui/material',
            '@emotion/react',
            '@emotion/styled'
        ],
        exclude: ['@mui/x-date-pickers']
    },
    build: {
        commonjsOptions: {
            include: [
                /date-fns/,
                /date-fns\/locale/,
                /date-fns\/_lib\/format\/longFormatters/,
                /hoist-non-react-statics/,
                /prop-types/,
                /react-is/,
                /react/,
                /react-dom/,
                /@mui\/system/,
                /@mui\/material/,
                /@emotion\/react/,
                /@emotion\/styled/
            ],
            transformMixedEsModules: true
        },
    },
}) 