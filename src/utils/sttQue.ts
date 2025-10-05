import { RecordingPart } from "../types";
import { simulateSTT } from "../external/stt";
import { FfmpegQueue } from "./ffmpgQue";

const QUEUE_INTERVAL_MS = 500;
setInterval(sttQueueWorker, QUEUE_INTERVAL_MS);
console.log(`STT Worker started, checking queue every ${QUEUE_INTERVAL_MS}ms.`);



const sttQueue: RecordingPart[] = [];

// Flag to prevent the worker from starting multiple processing jobs concurrently
let isProcessing = false;

/**
 * The background worker that pulls items from the queue and calls simulateSTT.
 */
async function sttQueueWorker() {
    if (isProcessing || sttQueue.length === 0) {
        return; // Already busy or queue is empty
    }

    isProcessing = true;
    const nextPart = sttQueue.shift(); // Get the next item (FIFO)

    if (nextPart) {
        try {
            // Await the STT simulation before moving to the next item
            const sttResult = await simulateSTT(nextPart);
            // push to ffmpeg queue
            FfmpegQueue.add(sttResult);
        } catch (error) {
            console.error(`[WORKER ERROR] Failed to process part for ${nextPart.idRecord}:`, error);
            // Optionally, implement retry logic here (e.g., push back to queue)
        }
    }

    isProcessing = false;
}

export const SttQueue = {
    add: (part: RecordingPart) => {
        sttQueue.push(part);
        console.log(`[STTQUEUE] Added part to queue. ID: ${part.idRecord}, Index: ${part.partIndex}. Current queue size: ${sttQueue.length}`);
    },
}
 

