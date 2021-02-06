import { Source, SourceData } from "./source";

class SerialSource extends Source {
    constructor(child_sources: Source[]) {
        super();
        if(!child_sources || child_sources.length === 0) {
            throw new Error("SerialSource missing child sources.");
        }
        this.child_sources_ = child_sources;

        for(const child_source of child_sources) {
            child_source.OnData((sourceData) => {
                this.HandleChildData(sourceData);
            });
        }
    }

    HandleChildData(source_data: SourceData): void {
        if (source_data.datapoint === null) {
            this.current_child_ += 1;
            if (this.current_child_ >= this.child_sources_.length) {
                this.SendData({
                    datapoint: null
                })
            } else {
                this.child_sources_[this.current_child_].Start();
            }
        } else {
            this.SendData(source_data);
        }
    }

    Start(): void {
        this.current_child_ = 0;
        this.child_sources_[0].Start();
    }

    child_sources_!: Source[];
    current_child_ = -1;
}

/**
 * Sends data from the first source until it completes. Then sends data from the next source, and so on.
 * @param child_sources 
 */
export default function NewSerialSource(child_sources: Source[]): Source {
    return new SerialSource(child_sources);
};