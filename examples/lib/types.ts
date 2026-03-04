export interface ExampleEntry {
  value: string;
  name: string;
  group: 'Core' | 'Figma' | 'Hello World' | 'Stitch';
  envVars: string[];
}
