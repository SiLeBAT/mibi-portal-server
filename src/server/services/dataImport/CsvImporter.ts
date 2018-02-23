import * as csv from "fast-csv"

function importCSVFile(filePath: string) {
    let data: any[] = []

    return new Promise(function (resolve, reject) {
        csv
            .fromPath(filePath, { headers: true })
            .on("data", function (entry) {
                data.push(entry);
            })
            .on("end", function () {
                resolve(data)
            });
    });
};

export {
    importCSVFile
};
