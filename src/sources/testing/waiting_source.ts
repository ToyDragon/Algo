import { AsyncTimeout } from "../../async_timeout";
import { Source, SourceData } from "../source";

/**
 * Forwards data from the child source, but not immediately. Data will be buffered and sent one at a time for every call to Next.
 */
export default class WaitingSource extends Source {
    constructor(source: Source) {
        super();
        this.source = source;
        this.source.OnData((data) => {
            this.buffer.push(data);
        });
    }

    public Start(): void {
        this.source.Start();
    }

    public async Next(): Promise<number | null> {
        if(this.done){
            return null;
        }

        while (!this.buffer.length){
            await AsyncTimeout(10);
        }
        const data = this.buffer.splice(0, 1)[0];
        if (!data.datapoint) {
            this.done = true;
        }
        this.SendData(data);

        return data.datapoint?.value || null;
    }

    private done = false;
    private buffer: SourceData[] = [];
    private source!: Source;
}