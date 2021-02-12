"use strict";

const { expect } = require("chai");
const api = require("../lib/alpaca-trade-api");
const mock = require("./support/mock-server");

describe("data v2 rest", () => {
  let alpaca;

  before(() => {
    alpaca = new api(mock.getConfig());
  });

  it("get trades with paging", async () => {
    let resp = alpaca.getTradesV2(
      "AAPL",
      "2021-02-08",
      "2021-02-10",
      10,
      alpaca.configuration
    );
    const trades = [];

    for await (let t of resp) {
      trades.push(t);
    }

    expect(trades.length).equal(10);
    expect(trades[0]).to.have.all.keys([
      "ID",
      "Exchange",
      "Price",
      "Size",
      "Timestamp",
      "Conditions",
      "Tape",
    ]);
  });

  it("get quotes", async () => {
    let resp = alpaca.getQuotesV2(
      "AAPL",
      "2021-02-08",
      "2021-02-10",
      3,
      alpaca.configuration
    );
    const quotes = [];

    for await (let q of resp) {
      quotes.push(q);
    }

    expect(quotes.length).equal(3);
    expect(quotes[0]).to.have.all.keys([
      "BidExchange",
      "BidPrice",
      "BidSize",
      "AskExchange",
      "AskPrice",
      "AskSize",
      "Timestamp",
      "Condition",
    ]);
  });

  it("get bars", async () => {
    let resp = alpaca.getBarsV2(
      "AAPL",
      "2021-02-01",
      "2021-02-10",
      2,
      "1Day",
      "all",
      alpaca.configuration
    );
    const bars = [];

    for await (let b of resp) {
      bars.push(b);
    }

    expect(bars.length).equal(2);
    expect(bars[0]).to.have.all.keys([
      "OpenPrice",
      "HighPrice",
      "LowPrice",
      "ClosePrice",
      "Volume",
      "Timestamp",
    ]);
  });
});
