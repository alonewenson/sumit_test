import { simulateFFMPEG } from "../services/ffmpg";
import { RecordingPart } from "../types";

const QUEUE_INTERVAL_MS = 500;
setInterval(ffmpegQueueWorker, QUEUE_INTERVAL_MS);

const ffmpegQueue: RecordingPart[] = [];

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
        `FFMPEG WORKER ERROR Failed to process part for ${nextPart.idRecord}:`,
        error
      );
    }
  }

  isProcessing = false;
}

export const FfmpegQueue = {
  add: (part: RecordingPart) => {
    ffmpegQueue.push(part);
    console.log(
      `FFMPEG QUEUE Added part to queue. ID: ${part.idRecord}, Index: ${part.partIndex}. Current queue size: ${ffmpegQueue.length}`
    );
  },
};
