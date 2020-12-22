import * as apiService from '../services/api-service';
import * as webhookService from '../services/webhook-service'
import * as transformService from '../services/transform-service'

export const routers = async (req, res, next) => {
    const { url, headers, method, body } = req;

    if (url === '/apis' && method.toLowerCase() === 'get') {
        const apis = await apiService.finAll();
        res.status(200).json(apis);
        return;
    } else if (url === '/apis' && method.toLowerCase() === 'post') {
        await apiService.save(req.body);
        res.status(201).json({ "message": "Successfully" });
        return;
    } else {
        const apis = await apiService.finAll();
        const urlAndMethodMatcher = await urlAndMethodMatching(apis, url, method);
        if (!urlAndMethodMatcher) {
            res.status(404).json();
            return;
        }

        await handleResponseByScenario(urlAndMethodMatcher, body, res);
    }
};

const urlAndMethodMatching = async (apis, url, method) => {
    return await apis.filter(api => api.url === url && api.method.toLowerCase() === method.toLowerCase()).map(data => data)[0];
}

const handleResponseByScenario = async (urlAndMethodMatcher, body, res) => {
    //todo find logic solution matchArgument
    const scenario = urlAndMethodMatcher.scenarios.filter(scenario => scenario.isEnable).map(data => data)[0];
    if (!scenario) {
        res.status(404).json();
        return;
    } else {
        const { responseStatusCode, webHook } = scenario;
        const responseData = await mappingResponse(body, scenario);
        res.status(responseStatusCode).json(responseData);
        if (webHook.isEnable) {
            await webhookService.hook(body, webHook);
            return;
        }
    }
}

const mappingResponse = async (data, scenarioResponse) => {
    const { response, isResponseTransfrom, responseTransfrom } = scenarioResponse;
    if (isResponseTransfrom) {
        return await transformService.transform(data, responseTransfrom);
    } else {
        return response;
    }
}