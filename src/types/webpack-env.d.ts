interface RequireContext {
  keys(): string[];
  (id: string): any;
  resolve(id: string): string;
  id: string;
}

interface NodeRequire {
  context(
    directory: string,
    useSubdirectories?: boolean,
    regExp?: RegExp,
  ): RequireContext;
}
