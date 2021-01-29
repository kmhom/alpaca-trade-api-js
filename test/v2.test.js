"use strict";

const { expect, assert } = require("chai");
const alpacaApi = require("../lib/alpaca-trade-api");
const mockServer = require("./support/mock-gomarkets-streaming");

describe("data_stream_v2", () => {
  let gomarkets_mock;
  let alpaca;
  let socket;

  function wait(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  before(() => {
    try {
      gomarkets_mock = new mockServer.StreamingWsMock(8003);
      alpaca = new alpacaApi({
        dataBaseUrl: "http://localhost:8003",
        keyId: "key1",
        secretKey: "secret1",
        feed: "sip",
      });
      socket = alpaca.data_stream_v2;
    } catch (e) {
      console.log(err);
    }
  });

  it("user can auth", async () => {
    let authState;

    socket.onStateChange((state) => {
      authState = state;
    });

    socket.connect();

    await wait(15);
    assert.equal(authState, "authenticated");
  });

  it("try to auth with wrong apiKey and Secret", async () => {
    const alpaca = new alpacaApi({
      dataBaseUrl: "http://localhost:8003",
      keyId: "wrongkey",
      secretKey: "wrongsecret",
      feed: "sip",
    });
    const socket = alpaca.data_stream_v2;
    let error;

    socket.onError((err) => {
      error = err;
    });

    socket.connect();

    await wait(10);
    assert.equal(error, "auth failed");
  });

  it("subscribe for symbol", async () => {
    const expectedSubs = { trades: ["AAPL"], quotes: [], bars: [] };

    socket.subscribeForTrades(["AAPL"]);

    await wait(10);
    const subs = socket.getSubscriptions();
    assert.deepEqual(subs, expectedSubs);
  });

  it("unsubscribe from symbol", async () => {
    const expectedSubs = { trades: [], quotes: [], bars: [] };

    socket.unsubscribeFromTrades("AAPL");

    await wait(10);
    const subs = socket.getSubscriptions();
    assert.deepEqual(subs, expectedSubs);
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
      data = trade;
    });

    socket.subscribeForTrades(["AAPL"]);

    await wait(10);
    assert.deepEqual(data, parsed);
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
      data = quote;
    });

    socket.subscribeForQuotes(["AAPL"]);

    await wait(10);
    assert.deepEqual(data, parsed);
  });

  it("close socket", () => {
    socket.disconnect();
    gomarkets_mock.close();
  });
});
