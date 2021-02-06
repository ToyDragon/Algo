import { Source, SourceData } from "./source";

class SummingSource extends Source {
    constructor(child_sources: Source[]) {
        super();
        this.child_sources = child_sources;
    }

    TrySend(): void {
        const data: SourceData[] = [];
        let all_done = true;
        for(let i = 0; i < this.child_values.length; ++i) {
            if (this.child_values[i].length > this.next_to_send_) {
                data.push(this.child_values[i][this.next_to_send_]);
                all_done = false;
            } else if (!this.child_done[i]) {
                // Waiting for a non-done child to report data.
                return;
            }
        }

        if (all_done) {
            this.SendData({
                datapoint: null
            });
            return;
        }

        if (data.length === 0){
            return;
        }

        let new_value = 0;
        for(const d of data){
            new_value += d.datapoint!.value;
        }

        this.next_to_send_++;
        this.SendData({
            datapoint: {
                instant: data[0].datapoint!.instant,
                value: new_value,
            }
        });

        // If all of the sources are done, but there is still valid data in the buffer, this will send it.
        this.TrySend();
    }

    Start(): void {
        for(let i = 0; i < this.child_sources.length; ++i){
            const ii = i;
            this.child_done.push(false);
            this.child_values.push([]);
            this.child_sources[i].OnData((source_data) => {
                if (!source_data.datapoint) {
                    this.child_done[ii] = true;
                } else {
                    this.child_values[ii].push(source_data);
                }
                this.TrySend();
            });
        }
        for (const child of this.child_sources) {
            child.Start();
        }
    }
    
    private next_to_send_ = 0;
    private child_values: SourceData[][] = [];
    private child_sources: Source[] = [];
    private child_done: boolean[] = [];
};

/**
 * Sends data that is the sum of the values of the children.
 * @param child_sources 
 */
export default function NewSummingSource(child_sources: Source[]): Source {
    return new SummingSource(child_sources);
};