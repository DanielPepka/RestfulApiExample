var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var AjaxTracker = /** @class */ (function () {
    function AjaxTracker() {
        this.postCount = ko.observable(0);
        this.isPosting = ko.observable(false);
    }
    AjaxTracker.prototype.MyName = function () {
        console.log("AjaxTracker");
    };
    AjaxTracker.prototype.Start = function () {
        this.postCount(this.postCount() + 1);
        //console.log("Start count: " + this.postCount());
    };
    AjaxTracker.prototype.Stop = function () {
        this.postCount(this.postCount() - 1);
        this.isPosting(this.postCount() > 0);
        // console.log("Stop count: " + this.postCount());
    };
    return AjaxTracker;
}());
var Utils = /** @class */ (function () {
    function Utils() {
    }
    Utils.prototype.MyName = function () {
        console.log("Utils");
    };
    Utils.NotNull = function (item) {
        return (item !== null)
            && (item !== undefined)
            && (item.hasOwnProperty('length') ? item.length > 0 : true);
    };
    Utils.IsNull = function (item) {
        return !this.NotNull(item);
    };
    Utils.Post = function (controllerName, tracker, request, callback) {
        tracker.Start();
        $.post(window.baseUrl + "api/" + controllerName, request)
            .done(function (response) {
            callback(response);
        })
            .fail(function (data) {
            console.log("FAIL(" + controllerName + "): " + JSON.stringify(data));
        })
            .always(function () {
            tracker.Stop();
        });
    };
    return Utils;
}());
/// <summary>
///  ViewModelBase is the base class for any server DTO in this example.  
///  It keeps a backup of the original value, and requires implementation of
///  a Load method, an AsDto method, and a CheckIfModified methods.
/// </summary>
var ViewModelBase = /** @class */ (function () {
    function ViewModelBase(dto, isAdd) {
        if (isAdd === void 0) { isAdd = false; }
        // The original value for the view model that created this. 
        this.original = null;
        // All VM's should know if they are modified or not
        this.isModified = ko.observable(false);
        this.isDelete = ko.observable(false);
        this.isCreate = ko.observable(false);
        this.isSaving = new AjaxTracker();
        this.original = dto;
        this.isCreate(isAdd);
    }
    ViewModelBase.prototype.MyName = function () {
        console.log("ViewModelBase");
    };
    ViewModelBase.prototype.GetUpdateType = function () {
        var updateType = 3 /* isUnchanged */;
        if (this.isCreate()) {
            updateType = 0 /* isCreate */;
        }
        else if (this.isDelete()) {
            updateType = 2 /* isDelete */;
        }
        else if (this.isModified()) {
            updateType = 1 /* isUpdate */;
        }
        return updateType;
    };
    // Resets the ViewModel to the unmodified version we fetched from the server.
    ViewModelBase.prototype.Reset = function () {
        if (Utils.NotNull(this.original)) {
            this.Load(this.original);
        }
        this.isModified(false);
        this.isDelete(false);
    };
    return ViewModelBase;
}());
/// <summary>
///  ItemVM is used to map a server.itemDTO into a knockout observable object.
/// </summary>
var ItemVM = /** @class */ (function (_super) {
    __extends(ItemVM, _super);
    // ItemVM needs a reference back to its collection to inform of it being changed
    function ItemVM(dto, collectionVM) {
        if (dto === void 0) { dto = null; }
        var _this = _super.call(this, dto) || this;
        _this.exampleItemId = 0;
        _this.itemString = ko.observable("");
        _this.itemInt = ko.observable(0);
        _this.itemBool = ko.observable(false);
        _this.exampleCollectionId = 0;
        _this.collectionVM = collectionVM;
        _this.isCreate(Utils.IsNull(dto));
        if (!_this.isCreate()) {
            _this.Load(dto);
        }
        else {
            // set the collection manually
            _this.exampleCollectionId = _this.collectionVM.exampleCollectionId;
        }
        _this.itemString.subscribe(function (newValue) { _this.CheckIfModified(); });
        _this.itemInt.subscribe(function (newValue) { _this.CheckIfModified(); });
        _this.itemBool.subscribe(function (newValue) { _this.CheckIfModified(); });
        _this.isModified.subscribe(function (newValue) { _this.collectionVM.CheckIfModified(); });
        _this.isDelete.subscribe(function (newValue) { _this.collectionVM.CheckIfModified(); });
        return _this;
    }
    ItemVM.prototype.MyName = function () {
        console.log("ItemVM");
    };
    // Take the c# server model and convert the values into knockout observables
    ItemVM.prototype.Load = function (dto) {
        if (dto != null) {
            this.isCreate(dto.UpdateType === 0 /* isCreate */);
            // backup the original object
            this.original = dto;
            this.exampleItemId = dto.ExampleItemId;
            this.itemString(dto.ItemString);
            this.itemInt(dto.ItemInt);
            this.itemBool(dto.ItemBool);
            this.exampleCollectionId = dto.ExampleCollectionId;
        }
    };
    ;
    // Convert our KnockoutVM object back into our c# server model
    ItemVM.prototype.AsDto = function () {
        var item = {
            UpdateType: this.GetUpdateType(),
            ExampleItemId: this.exampleItemId,
            ItemString: this.itemString(),
            ItemInt: this.itemInt(),
            ItemBool: this.itemBool(),
            ExampleCollectionId: this.exampleCollectionId
        };
        return item;
    };
    // CheckIfModified Compares the original values against the observable values and sets isModified to true if different
    ItemVM.prototype.CheckIfModified = function () {
        var isModified = this.isCreate() || this.isDelete();
        this.MyName();
        if (Utils.NotNull(this.original)) {
            isModified = isModified || (this.original.ItemString !== this.itemString());
            isModified = isModified || (this.original.ItemInt != this.itemInt());
            isModified = isModified || (this.original.ItemBool !== this.itemBool());
        }
        console.log("checking modified: " + this.exampleCollectionId + " - " + isModified);
        this.isModified(isModified);
        if (this.isModified()) {
            this.collectionVM.CheckIfModified();
        }
    };
    return ItemVM;
}(ViewModelBase));
/// <summary>
///  CollectionVM is used to map a server.collectionDTO into a knockout observable object.
/// </summary>
var CollectionVM = /** @class */ (function (_super) {
    __extends(CollectionVM, _super);
    function CollectionVM(dto) {
        if (dto === void 0) { dto = null; }
        var _this = _super.call(this, dto) || this;
        _this.exampleCollectionId = 0;
        _this.name = ko.observable("");
        _this.exampleItems = ko.observableArray([]);
        _this.itemCount = ko.computed(function () {
            var count = "-";
            if (Utils.NotNull(_this.exampleItems())) {
                count = "" + _this.exampleItems().length;
            }
            return count;
        });
        if (Utils.NotNull(dto)) {
            _this.Load(dto);
        }
        // Whenever something changes we need to check if we have entered a state that can be saved.
        _this.name.subscribe(function (newValue) { console.log("modified"); _this.CheckIfModified(); });
        return _this;
    }
    CollectionVM.prototype.MyName = function () {
        console.log("CollectionVM");
    };
    // Take the c# server model and convert the values into knockout observables
    CollectionVM.prototype.Load = function (dto) {
        var _this = this;
        if (dto === void 0) { dto = null; }
        if (dto != null) {
            // backup the original object
            this.original = dto;
            this.isCreate(dto.UpdateType === 0 /* isCreate */);
            // store the collection info
            this.exampleCollectionId = dto.ExampleCollectionId;
            this.name(dto.Name);
            // check if there are any example items, if so load those too
            if (dto.ItemDTOs !== null && dto.ItemDTOs !== undefined) {
                var collectionItems = ko.utils.arrayMap(dto.ItemDTOs, function (i) {
                    return new ItemVM(i, _this);
                });
                this.exampleItems(collectionItems);
            }
        }
    };
    ;
    // Convert our KnockoutVM object back into our c# server model
    CollectionVM.prototype.AsDto = function () {
        var dto = {
            UpdateType: this.GetUpdateType(),
            ExampleCollectionId: this.exampleCollectionId,
            Name: this.name(),
            ItemDTOs: []
        };
        ko.utils.arrayForEach(this.exampleItems(), function (item) {
            dto.ItemDTOs.push(item.AsDto());
        });
        return dto;
    };
    // CheckIfModified Compares the original values against the observable values and sets isModified to true if different
    CollectionVM.prototype.CheckIfModified = function () {
        var isModified = this.isCreate() || this.isDelete();
        if (Utils.NotNull(this.original)) {
            isModified = isModified || (this.original.Name !== this.name());
        }
        ko.utils.arrayForEach(this.exampleItems(), function (item, index) {
            isModified = isModified || item.isModified() || item.isCreate() || item.isDelete();
        });
        console.log("checking " + this.exampleCollectionId + ": " + isModified);
        this.isModified(isModified);
    };
    return CollectionVM;
}(ViewModelBase));
var IndexViewModel = /** @class */ (function () {
    function IndexViewModel() {
        var _this = this;
        this.collections = ko.observableArray([]);
        this.selectedCollection = ko.observable(null);
        this.isGettingCollection = new AjaxTracker();
        this.isGettingCollections = new AjaxTracker();
        this.isGettingItems = new AjaxTracker();
        this.isGettingSelectedCollection = new AjaxTracker();
        this.isSavingCollections = new AjaxTracker();
        this.canSave = ko.computed({
            owner: this,
            read: function () {
                var canSave = false;
                // Collections know if its items have changed. 
                ko.utils.arrayForEach(_this.collections(), function (collection, index) {
                    canSave = canSave || collection.isModified();
                });
                return true;
            }
        });
        this.CanSaveCollectionItem = ko.computed({
            owner: this,
            read: function () {
                var canSave = false;
                ko.utils.arrayForEach(_this.collections(), function (collection, index) {
                    canSave = canSave || collection.isModified();
                });
                return true;
            }
        });
        this.deleteAllCollectionsToggle = ko.observable(false);
        this.deleteAllItemsToggle = ko.observable(true);
        this.isModified = ko.observable();
        this.GetCollections();
        this.collections.subscribe(function (newValue) {
            _this.CheckIfModified();
            // update the selected collection
            if (Utils.NotNull(_this.selectedCollection())) {
                _this.selectedCollection(_this.GetCollectionById(_this.selectedCollection().exampleCollectionId));
            }
        });
        this.selectedCollection.subscribe(function (newValue) { _this.deleteAllItemsToggle(true); });
    }
    IndexViewModel.prototype.MyName = function () {
        console.log("IndexViewModel");
    };
    IndexViewModel.prototype.GetCollections = function (collectionIds, includeItems) {
        var _this = this;
        if (collectionIds === void 0) { collectionIds = []; }
        if (includeItems === void 0) { includeItems = false; }
        var request = {
            RequestTime: new Date(),
            // no point in requesting collections that had a temp id
            CollectionIds: collectionIds,
            IncludeItems: includeItems
        };
        Utils.Post("GetCollections", this.isGettingCollections, request, function (response) {
            if (Utils.NotNull(response.Collections)) {
                var collections_1 = _this.collections();
                // so for each item fetched, look for it in the list of existing items
                ko.utils.arrayForEach(response.Collections, function (collectionDTO) {
                    var collectionVM = ko.utils.arrayFirst(collections_1, function (collection) {
                        return collection.exampleCollectionId === collectionDTO.ExampleCollectionId;
                    });
                    var updatedCollection = new CollectionVM(collectionDTO);
                    // if we found it, then splice it in to replace the old version
                    if (Utils.NotNull(collectionVM)) {
                        var index = ko.utils.arrayIndexOf(collections_1, collectionVM);
                        collections_1.splice(index, 1, updatedCollection);
                    }
                    // we don't have it in the list, which means it is new so just add it
                    else {
                        collections_1.push(updatedCollection);
                    }
                });
                _this.collections(collections_1);
                // now update the modified value
                _this.CheckIfModified();
                // do logic to only replace the displayed collection if the item modified was in that collection
                if (Utils.NotNull(_this.selectedCollection())) {
                    var selectedCollectionModified = ko.utils.arrayFirst(response.Collections, function (collectionDTO) {
                        return collectionDTO.ExampleCollectionId === _this.selectedCollection().exampleCollectionId;
                    });
                    // if the selected collection is modified, we need to refresh it with the updated version stored in the list
                    if (Utils.NotNull(selectedCollectionModified)) {
                        _this.selectedCollection(_this.GetCollectionById(_this.selectedCollection().exampleCollectionId));
                    }
                }
            }
        });
    };
    IndexViewModel.prototype.SetSelectedCollection = function (selectedCollectionId) {
        var _this = this;
        if (Utils.IsNull(this.selectedCollection()) || this.selectedCollection().exampleCollectionId != selectedCollectionId) {
            this.selectedCollection(null);
            // if we haven't saved it to the server yet, just work locally.
            this.selectedCollection(this.GetCollectionById(selectedCollectionId));
            if (this.selectedCollection().isCreate() || this.selectedCollection().isModified()) {
                // don't bother loading data from the server if it hasn't been saved yet.
            }
            else {
                // We need to load the contents haven't saved it to the server yet, just work locally.
                var request = {
                    RequestTime: new Date(),
                    ExampleCollectionId: selectedCollectionId,
                    IncludeItems: true
                };
                Utils.Post("GetCollection", this.isGettingSelectedCollection, request, function (response) {
                    var serverCollection = new CollectionVM(response.Collection);
                    if (_this.selectedCollection().isModified()) {
                        serverCollection.name(_this.selectedCollection().name());
                        var serverItems_1 = serverCollection.exampleItems();
                        // loop over the items currently in the list and compare them to the ones from the server
                        ko.utils.arrayForEach(_this.selectedCollection().exampleItems(), function (item) {
                            // new item, wouldn't be on the server yet so just keep it
                            if (item.isCreate()) {
                                serverItems_1.push(item);
                            }
                            else if (item.isModified() || item.isDelete()) {
                                // we have an item that was modified, see if we have it in the server list
                                var exists = ko.utils.arrayFirst(serverItems_1, function (serverItem) {
                                    return serverItem.exampleItemId == item.exampleItemId;
                                });
                                // if so, remove it from the server items
                                if (Utils.NotNull(exists)) {
                                    var index_1 = ko.utils.arrayIndexOf(serverItems_1, exists);
                                    console.log("Index: " + index_1);
                                    serverItems_1.splice(index_1, 1, (item));
                                    //ko.utils.arrayRemoveItem(serverItems, exists);
                                    // and push our modified one
                                }
                                else {
                                    // if it wasn't in the server collection... don't bother adding it
                                }
                            }
                        });
                        serverCollection.exampleItems(serverItems_1);
                    }
                    var collections = _this.collections();
                    var index = ko.utils.arrayIndexOf(collections, _this.selectedCollection());
                    if (_this.selectedCollection().isDelete()) {
                        serverCollection.isDelete(true);
                    }
                    ;
                    collections.splice(index, 1, serverCollection);
                    _this.collections(collections);
                    _this.selectedCollection(_this.GetCollectionById(selectedCollectionId));
                });
            }
        }
    };
    IndexViewModel.prototype.SaveItem = function (collectionId, itemId) {
        var _this = this;
        // First lookup the collection
        var collection = ko.utils.arrayFirst(this.collections(), function (collectionVM) {
            return collectionVM.exampleCollectionId == collectionId;
        });
        // if it exists
        if (Utils.NotNull(collection)) {
            // look for the item requested to be saved
            var item_1 = ko.utils.arrayFirst(collection.exampleItems(), function (itemVM) {
                return itemVM.exampleItemId === itemId;
            });
            // if it exists
            if (Utils.NotNull(item_1)) {
                var request = {
                    RequestTime: new Date(),
                    Items: [item_1.AsDto()]
                };
                Utils.Post("UpdateItems", item_1.isSaving, request, function (response) {
                    var items = collection.exampleItems();
                    // so we finished the update, look for the item and change its id to reflect the new value
                    var updatedItem = ko.utils.arrayFirst(response.UpdatedItemIds, function (updatedItem) {
                        return updatedItem.OrigionalId == item_1.exampleItemId;
                    });
                    // then request that it be updated
                    if (Utils.NotNull(updatedItem)) {
                        item_1.exampleItemId = updatedItem.NewId;
                        if (Utils.IsNull(updatedItem.NewId)) {
                            ko.utils.arrayRemoveItem(items, item_1);
                            if (Utils.NotNull(collection.original)) {
                                var origItem = ko.utils.arrayFirst(collection.original.ItemDTOs, function (item) {
                                    return item.ExampleItemId === updatedItem.OrigionalId;
                                });
                                ko.utils.arrayRemoveItem(collection.original.ItemDTOs, origItem);
                            }
                            collection.exampleItems(items);
                        }
                        else {
                            _this.GetItemsForCollection(collectionId, [updatedItem.NewId]);
                        }
                    }
                    collection.CheckIfModified();
                });
            }
        }
    };
    IndexViewModel.prototype.GetItemsForCollection = function (collectionId, itemIds) {
        var _this = this;
        if (itemIds === void 0) { itemIds = []; }
        // if the list of items is null
        var request = {
            RequestTime: new Date(),
            // no point in requesting an item that has a temp id
            ItemIds: ko.utils.arrayFilter(itemIds, function (item) { return item > 0; })
        };
        Utils.Post("GetItems", this.isGettingItems, request, function (response) {
            if (Utils.NotNull(response.Items)) {
                var collection_1 = _this.GetCollectionById(collectionId);
                // now add all of them back
                // TODO: splicing back in the same place to give a better user experience
                var items_1 = collection_1.exampleItems();
                // so for each item fetched, look for it in the list of existing items
                ko.utils.arrayForEach(response.Items, function (i) {
                    var itemVM = ko.utils.arrayFirst(items_1, function (item) {
                        return item.exampleItemId === i.ExampleItemId;
                    });
                    var updatedItem = new ItemVM(i, collection_1);
                    // if we found it, then splice it in to replace the old version
                    if (Utils.NotNull(itemVM)) {
                        var index = ko.utils.arrayIndexOf(items_1, itemVM);
                        items_1.splice(index, 1, updatedItem);
                    }
                    // we don't have it in the list, which means it is new so just add it
                    else {
                        items_1.push(updatedItem);
                    }
                });
                collection_1.exampleItems(items_1);
                // now update the modified value
                collection_1.CheckIfModified();
                // do logic to only replace the displayed collection if the item modified was in that collection
                if (Utils.NotNull(_this.selectedCollection()) && _this.selectedCollection().exampleCollectionId == collectionId) {
                    _this.selectedCollection(_this.GetCollectionById(_this.selectedCollection().exampleCollectionId));
                }
            }
        });
    };
    // Save changes to all collections and all DTOs that have changed, optionally just save the collections of the ids passed in.
    // save collections also saves the items
    IndexViewModel.prototype.SaveCollections = function (collectionIds) {
        var _this = this;
        if (collectionIds === void 0) { collectionIds = []; }
        var filtered = [];
        // first find each of the collections that were requested to be saved and put them in a list
        filtered = ko.utils.arrayFilter(this.collections(), function (item) {
            var result = false;
            // so if the collection ids aren't null, look 
            if (Utils.NotNull(collectionIds)) {
                var exists = ko.utils.arrayFirst(collectionIds, function (collectionId) {
                    return collectionId === item.exampleCollectionId;
                });
                result = Utils.NotNull(exists);
            }
            // if they are null, then just... save all collections which are modified
            else {
                result = item.isModified() || item.isCreate() || item.isDelete();
            }
            return result;
        });
        // map the collections to be saved into DTOs, this includes any changes to items
        var collectionDTOs = ko.utils.arrayMap(filtered, function (collectionVM) {
            return collectionVM.AsDto();
        });
        var request = {
            RequestTime: new Date(),
            Collections: collectionDTOs
        };
        Utils.Post("UpdateCollections", this.isSavingCollections, request, function (response) {
            // so now we updated the collections, look for any that were created new or removed
            if (Utils.NotNull(response.UpdatedCollectionIds)) {
                var collections_2 = _this.collections();
                var collectionIds_1 = [];
                // so we finished the update, look for each collection that was added and collection and change its id to reflect the new value
                ko.utils.arrayForEach(response.UpdatedCollectionIds, function (updatedCollection) {
                    // find the original collection
                    var collectionVM = ko.utils.arrayFirst(collections_2, function (collection) {
                        return collection.exampleCollectionId === updatedCollection.OrigionalId;
                    });
                    if (Utils.IsNull(updatedCollection.NewId)) {
                        ko.utils.arrayRemoveItem(collections_2, collectionVM);
                    }
                    else {
                        // if the original value is 0 or less then we were adding a new collection
                        collectionIds_1.push(updatedCollection.NewId);
                        if (updatedCollection.OrigionalId <= 0) {
                            if (Utils.NotNull(collectionVM)) {
                                collectionVM.exampleCollectionId = updatedCollection.NewId;
                            }
                        }
                    }
                    // if the updated value is null, we removed it
                });
                _this.collections(collections_2);
                _this.GetCollections(collectionIds_1, true);
            }
        });
    };
    IndexViewModel.prototype.AddNewCollection = function () {
        var collectionIds = ko.utils.arrayMap(this.collections(), function (item) { return item.exampleCollectionId; });
        var minCollectionId = Math.min.apply(Math, collectionIds) - 1;
        if (minCollectionId > 0) {
            minCollectionId = 0;
        }
        var newCollectionDTO = {
            Name: "New Collection",
            ExampleCollectionId: minCollectionId,
            ItemDTOs: [],
            UpdateType: 0 /* isCreate */
        };
        var newCollection = new CollectionVM(newCollectionDTO);
        this.collections.push(newCollection);
    };
    IndexViewModel.prototype.DeleteAll = function () {
        this.deleteAllCollectionsToggle(!this.deleteAllCollectionsToggle());
        var collections = this.collections();
        this.DeleteCollections(ko.utils.arrayMap(collections, function (item) {
            return item.exampleCollectionId;
        }), true);
    };
    IndexViewModel.prototype.DeleteAllItems = function () {
        this.deleteAllItemsToggle(!this.deleteAllItemsToggle());
        var collection = this.selectedCollection();
        var items = collection.exampleItems();
        this.DeleteItems(collection.exampleCollectionId, ko.utils.arrayMap(items, function (item) {
            return item.exampleItemId;
        }), true);
    };
    IndexViewModel.prototype.DeleteCollections = function (collectionIds, useToggle) {
        var _this = this;
        if (useToggle === void 0) { useToggle = false; }
        var collections = this.collections();
        ko.utils.arrayForEach(collectionIds, function (exampleCollectionId) {
            var collection = _this.GetCollectionById(exampleCollectionId);
            if (exampleCollectionId <= 0) {
                ko.utils.arrayRemoveItem(collections, collection);
            }
            else {
                if (useToggle) {
                    collection.isDelete(_this.deleteAllCollectionsToggle());
                }
                else {
                    collection.isDelete(!collection.isDelete());
                }
            }
        });
        this.collections(collections);
    };
    IndexViewModel.prototype.DeleteItems = function (collectionId, itemIds, useToggle) {
        var _this = this;
        if (useToggle === void 0) { useToggle = false; }
        var collection = this.GetCollectionById(collectionId);
        var items = collection.exampleItems();
        ko.utils.arrayForEach(itemIds, function (exampleItemId) {
            var item = ko.utils.arrayFirst(items, function (item) {
                return item.exampleItemId == exampleItemId;
            });
            if (Utils.NotNull(item)) {
                if (exampleItemId <= 0) {
                    ko.utils.arrayRemoveItem(items, item);
                }
                else {
                    if (useToggle) {
                        item.isDelete(_this.deleteAllItemsToggle());
                    }
                    else {
                        item.isDelete(!item.isDelete());
                    }
                }
            }
        });
        collection.exampleItems(items);
    };
    IndexViewModel.prototype.ResetAll = function () {
        var collections = this.collections();
        ko.utils.arrayForEach(collections, function (collection) {
            if (Utils.NotNull(collection)) {
                collection.Reset();
            }
        });
        this.collections(collections);
    };
    IndexViewModel.prototype.ResetSelectedCollection = function () {
        var collection = this.selectedCollection();
        var items = collection.exampleItems();
        if (Utils.NotNull(items)) {
            ko.utils.arrayForEach(collection.exampleItems(), function (exampleItem) {
                if (Utils.NotNull(exampleItem)) {
                    exampleItem.Reset();
                }
            });
            collection.exampleItems(items);
        }
        collection.Reset();
        collection.CheckIfModified();
        this.selectedCollection(collection);
        this.CheckIfModified();
    };
    IndexViewModel.prototype.ResetItem = function (collectionId, itemId) {
    };
    IndexViewModel.prototype.GetCollectionById = function (collectionId) {
        var collection = ko.utils.arrayFirst(this.collections(), function (item) {
            return item.exampleCollectionId == collectionId;
        });
        return collection;
    };
    IndexViewModel.prototype.AddNewItem = function () {
        var itemIds = ko.utils.arrayMap(this.selectedCollection().exampleItems(), function (item) { return item.exampleItemId; });
        var minItemId = Math.min.apply(Math, itemIds) - 1;
        if (minItemId > 0) {
            minItemId = 0;
        }
        var newItem = new ItemVM(null, this.selectedCollection());
        newItem.exampleItemId = minItemId;
        newItem.itemString("New Item");
        newItem.itemInt(0);
        newItem.itemBool(false);
        newItem.exampleCollectionId = this.selectedCollection().exampleCollectionId;
        newItem.isCreate(true);
        var items = this.selectedCollection().exampleItems();
        items.push(newItem);
        this.selectedCollection().exampleItems(items);
        this.selectedCollection().isModified(true);
    };
    IndexViewModel.prototype.CheckIfModified = function () {
        var isModified = false;
        var exists = ko.utils.arrayFirst(this.collections(), function (item) {
            return item.isModified() || item.isCreate() || item.isDelete();
        });
        this.isModified(Utils.NotNull(exists));
    };
    return IndexViewModel;
}());
//# sourceMappingURL=ViewModels.js.map