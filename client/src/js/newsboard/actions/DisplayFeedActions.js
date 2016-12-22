import AjaxClient from "../../../js/utils/AjaxClient";

export const PAGINATED_FETCHED_FEEDS = "PAGINATED_FETCHED_FEEDS";
const FEEDS_LENGTH_ZERO = 0;

export function displayFeedsByPage(pageIndex, callback = () => {}) {
    return dispatch => {
        let ajax = AjaxClient.instance("/fetch-all-feeds", true);
        const headers = {
            "Accept": "application/json",
            "Content-Type": "application/json"
        };
        ajax.post(headers, { "lastIndex": pageIndex }).then((feeds) => {
            let result = {
                "docsLenght": 0
            };
            if (feeds.docs.length > FEEDS_LENGTH_ZERO) {
                dispatch(paginatedFeeds(feeds.docs));
                result.docsLenght = feeds.docs.length;
            }
            let defaultPageSize = 25;
            result.hasMoreFeeds = feeds.docs.length === defaultPageSize;
            callback(result);  //eslint-disable-line callback-return
        }).catch(() => {
            dispatch(paginatedFeeds([]));
        });
    };
}

export async function fetchFeedsFromSources() {
    const headers = {
        "Accept": "application/json",
        "Content-Type": "application/json"
    };
    let ajaxFetch = AjaxClient.instance("/fetch-all-feeds-from-all-sources", true);
    await ajaxFetch.post(headers, {});
}

export function paginatedFeeds(feeds) {
    return { "type": PAGINATED_FETCHED_FEEDS, feeds };
}
