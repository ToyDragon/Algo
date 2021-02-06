import NewLeastSquaresModel from "./models/least_squares_model";
import NewCSVSource from "./sources/csv_source";
import * as fs from "fs";
import { Model } from "./models/model";
import NewBufferingSource from "./sources/buffering_source";

// TODO: Performance is a bottleneck. Try running historical tests in parallel, such that they share the same BufferingSource send loop. I suspect that is a bottleneck.

(async () => {

    const currency_pairs = ["XDGUSD", "XRPUSDT", "ETHUSDC", "XBTUSDC", "XBTUSDT"]; // AAVEGBP

    for (const pair of currency_pairs) {
        type HistResult = {lookback_seconds: number, value: number};
        let first = true;
        const source = NewBufferingSource(NewCSVSource(fs.createReadStream("/home/frog/Development/Algo/historical_data/" + pair + ".csv")));

        // Number of minutes to extrapolate into the future. Doesn't really matter for these tests, because we buy at any positive expectation and sell at any negative.
        const lookahead = 5;

        console.log("\nTrading in pair " + pair + ", using least squares linear regression");
        
        let all_results: HistResult[] = [];
        for (let lookback_seconds = 2; lookback_seconds < 60; lookback_seconds++){
            const result = await HistoricalTest(NewLeastSquaresModel(lookback_seconds, lookahead, source));
            all_results.push({
                lookback_seconds: lookback_seconds,
                value: result.end_portfolio_value
            });

            if (first){
                first = false;
                console.log("Value if bought and held: " + result.value_if_holding);
            }

            process.stdout.write(".");
        }
        
        for (let lookback_seconds = 60; lookback_seconds < 60 * 60 * 6; lookback_seconds += 60){
            const result = await HistoricalTest(NewLeastSquaresModel(lookback_seconds, lookahead, source));
            all_results.push({
                lookback_seconds: lookback_seconds,
                value: result.end_portfolio_value
            });
            process.stdout.write(".");
        }
        all_results.sort((a, b) => {
            return a.value > b.value ? -1 : 1;
        });

        console.log("\nTop 5 performing lookback lengths:");
        for(let i = 0; i < 5; ++i) {
            console.log(all_results[i].lookback_seconds + " seconds: " + all_results[i].value);
        }
    }

    // TODO: Get rid of this, or wrap it in some function that makes it usable.
    // const start = new Date();
    // const source = new WaitingSource(NewSummingSource([
    //     NewReciprocatingSource(10, 100, 100, 1000, start),
    //     NewReciprocatingSource(0, 45, 17, 1000, start),
    //     NewReciprocatingSource(0, 50, 1000, 1000, start),
    // ]));
    // for(let i = 0; i < 1000; ++i){
    //     const real_value = await source.Next();
    //     const predicted_change = model.PredictValueChange();
    //     if (!real_value){
    //         break;
    //     }

    //     if (predicted_change > 0) {
    //         // Buy!
    //         if (dollars) {
    //             console.log("Buying at " + real_value);
    //             last_dollars = dollars;
    //             crypto = dollars / real_value;
    //             dollars = 0;
    //         }
    //     } else {
    //         // Sell!
    //         if (crypto) {
    //             let new_dollars = crypto * real_value;
    //             console.log("Selling at " + real_value + " for change of dollars: " + (new_dollars - last_dollars));
    //             dollars = new_dollars
    //             crypto = 0;
    //         }
    //     }
    //     last_real_value = real_value;
    // }

    // if (crypto) {
    //     console.log("Finish-selling at " + last_real_value);
    //     dollars = crypto * last_real_value;
    //     crypto = 0;
    // }
    // console.log("Ending value: " + dollars);

})();

async function HistoricalTest(model: Model): Promise<{end_portfolio_value: number, value_if_holding: number}> {
    return new Promise((resolve) => {
        let dollars = 100;
        let crypto = 0;

        let start_value = -1;
        let last_real_value = 0;
        model.OnChange((sourcedata) => {
            if(sourcedata.datapoint) {
                const real_value = sourcedata.datapoint.value;
                const predicted_change = model.PredictValueChange();

                if (predicted_change > 0) {
                    // Buy!
                    if (dollars) {
                        crypto = dollars / real_value;
                        dollars = 0;
                    }
                } else {
                    // Sell!
                    if (crypto) {
                        let new_dollars = crypto * real_value;
                        dollars = new_dollars
                        crypto = 0;
                    }
                }
                if (start_value === -1) {
                    start_value = real_value;
                }
                last_real_value = real_value;
            } else {
                if (crypto) {
                    dollars = crypto * last_real_value;
                    crypto = 0;
                }
                resolve({end_portfolio_value: dollars, value_if_holding: 100 * (last_real_value/start_value)});
            }
        });
        model.Start();
    });
}