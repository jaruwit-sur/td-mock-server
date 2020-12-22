const Api = require('../models/api-model');

export const finAll = async () => {
    return await Api.find();
}

export const save = async (body) => {
    const api = new Api(body);
    return await api.save();
}