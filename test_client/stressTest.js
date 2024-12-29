const WS_URL = process.env.WS_URL;
const socket = new WebSocket(WS_URL);

socket.onopen = function (event) {
  console.log("connected");

  socket.send(
    JSON.stringify({ type: "subscribe", data: { pairs: ["btc_usdt"] } })
  );
  socket.send(
    JSON.stringify({
      type: "order",
      data: { pair: "btc_usdt", type: "sell", price: 90000, quantity: 10 },
    })
  );
  for (let i = 0; i < 50000; i++) {
    const min = 1;
    const max = 100000;
    const randomInt = Math.floor(Math.random() * (max - min + 1)) + min;
    process.stdout.write(randomInt.toString());

    const randomBinary = Math.floor(Math.random() * 2);
    const type = randomBinary ? "buy" : "sell";
    socket.send(
      JSON.stringify({
        type: "order",
        data: {
          pair: "btc_usdt",
          type: type,
          price: randomInt,
          quantity: randomInt,
        },
      })
    );
  }
  socket.send(
    JSON.stringify({
      type: "order",
      data: { pair: "btc_usdt", type: "buy", price: 9001, quantity: 44 },
    })
  );
  socket.send(
    JSON.stringify({
      type: "order",
      data: { pair: "btc_usdt", type: "sell", price: 920, quantity: 10 },
    })
  );
};

socket.onmessage = function (event) {
  console.log(event.data);
};

socket.onclose = function () {
  console.log("closed");
};

socket.onerror = function (err) {
  console.log("err", err);
};
