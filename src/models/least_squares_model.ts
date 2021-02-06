import { Datapoint } from "../sources/datapoint";
import { Source } from "../sources/source";
import { Model } from "./model";

class LeastSquaresModel extends Model {
    constructor(lookback_seconds: number, extrapolation_minutes: number, source: Source) {
        super();
        this.source = source;
        this.extrapolation_minutes = extrapolation_minutes;
        this.lookback_seconds = lookback_seconds;
    }

    public Start(): void {
        this.source.OnData((sourcedata) => {
            if (!sourcedata.datapoint) {
                this.NotifyChange(sourcedata);
                return;
            }

            // Trim out all values that are too old to affect our linear regression.
            if (this.recent_values.length) {
                const earliest_allowed_data = new Date(sourcedata.datapoint.instant);
                earliest_allowed_data.setSeconds(earliest_allowed_data.getSeconds() - this.lookback_seconds);
                while(this.recent_values.length && this.recent_values[0].instant < earliest_allowed_data) {
                    this.recent_values.splice(0, 1);
                }
            }

            this.recent_values.push(sourcedata.datapoint);
            this.NotifyChange(sourcedata);
        });
        this.source.Start();
    }

    public PredictValueChange(): number {
        if (this.recent_values.length < 2) {
            // Can't extrapolate without at least 2 points.
            return 0;
        }

        // Least squares regression
        //            N * Sum(x*y) - Sum(x) * Sum(y)
        //   m   =   --------------------------------
        //               N * Sum(x^2) - (Sum(x))^2
        //
        //
        //            Sum(y) - m * Sum(x)
        //   b   =   ---------------------
        //                     N
        //
        // We use time on the X axis, and value on the Y axis. We treat the earliest data we have as `x=0`, and adjust all other data accordingly.

        const ToSeconds = (date: Date) => {
            return date.getTime() / 1000;
        }

        let sum_xy = 0;
        let sum_x = 0;
        let sum_y = 0;
        let sum_x2 = 0;
        const start_seconds = ToSeconds(this.recent_values[0].instant);
        for (let i = 0; i < this.recent_values.length; ++i){
            const x = ToSeconds(this.recent_values[i].instant) - start_seconds;
            sum_xy += x * this.recent_values[i].value;
            sum_y += this.recent_values[i].value;
            sum_x += x;
            sum_x2 += x * x;
        }

        const n = this.recent_values.length;
        const m = (n * sum_xy - sum_x * sum_y) / (n * sum_x2 - sum_x * sum_x);
        const b = (sum_y - m * sum_x) / n;

        // The "expected value" comes from extending our linear regression out some number of minutes into the future. 
        const extrapolated_x = (ToSeconds(this.recent_values[n - 1].instant) - start_seconds) + this.extrapolation_minutes * 60;
        const new_value = m * extrapolated_x + b;
        const predicted_change = new_value - this.recent_values[n - 1].value;
        return predicted_change;
    }

    private recent_values: Datapoint[] = [];
    private extrapolation_minutes!: number;
    private lookback_seconds!: number;
    private source!: Source;
}

/**
 * Does a linear regression over recent values, and extrapolates that into the future to come up with an expected value.
 * @param lookback_minutes 
 * @param extrapolation_minutes 
 * @param source 
 */
export default function NewLeastSquaresModel(lookback_minutes: number, extrapolation_minutes: number, source: Source): Model {
    return new LeastSquaresModel(lookback_minutes, extrapolation_minutes, source);
}