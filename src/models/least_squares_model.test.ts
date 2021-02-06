import NewRepeatingSource from "../sources/testing/repeating_source";
import NewSummingSource from "../sources/summing_source";
import WaitForSourceDone from "../sources/wait_for_source_done";
import NewLeastSquaresModel from "./least_squares_model";

test("Constant value", async (done) => {
    const source = NewRepeatingSource([1], 5, new Date("1/1/21"));
    const model = NewLeastSquaresModel(5 * 60, 1, source);
    model.Start();
    await WaitForSourceDone(source);
    expect(model.PredictValueChange()).toBe(0);
    done();
});

test("Consistently increasing value", async (done) => {
    const source = NewRepeatingSource([1, 2, 3, 4, 5], 5, new Date("1/1/21"));
    const model = NewLeastSquaresModel(5 * 60, 1, source);
    model.Start();
    await WaitForSourceDone(source);
    expect(model.PredictValueChange()).toBe(1);
    done();
});

test("Consistently decreasing value", async (done) => {
    const source = NewRepeatingSource([9, 8, 7, 6, 5], 5, new Date("1/1/21"));
    const model = NewLeastSquaresModel(5 * 60, 1, source);
    model.Start();
    await WaitForSourceDone(source);
    expect(model.PredictValueChange()).toBe(-1);
    done();
});

test("Respects lookback limit", async (done) => {
    const source = NewSummingSource([
        NewRepeatingSource([0, 0, 0, 0, 0, 9, 8, 7, 6, 5], 10, new Date("1/1/21")),
        NewRepeatingSource([9, 9, 9, 9, 9, 0, 0, 0, 0, 0], 10, new Date("1/1/21")),
    ]);
    const model = NewLeastSquaresModel(4 * 60, 1, source);
    model.Start();
    await WaitForSourceDone(source);
    expect(model.PredictValueChange()).toBe(-1);
    done();
});