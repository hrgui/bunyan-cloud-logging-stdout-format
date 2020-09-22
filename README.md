# @hrgui/bunyan-cloud-logging-stdout-format

Formats Bunyan logs to be used for Google Cloud Logging via stdout.

# Quickstart

```
npm install @hrgui/bunyan-cloud-logging-stdout-format
```

# What's the difference between @google-cloud/logging-bunyan and this?

- https://github.com/googleapis/nodejs-logging-bunyan writes to Google Cloud Logging directly.
- `@hrgui/bunyan-cloud-logging-stdout-format` does not. It writes directly to stdout and formats it as per https://cloud.google.com/logging/docs/structured-logging

- https://github.com/googleapis/nodejs-logging-bunyan requires Cloud Log Writer Role since it writes to Google Cloud Logging directly
- `@hrgui/bunyan-cloud-logging-stdout-format` requires whatever is writing to STDOUT to eventually arrive at Cloud Logging. Example: Google Kubernetes Engine: https://cloud.google.com/blog/products/management-tools/using-logging-your-apps-running-kubernetes-engine
