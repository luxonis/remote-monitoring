import _ from "lodash";

export function buildUrl(...args) {
  return args.map((part, i) => {
    if (i === 0){
      return part.trim().replace(/[/]*$/g, '')
    } else {
      return part.trim().replace(/(^[/]*|[/]*$)/g, '')
    }
  }).filter(x=>x.length).join('/')
}

export function nestedOmit(obj, func) {
    const max_depth = 5;
    return nestedOmitRecur(obj, func, max_depth)
}

export function nestedOmitRecur(obj, func, depth) {
    if(depth === 0) {
        return "!ommited!"
    }
    // basic _.omit on the current object
    var r = _.omitBy(obj, func);

    //transform the children objects
    _.each(r, function (val, key) {
        if (typeof (val) === "object")
            r[key] = nestedOmit(val, func, depth - 1);
    });

    return r;
}