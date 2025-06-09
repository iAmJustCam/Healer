/**
 * WebSocket Domain Pipeline Declaration
 * 
 * Constitutional compliance: SSOT + DRY + SRP
 * - NO local type definitions
 * - Uses declaration merging pattern ONLY
 */

import {
  WebSocketStatus,
  WebSocketOptions
} from '@types';

// Extend the canonical PipelineParamMap via declaration merging
declare module '@types' {
  /** @internal L2 Pipeline Extension */
  interface PipelineParamMap {
    'websocket': {
      readonly url: string;
      readonly initialStatus?: WebSocketStatus;
      readonly autoConnect?: boolean;
      readonly options?: Partial<WebSocketOptions>;
      readonly debugMode?: boolean;
      readonly messageBufferSize?: number;
      readonly useSecureConnection?: boolean;
      readonly connectionTimeout?: number;
      readonly binaryType?: 'blob' | 'arraybuffer';
    };
  }
}