import { EventEmitter } from "events";

const globalForEvents = globalThis;
const emitter = globalForEvents.__sensorEmitter ?? new EventEmitter();

if (process.env.NODE_ENV !== "production") globalForEvents.__sensorEmitter = emitter;

export default emitter;