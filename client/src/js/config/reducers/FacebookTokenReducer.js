import { FACEBOOK_EXPIRE_TIME } from "../../facebook/FacebookAction";

export function tokenExpiresTime(state = { "expireTime": 0 }, action = {}) {
    switch(action.type) {
    case FACEBOOK_EXPIRE_TIME:
        return Object.assign({}, state, { "expireTime": action.expireTime });
    default:
        return state;
    }
}