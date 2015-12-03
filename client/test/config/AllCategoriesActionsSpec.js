/* eslint no-unused-expressions:0, max-nested-callbacks: [2, 5] */

"use strict";
import { displayAllCategories, displayAllCategoriesAsync, DISPLAY_ALL_CATEGORIES } from "../../src/js/config/actions/AllCategoriesActions.js";
import CategoriesApplicationQueries from "../../src/js/config/db/CategoriesApplicationQueries.js";
import mockStore from "../helper/ActionHelper.js";
import { expect } from "chai";
import sinon from "sinon";
import { List } from "immutable";

describe("AllCategoriesActions", () => {
    it("return type DISPLAY_ALL_CATEGORIES action", () =>  {
        let categories = "{TimeLine, Sports}";
        let allCategoreisAction = { "type": DISPLAY_ALL_CATEGORIES, categories };
        expect(allCategoreisAction).to.deep.equal(displayAllCategories(categories));
    });

    it("dispatch DISPLAY_ALL_CATEGORIES_ASYNC action", (done) =>  {
        let categories = "{TimeLine, Sports}";
        let store = mockStore({ "categories": List([]) }, [{"type": "DISPLAY_ALL_CATEGORIES", categories }], done);
        let allCategoriesDbMock = sinon.mock(CategoriesApplicationQueries).expects("fetchAllCategories");
        allCategoriesDbMock.returns(Promise.resolve(categories));
        store.dispatch(displayAllCategoriesAsync());
        allCategoriesDbMock.verify();
        CategoriesApplicationQueries.fetchAllCategories.restore();
    });
});
