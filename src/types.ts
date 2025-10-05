

export interface RecordingPart {
    idRecord: string;    // UUID for the recording session
    partIndex: number;   // Sequential part number (0, 1, 2, ...)
    isLast: boolean;     // Indicates if this is the final part
    recordingBlock: string; // Simulated base64 or audio chunk data
}

export interface STTResult {
    idRecord: string;
    partIndex: number;
    filename: string;
    isLast: boolean;
}


export interface FFMPEGResult {
    idRecord: string;
    filename: string;
}


export interface ProcessedPart {
    stt: string;
    ffmpeg: FFMPEGResult;
    isMerged: boolean;
}


export interface RecordingSession {
    // Metadata
    idRecord: string;
    isFinished: boolean; // True if the 'isLast' part has been received

    // Tracking progress
    lastReceivedIndex: number;   // The highest partIndex received so far
    lastMergedIndex: number;     // The highest partIndex successfully merged (initial -1)

    // Data storage (handles out-of-order processing completion)
    processedParts: Map<number, ProcessedPart>;
    
    // File paths for final output
    textFile: string;
    audioFile: string;
}