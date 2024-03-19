import { profiles } from "../data";
import { ProcessListEnum } from "./enums";

self.onmessage = (e: MessageEvent<string>) => {
  console.log("[Worker] count message received:", e.data);
  if (e.data === ProcessListEnum.count) {
    const findLength = profiles.length;
    self.postMessage(findLength);
  }
};
export {};
