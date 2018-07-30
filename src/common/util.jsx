

export function debug(msg) {
    if ("production" !== process.env.NODE_ENV) console.log(msg);
}
