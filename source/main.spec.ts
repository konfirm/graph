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
