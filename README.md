# @hrgui/bunyan-cloud-logging-stdout-format

Formats Bunyan logs that output to stdout to be easily picked up by Google Cloud Logging.
_Note: it will make it harder for bunyan cli to parse because it does not contain "msg"_

# Quickstart

```
npm install @hrgui/bunyan-cloud-logging-stdout-format
```

```js
const {
  CloudLoggingStream,
} = require("@hrgui/bunyan-cloud-logging-stdout-format");
const bunyan = require("bunyan");

const logger = bunyan.createLogger({
  name: "myapp",
  streams: [new CloudLoggingStream().stream("info")],
});

logger.info("hello world");
```

```bash
{"timestamp":"2020-09-22T06:58:46.564Z","severity":"INFO","name":"myapp","hostname":"harman-comp.local","pid":20499,"level":30,"time":"2020-09-22T06:58:46.564Z","v":0,"message":"hello world"}
```

# What's the difference between @google-cloud/logging-bunyan and this?

- https://github.com/googleapis/nodejs-logging-bunyan writes to Google Cloud Logging directly.
- `@hrgui/bunyan-cloud-logging-stdout-format` does not. It writes directly to stdout and formats it as per https://cloud.google.com/logging/docs/structured-logging

- https://github.com/googleapis/nodejs-logging-bunyan requires Cloud Log Writer Role since it writes to Google Cloud Logging directly
- `@hrgui/bunyan-cloud-logging-stdout-format` requires whatever is writing to STDOUT to eventually arrive at Cloud Logging. Example: Google Kubernetes Engine: https://cloud.google.com/blog/products/management-tools/using-logging-your-apps-running-kubernetes-engine
