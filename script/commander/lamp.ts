import * as Yeelight from 'yeelight2';

const tryToConnectLamp = (): Promise<Yeelight.Light> => new Promise<Yeelight.Light>((success, fail) => {
  const timer = setTimeout(() => fail(`Couldn't find lamp in 2000ms`), 2000);
  Yeelight.discover(function(myLight) {
    this.close();
    clearTimeout(timer);
    success(myLight);
  });
});

const connect = (): Promise<Yeelight.Light> => {
  const connection = tryToConnectLamp();
  connection.catch((err) => {
    console.error(`Failed to connect to lamp: ${err}`);
    err.exit();
    console.log(`Connection to lamp closed`);
  });
  return connection;
};

connect().then((it) => {
  it.set_rgb(0x0000FF);
});

export {connect};
