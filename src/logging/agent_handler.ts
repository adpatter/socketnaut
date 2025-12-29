import * as stream from "node:stream";
import { Peer } from "@far-analytics/port-peer";
import { Node, LogContext, Config } from "streams-logger";

export class AgentHandler extends Node<LogContext, never> {
  constructor(peer: Peer, callable: string, streamOptions?: stream.WritableOptions) {
    super(
      new stream.Writable({
        ...Config.getWritableOptions(true),
        ...streamOptions,
        ...{
          objectMode: true,
          write: (
            chunk: LogContext,
            encoding: BufferEncoding,
            callback: stream.TransformCallback
          ) => {
            (async () => {
              await peer.call(callable, {
                message: chunk.message,
                level: chunk.level,
                isotime: chunk.isotime,
                pid: chunk.pid,
                hostname: chunk.hostname,
                threadid: chunk.threadid
              });
              callback();
            })().catch((reason: unknown) => {
              callback(reason instanceof Error ? reason : new Error(String(reason)));
            });
          },
        },
      })
    );
  }
}
