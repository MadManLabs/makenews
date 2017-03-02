import React, { Component, PropTypes } from "react";
import R from "ramda"; //eslint-disable-line id-length
import { searchInConfiguredSources, deleteSource } from "../../sourceConfig/actions/SourceConfigurationActions";
import { connect } from "react-redux";
import Input from "./../../utils/components/Input";
import SourceFilters from "./../../newsboard/filter/SourceFilters";

class ConfiguredSources extends Component {

    constructor() {
        super();
        this._renderSources = this._renderSources.bind(this);
    }

    componentDidMount() {
        this.props.dispatch(searchInConfiguredSources(""));
    }

    _renderSources(sourceType, searchKey) {
        let configuredSourceDOM = (source) => <li className="source-name" key={source._id}>{source.name}
            <i className="fa fa-times delete-source" onClick={() => {
                this.props.dispatch(deleteSource(this.props.sources, this.props.currentTab, source));
            }}
            /></li>;
        if(searchKey) {
            let key = searchKey.toUpperCase();
            let configuredSources = source => source.name.toUpperCase().match(key) && source;
            return R.pipe(
                R.filter(configuredSources),
                R.map(configuredSourceDOM)
            )(this.props.sources[sourceType]);
        }
        let filterHashtags = (source) => {
            if(!source.hashtag) {
                return source;
            }
            return null;
        };
        return R.map(configuredSourceDOM, R.filter(filterHashtags, (R.prop(sourceType, this.props.sources))));
    }

    _searchInSources(event) {
        let value = event.target.value;
        this.props.dispatch(searchInConfiguredSources(value));
    }

    render() {
        return (
            <aside className="configured-sources-container">
                <h3 className="heading">My Sources</h3>
                <SourceFilters searchKeyword={this.props.searchKeyword} currentTab={this.props.currentTab} renderSources={this._renderSources}/>
                <Input className={"input-box"} eventHandlers={{ "onKeyUp": (event) => {
                    this._searchInSources(event);
                } }} placeholder="search" addonSrc="./images/search-icon.png"
                />
            </aside>
        );
    }
}

function mapToStore(state) {
    return {
        "sources": state.configuredSources,
        "searchKeyword": state.searchInConfiguredSources,
        "currentTab": state.currentSourceTab
    };
}

ConfiguredSources.propTypes = {
    "sources": PropTypes.object.isRequired,
    "dispatch": PropTypes.func.isRequired,
    "searchKeyword": PropTypes.string,
    "currentTab": PropTypes.string.isRequired
};

export default connect(mapToStore)(ConfiguredSources);
