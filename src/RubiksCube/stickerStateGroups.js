const cubieIDs = [
    "BDL",
    "DL",
    "DFL",
    "BL",
    "L",
    "FL",
    "BLU",
    "LU",
    "FLU",
    "BD",
    "D",
    "DF",
    "B",
    "F",
    "BU",
    "U",
    "FU",
    "BDR",
    "DR",
    "DFR",
    "BR",
    "R",
    "FR",
    "BRU",
    "RU",
    "FRU"
];

/*
    This allows users to specify a few specific stickers to leave on,
    and turn the rest off

    stickers should be an object where each key is the id of a given cubie and the value is an integer. 
    You use the integer's active bits to determine whether a face on the cubie will be marked as on or off

    for example:

    stickers = {
        "RUF": 0b110,
        "FLD": 0b111
    }

    this would turn every sticker off except on the RUF's R and U stickers and all of FLD's stickers
    
    note: this function doesnt turn them off itself, its just used to easily generate specific patterns as an object, 
    you feed the output of this to the Cubes toggleStickerState function
*/
export function allOffExcept(stickers) {
    let stickerKeys = Object.keys(stickers);

    return cubieIDs.reduce((map, id) => {
        let stickerKeyIndex = stickerKeys.findIndex(key => key.split("").sort().join("") === id);

        if (stickerKeyIndex > -1){
            let stickerKey = stickerKeys[stickerKeyIndex];
            map[stickerKey] = stickers[stickerKey];
        } else {
            map[id] = 0;
        }
        return map;
    }, {})
}

// This does the same thing as allOffExcept, just reversed
export function allOnExcept(stickers) {
    let stickerKeys = Object.keys(stickers);

    return cubieIDs.reduce((map, id) => {
        let stickerKeyIndex = stickerKeys.findIndex(key => key.split("").sort().join("") === id);

        if (stickerKeyIndex > -1){
            let stickerKey = stickerKeys[stickerKeyIndex];
            map[stickerKey] = stickers[stickerKey];
        } else {
            // this will leave some stickers with more bits than faces
            // But we just ignore any extra bits (going from right to left)
            map[id] = 0b111;
        }
        return map;
    }, {})
}

// Exports the D face cross only sticker group
export const cross = allOffExcept({
    "FD": 0b11,
    "BD": 0b11,
    "RD": 0b11,
    "LD": 0b11,
    "U": 0b1,
    "F": 0b1,
    "R": 0b1,
    "L": 0b1,
    "D": 0b1,
    "B": 0b1,
});

// Exports the first layer only sticker group
export const firstLayer = allOffExcept({
    "FLD": 0b111,
    "FRD": 0b111,
    "BLD": 0b111,
    "BRD": 0b111,
    "FD": 0b11,
    "BD": 0b11,
    "RD": 0b11,
    "LD": 0b11,
    "F": 0b1,
    "R": 0b1,
    "L": 0b1,
    "D": 0b1,
    "B": 0b1,
    "U": 0b1
})

// Exports the first two layer only sticker group
export const firstTwoLayers = allOnExcept({
    "FLU": 0b000,
    "FRU": 0b000,
    "BLU": 0b000,
    "BRU": 0b000,
    "UL": 0b00,
    "UR": 0b00,
    "UF": 0b00,
    "UB": 0b00,
})

// Exports the first two layers plus top layer cross
// OLL stands for Orientation of Last Layer
export const OLLCross = allOnExcept({
    "FLU": 0b000,
    "FRU": 0b000,
    "BLU": 0b000,
    "BRU": 0b000,
    "UL": 0b10,
    "UR": 0b10,
    "UF": 0b10,
    "UB": 0b10,
})

// Exports the first two layers and all top layer stickers
export const OLL = allOnExcept({
    "FLU": 0b001,
    "FRU": 0b001,
    "BLU": 0b001,
    "BRU": 0b001,
    "FU": 0b01,
    "BU": 0b01,
    "LU": 0b01,
    "RU": 0b01
})
