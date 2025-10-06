import { simulateFFMPEG } from "../services/ffmpg";
import { STTResult } from "../types";

const QUEUE_INTERVAL_MS = 500;
setInterval(ffmpegQueueWorker, QUEUE_INTERVAL_MS);

console.log(
  `FFMPEG Worker started, checking queue every ${QUEUE_INTERVAL_MS}ms.`
);
const ffmpegQueue: STTResult[] = [];

let isProcessing = false;

async function ffmpegQueueWorker() {
  if (isProcessing || ffmpegQueue.length === 0) {
    return; // Already busy or queue is empty
  }

  isProcessing = true;
  const nextPart = ffmpegQueue.shift(); // Get the next item (FIFO)

  if (nextPart) {
    try {
      await simulateFFMPEG(nextPart);
    } catch (error) {
      console.error(
        `[WORKER ERROR] Failed to process part for ${nextPart.idRecord}:`,
        error
      );
    }
  }

  isProcessing = false;
}

export const FfmpegQueue = {
  add: (part: STTResult) => {
    ffmpegQueue.push(part);
    console.log(
      `[FFMPEG QUEUE] Added part to queue. ID: ${part.idRecord}, Index: ${part.partIndex}. Current queue size: ${ffmpegQueue.length}`
    );
  },
};
