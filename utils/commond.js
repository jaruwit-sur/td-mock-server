export const matchArgument = (object, objectCondition) => {
    const { key, value } = objectCondition;
    return (value === findValueByKey(object, key));
}

export const findValueByKey = (object, key) => {
    let value;
    Object.keys(object).some((k) => {
        if (k === key) {
            value = object[k];
            return true;
        }

        if (object[k] && typeof object[k] === 'object') {
            value = findValueByKey(object[k], key);
            return value !== undefined;
        }
    });
    return value;
}

