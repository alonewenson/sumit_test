import { RecordingPart } from "../types";
import { simulateSTT } from "../services/stt";

const QUEUE_INTERVAL_MS = 500;
setInterval(sttQueueWorker, QUEUE_INTERVAL_MS);

const sttQueue: RecordingPart[] = [];

let isProcessing = false;

async function sttQueueWorker() {
  if (isProcessing || sttQueue.length === 0) {
    return;
  }

  isProcessing = true;
  const nextPart = sttQueue.shift();

  if (nextPart) {
    try {
      await simulateSTT(nextPart);
    } catch (error) {
      console.error(
        `STT WORKER ERROR Failed to process part for ${nextPart.idRecord}:`,
        error
      );
    }
  }

  isProcessing = false;
}

export const SttQueue = {
  add: (part: RecordingPart) => {
    sttQueue.push(part);
    console.log(
      `STTQUEUE Added part to queue. ID: ${part.idRecord}, Index: ${part.partIndex}. Current queue size: ${sttQueue.length}`
    );
  },
};
