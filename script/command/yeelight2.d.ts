declare module "yeelight2" {

  namespace Yeelight {
    interface Light {
      toggle(): void

      set_power(mode: 'on' | 'off'): Promise<any>

      name: string
    }
  }

  class Yeelight {
    static discover(callback: (light: Yeelight.Light) => void): void;

    static close(): void
  }

  export = Yeelight;
}
