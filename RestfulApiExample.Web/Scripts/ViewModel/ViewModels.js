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
        this.isCreate = ko.observable(true);
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
        this.Load(this.original);
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
    function ItemVM(dto) {
        if (dto === void 0) { dto = null; }
        var _this = _super.call(this, dto) || this;
        _this.exampleItemId = 0;
        _this.itemString = ko.observable("");
        _this.itemInt = ko.observable(0);
        _this.itemBool = ko.observable(false);
        _this.exampleCollectionId = 0;
        _this.isCreate(dto == null);
        if (!_this.isCreate()) {
            _this.Load(dto);
        }
        _this.itemString.subscribe(function (newValue) { _this.CheckIfModified(); });
        _this.itemInt.subscribe(function (newValue) { _this.CheckIfModified(); });
        _this.itemBool.subscribe(function (newValue) { _this.CheckIfModified(); });
        return _this;
    }
    ItemVM.prototype.MyName = function () {
        console.log("ItemVM");
    };
    // Take the c# server model and convert the values into knockout observables
    ItemVM.prototype.Load = function (item) {
        if (item != null) {
            // backup the original object
            this.original = item;
            this.exampleItemId = item.ExampleItemId;
            this.itemString(item.ItemString);
            this.itemInt(item.ItemInt);
            this.itemBool(item.ItemBool);
            this.exampleCollectionId = item.ExampleCollectionId;
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
        console.log("checking modified: ");
        this.MyName();
        if (Utils.NotNull(this.original)) {
            isModified = isModified || (this.original.ItemString !== this.itemString());
            isModified = isModified || (this.original.ItemInt !== this.itemInt());
            isModified = isModified || (this.original.ItemBool !== this.itemBool());
        }
        this.isModified(isModified);
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
        if (Utils.NotNull(dto)) {
            _this.isCreate(false);
            _this.Load(dto);
        }
        // Whenever something changes we need to check if we have entered a state that can be saved.
        _this.name.subscribe(function (newValue) { console.log("modified"); _this.CheckIfModified(); });
        _this.exampleItems.subscribe(function (newValue) { _this.CheckIfModified(); });
        return _this;
    }
    CollectionVM.prototype.MyName = function () {
        console.log("CollectionVM");
    };
    // Take the c# server model and convert the values into knockout observables
    CollectionVM.prototype.Load = function (item) {
        if (item === void 0) { item = null; }
        if (item != null) {
            // backup the original object
            this.original = item;
            // store the collection info
            this.exampleCollectionId = item.ExampleCollectionId;
            this.name(item.Name);
            // check if there are any example items, if so load those too
            if (item.ItemDTOs !== null && item.ItemDTOs !== undefined) {
                var collectionItems = ko.utils.arrayMap(item.ItemDTOs, function (i) {
                    return new ItemVM(i);
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
        return dto;
    };
    CollectionVM.prototype.AsDtoWithItems = function () {
        var dto = this.AsDto();
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
            isModified = isModified || item.isModified();
        });
        this.isModified(isModified);
    };
    return CollectionVM;
}(ViewModelBase));
var IndexViewModel = /** @class */ (function () {
    function IndexViewModel() {
        var _this = this;
        this.collections = ko.observableArray([]);
        this.selectedCollection = ko.observable(null);
        this.isGettingCollections = new AjaxTracker();
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
        this.isModified = ko.observable();
        this.GetCollections();
        this.collections.subscribe(function (newValue) { _this.CheckIfModified(); });
    }
    IndexViewModel.prototype.MyName = function () {
        console.log("IndexViewModel");
    };
    IndexViewModel.prototype.GetCollections = function () {
        var _this = this;
        this.collections([]);
        var request = {
            CollectionIds: [],
            IncludeItems: false
        };
        Utils.Post("GetCollections", this.isGettingCollections, request, function (response) {
            if (response.Collections.length > 0) {
                var collections = ko.utils.arrayMap(response.Collections, function (i) {
                    return new CollectionVM(i);
                });
                _this.collections(collections);
            }
        });
    };
    IndexViewModel.prototype.SetSelectedCollection = function (selectedCollectionId) {
        var _this = this;
        this.selectedCollection(null);
        var request = {
            ExampleCollectionId: selectedCollectionId,
            IncludeItems: true
        };
        // if we haven't saved it to the server yet, just work locally.
        var collection = this.GetCollectionById(selectedCollectionId);
        this.selectedCollection(collection);
        if (selectedCollectionId <= 0) {
        }
        else {
            // We need to load the contents haven't saved it to the server yet, just work locally.
            Utils.Post("GetCollection", this.isGettingSelectedCollection, request, function (response) {
                var serverCollection = new CollectionVM(response.Collection);
                var selectedCollectionItems = collection.exampleItems();
                ko.utils.arrayForEach(collection.exampleItems(), function (selectedCollectionItem) {
                    if (!selectedCollectionItem.isModified()) {
                        // then we should update with the server version, otherwise keep local
                        var serverItem = ko.utils.arrayFirst(serverCollection.exampleItems(), function (serverItem) { return serverItem.exampleItemId === selectedCollectionItem.exampleItemId; });
                        if (Utils.NotNull(serverItem)) {
                        }
                        else {
                            // if the server version doesn't exist then we should remove it from the array. 
                            ko.utils.arrayRemoveItem(selectedCollectionItems, selectedCollectionItem);
                        }
                    }
                });
                collection.exampleItems(selectedCollectionItems);
                _this.selectedCollection();
            });
        }
    };
    IndexViewModel.prototype.SaveItem = function (collectionId, itemId) {
        var collection = ko.utils.arrayFirst(this.collections(), function (collectionVM) {
            return collectionVM.exampleCollectionId == collectionId;
        });
        if (Utils.NotNull(collection)) {
            var item = ko.utils.arrayFirst(collection.exampleItems(), function (itemVM) {
                return itemVM.exampleItemId === itemId;
            });
            var items = [];
            if (Utils.NotNull(item)) {
                items.push(item.AsDto());
                var request = {
                    Items: items,
                    CollectionId: collectionId
                };
                Utils.Post("UpdateItems", item.isSaving, request, function (response) {
                    console.log("UpdateItems: " + JSON.stringify(response));
                });
            }
        }
    };
    IndexViewModel.prototype.SaveCollection = function (collectionId, includeItems) {
        if (includeItems === void 0) { includeItems = false; }
        var collections = [];
        var collection = ko.utils.arrayFirst(this.collections(), function (collectionVM) {
            return collectionVM.exampleCollectionId == collectionId;
        });
        if (Utils.NotNull(collection)) {
            if (includeItems) {
                collections.push(collection.AsDtoWithItems());
            }
            else {
                collections.push(collection.AsDto());
            }
            var request = {
                Collections: collections
            };
            Utils.Post("UpdateCollections", collection.isSaving, request, function (response) {
                console.log("UpdateCollections: " + JSON.stringify(response));
            });
        }
    };
    // Save changes to all collections and all DTOs that have changed
    IndexViewModel.prototype.SaveCollections = function () {
        var _this = this;
        var filtered = ko.utils.arrayFilter(this.collections(), function (item) {
            return item.isModified() || item.isCreate() || item.isDelete();
        });
        var collections = ko.utils.arrayMap(filtered, function (collectionVM) {
            var collectionDTO = collectionVM.AsDtoWithItems();
            collectionDTO.UpdateType = collectionVM.GetUpdateType();
            return collectionDTO;
        });
        var request = {
            Collections: collections
        };
        Utils.Post("UpdateCollections", this.isSavingCollections, request, function (response) {
            _this.GetCollections();
        });
    };
    IndexViewModel.prototype.AddNewCollection = function () {
        var newCollection = new CollectionVM();
        newCollection.name("New Collection");
        newCollection.isCreate(true);
        var collectionIds = ko.utils.arrayMap(this.collections(), function (item) { return item.exampleCollectionId; });
        var minCollectionId = Math.min.apply(Math, collectionIds);
        newCollection.exampleCollectionId = minCollectionId > 0 ? 0 : minCollectionId - 1;
        this.collections.push(newCollection);
    };
    IndexViewModel.prototype.DeleteAll = function () {
        var collections = this.collections();
        this.DeleteCollections(ko.utils.arrayMap(collections, function (item) {
            return item.exampleCollectionId;
        }));
    };
    IndexViewModel.prototype.DeleteCollections = function (collectionIds) {
        var _this = this;
        var collections = this.collections();
        ko.utils.arrayForEach(collectionIds, function (exampleCollectionId) {
            var collection = _this.GetCollectionById(exampleCollectionId);
            if (exampleCollectionId <= 0) {
                ko.utils.arrayRemoveItem(collections, collection);
            }
            else {
                collection.isDelete(!collection.isDelete());
            }
        });
        this.collections(collections);
    };
    IndexViewModel.prototype.ResetAll = function () {
        ko.utils.arrayForEach(this.collections(), function (item) {
            item.Reset();
        });
    };
    IndexViewModel.prototype.ResetCollection = function (collectionId) {
        var collection = this.GetCollectionById(collectionId);
        collection.Reset();
    };
    IndexViewModel.prototype.GetCollectionById = function (collectionId) {
        var collection = ko.utils.arrayFirst(this.collections(), function (item) {
            return item.exampleCollectionId == collectionId;
        });
        return collection;
    };
    IndexViewModel.prototype.AddNewItem = function (selectedCollectionId) {
        // grab the collection
        var collection = this.GetCollectionById(selectedCollectionId);
        // add the item
        var itemIds = ko.utils.arrayMap(collection.exampleItems(), function (item) { return item.exampleItemId; });
        var minItemId = Math.min.apply(Math, itemIds);
        var newItem = new ItemVM();
        newItem.exampleItemId = minItemId - 1;
        newItem.itemString("New Item");
        newItem.itemInt(0);
        newItem.itemBool(false);
        var items = collection.exampleItems();
        items.push(newItem);
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