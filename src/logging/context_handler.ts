import * as stream from "node:stream";
import { Node, LogContext, Config } from "streams-logger";

export class ContextHandler extends Node<LogContext, LogContext> {
  constructor(streamOptions?: stream.TransformOptions) {
    super(
      new stream.PassThrough({
        ...Config.getDuplexOptions(true, true),
        ...streamOptions,
        ...{
          readableObjectMode: true,
          writableObjectMode: true,
        },
      })
    );
  }

  public write = async (logContext: LogContext): Promise<void> => {
    try {
      await super._write(logContext);
    } catch (err) {
      if (err instanceof Error) {
        Config.errorHandler(err);
      }
    }
  };
}
