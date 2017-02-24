import React, { Component, PropTypes } from "react";
import ReactDOM from "react-dom";
import Feed from "./Feed.jsx";
import AppWindow from "./../../utils/AppWindow";
import { connect } from "react-redux";
import * as DisplayFeedActions from "../actions/DisplayFeedActions";
import R from "ramda"; //eslint-disable-line id-length
import DisplayCollection from "./DisplayCollection";
import Spinner from "../../utils/components/Spinner";

export class DisplayFeeds extends Component {
    constructor() {
        super();
        this.state = { "expandView": false, "showCollectionPopup": false };
        this.hasMoreFeeds = true;
        this.offset = 0;
        this.getMoreFeeds = this.getMoreFeeds.bind(this);
        this.getFeedsCallBack = this.getFeedsCallBack.bind(this);
        this.fetchFeedsFromSources = this.fetchFeedsFromSources.bind(this);
    }

    async componentWillMount() {
        await this.autoRefresh();
    }

    async componentDidMount() {
        this.props.dispatch(DisplayFeedActions.fetchingFeeds(true));
        await this.fetchFeedsFromSources();
        window.scrollTo(0, 0); //eslint-disable-line no-magic-numbers
        this.dom = ReactDOM.findDOMNode(this);
        this.dom.addEventListener("scroll", this.getFeedsCallBack);
        this.getMoreFeeds(this.props.sourceType);
        this.props.dispatch(DisplayFeedActions.clearFeeds());
    }

    componentWillReceiveProps(nextProps) {
        if(this.props.sourceType !== nextProps.sourceType) {
            this.hasMoreFeeds = true;
            this.offset = 0;
            this.getMoreFeeds(nextProps.sourceType);
            this.props.dispatch(DisplayFeedActions.clearFeeds());
        }

        if(this.props.currentFilterSource !== nextProps.currentFilterSource) {
            this.offset = 0;
        }

        const firstArticleIndex = 0;
        let [firstArticle] = nextProps.feeds;
        if(firstArticle && !firstArticle.collection && this.offset === firstArticleIndex && this.props.feeds !== nextProps.feeds) {
            if(!nextProps.articleToDisplay._id && this.currentArticle) {
                firstArticle = this.currentArticle;
            }
            this.props.dispatch(DisplayFeedActions.displayArticle(firstArticle));
        }

        if(this.props.articleToDisplay !== nextProps.articleToDisplay && nextProps.articleToDisplay._id) {
            this.currentArticle = nextProps.articleToDisplay;
        }
    }

    componentWillUnmount() {
        this.dom.removeEventListener("scroll", this.getFeedsCallBack);
    }

    getFeedsCallBack() {
        if (!this.timer) {
            const scrollTimeInterval = 250;
            this.timer = setTimeout(() => {
                this.timer = null;
                const scrollTop = this.dom.scrollTop;
                if (scrollTop && scrollTop + this.dom.clientHeight >= this.dom.scrollHeight) {
                    this.getMoreFeeds(this.props.sourceType);
                }
            }, scrollTimeInterval);
        }
    }

    async fetchFeedsFromSources(param) {
        let array = this.props.configuredSources;
        let hasConfiguredSources = R.pipe(
            R.values,
            R.all(arr => !arr.length)
        )(array);
        if(!hasConfiguredSources) {
            await DisplayFeedActions.fetchFeedsFromSources(param);
        }
    }

    getMoreFeeds(sourceType) {
        let callback = (result) => {
            this.offset = result.docsLength ? (this.offset + result.docsLength) : this.offset;
            this.hasMoreFeeds = result.hasMoreFeeds;
        };

        if (this.hasMoreFeeds) {
            if(sourceType === "bookmark") {
                this.props.dispatch(DisplayFeedActions.getBookmarkedFeeds(this.offset, callback));
            } else if(sourceType === "collections") {
                this.props.dispatch(DisplayFeedActions.getAllCollections(this.offset, callback));
            } else {
                let filter = {};
                if(sourceType === "trending") {
                    filter.sources = this.props.currentFilterSource;
                } else {
                    filter.sources = {};
                    filter.sources[sourceType] = this.props.currentFilterSource[sourceType];
                }
                this.props.dispatch(DisplayFeedActions.displayFeedsByPage(this.offset, filter, callback));
            }
        }
    }

    _toggleFeedsView() {
        this.setState({ "expandFeedsView": !this.state.expandFeedsView });
    }

    autoRefresh() {
        const AUTO_REFRESH_INTERVAL = AppWindow.instance().get("autoRefreshSurfFeedsInterval");
        if (!AppWindow.instance().get("autoRefreshTimer")) {
            AppWindow.instance().set("autoRefreshTimer", setInterval(async() => {
                await this.fetchFeedsFromSources(true);
            }, AUTO_REFRESH_INTERVAL));
        }
    }

    render() {
        return (
            this.props.sourceType === "collections" ? <DisplayCollection />
            : <div className={this.state.expandFeedsView ? "configured-feeds-container expand" : "configured-feeds-container"}>
                <button onClick={this.fetchFeedsFromSources} className="refresh-button">{"Refresh"}</button>
                <i onClick={() => {
                    this._toggleFeedsView();
                }} className="expand-icon"
                />
                { this.props.isFetchingFeeds ? <div className="spinner-container"> <div className="show-spinner"> <Spinner /></div> </div>
                  : <div className="feeds">
                    {this.props.feeds.map((feed, index) =>
                        <Feed feed={feed} key={index} active={feed._id === this.props.articleToDisplay._id} dispatch={this.props.dispatch}/>)}
                </div> }
            </div>
        );
    }
}

function mapToStore(store) {
    return {
        "feeds": store.fetchedFeeds,
        "sourceType": store.newsBoardCurrentSourceTab,
        "articleToDisplay": store.selectedArticle,
        "currentFilterSource": store.currentFilterSource,
        "configuredSources": store.configuredSources,
        "isFetchingFeeds": store.fetchingFeeds
    };
}

DisplayFeeds.propTypes = {
    "dispatch": PropTypes.func.isRequired,
    "feeds": PropTypes.array.isRequired,
    "sourceType": PropTypes.string.isRequired,
    "articleToDisplay": PropTypes.object,
    "currentFilterSource": PropTypes.object,
    "configuredSources": PropTypes.object,
    "isFetchingFeeds": PropTypes.bool
};

export default connect(mapToStore)(DisplayFeeds);
