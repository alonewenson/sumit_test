// const { setTimeout: sleepPromise } = require('timers/promises');
// const fs = require('fs/promises');
// const { randomUUID } = require('crypto');

// class RecordingServer {
//     // Key: idRecord (string), Value: RecordingSession (state)
//     private sessions = new Map<string, RecordingSession>();
//     private outputDir = './output';

//     constructor() {
//         console.log("Server initialized.");
//     }

//     /**
//      * Initializes the state for a new recording session.
//      * @param idRecord The UUID of the recording.
//      * @returns The initialized session object.
//      */
//     private initializeSession(idRecord: string): RecordingSession {
//         const session: RecordingSession = {
//             idRecord,
//             isFinished: false,
//             lastReceivedIndex: -1,
//             lastMergedIndex: -1,
//             processedParts: new Map(),
//             textFile: `${this.outputDir}/${idRecord}_text.txt`,
//             audioFile: `${this.outputDir}/${idRecord}_audio.txt`,
//         };
//         this.sessions.set(idRecord, session);
//         console.log(`[Server] New session started for ${idRecord}.`);
//         return session;
//     }

//     /**
//      * Attempts to merge sequentially available processed parts.
//      * Handles out-of-order completion (Race Conditions).
//      * @param session The recording session to check.
//      */
//     private async attemptOrderedMerge(session: RecordingSession): Promise<void> {
//         let mergedCount = 0;
        
//         while (true) {
//             const nextIndexToMerge = session.lastMergedIndex + 1;
//             const nextPart = session.processedParts.get(nextIndexToMerge);

//             // Check if the next sequential part is ready
//             if (!nextPart || nextPart.isMerged) {
//                 break; // Stop if the next part isn't ready or already merged
//             }

//             console.log(`[MERGE][${session.idRecord}] Merging Part ${nextIndexToMerge}...`);
            
//             // 1. Text Merging (Sequential Append)
//             await fs.appendFile(session.textFile, nextPart.stt.text + '\n');
            
//             // 2. Audio Merging (Sequential Append)
//             await fs.appendFile(session.audioFile, nextPart.ffmpeg.audioChunk + '\n');
            
//             // Update state
//             nextPart.isMerged = true;
//             session.lastMergedIndex = nextIndexToMerge;
//             mergedCount++;
//         }

//         if (mergedCount > 0) {
//              console.log(`[MERGE][${session.idRecord}] Successfully merged ${mergedCount} part(s). New merged index: ${session.lastMergedIndex}`);
//         }
       
//         // Check for final completion
//         this.checkFinalCompletion(session);
//     }

//     /**
//      * Checks if the entire recording session is complete (all parts received and merged).
//      * @param session The recording session to check.
//      */
//     private async checkFinalCompletion(session: RecordingSession): Promise<void> {
//         // Completion is reached if the 'isLast' part was received (session.isFinished)
//         // AND the highest index received (session.lastReceivedIndex) matches the highest index merged.
//         if (session.isFinished && session.lastReceivedIndex === session.lastMergedIndex) {
//             console.log(`\n\n🎉 [COMPLETE][${session.idRecord}] Recording processing finished and successfully merged all ${session.lastReceivedIndex + 1} parts!`);
//             console.log(`   Final Text Output: ${session.textFile}`);
//             console.log(`   Final Audio Output: ${session.audioFile}\n\n`);
//             this.sessions.delete(session.idRecord); // Clean up
//         }
//     }

//     /**
//      * Main server entry point for processing an incoming part.
//      * Handles Concurrent Processing and Queue Management.
//      * @param part The incoming recording part from the Recorder service.
//      */
//     public async processIncomingPart(part: RecordingPart): Promise<void> {
//         try {
//             // Ensure output directory exists
//             await fs.mkdir(this.outputDir, { recursive: true });

//             let session = this.sessions.get(part.idRecord);
//             if (!session) {
//                 session = this.initializeSession(part.idRecord);
//             }

//             // Update session metadata
//             if (part.partIndex > session.lastReceivedIndex) {
//                 session.lastReceivedIndex = part.partIndex;
//             }
//             if (part.isLast) {
//                 session.isFinished = true;
//                 console.log(`[Server][${part.idRecord}] Received final part (Index: ${part.partIndex}).`);
//             }
            
//             const partId = `${part.idRecord}:${part.partIndex}`;
//             console.log(`[Server] Received part ${partId}. Triggering concurrent processing...`);

//             // --- Concurrent Processing (STT and FFMPEG run simultaneously) ---
//             const sttPromise = simulateSTT(part);
//             const ffmpegPromise = simulateFFMPEG(part);

//             const [sttResult, ffmpegResult] = await Promise.all([sttPromise, ffmpegPromise]);
//             // --- Processing complete (may be out of order!) ---

//             // Store the combined processed result
//             session.processedParts.set(part.partIndex, {
//                 stt: sttResult,
//                 ffmpeg: ffmpegResult,
//                 isMerged: false,
//             });
//             console.log(`[Server][${partId}] Both services completed. Result stored.`);

//             // Trigger the ordered merge attempt
//             this.attemptOrderedMerge(session);

//         } catch (error) {
//             console.error(`[Server Error] Failed to process part ${part.idRecord}:${part.partIndex}:`, error);
//         }
//     }
// }


// // --- 4. Recorder Simulator ---

// /**
//  * Simulates the Recorder Service sending parts at random intervals.
//  * @param server The instance of the RecordingServer to send parts to.
//  * @param idRecord The ID of the recording session.
//  * @param totalParts The total number of parts to send.
//  */
// async function simulateRecorder(server: RecordingServer, idRecord: string, totalParts: number): Promise<void> {
//     console.log(`\n[RECORDER][${idRecord}] Starting to send ${totalParts} parts...`);
    
//     const parts: RecordingPart[] = [];
//     for (let i = 0; i < totalParts; i++) {
//         parts.push({
//             idRecord,
//             partIndex: i,
//             isLast: i === totalParts - 1
//         });
//     }

//     // Shuffle the parts to simulate Out-of-Order arrival (Technical Challenge #2)
//     // We only shuffle a subset to ensure part 0 is likely first, but order is not guaranteed.
//     // Example: send 0, then 3, then 1, then 2.
//     // parts.sort(() => Math.random() - 0.5); // Uncomment this line to force completely random order

//     for (const part of parts) {
//         // Send parts at random intervals (1-10 seconds)
//         const delay = Math.floor(Math.random() * 9000) + 1000;
//         await sleepPromise(delay);
//         console.log(`[RECORDER][${idRecord}] Sending Part ${part.partIndex} (Next send in ${(delay / 1000).toFixed(1)}s)...`);
        
//         // Send the part to the server
//         server.processIncomingPart(part);
//     }
    
//     console.log(`[RECORDER][${idRecord}] All parts sent.`);
// }

// // --- 5. Execution ---

// async function main() {
//     const server = new RecordingServer();
//     const idRecord1 = randomUUID();
//     const idRecord2 = randomUUID();
    
//     // Start two concurrent recording sessions to simulate distributed load
//     const session1 = simulateRecorder(server, idRecord1, 4); // 4 parts
//     const session2 = simulateRecorder(server, idRecord2, 3); // 3 parts

//     await Promise.all([session1, session2]);
    
//     // Keep the process alive while the server is processing background tasks
//     console.log("\nAll recorder data sent. Waiting for all concurrent processing and merging to complete...");
// }

// main().catch(console.error);

// // Fix for CJS/TS-Node environment: Adding an explicit CJS export prevents the TS compiler
// // from injecting an "export {}" (ESM syntax) at the end, which causes the SyntaxError.
// module.exports = {};
