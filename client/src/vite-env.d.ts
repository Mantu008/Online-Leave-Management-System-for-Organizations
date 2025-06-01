/// <reference types="vite/client" />

declare module 'hoist-non-react-statics' {
    import * as React from 'react';
    function hoistNonReactStatics<T extends React.ComponentType<any>, S extends React.ComponentType<any>>(
        TargetComponent: T,
        SourceComponent: S,
        blacklist?: { [key: string]: boolean }
    ): T & S;
    export = hoistNonReactStatics;
}

declare module 'prop-types' {
    import * as React from 'react';

    export const any: React.Requireable<any>;
    export const array: React.Requireable<any[]>;
    export const bool: React.Requireable<boolean>;
    export const func: React.Requireable<(...args: any[]) => any>;
    export const number: React.Requireable<number>;
    export const object: React.Requireable<object>;
    export const string: React.Requireable<string>;
    export const node: React.Requireable<React.ReactNode>;
    export const element: React.Requireable<React.ReactElement>;
    export const symbol: React.Requireable<symbol>;
    export const exact: (props: { [key: string]: React.Requireable<any> }) => React.Requireable<any>;
    export const oneOf: (types: any[]) => React.Requireable<any>;
    export const oneOfType: (types: React.Requireable<any>[]) => React.Requireable<any>;
    export const arrayOf: (type: React.Requireable<any>) => React.Requireable<any[]>;
    export const objectOf: (type: React.Requireable<any>) => React.Requireable<{ [key: string]: any }>;
    export const shape: (type: { [key: string]: React.Requireable<any> }) => React.Requireable<any>;
    export const instanceOf: (expectedClass: any) => React.Requireable<any>;

    export function checkPropTypes(
        propTypes: { [key: string]: React.Requireable<any> },
        props: { [key: string]: any },
        location: string,
        componentName: string,
        getStack?: () => any
    ): void;

    export function resetWarningCache(): void;
}

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