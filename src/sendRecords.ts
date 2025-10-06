import http from 'http';
import { RecordingPart } from './types';

const recordingParts: RecordingPart[] = [
    { idRecord: '1', partIndex: 0, isLast: false, audioBlock: 'a' },
    { idRecord: '1', partIndex: 1, isLast: false, audioBlock: 'b' },
    // { idRecord: '2', partIndex: 2, isLast: false, audioBlock: 'c' },
    // { idRecord: '2', partIndex: 1, isLast: false, audioBlock: 'b' },
    // { idRecord: '2', partIndex: 0, isLast: false, audioBlock: 'a' },
    // { idRecord: '2', partIndex: 3, isLast: false, audioBlock: 'd' },
    // { idRecord: '1', partIndex: 2, isLast: true, audioBlock: 'c' },
    // { idRecord: '2', partIndex: 4, isLast: true, audioBlock: 'e' },
];

function postJson(path: string, data: unknown): Promise<void> {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify(data);

        const req = http.request(
            {
                hostname: 'localhost',
                port: 3000,
                path,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(body),
                },
            },
            (res) => {
                // Drain response
                res.on('data', () => {});
                res.on('end', () => resolve());
            }
        );

        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

async function sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
}

async function main() {
    for (const part of recordingParts) {
        const delayMs = 100//1000 + Math.floor(Math.random() * 2000); // 1-3s
        await sleep(delayMs);
        console.log(`POST /records partIndex=${part.partIndex} delay=${delayMs}ms`);
        await postJson('/records', part);
    }
    console.log('Done sending parts.');
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});