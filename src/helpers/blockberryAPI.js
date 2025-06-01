var API_TOKEN = 'pt0KWv6G0myckUcR1lLpyRq1uvx6O2';
var WALLET_ADDRESS = '0xbe1d2b816cf0419257949f780f964ffcc1dff0d7c7afa26908d653b5c44f016c';
var url = "https://api.blockberry.one/sui/v1/accounts/".concat(WALLET_ADDRESS, "/balance");
console.log(url);
var options = {
    method: 'GET',
    headers: { accept: '*/*', 'x-api-key': 'pt0KWv6G0myckUcR1lLpyRq1uvx6O2' }
};
fetch(url, options)
    .then(function (res) { return res.json(); })
    .then(function (res) { return console.log(res); })
    .catch(function (err) { return console.error(err); });
