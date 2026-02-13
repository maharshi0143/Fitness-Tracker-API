const API_URL = 'http://localhost:3000/api';

async function test(name: string, fn: () => Promise<void>) {
    try {
        process.stdout.write(`Testing ${name}... `);
        await fn();
        console.log('PASS');
    } catch (e: any) {
        console.log('FAIL');
        console.error(e.message);
    }
}

async function request(method: string, path: string, body?: any) {
    const res = await fetch(`${API_URL}${path}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    return { status: res.status, data };
}

async function main() {
    console.log('Starting verification...');

    // 1. Gym Management
    await test('Create Gym (valid)', async () => {
        const { status, data } = await request('POST', '/gyms', {
            name: 'Test Gym ' + Date.now(),
            capacity: 10,
            address: { street: 'Main', city: 'City', country: 'Country' }
        });
        if (status !== 201) throw new Error(`Expected 201, got ${status}: ${JSON.stringify(data)}`);
    });

    await test('Create Gym (invalid capacity)', async () => {
        const { status, data } = await request('POST', '/gyms', {
            name: 'Bad Gym ' + Date.now(),
            capacity: -5,
            address: { street: 'Main', city: 'City', country: 'Country' }
        });
        if (status !== 400) throw new Error(`Expected 400, got ${status}`);
        if (data.error.layer !== 'runtime') throw new Error('Expected runtime error layer');
    });

    // 2. Trainer Assignment
    // (Need trainer and gym IDs)
    // ... (Can implement if needed, requires data setup)

    // 3. Member Enrollment
    // ...

    // 4. Workout
    // ...

    // 5. Metrics
    // ...
}

main();
