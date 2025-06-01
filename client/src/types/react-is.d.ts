declare module 'react-is' {
    import * as React from 'react';

    export function typeOf(object: any): symbol | undefined;
    export function isValidElementType(object: any): boolean;
    export function isAsyncMode(object: any): boolean;
    export function isConcurrentMode(object: any): boolean;
    export function isContextConsumer(object: any): boolean;
    export function isContextProvider(object: any): boolean;
    export function isElement(object: any): boolean;
    export function isForwardRef(object: any): boolean;
    export function isFragment(object: any): boolean;
    export function isLazy(object: any): boolean;
    export function isMemo(object: any): boolean;
    export function isPortal(object: any): boolean;
    export function isProfiler(object: any): boolean;
    export function isStrictMode(object: any): boolean;
    export function isSuspense(object: any): boolean;

    export const AsyncMode: symbol;
    export const ConcurrentMode: symbol;
    export const ContextConsumer: symbol;
    export const ContextProvider: symbol;
    export const Element: symbol;
    export const ForwardRef: symbol;
    export const Fragment: symbol;
    export const Lazy: symbol;
    export const Memo: symbol;
    export const Portal: symbol;
    export const Profiler: symbol;
    export const StrictMode: symbol;
    export const Suspense: symbol;
} 