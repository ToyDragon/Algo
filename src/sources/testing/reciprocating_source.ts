import NewRepeatingSource from "./repeating_source";
import { Source } from "../source";

/**
 * Provides data that slowly interpolates back and forth between a low value and a high value. Returns a total quantity of data equal to `iterations`. The gap between one lowpoint and the next is controlled by `period`.
 * For example, NewReciprocatingSource(10, 20, 5, 10, instant) will return something like [10, 14, 17, 20, 17, 14, 10, 14, 17, 20, 17, 14].
 * @param value_a 
 * @param value_b 
 * @param period 
 * @param iterations 
 * @param start_instant 
 */
export default function NewReciprocatingSource(value_a: number, value_b: number, period: number, iterations: number, start_instant: Date): Source {
    const values: number[] = [];
    let range = Math.floor(period / 2);
    for(let i = 0; i < range; i++) {
        values.push(value_a + (value_b - value_a) * (i / range));
    }
    for(let i = range; i < period; i++) {
        values.push(value_b - (value_b - value_a) * ((i - range) / (period - range)));
    }
    return NewRepeatingSource(values, iterations, start_instant);
};