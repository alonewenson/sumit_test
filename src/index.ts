import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { RecordingPart } from './types';
import { SttQueue } from './utils/sttQue';
import { mockDB } from './utils/db';

const app = express();
const port = 3000;
app.use(bodyParser.json());

//clear the mock db
mockDB.clear();

/**
 * POST endpoint to receive audio recording parts and add them to the queue.
 */
app.post('/records', (req: Request<{}, any, RecordingPart>, res: Response) => {
    const { idRecord, partIndex, isLast, audioBlock } = req.body;

    // 1. Validate incoming data (basic check)
    if (!idRecord || typeof partIndex !== 'number' || typeof isLast !== 'boolean') {
        return res.status(400).json({ error: 'Missing required fields: idRecord, partIndex, or isLast.' });
    }

    // check if record exist in mock db
    const recordExists = mockDB.get(idRecord, partIndex);
    if (recordExists) {
        return res.status(400).json({ error: 'Record already exists.' });
    }

    mockDB.set(idRecord, partIndex, {
        isLast: isLast,
        audioBlock: audioBlock,
        textBlock: "",
        status: "pending",
    });

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