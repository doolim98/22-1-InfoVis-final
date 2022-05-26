import * as fs from "fs";
import * as csv from "csv";

function main() {
  let count = 0;
  const input_path = "./vis_data_large.csv";
  const output_path = "./vis_data.csv";
  const reduce_ratio = 200;
  fs.createReadStream(input_path)
    .pipe(csv.parse({ delimiter: "," }))
    .pipe(
      csv.transform(function (record) {
        count++;
        if (count == 1) return record;
        else if (count % reduce_ratio == 0) return record;
        else return null;
      })
    )
    .pipe(csv.stringify({ quoted: true }))
    .pipe(fs.createWriteStream(output_path));
}

main();
