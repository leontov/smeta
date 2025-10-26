declare module 'react' {
  export interface FC<P = Record<string, unknown>> {
    (props: P): JSX.Element | null;
  }
  export type ReactNode = JSX.Element | string | number | boolean | null | undefined | ReactNode[];
  export const useState: <T>(initial: T) => [T, (next: T | ((prev: T) => T)) => void];
  export const useEffect: (effect: () => void | (() => void), deps?: unknown[]) => void;
  export const useMemo: <T>(factory: () => T, deps: unknown[]) => T;
  export const useCallback: <T extends (...args: never[]) => unknown>(callback: T, deps: unknown[]) => T;
  export const useRef: <T>(initial: T) => { current: T };
  const React: {
    createElement: (...args: unknown[]) => JSX.Element;
    Fragment: any;
  };
  export default React;
}

declare module 'react/jsx-runtime' {
  export const Fragment: any;
  export function jsx(type: any, props: any, key?: any): any;
  export function jsxs(type: any, props: any, key?: any): any;
}

declare global {
  namespace JSX {
    type Element = any;
    interface IntrinsicElements {
      [elementName: string]: any;
    }
  }
}

declare module 'react-native' {
  export const ActivityIndicator: any;
  export const FlatList: any;
  export const View: any;
  export const Text: any;
  export const TextInput: any;
  export const ScrollView: any;
  export const StyleSheet: { create: (styles: Record<string, unknown>) => Record<string, unknown> };
  export const TouchableOpacity: any;
  export const RefreshControl: any;
  export type GestureResponderEvent = any;
}

declare module 'react-native-gesture-handler' {
  export const TouchableOpacity: any;
}

declare module 'react-native-safe-area-context' {
  export const SafeAreaProvider: ({ children }: { children?: any }) => any;
}

declare module '@react-navigation/native' {
  export const NavigationContainer: ({ children }: { children?: any }) => any;
  export const useFocusEffect: (effect: () => void | (() => void)) => void;
}

declare module '@react-navigation/native-stack' {
  export type NativeStackScreenProps<T extends Record<string, unknown>, K extends keyof T> = {
    navigation: any;
    route: { params: T[K] };
  };
  export function createNativeStackNavigator<T extends Record<string, unknown>>(): {
    Navigator: ({ children, screenOptions, initialRouteName }: any) => any;
    Screen: (props: any) => any;
  };
}

declare module 'expo-status-bar' {
  export const StatusBar: (props: any) => any;
}

declare module 'expo-asset' {
  export class Asset {
    localUri?: string;
    static fromModule(moduleId: unknown): Asset;
    downloadAsync(): Promise<Asset>;
  }
}

declare module 'expo-sqlite' {
  export interface SQLResultSetRowList {
    length: number;
    item: (index: number) => any;
  }
  export interface SQLResultSet {
    rows: SQLResultSetRowList;
  }
  export interface SQLTransaction {
    executeSql(
      sqlStatement: string,
      args?: unknown[] | null,
      callback?: (transaction: SQLTransaction, resultSet: SQLResultSet) => void,
      errorCallback?: (transaction: SQLTransaction, error: Error) => boolean
    ): void;
  }
  export interface SQLiteDatabase {
    transaction(
      callback: (transaction: SQLTransaction) => void,
      errorCallback?: (error: Error) => void,
      successCallback?: () => void
    ): void;
    readTransaction(
      callback: (transaction: SQLTransaction) => void,
      errorCallback?: (error: Error) => void,
      successCallback?: () => void
    ): void;
  }
  export function openDatabase(name?: string): SQLiteDatabase;
}

declare module 'uuid' {
  export function v4(): string;
}

declare module 'zustand' {
  type StateCreator<T> = (
    set: (partial: Partial<T> | ((state: T) => Partial<T>)) => void,
    get: () => T
  ) => T;
  interface UseStore<T> {
    (): T;
    <U>(selector: (state: T) => U): U;
    getState: () => T;
    setState: (partial: Partial<T> | ((state: T) => Partial<T>)) => void;
  }
  const create: <T>(creator: StateCreator<T>) => UseStore<T>;
  export default create;
}

declare module 'expo-file-system' {
  export const FileSystem: unknown;
}

declare module 'expo' {
  const Expo: unknown;
  export default Expo;
}

declare module '*.json' {
  const value: any;
  export default value;
}

declare function fetch(input: any, init?: any): Promise<{ json: () => Promise<any> }>;
declare function require(path: string): any;
