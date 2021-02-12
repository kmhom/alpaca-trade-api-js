const axios = require("axios").default;

const entityv2 = require("./entityv2");

const v2MaxLimit = 10000;

function dataHttpRequest(url, queryParams, config) {
  const { dataBaseUrl, keyId, secretKey, oauth } = config;
  const resp = axios
    .get(`${dataBaseUrl}${url}`, {
      params: queryParams,
      headers:
        oauth !== ""
          ? {
              "content-type": "application/json",
              Authorization: "Bearer " + oauth,
            }
          : {
              "content-type": "application/json",
              "APCA-API-KEY-ID": keyId,
              "APCA-API-SECRET-KEY": secretKey,
            },
    })
    .catch((err) => {
      throw err;
    });
  return resp;
}

async function* getDataV2(endpoint, symbol, options = {}, config) {
  let pageToken = null;
  let totalItems = 0;
  const limit = options.limit;
  while (true) {
    let actualLimit = null;
    if (limit) {
      actualLimit = Math.min(limit - totalItems, v2MaxLimit);
      if (actualLimit < 1) {
        break;
      }
      if (actualLimit > v2MaxLimit) {
        actualLimit = v2MaxLimit;
      }
    }
    let params = options;
    Object.assign(params, { limit: actualLimit, pageToken: pageToken });
    const resp = await dataHttpRequest(
      `/v2/stocks/${symbol}/${endpoint}`,
      params,
      config
    );
    const items = resp.data[endpoint];
    for (let item of items) {
      yield item;
    }
    totalItems += items.length;
    pageToken = resp.data.next_page_token;
    if (!pageToken) {
      break;
    }
  }
}

async function* getTrades(symbol, start, end, limit, config) {
  const trades = getDataV2(
    "trades",
    symbol,
    { start: start, end: end, limit: limit },
    config
  );
  for await (let trade of trades) {
    yield entityv2.AlpacaTradeV2(trade);
  }
}

async function* getQuotes(symbol, start, end, limit, config) {
  const quotes = getDataV2(
    "quotes",
    symbol,
    { start: start, end: end, limit: limit },
    config
  );
  for await (let quote of quotes) {
    yield entityv2.AlpacaQuoteV2(quote);
  }
}

async function* getBars(
  symbol,
  start,
  end,
  limit,
  timeframe,
  adjustment,
  config
) {
  const bars = getDataV2(
    "bars",
    symbol,
    {
      start: start,
      end: end,
      limit: limit,
      timeframe: timeframe,
      adjustment: adjustment,
    },
    config
  );
  for await (let bar of bars) {
    yield entityv2.AlpacaBarV2(bar);
  }
}

module.exports = {
  getTrades,
  getQuotes,
  getBars,
};
