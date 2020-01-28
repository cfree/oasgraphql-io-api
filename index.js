const express = require('express');
const bodyParser = require('body-parser');
const graphqlHTTP = require('express-graphql')
const { createGraphQlSchema } = require('openapi-to-graphql');
const uuidv4 = require('uuid/v4');
const cors = require('cors');

let memorySchemas = {};
const port = process.env.PORT || 4001;

const app = express();
const jsonParser = bodyParser.json();
app.use(jsonParser);
app.use(cors());

app.use('/graphql/:schemaId', (req, res) => graphqlHTTP({
  schema: memorySchemas[req.params.schemaId],
  graphiql: true
})(req, res));

app.post('/convert', async (req, res, next) => {
  const oas = req.body;

  try {
    const data = await createGraphQlSchema(oas);
    const id = uuidv4();
    const results = {
      id,
      report: data.report,
    }

    memorySchemas = {
      ...memorySchemas,
      [id]: data.schema,
    };
    
    res.send(results);
  } catch (e) {
    next(e);
  }
});

app.listen(port, () => console.log(`App listening on port ${port}!`));
