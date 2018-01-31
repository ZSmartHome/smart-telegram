declare module "yeelight2" {

  namespace Yeelight {
    interface Light {
      toggle(): void

      set_power(mode: 'on' | 'off'): Promise<any>

      name: string
    }

    interface Closable {
      close(): void
    }
  }

  class Yeelight {
    static discover(callback: (this: Yeelight.Closable, light: Yeelight.Light) => void): void;

    static close(): void
  }

  export = Yeelight;
}
