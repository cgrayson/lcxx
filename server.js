const fs = require("fs");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

const app = express();

if (!process.env.LC_API_SUPER) {
  console.log('Required env var LC_API_SUPER not set');
} else {
  app.use(express.static(path.join(__dirname, 'app', 'views')));
}

let lcEnv = 'local';
let accountMap = {};

app.use(cors( { origin: "http://localhost:8081" } ));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const urlMap = {
  development: 'https://app.leadconduit-development.com',
  local: 'http://leadconduit.localhost',
  staging: 'https://app.leadconduit-staging.com',
  production: 'https://app.leadconduit.com'
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
      return [];
    }
  }
}

async function getData(environment, resourcePath, res, apiKey = process.env.LC_API_SUPER) {
  return api('get', environment, resourcePath, {}, res, apiKey);
}

async function putData(environment, resourcePath, data, res, apiKey = process.env.LC_API_SUPER) {
  api('put', environment, resourcePath, data, res, apiKey);
}

async function deleteData(environment, resourcePath, res, apiKey = process.env.LC_API_SUPER) {
  api('delete', environment, resourcePath, {}, res, apiKey);
}

async function postData(environment, resourcePath, data, res, apiKey = process.env.LC_API_SUPER) {
  api('post', environment, resourcePath, data, res, apiKey);
}

app.get('/', function (req,res) {
  // this endpoint will only be hit if app isn't using express.static(path)
  if (!process.env.LC_API_SUPER) {
    return res.send('<pre>Required env var $LC_API_SUPER not set</pre>');
  }
});

app.get('/environment', function (req, res) {
  res.send({ env: lcEnv });
});

app.put('/environment/:env', function (req, res) {
  lcEnv = req.params.env;
  accountMap = {};
  res.sendStatus(200);
});

app.get('/account/:apiKey', async (req, res) => {
  await getData(lcEnv, 'account', res, req.params.apiKey);
})

app.get('/allowlists', async (req, res) => {
  await getData(lcEnv, 'packages/allowlist', res);
})

app.get('/entities', async (req, res) => {
  await getData(lcEnv, 'entities', res);
})

app.get('/accountMap', async function (req, res) {
  // see if the map is already loaded
  if(Object.keys(accountMap).length === 0) {
    const entitiesArray = await api('get', lcEnv, 'entities', {}, null, process.env.LC_API_SUPER);

    entitiesArray.forEach(entity => {
      if (entity.account) {
        accountMap[entity.id] = entity.name;
      }
    });
  }
  res.send(accountMap);
});

app.post('/packages/:packageId', async (req, res) => {
  const data = {
    id: req.params.packageId,
    account_ids: []
  };
  await postData(lcEnv, `packages/allowlist/${req.params.packageId}`, data, res);
});

app.put('/packages/:packageId', async (req, res) => {
  const data = {
    id: req.params.packageId,
    account_ids: req.body.accountIds
  };
  await putData(lcEnv, `packages/allowlist/${req.params.packageId}`, data, res);
});

app.delete('/packages/:packageId', async (req, res) => {
  await deleteData(lcEnv, `packages/allowlist/${req.params.packageId}`, res);
});

app.post('/entities', async (req, res) => {
  await postData(lcEnv, 'entities', req.body, res);
});

app.put('/entities/:entityId', async (req, res) => {
  await putData(lcEnv, `entities/${req.params.entityId}`, req.body, res);
});

app.delete('/entities/:entityId', async (req, res) => {
  await deleteData(lcEnv, `entities/${req.params.entityId}`, res);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
