declare module '*.scss' {
  const content: { [className: string]: string };
  export = content;
}

declare module '*.pug' {
  const value: any;
  export default value;
}
