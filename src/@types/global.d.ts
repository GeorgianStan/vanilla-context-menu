declare module '*.scss' {
  const content: { use: (options: unknown) => void; unuse: () => void };
  export = content;
}
