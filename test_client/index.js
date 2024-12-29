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

  socket.send(
    JSON.stringify({
      type: "order",
      data: { pair: "btc_usdt", type: "buy", price: 90010, quantity: 44 },
    })
  );
  socket.send(
    JSON.stringify({
      type: "order",
      data: { pair: "btc_usdt", type: "sell", price: 920, quantity: 10 },
    })
  );
  socket.send(
    JSON.stringify({
      type: "order",
      data: { pair: "btc_usdt", type: "buy", price: 998046, quantity: 44 },
    })
  );
};

socket.onmessage = function (event) {
  const message = JSON.parse(event.data);
  if (message.type === "fullOrderBook") {
    // Tam orderBook'u al
    orderBook = message.data;
    console.log("Tam orderBook alındı:", orderBook);
  }
  console.log(message);
  //process.stdout.write(message.data[0].toString());
};

socket.onclose = function () {
  console.log("WebSocket bağlantısı kapandı, yeniden bağlanıyor...");
};

socket.onerror = function (err) {
  console.log(err);
};
