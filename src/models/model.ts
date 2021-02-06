import { SourceData } from "../sources/source";

export type ModelPredictionChangeHandler = (sourcedata: SourceData) => void;

export abstract class Model {
    abstract PredictValueChange(): number;
    abstract Start(): void;
    
    OnChange(handler: ModelPredictionChangeHandler): void {
        this.data_handlers.push(handler);
    }

    protected NotifyChange(sourcedata: SourceData): void {
        for (const handler of this.data_handlers) {
            handler(sourcedata);
        }
    }

    protected data_handlers: ModelPredictionChangeHandler[] = [];
}