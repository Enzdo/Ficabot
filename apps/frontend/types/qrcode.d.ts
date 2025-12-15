declare module 'qrcode' {
  export function toCanvas(
    canvas: HTMLCanvasElement,
    text: string,
    options?: any,
    callback?: (error: Error | null | undefined) => void
  ): Promise<void>;
  
  export function toDataURL(
    text: string,
    options?: any,
    callback?: (error: Error | null | undefined, url: string) => void
  ): Promise<string>;
  
  export function toString(
    text: string,
    options?: any,
    callback?: (error: Error | null | undefined, string: string) => void
  ): Promise<string>;
}
