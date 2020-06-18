export class TimingRegion {
    static currentRegionsStack: TimingRegion[] = [];

    public children: { [name: string]: TimingRegion } = {};
    public totalDuration: DOMHighResTimeStamp = 0;
    public totalCount = 0;
    private currentlyActiveStartTime: DOMHighResTimeStamp | null = null;

    public static open(name: string) {
        const region = TimingRegion.currentRegionsStack.length
            ? TimingRegion.getOrCreateChildRegion(name, TimingRegion.currentRegionsStack[TimingRegion.currentRegionsStack.length - 1])
            : new TimingRegion(name); // Root region

        TimingRegion.currentRegionsStack.push(region);

        if (region.currentlyActiveStartTime) {
            throw new Error(`Trying to start timing region ${this.name} when it is already running.`);
        }
        region.currentlyActiveStartTime = performance.now();
        region.totalCount++;

        return region;
    }

    private constructor(private name: string) {
    }

    private static getOrCreateChildRegion(name: string, withinParent: TimingRegion) {
        if (withinParent.children.hasOwnProperty(name)) {
            return withinParent.children[name];
        } else {
            const newRegion = new TimingRegion(name);
            withinParent.children[name] = newRegion;
            return newRegion;
        }
    }

    public close() {
        const endTime = performance.now();
        if (!this.currentlyActiveStartTime) {
            throw new Error(`Trying to stop timing region ${this.name} when it is not running.`);
        }

        const duration = endTime - this.currentlyActiveStartTime;
        this.totalDuration += duration;
        this.currentlyActiveStartTime = null;

        const poppedInstance = TimingRegion.currentRegionsStack.pop();
        if (!poppedInstance) {
            throw new Error(`Timing region disposal mismatch. When trying to pop ${this.name}, stack was empty.`);
        } else if (poppedInstance !== this) {
            throw new Error(`Timing region disposal mismatch. When trying to pop ${this.name}, actually found ${poppedInstance.name}`);
        }
    }
}
