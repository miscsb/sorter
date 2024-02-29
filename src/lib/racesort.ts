class RaceTree<T> {
    public readonly value : undefined | T;
    public width : number = 0;
    public rank  : number = 0;
    public children : RaceTree<T>[]

    // constructor

    constructor(value : undefined | T, children : RaceTree<T>[]) {
        this.value = value;
        this.children = children;
        this.recalculateRank(this.rank);
        this.recalculateWidth();
    }

    // operations on children

    addChild(child: RaceTree<T>): void {
        this.children.push(child);
    }

    // rank and width update

    recalculateRank(rank: number): void {
        this.rank = rank;
        this.children.forEach((child) => {
            child.recalculateRank(rank + 1);
        });
    }

    recalculateWidth(): number {
        let width = this.children.map((e) => e.recalculateWidth()).reduce((a, b) => a + b, 0);
        if (width == 0) width = 1;
        this.width = width;
        return width;
    }

    // is tree a linked list?
    
    isLinkedList(): boolean {
        if (this.children.length == 0) return true;
        if (this.children.length != 1) return false;
        return this.children[0].isLinkedList();
    }

    toLinkedList(): T[] {
        let list : T[] = [];
        if (this.children.length > 0) {
            list = this.children[0].toLinkedList();
        }
        if (this.value != undefined) {
            list.unshift(this.value);
        }
        return list;
    }

    // race

    public findRace(k : number): undefined | [RaceTree<T>, T[]] {
        if (this.children.length == 0) return undefined;
        if (this.children.length == 1) return this.children[0].findRace(k);

        let slice = this.children.slice(0, Math.min(k, this.children.length)).map((e) => e.value!);
        return [this, slice];
    }

    public runRace(result: T[]): void {
        if (result.length == 0) return;

        let participants = this.children.filter((e) =>  result.includes(e.value!));
        this.children    = this.children.filter((e) => !result.includes(e.value!));
        let getByValue   = (value : T) => participants.filter((e) => e.value == value)[0];

        this.addChild(getByValue(result[0]));
        for (let i = 1; i < result.length; i += 1) {
            getByValue(result[i-1]).addChild(getByValue(result[i]));
        }
    }

}

class RaceSort<T> {
    private root: RaceTree<T>;
    private pointer: undefined | RaceTree<T>;
    readonly k: number;

    constructor(k : number, list : T[]) {
        this.k = k;
        this.root = createRaceTree(list);
    }

    public getRoot(): RaceTree<T> {
        return this.root;
    }

    public findRace(): undefined | T[] {
        let maybeRace = this.root.findRace(this.k);
        if (maybeRace == undefined) return undefined;

        let [tree, race] = maybeRace;
        this.pointer = tree;
        return race;
    }

    public runRace(result : T[]) {
        if (this.pointer == undefined) return;
        this.pointer.runRace(result);
        this.root.recalculateWidth();
        this.pointer.recalculateRank(this.pointer.rank);
    }

    public isSorted(): boolean {
        return this.root.isLinkedList();
    }

    public toArray(): undefined | T[] {
        if (!this.isSorted()) return undefined;
        return this.root.toLinkedList();
    }
}

function createRaceTree<T>(list : T[]): RaceTree<T> {
    let children : RaceTree<T>[] = [];
    list.forEach((e) => {
        children.push(new RaceTree(e, []));
    });
    return new RaceTree(undefined, children);
}

function tabulateRaceSort<T>(sorter: RaceSort<T>): Map<T, [number, number]> {
    let map : Map<T, [number, number]> = new Map();
    let [x, y] = [0, 0];

    let updater = (tree : RaceTree<T>) => {
        map.set(tree.value!, [x, y]);
        x += tree.width;
    }

    let queue = [sorter.getRoot()];

    while (queue.length != 0) {
        queue = queue.flatMap((tree) => tree.children);
        queue.forEach(updater);
        y += 1;
        x = 0;
    }

    return map;
}

function tabulateRaceSortArrows<T>(sorter: RaceSort<T>, tabulatedRaceSort: Map<T, [number, number]>): [[number, number], [number, number]][] {
    let result : [[number, number], [number, number]][] = [];

    let queue = sorter.getRoot().children;

    while (queue.length != 0) {
        let node = queue.pop()!;
        node.children.forEach((child) => {
            let entry : [[number, number], [number, number]] = [tabulatedRaceSort.get(node.value!)!, tabulatedRaceSort.get(child.value!)!];
            result.push(entry);
            queue.push(child);
        });
    }

    return result;
}

export { RaceSort, tabulateRaceSort, tabulateRaceSortArrows }
