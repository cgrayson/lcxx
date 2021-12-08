const fs = require("fs");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

const path = __dirname + '/app/views/';

if (!process.env.LC_API_SUPER) {
  console.log('Required env var LC_API not set');
  process.exit(2);
}

const TEMP_ENV = 'local';

const app = express();
app.use(express.static(path));

var corsOptions = {
  origin: "http://localhost:8081"
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const urlMap = {
  local: 'http://leadconduit.localhost',
  staging: 'https://app.leadconduit-staging.com'
};

async function api(method, environment, resourcePath, data, res, apiKey) {
  let result = {};
  const config = {
    auth: {
      username: 'X',
      password: apiKey
    },
    data: data,
    headers: {
      Accept: 'application/json'
    },
    method: method,
    url: `${urlMap[environment]}/${resourcePath}`
  }
  try {
    result = await axios(config);
    if(res) {
      res.send(result.data);
    }
    else {
      return result.data;
    }
  }
  catch (e) {
    console.error(`error: ${e}`)
    if(res) {
      res.status(e.response.status).send(e.message);
    }
    else {
      return e;
    }
  }
}

async function getData(environment, resourcePath, res, apiKey = process.env.LC_API_SUPER) {
  return api('get', environment, resourcePath, {}, res, apiKey);
}

async function putData(environment, resourcePath, data, res, apiKey = process.env.LC_API_SUPER) {
  api('put', environment, resourcePath, data, res, apiKey);
}

function cachePath(env = TEMP_ENV) {
  return `${__dirname}/app/cache/${env}.json`;
}

function updateAccountCache(id, name) {
  const cache = require(cachePath());
  cache[id.substr(14)] = name;
  fs.writeFileSync(cachePath(), JSON.stringify(cache, null, 2));
}

app.get('/', function (req,res) {
  res.sendFile(path + "index.html");
});

app.get('/account/:apiKey', async (req, res) => {
  const data = await getData(TEMP_ENV, 'account', null, req.params.apiKey);
  updateAccountCache(data.id, data.name);
  res.send(data);
})

app.get('/allowlists', async (req, res) => {
  await getData(TEMP_ENV, 'packages/allowlist', res);
})

app.get('/entities', async (req, res) => {
  await getData(TEMP_ENV, 'entities', res);
})

app.get('/accountMap', function (req, res) {
  res.sendFile(`${cachePath(TEMP_ENV)}`);
});

app.put('/packages/:packageId', async (req, res) => {
  const data = {
    id: req.params.packageId,
    account_ids: req.body.accountIds.split(',')
  };
  await putData(TEMP_ENV, `packages/allowlist/${req.params.packageId}`, data, res);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
