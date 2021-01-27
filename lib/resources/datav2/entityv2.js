let trade_mapping_v2 = {
    "i": "ID",
    "S": "Symbol",
    "x": "Exchange",
    "p": "Price",
    "s": "Size",
    "t": "Timestamp",
    "c": "Conditions",
    "z": "Tape"
}

let quote_mapping_v2 = {
    "S": "Symbol",
    "bx": "BidExchange",
    "bp": "BidPrice",
    "bs": "BidSize",
    "ax": "AskExchange",
    "ap": "AskPrice",
    "as": "AskSize",
    "t": "Timestamp",
    "c": "Condition",
    "z": "Tape"
}

let bar_mapping_v2 = {
    "S": "Symbol",
    "o": "OpenPrice",
    "h": "HighPrice",
    "l": "LowPrice",
    "c": "ClosePrice",
    "v": "Volume",
    "t": "Timestamp",
}

function AlpacaQuoteV2(data) { 
    return convert(data, quote_mapping_v2)
}

function AlpacaTradeV2(data) {
    return convert(data, trade_mapping_v2)
}

function AlpacaBarV2(data) {
    return convert(data, bar_mapping_v2)
}

function convert(data, mapping) {
    const obj = {};
    for (let key in data) {
        if (mapping.hasOwnProperty(key)) {
            obj[mapping[key]] = data[key];
        } else {
            obj[key] = data[key];
        }
    }
    return obj;
}

module.exports = {
    'AlpacaTradeV2': AlpacaTradeV2,
    'AlpacaQuoteV2': AlpacaQuoteV2,
    'AlpacaBarV2': AlpacaBarV2,
};
