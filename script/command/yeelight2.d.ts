interface Light {
  toggle(): void
  set_power(mode: 'on'|'off'): Promise<any>
  name: string
}

declare module "yeelight2" {
  class Yeelight {
    static discover(callback: (light: Light) => void): void;
    static close():void

  }

  export = Yeelight;
}