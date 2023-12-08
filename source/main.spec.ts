import test from 'tape';
import { Graph } from './Domain/Graph';

test('README Examples - Usage', async (t) => {
    const graph = new Graph<string>();

    // the regular flow of A -> B -> C -> D -> E
    graph.edge('A', 'B');
    graph.edge('B', 'C');
    graph.edge('C', 'D');
    graph.edge('D', 'E');
    
    // show various shortest paths
    t.deepEqual(await graph.shortest('A', 'C'), ['A', 'B', 'C'], `A -> C is [['A', 'B', 'C']]`);
    t.deepEqual(await graph.shortest('A', 'E'), ['A', 'B', 'C', 'D', 'E'], `A -> E is [['A', 'B', 'C', 'D', 'E']]`);
    t.deepEqual(await graph.shortest('B', 'E'), ['B', 'C', 'D', 'E'], `B -> E is [['B', 'C', 'D', 'E']]`);
    
    // allow to move back from B -> A
    graph.edge('B', 'A');
    
    // allow to move from A -> E
    graph.edge('A', 'E');
    
    // show various shortest paths
    t.deepEqual(await graph.shortest('A', 'C'), ['A', 'B', 'C'], `A -> C is [['A', 'B', 'C']]`);
    t.deepEqual(await graph.shortest('A', 'E'), ['A', 'E'], `A -> E is [['A', 'E']]`);
    t.deepEqual(await graph.shortest('B', 'E'), ['B', 'A', 'E'], `B -> E is [['B', 'A', 'E']]`);

    t.end();
});

test('README Examples - API - sources', async (t) => {
    const graph = new Graph<string>();
    const expect = new Set([ 'begins', 'middle', 'starts']);

    graph.edge('begins', 'middle');
    graph.edge('middle', 'ends');
    graph.edge('starts', 'middle');
    graph.edge('middle', 'stops');

    t.deepEqual(graph.sources, expect, `graph.sources is Set(${JSON.stringify([...expect])})`);

    t.end();
});

test('README Examples - API - destinations', async (t) => {
    const graph = new Graph<string>();
    const expect = new Set([ 'middle', 'ends', 'stops']);

    graph.edge('begins', 'middle');
    graph.edge('middle', 'ends');
    graph.edge('starts', 'middle');
    graph.edge('middle', 'stops');

    t.deepEqual(graph.destinations, expect, `graph.destinations is Set(${JSON.stringify([...expect])})`);

    t.end();
});

test('README Examples - API - starters', async (t) => {
    const graph = new Graph<string>();
    const expect = new Set([ 'begins', 'starts']);

    graph.edge('begins', 'middle');
    graph.edge('middle', 'ends');
    graph.edge('starts', 'middle');
    graph.edge('middle', 'stops');

    t.deepEqual(graph.starters, expect, `graph.starters is Set(${JSON.stringify([...expect])})`);

    t.end();
});

test('README Examples - API - stoppers', async (t) => {
    const graph = new Graph<string>();
    const expect = new Set([ 'ends', 'stops']);

    graph.edge('begins', 'middle');
    graph.edge('middle', 'ends');
    graph.edge('starts', 'middle');
    graph.edge('middle', 'stops');

    t.deepEqual(graph.stoppers, expect, `graph.stoppers is Set(${JSON.stringify([...expect])})`);

    t.end();
});

test('README Examples - API - paths', async (t) => {
    const graph = new Graph<string>();
    const expect = [
        [ 'begins', 'middle', 'ends' ],
        [ 'begins', 'middle', 'stops' ],
        [ 'starts', 'middle', 'ends' ],
        [ 'starts', 'middle', 'stops' ]
    ];

    graph.edge('begins', 'middle');
    graph.edge('middle', 'ends');
    graph.edge('starts', 'middle');
    graph.edge('middle', 'stops');

    const paths = await graph.paths();

    t.deepEqual(paths, expect, `paths() is ${JSON.stringify(expect)}`);

    t.end();
});


test('README Examples - API - shortest', async (t) => {
    const graph = new Graph<string>();
    const expect = ['planned', 'doing', 'cancel', 'complete'];
    const expect_doing = ['doing', 'cancel', 'complete'];
    const expect_review_cancel = ['review', 'doing', 'cancel']

    graph.edge('planned', 'doing');
    graph.edge('doing', 'review');
    graph.edge('doing', 'cancel');
    graph.edge('review', 'done');
    graph.edge('review', 'doing');
    graph.edge('done', 'complete');
    graph.edge('cancel', 'complete');

    t.deepEqual(await graph.shortest(), expect, `shortest() is ${JSON.stringify(expect)}`);
    t.deepEqual(await graph.shortest('doing'), expect_doing, `shortest('doing') is ${JSON.stringify(expect_doing)}`);
    t.deepEqual(await graph.shortest('review', 'cancel'), expect_review_cancel, `shortest('review', 'cancel') is ${JSON.stringify(expect_review_cancel)}`);

    t.end();
});
