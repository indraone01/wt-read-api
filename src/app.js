const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const morgan = require('morgan');
const cors = require('cors');
const YAML = require('yamljs');
const app = express();
const config = require('./config');
const { HttpError, HttpInternalError, Http404Error } = require('./errors');
const { version } = require('../package.json');
const { hotelsRouter } = require('./routes/hotels');

const swaggerDocument = YAML.load(path.resolve('./docs/swagger.yaml'));
 
// Swagger docs

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Generic middlewares
app.use(cors());
app.use(bodyParser.json());

// Logging only when not in test mode
if (config.logHttpTraffic) {
  app.use(morgan(':remote-addr :remote-user [:date[clf]] :method :url HTTP/:http-version :status :res[content-length] - :response-time ms', {
    skip: function (req, res) {
      return res.statusCode < 400;
    },
    stream: process.stderr,
  }));

  app.use(morgan(':remote-addr :remote-user [:date[clf]] :method :url HTTP/:http-version :status :res[content-length] - :response-time ms', {
    skip: function (req, res) {
      return res.statusCode >= 400;
    },
    stream: process.stdout,
  }));
}

// Root handler
app.get('/', (req, res) => {
  const response = {
    docs: config.baseUrl + '/docs',
    info: 'https://github.com/windingtree/wt-read-api/blob/master/README.md',
    version,
    config: process.env.WT_CONFIG,
    wtIndexAddress: config.wtIndexAddress,
  };
  res.status(200).json(response);
});

// Router
app.use(hotelsRouter);

// 404 handler
app.use('*', (req, res, next) => {
  next(new Http404Error());
});

// Error handler
app.use((err, req, res, next) => {
  if (!(err instanceof HttpError)) {
    config.logger.error(err.stack);
    err = new HttpInternalError();
  }

  res.status(err.status).json(err.toPlainObject());
});

module.exports = {
  app,
};
