import { Datapoint } from "./datapoint";

export interface SourceData {
    // Null datapoint indicates no more data will come.
    datapoint: Datapoint | null;
}

export type SourceDataHandler = (sourcedata: SourceData) => void;

export abstract class Source {
    abstract Start(): void;

    OnData(handler: SourceDataHandler): void {
        this.data_handlers.push(handler);
        this.HandlerAdded();
    }

    protected SendData(source_data: SourceData): void {
        for (const handler of this.data_handlers) {
            handler(source_data);
        }
    }

    protected HandlerAdded(): void {}

    protected data_handlers: SourceDataHandler[] = [];
}