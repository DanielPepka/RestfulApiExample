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
        console.log("Start count: " + this.postCount());
    };
    AjaxTracker.prototype.Stop = function () {
        this.postCount(this.postCount() - 1);
        this.isPosting(this.postCount() >= 0);
        console.log("Stop count: " + this.postCount());
    };
    return AjaxTracker;
}());
var Utils = /** @class */ (function () {
    function Utils() {
    }
    Utils.prototype.MyName = function () {
        console.log("Utils");
    };
    Utils.Post = function (apiEndpoint, tracker, request, callback) {
        tracker.Start();
        $.post(apiEndpoint, request)
            .done(function (response) {
            callback(response);
        })
            .fail(function (data) {
            console.log("FAIL(" + apiEndpoint + "): " + JSON.stringify(data));
        })
            .always(function () {
            tracker.Stop();
        });
    };
    return Utils;
}());
/// <summary>
///  ViewModelBase is the base class for any server DTO.  
///  It keeps a backup of the original value, and requires implementation of
///  a Load method, a AsDto method, and a CheckIfModified methods.
/// </summary>
var ViewModelBase = /** @class */ (function () {
    function ViewModelBase(dto) {
        // The original value for the view model that created this. 
        this.original = null;
        // All VM's should know if they are modified or not
        this.isModified = ko.observable(false);
        this.isMarkedForDelete = ko.observable(false);
        this.original = dto;
    }
    ViewModelBase.prototype.MyName = function () {
        console.log("ViewModelBase");
    };
    // Resets the ViewModel to the unmodified version we fetched from the server.
    ViewModelBase.prototype.Reset = function () {
        this.Load(this.original);
        this.isModified(false);
        this.isMarkedForDelete(false);
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
        if (dto != null) {
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
        if (item === void 0) { item = null; }
        if (item != null) {
            // backup the original object
            this.original = item;
            this.exampleItemId = item.Value.ExampleItemId;
            this.itemString(item.Value.ItemString);
            this.itemInt(item.Value.ItemInt);
            this.itemBool(item.Value.ItemBool);
            this.exampleCollectionId = item.Value.ExampleCollectionId;
        }
    };
    ;
    // Convert our KnockoutVM object back into our c# server model
    ItemVM.prototype.AsDto = function () {
        var item = {
            UpdateType: null,
            Value: {
                ExampleItemId: this.exampleItemId,
                ItemString: this.itemString(),
                ItemInt: this.itemInt(),
                ItemBool: this.itemBool(),
                ExampleCollectionId: this.exampleCollectionId,
                ExampleCollection: null
            }
        };
        return item;
    };
    ItemVM.prototype.CheckIfModified = function () {
        var isModified = false;
        isModified = isModified || (this.original.Value.ItemString !== this.itemString());
        isModified = isModified || (this.original.Value.ItemInt !== this.itemInt());
        isModified = isModified || (this.original.Value.ItemBool !== this.itemBool());
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
        if (dto != null) {
            _this.Load(dto);
        }
        _this.name.subscribe(function (newValue) { _this.CheckIfModified(); });
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
            this.MyName();
            // store the collection info
            this.exampleCollectionId = item.Value.ExampleCollectionId;
            this.name(item.Value.Name);
            // check if there are any example items, if so load those too
            if (item.Value.ExampleItems !== null && item.Value.ExampleItems !== undefined) {
                var collectionItems = ko.utils.arrayMap(item.Value.ExampleItems, function (i) {
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
            UpdateType: null,
            Value: {
                ExampleCollectionId: this.exampleCollectionId,
                Name: this.name(),
                ExampleItems: null
            }
        };
        return dto;
    };
    CollectionVM.prototype.CheckIfModified = function () {
        var isModified = false;
        isModified = isModified || (this.original.Value.Name !== this.name());
        this.isModified(isModified);
    };
    return CollectionVM;
}(ViewModelBase));
var IndexViewModel = /** @class */ (function () {
    function IndexViewModel() {
        this.collections = ko.observableArray([]);
        this.selectedCollection = ko.observable(null);
        this.isGettingCollections = new AjaxTracker();
        this.isGettingSelectedCollection = new AjaxTracker();
        this.GetCollections();
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
        Utils.Post("Api/GetCollections", this.isGettingCollections, request, function (response) {
            console.log("collections: " + JSON.stringify(response));
            if (response.Collections.length > 0) {
                var collections = ko.utils.arrayMap(response.Collections, function (i) {
                    return new CollectionVM(i);
                });
                console.log("collections: " + JSON.stringify(response));
                _this.collections(collections);
            }
        });
    };
    IndexViewModel.prototype.SetSelectedCollection = function (selectedCollectionId) {
        var _this = this;
        this.selectedCollection(null);
        var request = {
            ExampleCollectionId: selectedCollectionId
        };
        Utils.Post("Api/GetCollection", this.isGettingSelectedCollection, request, function (response) {
            _this.selectedCollection(new CollectionVM(response.Collection));
        });
    };
    return IndexViewModel;
}());
//# sourceMappingURL=ViewModels.js.map