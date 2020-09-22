import { Writable } from "stream";

// Map of Stackdriver logging levels.
const BUNYAN_TO_STACKDRIVER: Map<number, string> = new Map([
  [60, "CRITICAL"],
  [50, "ERROR"],
  [40, "WARNING"],
  [30, "INFO"],
  [20, "DEBUG"],
  [10, "DEBUG"],
]);

export interface ServiceContext {
  /**
   * An identifier of the service, such as the name of the executable, job, or
   * Google App Engine service name.
   */
  service?: string;
  /**
   * Represents the version of the service.
   */
  version?: string;
}

export interface HttpRequest {
  requestMethod?: string;
  requestUrl?: string;
  requestSize?: number;
  status?: number;
  responseSize?: number;
  userAgent?: string;
  remoteIp?: string;
  serverIp?: string;
  referer?: string;
  latency?: string | { seconds: number; nanos: number };
  cacheLookup?: boolean;
  cacheHit?: boolean;
  cacheValidatedWithOriginServer?: boolean;
  cacheFillBytes?: number;
  protocol?: string;
}

export interface BunyanLogRecord {
  message?: string;
  msg?: string;
  err?: Error;
  serviceContext?: ServiceContext;
  level?: string;
  time?: Date;
  httpRequest?: HttpRequest;
  labels?: {};
  [key: string]: any;
}

export interface StackdriverEntryMetadata {
  resource?: MonitoredResource;
  timestamp?: Date;
  severity?: string;
  httpRequest?: HttpRequest;
  labels?: {};
  trace?: {};
}

export interface MonitoredResource {
  type?: string;
  labels?: { [key: string]: string };
}

export class CloudLoggingStream extends Writable {
  bunyanReadable: boolean = false;

  constructor(opts) {
    super(opts);
    this.bunyanReadable = opts?.bunyanReadable || this.bunyanReadable;
  }

  stream(level) {
    return { level, stream: this as Writable };
  }

  /**
   * Format a bunyan record into a Stackdriver log entry.
   */
  private formatEntry_(record: string | BunyanLogRecord) {
    if (typeof record === "string") {
      return record;
    }

    if (!record.message) {
      if (record.err && record.err.stack) {
        record.message = record.err.stack;
      } else if (record.msg) {
        record.message = record.msg;
        if (!this.bunyanReadable) {
          delete record.msg;
        }
      }
    }

    const entryMetadata: StackdriverEntryMetadata = {
      timestamp: record.time,
      severity: BUNYAN_TO_STACKDRIVER.get(Number(record.level)),
    };

    if (record.httpRequest) {
      entryMetadata.httpRequest = record.httpRequest;
      delete record.httpRequest;
    }

    const proper = CloudLoggingStream.properLabels(record.labels);
    if (record.labels && proper) {
      entryMetadata.labels = record.labels;
      delete record.labels;
    }

    return {
      ...entryMetadata,
      ...record,
    };
  }

  static properLabels(labels: any) {
    if (typeof labels !== "object") return false;
    for (const prop in labels) {
      if (typeof labels[prop] !== "string") {
        return false;
      }
    }
    return true;
  }

  _write(chunk, encoding, cb) {
    try {
      const record = JSON.parse(chunk);
      process.stdout.write(JSON.stringify(this.formatEntry_(record)) + "\n");
    } catch (e) {
      process.stdout.write(chunk);
    }
    cb();
  }
}
