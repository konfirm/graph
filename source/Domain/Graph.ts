export class Graph<T = unknown> {
    readonly #storage: Map<T, Set<T>> = new Map();

    /**
     * link one or more destinations to given source
     *
     * @param {T} source
     * @param {...[T, ...Array<T>]} destinations
     * @return {*}  {number}
     * @memberof Graph
     */
    edge(source: T, ...destinations: [T, ...Array<T>]): number {
        const edges = this.#get(source);
        const { size: before } = edges;

        destinations.forEach((d) => edges.add(d));

        return edges.size - before;
    }

    /**
     * remove the edges, optionally limited to the provided destinations only
     *
     * @param {T} source
     * @param {...Array<T>} destinations
     * @return {*}  {number}
     * @memberof Graph
     */
    drop(source: T, ...destinations: Array<T>): number {
        const edges = this.#get(source);
        const { size: before } = edges;

        if (destinations.length) {
            destinations.forEach((d) => edges.delete(d));

            return before - edges.size;
        }

        edges.clear();
        this.#storage.delete(source);

        return before;
    }

    /**
     * Obtain all nodes which somehow can be followed up
     *
     * @readonly
     * @type {Set<T>}
     * @memberof Graph
     */
    get sources(): Set<T> {
        return new Set<T>([...this.#storage.keys()]);
    }

    /**
     * Obtain all nodes which somehow can be lead into
     *
     * @readonly
     * @type {Set<T>}
     * @memberof Graph
     */
    get destinations(): Set<T> {
        return new Set<T>([...this.#storage.values()].reduce((carry, nodes) => carry.concat([...nodes]), [] as Array<T>));
    }

    /**
     * All start nodes (no sources before them)
     *
     * @readonly
     * @type {Set<T>}
     * @memberof Graph
     */
    get starters(): Set<T> {
        return this.#diff(this.sources, this.destinations);
    }

    /**
     * All stop nodes (no destinations after them)
     *
     * @readonly
     * @type {Set<T>}
     * @memberof Graph
     */
    get stoppers(): Set<T> {
        return this.#diff(this.destinations, this.sources);
    }

    /**
     * Obtain the list of immediate destinations from given node
     *
     * @param {T} after
     * @return {*}  {Array<T>}
     * @memberof Graph
     */
    next(after: T): Array<T> {
        return [...this.#get(after)];
    }

    /**
     * Obtain all possible paths, optionally between start and/or stop
     *
     * @param {T} [start]
     * @param {T} [stop]
     * @return {*}  {Promise<Array<Array<T>>>}
     * @memberof Graph
     */
    async paths(start?:T, stop?: T): Promise<Array<Array<T>>> {
        const result: Array<Array<T>> = [];
        const stops = stop ? new Set<T>([stop]) : this.stoppers;
        const starts = start ? new Set<T>([start]) : this.starters;

        for (const start of starts) {
            if (stops.has(start)) {
                result.push([start]);
                continue;
            }

            const append = await this.#dfs(start, [], stops);
            result.push(...append);
        }

        return result;
    }

    /**
     * Obtain the shortest possible path, optionally between start and/or stop
     *
     * @param {T} [start]
     * @param {T} [stop]
     * @return {*}  {(Promise<Array<T> | undefined>)}
     * @memberof Graph
     */
    async shortest(start?:T, stop?:T): Promise<Array<T>|undefined> {
        const paths = await this.paths(start, stop);
        const [path] = paths.sort(({length:a}, {length:b})=> a<b?-1:Number(a>b));

        return path;
    }


    /**
     * Obtain the diff between two sets
     *
     * @param {Set<T>} a
     * @param {Set<T>} b
     * @return {*}  {Set<T>}
     * @memberof Graph
     */
    #diff(a: Set<T>, b: Set<T>): Set<T> {
        return new Set<T>([...a].filter((v) => !b.has(v)));
    }

    /**
     * Depth First Search
     * 
     * @param {T} [start]
     * @param {T} [stop]
     * @return {*}  {Promise<Array<Array<T>>>}
     * @memberof Graph
     */
    async #dfs(current: T, path: Array<T>, stops: Set<T>): Promise<Array<Array<T>>> {
        const result: Array<Array<T>> = [];
        const scope = path.concat(current);

        for (const next of this.next(current)) {
            if (path.includes(next)) {
                continue;
            }

            if (stops.has(next)) {
                result.push(scope.concat(next));
                continue;
            }

            const append = await this.#dfs(next, scope, stops);
            result.push(...append);
        }

        return result;
    }

    /**
     * Obtain the destination Set for node
     *
     * @param {T} node
     * @return {*}  {Set<T>}
     * @memberof Graph
     */
    #get(node: T): Set<T> {
        if (!this.#storage.has(node)) {
            this.#storage.set(node, new Set<T>());
        }
        return this.#storage.get(node) as Set<T>;
    }
}
