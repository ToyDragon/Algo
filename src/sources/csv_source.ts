import * as stream from "stream";
import { AsyncTimeout } from "../async_timeout";
import { Source } from "./source";

class CSVSource extends Source {
    constructor(stream: stream.Readable) {
        super();
        this.stream = stream;
    }

    /**
     * We only send data if we have lines spanning multiple minutes. If all of our data is from the same minute, we can't tell if there is more data coming for that minute.
     * @param line 
     */
    private TrySendLine(line: string): void {
        const pieces = line.split(",");
        const minute = Math.floor(Number(pieces[0]) / 60) * 60;
        if(minute != this.current_minute){
            this.SendPendingData();
            this.current_minute = minute;
        }
        const volume = Number(pieces[2]);
        this.minute_value += Number(pieces[1]) * volume;
        this.minute_volume += volume;
    }  

    /**
     * Actually sends the data for current minute, and clears accumulating values.
     */
    private SendPendingData(): void {
        if (this.current_minute) {
            this.SendData({
                datapoint: {
                    instant: new Date(this.current_minute * 1000),
                    value: this.minute_value / this.minute_volume
                }
            });
            this.minute_value = 0;
            this.minute_volume = 0;
        }
    }

    Start(): void {
        this.stream.on("data", (chunk) => {
            // We can't guarantee that the chunk lines up with newlines, so we have to do this odd buffering strategy.
            let data = this.leftovers + chunk;
            this.leftovers = "";
            // TODO: parse multiple lines at once. Right now we only parse 1 line, and loop until there are no more lines. I suspect this is a performance bottleneck.
            while(data) {
                const newline_pos = data.indexOf("\n");
                if (newline_pos === -1){
                    this.leftovers = data;
                    return;
                }
                const pieces = data.split("\n");
                data = pieces.slice(1).join("\n");
                this.TrySendLine(pieces[0]);
            }
        });

        // Since we wait for a minute to end before sending it, we still have the last minutes worth of data buffered that needs to be send.
        // Similarly, we buffer each individual line until we reach a terminating newline character. If the CSV doesn't end with a newline, then we still have the last line of data in the line buffer waiting to be processed.
        this.stream.on("end", async () => {
            if(this.leftovers) {
                this.TrySendLine(this.leftovers);
            }
            this.SendPendingData();
            await AsyncTimeout(0);
            this.SendData({datapoint: null});
        })
    }

    private stream!: stream.Readable;

    /**
     * The buffer containing a partial line that hasn't yet been processed.
     */
    private leftovers = "";

    // These contain all of the data required to determine the minute's weighted average value.
    private current_minute = 0;
    private minute_volume = 0;
    private minute_value = 0;
}

/**
 * Parses CSV data from a stream, expected to be in the Kraken historical data format. Combines lines from the same minute, coming up with a weighted average transaction value.
 * @param stream 
 */
export default function NewCSVSource(stream: stream.Readable): Source {
    return new CSVSource(stream);
};