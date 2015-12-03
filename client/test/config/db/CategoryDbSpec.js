/* eslint max-nested-callbacks: [2, 5] no-unused-expressions:0, no-unused-vars:0, no-undefined:0*/

"use strict";
import PouchClient from "../../../src/js/db/PouchClient.js";
import CategoryDb from "../../../src/js/config/db/CategoryDb.js";
import sinon from "sinon";
import { expect } from "chai";

describe("CategoryDb", () => {
    describe("fetchAllCategoryDocuments", () => {
        it("should fetch all category documents", (done) => {
            let pouchClientMock = sinon.mock(PouchClient).expects("fetchDocuments").withArgs("category/allCategories", { "include_docs": true }).returns(Promise.resolve(""));
            CategoryDb.fetchAllCategoryDocuments().then(() => {
                pouchClientMock.verify();
                PouchClient.fetchDocuments.restore();
                done();
            });
        });
    });

    describe("fetchSourceConfigurationsByCategoryId", () => {
        it("should fetch all the source configurations for a category id", (done) => {
            let categoryId = "categoryId";
            let pouchClientMock = sinon.mock(PouchClient).expects("fetchDocuments").withArgs("category/sourceConfigurations", { "include_docs": true, "key": categoryId }).returns(Promise.resolve("resolved"));
            CategoryDb.fetchSourceConfigurationsByCategoryId(categoryId).then((result) => {
                pouchClientMock.verify();
                PouchClient.fetchDocuments.restore();
                done();
            });
        });

        it("should reject if the category id is empty", (done) => {
            CategoryDb.fetchSourceConfigurationsByCategoryId("").catch(error => {
                expect("category id should not be empty").to.equal(error);
                done();
            });
        });
    });

    describe("fetchSourceConfigurationByUrl", () => {
        it("should fetch all the source configurations for a url", () => {
            let url = "hindu.com/rss";
            let pouchClientMock = sinon.mock(PouchClient).expects("fetchDocuments").withArgs("category/allSourcesByUrl", { "include_docs": true, "key": url });
            CategoryDb.fetchSourceConfigurationByUrl(url);
            pouchClientMock.verify();
            PouchClient.fetchDocuments.restore();
        });

        it("should reject if the category id is empty", (done) => {
            CategoryDb.fetchSourceConfigurationByUrl("").catch(error => {
                expect("url should not be empty").to.equal(error);
                done();
            });
        });
    });

    describe("createOrUpdateSource", () => {
        it("should create Source if no source with url is found", (done) => {
            let jsonDocument = {
                "docType": "source",
                "sourceType": "rss",
                "url": "www.google.com/rss",
                "categoryId": [
                    "8bc3db40aa04d6c65fd10d833f00163e"
                ]
            };
            let fetchDocumentsStub = sinon.stub(PouchClient, "fetchDocuments");
            fetchDocumentsStub.withArgs("category/allSourcesByUrl", { "include_docs": true, "key": jsonDocument.url });
            fetchDocumentsStub.returns(Promise.resolve([]));
            let pouchClientMock = sinon.mock(PouchClient).expects("createDocument").withArgs(jsonDocument).returns(Promise.resolve("resolve"));
            CategoryDb.createOrUpdateSource(jsonDocument).then(() => {
                pouchClientMock.verify();
                PouchClient.createDocument.restore();
                PouchClient.fetchDocuments.restore();
                done();
            });
        });

        it("should update Source if a source with given url exists", (done) => {
            let existingDocument = {
                "docType": "source",
                "sourceType": "rss",
                "url": "www.google.com/rss",
                "categoryIds": [
                    "id1"
                ]
            };
            let expectedCreateDocument = {
                "docType": "source",
                "sourceType": "rss",
                "url": "www.google.com/rss",
                "categoryIds": [
                    "id1", "id2"
                ]
            };

            let jsonDocument = {
                "docType": "source",
                "sourceType": "rss",
                "url": "www.google.com/rss",
                "categoryIds": [
                    "id2"
                ]
            };

            let fetchDocumentsStub = sinon.stub(PouchClient, "fetchDocuments");
            fetchDocumentsStub.withArgs("category/allSourcesByUrl", { "include_docs": true, "key": jsonDocument.url });
            fetchDocumentsStub.returns(Promise.resolve([existingDocument]));
            let pouchClientMock = sinon.mock(PouchClient).expects("updateDocument").withArgs(expectedCreateDocument).returns(Promise.resolve(""));
            CategoryDb.createOrUpdateSource(jsonDocument).then(() => {
                pouchClientMock.verify();
                PouchClient.updateDocument.restore();
                PouchClient.fetchDocuments.restore();
                done();
            });
        });

        it("should reject if the document is empty", (done) => {
            CategoryDb.createOrUpdateSource(null).catch(error => {
                expect("document should not be empty").to.equal(error);
                done();
            });
        });

        xit("should not update or create if the category id of a url is already exists in the document fetched from db", (done) => {
            let jsonDocument = {
                "docType": "source",
                "sourceType": "rss",
                "url": "www.google.com/rss",
                "categoryIds": [
                    "id2"
                ]
            };

            let existingDocument = jsonDocument;

            let fetchDocumentsStub = sinon.stub(PouchClient, "fetchDocuments");
            fetchDocumentsStub.withArgs("category/allSourcesByUrl", { "include_docs": true, "key": jsonDocument.url });
            fetchDocumentsStub.returns(Promise.resolve([existingDocument]));
            let pouchClientMock = sinon.mock(PouchClient).expects("updateDocument").never();
            CategoryDb.createOrUpdateSource(jsonDocument).then(() => {
                pouchClientMock.verify();
                PouchClient.updateDocument.restore();
                done();
            });

        });
    });

    describe("isCategoryExists", () => {
        let resultDocs = null;
        before("isCategoryExists", () => {
            resultDocs = [
                {
                    "_id": "8bc3db40aa04d6c65fd10d833f001be8",
                    "_rev": "1-0078fe2a374458f856d8678a50f78d3e",
                    "docType": "category",
                    "name": "Politics"
                },
                {
                    "_id": "8bc3db40aa04d6c65fd10d833f00163e",
                    "_rev": "2-7f1d26cb8acdcb3dbfc135b74af7ad28",
                    "docType": "category",
                    "name": "Sports"
                }
            ];
        });
        it("should resolve true if the category already exists", (done) => {
            let categoryName = "Sports";
            sinon.stub(CategoryDb, "fetchAllCategoryDocuments").returns(Promise.resolve(resultDocs));
            CategoryDb.isCategoryExists(categoryName).then((result)=> {
                expect(result.status).to.be.true;
                CategoryDb.fetchAllCategoryDocuments.restore();
                done();
            });
        });
        it("should resolve with false if the category not already exists", (done) => {
            let categoryName = "test_category";
            sinon.stub(CategoryDb, "fetchAllCategoryDocuments").returns(Promise.resolve(resultDocs));
            CategoryDb.isCategoryExists(categoryName).then((result)=> {
                expect(result.status).to.be.false;
                CategoryDb.fetchAllCategoryDocuments.restore();
                done();
            });
        });

    });

    describe("createCategoryIfNotExists", () => {
        let categoryDocument = null;
        before("createCategoryIfNotExists", () => {
            categoryDocument = {
                "docType": "category",
                "name": "Politics"
            };
        });

        it("should create the cateogry document if category name does not exists", (done) => {
            sinon.stub(CategoryDb, "isCategoryExists").withArgs("Politics").returns(Promise.resolve({ "status": false }));
            let pouchClientMock = sinon.mock(PouchClient).expects("createDocument").withArgs(categoryDocument).returns(Promise.resolve("resolved"));
            CategoryDb.createCategoryIfNotExists(categoryDocument).then((response)=> {
                pouchClientMock.verify();
                CategoryDb.isCategoryExists.restore();
                PouchClient.createDocument.restore();
                done();
            });
        });

        it("should not create the cateogry document if category is already exists", (done) => {
            sinon.stub(CategoryDb, "isCategoryExists").withArgs("Politics").returns(Promise.resolve({ "status": true }));
            let pouchClientMock = sinon.mock(PouchClient).expects("createDocument").never();
            CategoryDb.createCategoryIfNotExists(categoryDocument).then((response)=> {
                expect("category name already exists").to.equal(response.status);
                pouchClientMock.verify();
                CategoryDb.isCategoryExists.restore();
                PouchClient.createDocument.restore();
                done();
            });
        });

        it("should reject with error if the document is invalid", (done) => {
            let pouchClientMock = sinon.mock(PouchClient).expects("createDocument").never();
            CategoryDb.createCategoryIfNotExists(undefined).catch((response)=> {
                expect("document should not be empty").to.equal(response.status);
                pouchClientMock.verify();
                PouchClient.createDocument.restore();
                done();
            });
        });
    });

    describe("createCategory", () => {
        it("should create category document and return resolved promise", (done) => {
            let jsonDocument = {
                "docType": "category",
                "name": "Sports"
            };
            let fetchCategoryByNameStub = sinon.stub(CategoryDb, "fetchCategoryByName");
            fetchCategoryByNameStub.returns(Promise.resolve([]));
            let pouchClientMock = sinon.mock(PouchClient).expects("createDocument").withArgs(jsonDocument).returns(Promise.resolve("resolve"));
            CategoryDb.createCategory(jsonDocument).then(() => {
                pouchClientMock.verify();
                PouchClient.createDocument.restore();
                CategoryDb.fetchCategoryByName.restore();
                done();
            });
        });

        it("should reject if creation fails", (done) => {
            let jsonDocument = {
                "docType": "category",
                "name": "Sports"
            };

            let existingJsonDocument = {
                "id": "1234",
                "docType": "category",
                "name": "Sports"
            };

            let fetchCategoryByNameStub = sinon.stub(CategoryDb, "fetchCategoryByName");
            fetchCategoryByNameStub.returns(Promise.resolve([existingJsonDocument]));
            let pouchClientMock = sinon.mock(PouchClient).expects("createDocument").never();
            CategoryDb.createCategory(jsonDocument).catch(() => {
                pouchClientMock.verify();
                PouchClient.createDocument.restore();
                CategoryDb.fetchCategoryByName.restore();
                done();
            });
        });

        it("should reject if fetchDocument fails", (done) => {
            let jsonDocument = {
                "docType": "category",
                "name": "Sports"
            };
            let fetchCategoryByNameStub = sinon.stub(CategoryDb, "fetchCategoryByName");
            fetchCategoryByNameStub.returns(Promise.reject([]));
            CategoryDb.createCategory(jsonDocument).catch(() => {
                done();
            });
            CategoryDb.fetchCategoryByName.restore();
        });
    });

    describe("fetchCategoryByName", () => {
        it("should fetch the category by name", () => {
            let name = "categoryname";
            let pouchClientMock = sinon.mock(PouchClient).expects("fetchDocuments").withArgs("category/allCategoriesByName", { "include_docs": true, "key": name });
            CategoryDb.fetchCategoryByName(name);
            pouchClientMock.verify();
            PouchClient.fetchDocuments.restore();
        });

        it("should reject if the category name is empty", (done) => {
            CategoryDb.fetchCategoryByName("").catch(error => {
                expect("name should not be empty").to.equal(error);
                done();
            });
        });
    });

    describe("updateCategory", ()=> {

        it("should update the category passed", (done)=> {
            let document = { "docType": "category", "name": "test", "createdTime": 1448554080663, "_id": "FCE3D585-B11D-5A1E-BADC-BE1392F70905", "_rev": "3-c8b00a32dc84b286d914816b51f7f52e" };
            let response = { "_id": "FCE3D585-B11D-5A1E-BADC-BE1392F70905", "rev": "modified" };

            let updateMock = sinon.mock(PouchClient).expects("updateDocument").withArgs(document).returns(Promise.resolve(response));
            CategoryDb.updateCategory(document).then(()=> {
                updateMock.verify();
                PouchClient.updateDocument.restore();
                done();
            });
        });

        it("should not update the category without id", (done)=> {
            let document = {};
            let response = "Invalid category id";

            let updateMock = sinon.mock(PouchClient).expects("updateDocument").withArgs(document).returns(Promise.reject(response));
            CategoryDb.updateCategory(document).catch(()=> {
                updateMock.verify();
                PouchClient.updateDocument.restore();
                done();
            });
        });

    });
});