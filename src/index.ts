import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import fs from 'fs';
import { RecordingPart } from './types';
import { SttQueue } from './utils/sttQue';

const app = express();
const port = 3000;
app.use(bodyParser.json());

/**
 * POST endpoint to receive audio recording parts and add them to the queue.
 */
app.post('/records', (req: Request<{}, any, RecordingPart>, res: Response) => {
    const { idRecord, partIndex, isLast, recordingBlock } = req.body;

    // 1. Validate incoming data (basic check)
    if (!idRecord || typeof partIndex !== 'number' || typeof isLast !== 'boolean') {
        return res.status(400).json({ error: 'Missing required fields: idRecord, partIndex, or isLast.' });
    }

    // check if folder exists in output/$idRecord folder make 2 subfolders for stt and ffmpeg
    const folderPath = path.join(__dirname, '..', 'output', idRecord);
    console.log('folderPath', folderPath);
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
        if (!fs.existsSync(path.join(folderPath, 'stt_done'))){
            fs.mkdirSync(path.join(folderPath, 'stt_done'), { recursive: true });
        }
    }

   SttQueue.add(req.body);
    
    res.status(202).json({
        ok: true,
        message: 'Recording part accepted and queued for processing.'
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

export default app;