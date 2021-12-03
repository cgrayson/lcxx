const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

const path = __dirname + '/app/views/';

const app = express();

app.use(express.static(path));

var corsOptions = {
  origin: "http://localhost:8081"
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// const db = require("./app/models");
//
// db.sequelize.sync();

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

app.get('/entities', async (req, res) => {
  const entities = await getEntities();
  console.log(`${entities.length} entities returned`);

  let sample = []
  entities.forEach((entity, i) => {
    if (i < 40) {
      sample.push(entity);
    }
  });
  res.send(sample);
})

app.get('/', function (req,res) {
  res.sendFile(path + "index.html");
});

// require("./app/routes/turorial.routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
