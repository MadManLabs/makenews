/* eslint no-unused-expressions:0, max-nested-callbacks: [2, 5] */
"use strict";
import ConfigureMenu from "../../../src/js/config/components/ConfigureMenu.jsx";
import { assert } from "chai";
import TestUtils from "react-addons-test-utils";
import React from "react";
import { Link } from "react-router";
import "../../helper/TestHelper.js";

describe("ConfigureMenu", () => {
    let configureMenuComponent = null, configTab = null;

    before("ConfigureMenu", () => {
        configTab = {
            "Name": "Configure Test"
        };

        configureMenuComponent = TestUtils.renderIntoDocument(
            <ConfigureMenu configTab={configTab}/>
        );
    });

    it("should have link to /configure/categories", () => {
        let linkElement = TestUtils.scryRenderedComponentsWithType(configureMenuComponent, Link);
        assert.strictEqual("/configure/categories", linkElement[0].props.to);
    });

    it("should display the configure tab name from the locale file", () => {
        assert.strictEqual("Configure Test", configureMenuComponent.refs.configureTabName.innerHTML);
    });

});

