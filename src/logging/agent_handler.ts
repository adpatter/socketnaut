import * as stream from "node:stream";
import { Peer } from "@far-analytics/port-peer";
import { Node, LogContext, SyslogLevelT, Config } from "streams-logger";

export class AgentHandler extends Node<LogContext<string, SyslogLevelT>, never> {
  constructor(peer: Peer, callable: string, streamOptions?: stream.WritableOptions) {
    super(
      new stream.Writable({
        ...Config.getWritableOptions(true),
        ...streamOptions,
        ...{
          objectMode: true,
          write: (
            chunk: LogContext<string, SyslogLevelT>,
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
                threadId: chunk.threadid,
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
