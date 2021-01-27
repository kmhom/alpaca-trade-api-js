"use strict";

const ws = require("./resources/datav2/websocket-v2");
const alpacav1 = require("../lib/resources/websockets");
const AlpacaStreamV2Client = ws.AlpacaStreamV2Client;

function AlpacaV2(config = {}) {
  this.configuration = {
    baseUrl:
      config.baseUrl ||
      process.env.APCA_API_BASE_URL ||
      (config.paper
        ? "https://paper-api.alpaca.markets"
        : "https://api.alpaca.markets"),
    dataBaseUrl:
      config.dataBaseUrl ||
      process.env.APCA_API_DATA_BASE_URL ||
      "https://data.alpaca.matkets",
    feed: config.feed || "sip",
    apiKey: config.apiKey || process.env.APCA_API_KEY_ID || "",
    secretKey: config.secretKey || process.env.APCA_API_SECRET_KEY || "",
    verbose: config.verbose || false,
    oauth: config.oauth || process.env.APCA_API_OAUTH || "",
    sePolygon: config.usePolygon ? true : false,
  };

  this.data_stream_v2 = new AlpacaStreamV2Client({
    url: this.configuration.dataBaseUrl,
    feed: this.configuration.feed,
    apiKey: this.configuration.apiKey,
    secretKey: this.configuration.secretKey,
    verbose: this.configuration.verbose,
  });

  this.trade_stream = new alpacav1.AlpacaStreamClient({
    url: this.configuration.baseUrl,
    apiKey: this.configuration.apiKey,
    secretKey: this.configuration.secretKey,
    oauth: this.configuration.oauth,
    usePolygon: this.configuration.usePolygon,
  });
}

module.exports = {
  AlpacaV2: AlpacaV2,
};
