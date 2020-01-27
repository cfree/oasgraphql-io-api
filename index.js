const express = require('express');
const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const graphqlHTTP = require('express-graphql')
const { createGraphQlSchema } = require('openapi-to-graphql');
const uuidv4 = require('uuid/v4');

let memorySchemas = {};

const app = express();
const jsonParser = bodyParser.json();
app.use(jsonParser);

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

module.exports.handler = serverless(app);

if (process.env.NODE_ENV === 'development') {
  app.listen(4001, () => console.log('App listening on port 4001!'));
}
