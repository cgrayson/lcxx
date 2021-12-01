const express = require('express')
const axios = require('axios');

const app = express()
const port = 3001

if (!process.env.LC_API) {
  console.log('Required env var LC_API not set');
  process.exit(2);
}

async function getEntities() {
  let result;
  const config = {
    auth: {
      username: 'X',
      password: process.env.LC_API
    },
    headers: {
      Accept: 'application/json'
    }
  }
  try {
    const response = await axios.get('https://app.leadconduit-staging.com/entities', config);
    result = response.data;
  }
  catch (e) {
    console.log(`error: ${e}`)
    result = e.message;
  }

  return result;
}

app.get('/', async (req, res) => {
  const entities = await getEntities();
  console.log(`${entities.length} entities returned`);

  let sample = '<ol>';
  entities.forEach((entity, i) => {
    if (i < 10) {
      sample += `<li>${entity.name} - <code>${entity.id}</code></li>`;
    }
  });
  res.send(sample);
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
