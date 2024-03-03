class RaceTree<T> {
    public readonly value : undefined | T;
    public readonly name : string;
    public children : RaceTree<T>[]

    // constructor

    constructor(value : undefined | T, name: string, children : RaceTree<T>[]) {
        this.value = value;
        this.name = name;
        this.children = children;
    }

    // operations on children

    addChild(child: RaceTree<T>): void {
        this.children.push(child);
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

    constructor(k : number, list : T[], namer: (value: T) => string) {
        this.k = k;
        this.root = createRaceTree(list, namer);
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
    }

    public isSorted(): boolean {
        return this.root.isLinkedList();
    }

    public toArray(): undefined | T[] {
        if (!this.isSorted()) return undefined;
        return this.root.toLinkedList();
    }
}

function createRaceTree<T>(list : T[], namer: (value: T) => string): RaceTree<T> {
    let children : RaceTree<T>[] = [];
    list.forEach((e) => {
        children.push(new RaceTree(e, namer(e), []));
    });
    return new RaceTree(undefined, '', children);
}

export { RaceSort }
