"use strict";

const { expect, assert } = require("chai");
const alpacaApi = require("../lib/alpaca-trade-api");
const mockServer = require("./support/mock-streaming");

describe("data_stream_v2", () => {
  let streaming_mock;
  let alpaca;
  let socket;
  let port;
  let status;
  let symbol;

  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  async function waitingForStatus(expected, timeout = 1000) {
    const start = new Date().getTime();
    while (new Date().getTime() <= start + timeout) {
      if (status === expected) {
        return true;
      }
      await sleep(1);
    }
    return false;
  }

  async function waitingFor(expected, fn = null, timeout = 1000) {
    const start = new Date().getTime();
    while (new Date().getTime() <= start + timeout) {
      if (fn) {
        if (JSON.stringify(fn()) === JSON.stringify(expected)) {
          return true;
        }
      } else {
        if (JSON.stringify(symbol) === JSON.stringify(expected)) {
          return true;
        }
      }
      await sleep(1);
    }
    return false;
  }

  before(() => {
    try {
      streaming_mock = new mockServer.StreamingWsMock(8080);
      port = streaming_mock.conn.options.port;
      alpaca = new alpacaApi({
        dataBaseUrl: `http://localhost:${port}`,
        keyId: "key1",
        secretKey: "secret1",
        feed: "sip",
      });
      socket = alpaca.data_stream_v2;
    } catch (e) {
      console.log(err);
    }
  });

  after(() => {
    socket.disconnect();
    streaming_mock.close();
  });

  it("user can auth", async () => {
    socket.onStateChange((state) => {
      status = state;
    });

    socket.connect();
    await waitingForStatus("authenticated").then((res) => {
      expect(res).to.be.true;
    });
  });

  it("try to auth with wrong apiKey and Secret", async () => {
    const alpaca = new alpacaApi({
      dataBaseUrl: `http://localhost:${port}`,
      keyId: "wrongkey",
      secretKey: "wrongsecret",
      feed: "sip",
    });
    const socket = alpaca.data_stream_v2;

    socket.onError((err) => {
      status = err;
    });

    socket.connect();
    waitingForStatus("auth failed").then((res) => {
      expect(res).to.be.true;
    });
  });

  it("subscribe for symbol", async () => {
    const expectedSubs = { trades: ["AAPL"], quotes: [], bars: [] };

    socket.subscribeForTrades(["AAPL"]);

    waitingFor(expectedSubs, () => { return socket.getSubscriptions()}).then((res) => {
      expect(res).to.be.true;
    });
  });

  it("unsubscribe from symbol", async () => {
    const expectedSubs = { trades: [], quotes: [], bars: [] };

    socket.unsubscribeFromTrades("AAPL");

    waitingFor(expectedSubs, () => { return socket.getSubscriptions()}).then((res) => {
      expect(res).to.be.true;
    });
  });

  it("parse streamed trade", async () => {
    let data;
    const parsed = {
      T: "t",
      ID: 1532,
      Symbol: "AAPL",
      Exchange: "Q",
      Price: 144.6,
      Size: 25,
      Timestamp: "2021-01-27T10:35:34.82840127Z",
      Conditions: ["@", "F", "T", "I"],
      Tape: "C",
    };
    socket.onStockTrade((trade) => {
      symbol = trade;
    });

    socket.subscribeForTrades(["AAPL"]);

    waitingFor(parsed).then((res) => {
      expect(res).to.be.true;
    });
  });

  it("parse streamed quote", async () => {
    let data;
    const parsed = {
      T: "q",
      Symbol: "AAPL",
      BidExchange: "Z",
      BidPrice: 139.74,
      BidSize: 3,
      AskExchange: "Q",
      AskPrice: 139.77,
      AskSize: 1,
      Timestamp: "2021-01-28T15:20:41.384564Z",
      Condition: "R",
      Tape: "C",
    };
    socket.onStockQuote((quote) => {
      symbol = quote;
    });

    socket.subscribeForQuotes(["AAPL"]);

    waitingFor(parsed).then((res) => {
      expect(res).to.be.true;
    });
  });
});
