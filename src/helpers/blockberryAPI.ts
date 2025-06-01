const API_TOKEN = 'pt0KWv6G0myckUcR1lLpyRq1uvx6O2';
const WALLET_ADDRESS = '0xbe1d2b816cf0419257949f780f964ffcc1dff0d7c7afa26908d653b5c44f016c';

const url = `https://api.blockberry.one/sui/v1/accounts/${WALLET_ADDRESS}/balance`;

const options = {
    method: 'GET',
    headers: {accept: '*/*', 'x-api-key': 'pt0KWv6G0myckUcR1lLpyRq1uvx6O2'}
  };
  
  fetch(url, options)
    .then(res => res.json())
    .then(res => console.log(res))
    .catch(err => console.error(err));
