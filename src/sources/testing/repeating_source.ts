import { AsyncTimeout } from "../../async_timeout";
import { Source } from "../source";

class RepeatingSource extends Source {
    constructor(values: number[], iterations: number, start_instant: Date) {
        super();
        this.values = values;
        this.iterations = iterations;
        this.start_instant = start_instant;
        if(iterations < 0) {
            throw new Error("RepeatingSource iteration count must be 0 or greater.");
        }
    }

    Start(): void {
        // Timeout to clear the stack, give our caller the chance to attach handlers.
        AsyncTimeout(0).then(() => {
            for(let i = 0; i < this.iterations; ++i) {
                const instant = new Date(this.start_instant);
                instant.setMinutes(instant.getMinutes() + i)
                this.SendData({
                    datapoint: {
                        instant: instant,
                        value: this.values[i % this.values.length]
                    }
                });
            }
            this.SendData({
                datapoint: null
            });
        });
    }

    private values: number[] = [];
    private iterations: number = 0;
    private start_instant!: Date;
}

/**
 * Sends values from the input, repeating if necesary. Sends a total quantity of data equal to "iterations", with each data point being one minute later than the previous.
 * For example, NewRepeatingSource([1,2,3], 6, instant) will send the values [1, 2, 3, 1, 2, 3].
 * @param values 
 * @param iterations 
 * @param start_instant 
 */
export default function NewRepeatingSource(values: number[], iterations: number, start_instant: Date): Source {
    return new RepeatingSource(values, iterations, start_instant);
};