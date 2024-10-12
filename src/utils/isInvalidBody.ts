type argsType =
    (string | undefined)[]

export default function (...args: argsType) {
    if(args.includes(undefined) || args.includes("")) return true;
    return false;
}