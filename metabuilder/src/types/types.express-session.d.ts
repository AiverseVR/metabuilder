// This file is used to extend the express-session module with custom types
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as session from 'express-session';

declare module 'express-session' {
  interface SessionData {
    nonce?: string;
    address?: string;
  }
}
