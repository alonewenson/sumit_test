import path from "path";
import { simulateFFMPEG } from "../external/ffmpg";
import { STTResult } from "../types";
import fs from "fs";


const QUEUE_INTERVAL_MS = 500;
setInterval(ffmpegQueueWorker, QUEUE_INTERVAL_MS);

console.log(`FFMPEG Worker started, checking queue every ${QUEUE_INTERVAL_MS}ms.`);
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
            // if the file does not exist, create it
            const outputFile = path.join(__dirname, "..", "output", nextPart.idRecord, "done.txt");
            if (nextPart.partIndex === 0) {
                const data = fs.readFileSync(nextPart.filename);
                fs.writeFileSync(outputFile, data);
            }
            else {
                // find if the next file is ready
                await simulateFFMPEG(nextPart.idRecord, outputFile, nextPart.filename);   
            }

        } catch (error) {
            console.error(`[WORKER ERROR] Failed to process part for ${nextPart.idRecord}:`, error);
        }
    }

    isProcessing = false;
}


export const FfmpegQueue = {
    add: (part:     STTResult) => {
        ffmpegQueue.push(part);
        console.log(`[FFMPEG QUEUE] Added part to queue. ID: ${part.idRecord}, Index: ${part.filename}. Current queue size: ${ffmpegQueue.length}`);
    },
}