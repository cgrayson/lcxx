const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

const path = __dirname + '/app/views/';

if (!process.env.LC_API_SUPER) {
  console.log('Required env var LC_API not set');
  process.exit(2);
}

const app = express();
app.use(express.static(path));

var corsOptions = {
  origin: "http://localhost:8081"
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const urlMap = {
  staging: 'https://app.leadconduit-staging.com'
};

async function getData(environment, resourcePath, res, apiKey = process.env.LC_API_SUPER) {
  let result = {};
  const config = {
    auth: {
      username: 'X',
      password: apiKey
    },
    headers: {
      Accept: 'application/json'
    }
  }
  try {
    result = await axios.get(`${urlMap[environment]}/${resourcePath}`, config);
    // console.debug(`${result.data.length} ${resourcePath}s returned`);
    res.send(result.data);
  }
  catch (e) {
    console.error(`error: ${e}`)
    res.status(e.response.status).send(e.message);
  }
}

app.get('/account/:apiKey', async (req, res) => {
  await getData('staging', 'account', res, req.params.apiKey);
})

app.get('/allowlists', async (req, res) => {
  await getData('staging', 'packages/allowlist', res);
})

app.get('/entities', async (req, res) => {
  await getData('staging', 'entities', res);
  // const results = response.data;
  // console.log(`${results.length} entities returned`);
  //
  // let sample = []
  // results.forEach((entity, i) => {
  //   if (i < 40) {
  //     sample.push(entity);
  //   }
  // });
  // res.send(sample);
})

app.get('/', function (req,res) {
  res.sendFile(path + "index.html");
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
