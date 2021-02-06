import { Source, SourceData } from "./source";

class BufferingSource extends Source {
    constructor(child_source: Source) {
        super();
        this.child_source = child_source;
    }

    protected HandlerAdded(): void {
        for(const sourcedata of this.buffer) {
            this.data_handlers[this.data_handlers.length-1](sourcedata);
        }
    }

    Start(): void {
        this.child_source.OnData((sourcedata) => {
            this.buffer.push(sourcedata);
            this.SendData(sourcedata);
        });
        this.child_source.Start();
    }

    private child_source!: Source;
    private buffer: SourceData[] = [];
}

/**
 * Forwards all sourcedata from the child source.
 * Stores all sent sourcedata in a buffer, and immediately sends it to any new OnData handlers when they are added.
 * 
 * @param child_source 
 */
export default function NewBufferingSource(child_source: Source): Source {
    return new BufferingSource(child_source);
};