import test from 'tape';
import { table } from 'template-literal-table';
import { Graph } from './Graph';

test('Graph - initial', async (t) => {
    const graph = new Graph<unknown>();

    t.deepEqual(graph.sources, new Set(), 'it has no sources');
    t.deepEqual(graph.destinations, new Set(), 'it has no destinations');
    t.deepEqual(graph.starters, new Set(), 'it has no starters');
    t.deepEqual(graph.stoppers, new Set(), 'it has no stoppers');
    t.deepEqual(await graph.paths(), [], 'it has no paths()');
    t.deepEqual(await graph.shortest(), undefined, 'it has no shortest()');

    t.end();
});

async function runner<T>(t: test.Test, values: Array<T>): Promise<Graph<T>> {
    const graph = new Graph<T>();
    const shortcut_start_index = 1;
    const shortcut_end_index = values.length - 2;

    t.true(values.slice(1).every((v, i) => graph.edge(values[i], v) === 1), 'adding a new edge returns 1');
    t.true(values.slice(1).every((v, i) => graph.edge(values[i], v) === 0), 'adding an existing edge returns 0');

    t.deepEqual(graph.sources, new Set(values.slice(0, -1)), `sources is ${JSON.stringify(values.slice(0, -1))}`);
    t.deepEqual(graph.destinations, new Set(values.slice(1)), `destinations is ${JSON.stringify(values.slice(1))}`);
    t.deepEqual(graph.starters, new Set(values.slice(0, 1)), `starters is ${JSON.stringify(values.slice(0, 1))}`);
    t.deepEqual(graph.stoppers, new Set(values.slice(-1)), `stoppers is ${JSON.stringify(values.slice(-1))}`);
    t.deepEqual(await graph.paths(), [values], `paths() is ${JSON.stringify([values])}`);
    t.deepEqual(await graph.shortest(), values, `shortest() is ${JSON.stringify(values)}`);

    for (let i = 0; i < values.length; ++i) {
        const v = values[i];
        const starter = values.slice(i);
        const stopper = values.slice(0, i + 1);

        t.deepEqual(await graph.paths(v), [starter], `paths(${v}) is ${JSON.stringify([starter])}`);
        t.deepEqual(await graph.shortest(v), starter, `shortest(${v}) is ${JSON.stringify(starter)}`);
        t.deepEqual(await graph.paths(undefined, v), [stopper], `paths(undefined, ${v}) is ${JSON.stringify([stopper])}`);
        t.deepEqual(await graph.shortest(undefined, v), stopper, `shortest(undefined, ${v}) is ${JSON.stringify(stopper)}`);
    }

    t.equal(graph.edge(values[shortcut_start_index], values[shortcut_end_index]), 1, `adding a new shortcut from ${JSON.stringify(values[shortcut_start_index])} to ${JSON.stringify(values[shortcut_end_index])} returns 1`);
    t.equal(graph.edge(values[shortcut_start_index], values[shortcut_end_index]), 0, `adding an existing shortcut from ${JSON.stringify(values[shortcut_start_index])} to ${JSON.stringify(values[shortcut_end_index])} returns 0`);

    const shortcut = values.slice(0, shortcut_start_index + 1).concat(values.slice(shortcut_end_index))

    t.deepEqual(graph.sources, new Set(values.slice(0, -1)), `sources is ${JSON.stringify(values.slice(0, -1))}`);
    t.deepEqual(graph.destinations, new Set(values.slice(1)), `destinations is ${JSON.stringify(values.slice(1))}`);
    t.deepEqual(graph.starters, new Set(values.slice(0, 1)), `starters is ${JSON.stringify(values.slice(0, 1))}`);
    t.deepEqual(graph.stoppers, new Set(values.slice(-1)), `stoppers is ${JSON.stringify(values.slice(-1))}`);
    t.deepEqual(await graph.paths(), [values, shortcut], `paths() is ${JSON.stringify([values, shortcut])}`);
    t.deepEqual(await graph.shortest(), shortcut, `shortest() is ${JSON.stringify(shortcut)}`);

    t.equal(graph.drop(values[shortcut_start_index], values[shortcut_start_index + 1]), 1, `dropping an existing shortcut from ${JSON.stringify(values[shortcut_start_index])} to ${JSON.stringify(values[shortcut_start_index + 1])} returns 1`);
    t.equal(graph.drop(values[shortcut_start_index], values[shortcut_start_index + 1]), 0, `dropping the now unknown shortcut from ${JSON.stringify(values[shortcut_start_index])} to ${JSON.stringify(values[shortcut_start_index + 1])} returns 0`);
    const dropped = values.filter((_, i) => i !== shortcut_start_index + 1);
    const starters = [values[0], values[shortcut_start_index + 1]];
    const paths = [shortcut, values.slice(shortcut_start_index + 1)];

    t.deepEqual(graph.sources, new Set(values.slice(0, -1)), `sources is ${JSON.stringify(values.slice(0, -1))}`);
    t.deepEqual(graph.destinations, new Set(dropped.slice(1)), `destinations is ${JSON.stringify(dropped.slice(1))}`);
    t.deepEqual(graph.starters, new Set(starters), `starters is ${JSON.stringify(starters)}`);
    t.deepEqual(graph.stoppers, new Set(values.slice(-1)), `stoppers is ${JSON.stringify(values.slice(-1))}`);
    t.deepEqual(await graph.paths(), paths, `paths() is ${JSON.stringify(paths)}`);
    t.deepEqual(await graph.shortest(), shortcut, `shortest() is ${JSON.stringify(shortcut)}`);

    graph.edge(values[shortcut_end_index - 2], values[shortcut_end_index + 2]);
    t.equal(graph.drop(values[shortcut_end_index - 2]), 2, `drop(${JSON.stringify(values[shortcut_end_index - 2])}) removes all 2 edges originating from ${JSON.stringify(values[shortcut_end_index - 2])}`);

    const paths2 = [shortcut, values.slice(shortcut_start_index + 1, shortcut_end_index - 1), dropped.slice(shortcut_end_index - 2)];

    t.deepEqual(await graph.paths(), paths2, `paths() is ${JSON.stringify(paths2)}`);
    t.deepEqual(await graph.shortest(), values.slice(shortcut_end_index - 1), `shortest() is ${JSON.stringify(values.slice(shortcut_end_index - 1))}`);

    return graph;
}

test('Graph - numbers', async (t) => {
    await runner<number>(t, [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 123]);

    t.end();
});

test('Graph - strings', async (t) => {
    await runner<string>(t, Array.from('abcdefghijklmnopqrstuvwxyz'));

    t.end();
});

test('Graph - objects', async (t) => {
    type Basic = { value: string | number };
    const values = [
        { value: 0 },
        { value: 'Foo' },
        { value: Math.PI },
        { value: 'Bar' },
        { value: Number.MAX_SAFE_INTEGER },
        { value: 'Baz' },
        { value: Number.MIN_SAFE_INTEGER },
        { value: 'Qux' },
        { value: 'End' },
    ];

    await runner<Basic>(t, values);

    t.end();
});

test('Graph - flow', async (t) => {
    const graph = new Graph<string>();

    graph.edge('created', 'refined');
    graph.edge('refined', 'planned');
    graph.edge('planned', 'doing');
    graph.edge('doing', 'review');
    graph.edge('review', 'done');

    graph.edge('planned', 'cancel');
    graph.edge('doing', 'cancel');
    graph.edge('review', 'cancel');

    graph.edge('review', 'doing');
    graph.edge('cancel', 'refined');

    const nextRecords: Array<any> = table`
        after   | next
        --------|------
        created | refined
        refined | planned
        planned | doing,cancel
        doing   | review,cancel
        review  | done,cancel,doing
        done    | 
        cancel  | refined
    `;
    
    for (const { after, next = '' } of nextRecords) {
        const expect = next.split(',').filter(Boolean);

        t.deepEqual(graph.next(after), expect, `next(${JSON.stringify(after)}) is ${JSON.stringify(expect)}`);
    };

    const shortestRecords: Array<any> = table`
        start   | end     | shortest
        --------|---------|----------
        created | created | created
        created | refined | created,refined
        created | planned | created,refined,planned
        created | doing   | created,refined,planned,doing
        created | review  | created,refined,planned,doing,review
        created | done    | created,refined,planned,doing,review,done
        created | cancel  | created,refined,planned,cancel

        refined | created | 
        refined | refined | refined
        refined | planned | refined,planned
        refined | doing   | refined,planned,doing
        refined | review  | refined,planned,doing,review
        refined | done    | refined,planned,doing,review,done
        refined | cancel  | refined,planned,cancel

        planned | created |
        planned | refined | planned,cancel,refined
        planned | planned | planned
        planned | doing   | planned,doing
        planned | review  | planned,doing,review
        planned | done    | planned,doing,review,done
        planned | cancel  | planned,cancel

        doing   | created | 
        doing   | refined | doing,cancel,refined
        doing   | planned | doing,cancel,refined,planned
        doing   | doing   | doing
        doing   | review  | doing,review
        doing   | done    | doing,review,done
        doing   | cancel  | doing,cancel

        review  | created | 
        review  | refined | review,cancel,refined
        review  | planned | review,cancel,refined,planned
        review  | doing   | review,doing
        review  | review  | review
        review  | done    | review,done
        review  | cancel  | review,cancel

        done    | created |
        done    | refined |
        done    | planned |
        done    | doing   |
        done    | review  |
        done    | done    | done
        done    | cancel  | 

        cancel  | created |
        cancel  | refined | cancel,refined
        cancel  | planned | cancel,refined,planned
        cancel  | doing   | cancel,refined,planned,doing
        cancel  | review  | cancel,refined,planned,doing,review
        cancel  | done    | cancel,refined,planned,doing,review,done
        cancel  | cancel  | cancel
    `;
    
    for (const { start, end, shortest } of shortestRecords) {
        const path = shortest && shortest.split(',');

        t.deepEqual(await graph.shortest(start, end), path, `shortest(${start}, ${end}) is ${JSON.stringify(path)}`);
    }

    t.end();
});