interface Window {
    indexViewModel: IndexViewModel;
    baseUrl: KnockoutObservable<string>;
}

class AjaxTracker {
    MyName(): void {
        console.log("AjaxTracker");
    }

    postCount: KnockoutObservable<number> = ko.observable(0);
    isPosting: KnockoutObservable<boolean> = ko.observable(false);

    Start(): void {
        this.postCount(this.postCount() + 1);
        //console.log("Start count: " + this.postCount());
    }

    Stop(): void {
        this.postCount(this.postCount() - 1);
        this.isPosting(this.postCount() > 0);
        // console.log("Stop count: " + this.postCount());
    }
}

class Utils {
    MyName(): void {
        console.log("Utils");
    }

    static NotNull(item: any): boolean {
        return (item !== null)
            && (item !== undefined)
            && (item.hasOwnProperty('length') ? item.length > 0 : true);
    }

    static IsNull(item: any): boolean {
        return !this.NotNull(item);
    }

    static Post(controllerName: string, tracker: AjaxTracker, request: any, callback: (response: any) => any): void {
        tracker.Start();
        $.post(window.baseUrl + "api/" + controllerName, request)
            .done((response: server.GetCollectionsResponse) => {
                callback(response);
            })
            .fail((data: any) => {
                console.log("FAIL(" + controllerName + "): " + JSON.stringify(data));
            })
            .always(() => {
                tracker.Stop();
            });
    }
}

/// <summary>
///  ViewModelBase is the base class for any server DTO in this example.  
///  It keeps a backup of the original value, and requires implementation of
///  a Load method, an AsDto method, and a CheckIfModified methods.
/// </summary>
abstract class ViewModelBase<Type> {
    MyName(): void {
        console.log("ViewModelBase");
    }

    // The original value for the view model that created this. 
    original: Type = null;

    // All VM's should know if they are modified or not
    isModified: KnockoutObservable<boolean> = ko.observable(false);
    isDelete: KnockoutObservable<boolean> = ko.observable(false);
    isCreate: KnockoutObservable<boolean> = ko.observable(true);
    isSaving: AjaxTracker = new AjaxTracker();

    /// Load takes the server.DTO and maps it into a knockout observable version. 
    abstract Load(item: Type): void;
    /// AsDto converts the knockout observable version back into a server.DTO which can be used for posting
    abstract AsDto(): Type;
    /// Check if Modified should set isModified to true if any of the knockout observable values become different from the original. 
    abstract CheckIfModified(): void;

    GetUpdateType(): server.UpdateType {
        let updateType: server.UpdateType = server.UpdateType.isUnchanged;

        if (this.isCreate()) {
            updateType = server.UpdateType.isCreate;
        }
        else if (this.isDelete()) {
            updateType = server.UpdateType.isDelete;
        }
        else if (this.isModified()) {
            updateType = server.UpdateType.isUpdate;
        }
        return updateType;
    }

    // Resets the ViewModel to the unmodified version we fetched from the server.
    Reset() {
        this.Load(this.original);
        this.isModified(false);
        this.isDelete(false);
    }

    constructor(dto: Type, isAdd: boolean = false) {
        this.original = dto;

        this.isCreate(isAdd)

    }
}

/// <summary>
///  ItemVM is used to map a server.itemDTO into a knockout observable object.
/// </summary>
class ItemVM extends ViewModelBase<server.ItemDTO> {
    MyName(): void {
        console.log("ItemVM");
    }

    exampleItemId: number = 0;
    itemString: KnockoutObservable<string> = ko.observable("");
    itemInt: KnockoutObservable<number> = ko.observable(0);
    itemBool: KnockoutObservable<boolean> = ko.observable(false);
    exampleCollectionId: number = 0;

    // Take the c# server model and convert the values into knockout observables
    Load(item: server.ItemDTO): void {
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

    // Convert our KnockoutVM object back into our c# server model
    AsDto(): server.ItemDTO {
        let item: server.ItemDTO = {
            UpdateType: this.GetUpdateType(),
            ExampleItemId: this.exampleItemId,
            ItemString: this.itemString(),
            ItemInt: this.itemInt(),
            ItemBool: this.itemBool(),
            ExampleCollectionId: this.exampleCollectionId
        };
        return item;
    }

    // CheckIfModified Compares the original values against the observable values and sets isModified to true if different
    CheckIfModified(): void {
        let isModified = this.isCreate() || this.isDelete();

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
    }

    collectionVM: CollectionVM;
    constructor(dto: server.ItemDTO = null, collectionVM: CollectionVM) {
        super(dto);
        this.collectionVM = collectionVM;
        this.isCreate(Utils.IsNull(dto));
        if (!this.isCreate()) {
            this.Load(dto);
        } else {
            // set the collection manually
            this.exampleCollectionId = this.collectionVM.exampleCollectionId;
        }
        this.itemString.subscribe((newValue: string) => { this.CheckIfModified(); });
        this.itemInt.subscribe((newValue: number) => { this.CheckIfModified(); });
        this.itemBool.subscribe((newValue: boolean) => { this.CheckIfModified(); });
        this.isModified.subscribe((newValue: boolean) => { this.collectionVM.CheckIfModified(); });
        this.isDelete.subscribe((newValue: boolean) => { this.collectionVM.CheckIfModified(); });
    }
}

/// <summary>
///  CollectionVM is used to map a server.collectionDTO into a knockout observable object.
/// </summary>
class CollectionVM extends ViewModelBase<server.CollectionDTO> {
    MyName(): void {
        console.log("CollectionVM");
    }

    exampleCollectionId: number = 0;
    name: KnockoutObservable<string> = ko.observable("");
    exampleItems: KnockoutObservableArray<ItemVM> = ko.observableArray([]);

    itemCount: KnockoutComputed<string> = ko.computed(() => {
        let count: string = "-";
        if (Utils.NotNull(this.exampleItems())) {
            count = "" + this.exampleItems().length;
        }
        return count;
    });

    // Take the c# server model and convert the values into knockout observables
    Load(item: server.CollectionDTO = null): void {
        if (item != null) {
            // backup the original object
            this.original = item;

            // store the collection info
            this.exampleCollectionId = item.ExampleCollectionId;
            this.name(item.Name);

            // check if there are any example items, if so load those too
            if (item.ItemDTOs !== null && item.ItemDTOs !== undefined) {
                let collectionItems: ItemVM[] = ko.utils.arrayMap(item.ItemDTOs, (i: server.ItemDTO) => {
                    return new ItemVM(i, this);
                });

                this.exampleItems(collectionItems);
            }
        }
    };

    // Convert our KnockoutVM object back into our c# server model
    AsDto(): server.CollectionDTO {
        let dto: server.CollectionDTO = {
            UpdateType: this.GetUpdateType(),
            ExampleCollectionId: this.exampleCollectionId,
            Name: this.name(),
            ItemDTOs: []
        };

        ko.utils.arrayForEach(this.exampleItems(), (item: ItemVM) => {
            dto.ItemDTOs.push(item.AsDto());
        });

        return dto;
    }

    // CheckIfModified Compares the original values against the observable values and sets isModified to true if different
    CheckIfModified(): void {
        let isModified = this.isCreate() || this.isDelete();

        if (Utils.NotNull(this.original)) {
            isModified = isModified || (this.original.Name !== this.name());
        }

        ko.utils.arrayForEach(this.exampleItems(), (item: ItemVM, index: number) => {
            isModified = isModified || item.isModified() || item.isCreate() || item.isDelete();
        });

        console.log("checking " + this.exampleCollectionId + ": " + isModified);
        this.isModified(isModified);
    }

    constructor(dto: server.CollectionDTO = null) {
        super(dto);
        if (Utils.NotNull(dto)) {
            this.isCreate(false);
            this.Load(dto);
        }

        // Whenever something changes we need to check if we have entered a state that can be saved.
        this.name.subscribe((newValue: string) => { console.log("modified"); this.CheckIfModified(); });
    }
}

class IndexViewModel {
    MyName(): void {
        console.log("IndexViewModel");
    }

    collections: KnockoutObservableArray<CollectionVM> = ko.observableArray([]);
    selectedCollection: KnockoutObservable<CollectionVM> = ko.observable(null);

    isGettingCollection: AjaxTracker = new AjaxTracker();
    isGettingCollections: AjaxTracker = new AjaxTracker();
    isGettingItems: AjaxTracker = new AjaxTracker();
    isGettingSelectedCollection: AjaxTracker = new AjaxTracker();
    isSavingCollections: AjaxTracker = new AjaxTracker();

    canSave: KnockoutComputed<boolean> = ko.computed({
        owner: this,
        read: () => {
            let canSave = false;
            // Collections know if its items have changed. 
            ko.utils.arrayForEach(this.collections(), (collection: CollectionVM, index: number) => {
                canSave = canSave || collection.isModified();
            });
            return true;
        }
    });

    CanSaveCollectionItem: KnockoutComputed<boolean> = ko.computed({
        owner: this,
        read: () => {
            let canSave = false;
            ko.utils.arrayForEach(this.collections(), (collection: CollectionVM, index: number) => {
                canSave = canSave || collection.isModified();
            });
            return true;
        }
    });


    GetItems(selectedCollectionId: number, itemIds: number[] = []) {

        // remove from our collections all of the ones we are trying to fetch
        let collection: CollectionVM = this.GetCollectionById(selectedCollectionId);
        let items = collection.exampleItems();
        ko.utils.arrayForEach(itemIds, (itemId: number) => {
            var existing = ko.utils.arrayFirst(items, (item: ItemVM) => {
                return item.exampleItemId === itemId;
            });
            if (Utils.NotNull(existing)) {
                ko.utils.arrayRemoveItem(items, existing);
            } else {
                // :shrug:
            }
        });

        collection.exampleItems(items);
        let request: server.GetItemsRequest = {
            // no point in requesting an item that had a temp id
            ItemIds: ko.utils.arrayFilter(itemIds, (item: number) => { return item > 0; })
        };

        Utils.Post("GetItems", this.isGettingItems, request, (response: server.GetItemsResponse) => {
            if (Utils.NotNull(response.Items)) {

                let collection: CollectionVM = this.GetCollectionById(selectedCollectionId);
                // now add all of them back
                // TODO: splicing back in the same place to give a better user experiance
                let newItems: ItemVM[] = ko.utils.arrayMap(response.Items, (i: server.ItemDTO) => {
                    return new ItemVM(i, collection);
                });

                let items = collection.exampleItems();
                ko.utils.arrayPushAll(items, newItems)

                // do logic to only replace the collection if it was requested.
                collection.exampleItems(items);
                collection.CheckIfModified();
                if (Utils.NotNull(this.selectedCollection()) && this.selectedCollection().exampleCollectionId == selectedCollectionId) {
                    this.selectedCollection(this.GetCollectionById(this.selectedCollection().exampleCollectionId));
                }
            }
        });
    }

    GetCollections(collectionIds: number[] = [], includeItems: boolean = false) {

        console.log("get col: " + ko.toJSON(collectionIds));
        // remove from our collections all of the ones we are trying to fetch
        let collections = this.collections();
        ko.utils.arrayForEach(collectionIds, (collectionId: number) => {
            var existing = ko.utils.arrayFirst(collections, (item: CollectionVM) => {
                return item.exampleCollectionId === collectionId;
            });
            if (Utils.NotNull(existing)) {
                ko.utils.arrayRemoveItem(collections, existing);
            } else {
                // :shrug:
            }
        });
        this.collections(collections)
        let request: server.GetCollectionsRequest = {
            // no point in requesting collections that had a temp id
            CollectionIds: ko.utils.arrayFilter(collectionIds, (item: number) => { return item > 0; }),
            IncludeItems: includeItems
        };

        Utils.Post("GetCollections", this.isGettingCollections, request, (response: server.GetCollectionsResponse) => {
            if (Utils.NotNull(response.Collections)) {

                // now add all of them back
                // TODO: splicing back in the same place to give a better user experiance
                let newCollections: CollectionVM[] = ko.utils.arrayMap(response.Collections, (i: server.CollectionDTO) => {
                    return new CollectionVM(i);
                });

                let collections = this.collections();
                ko.utils.arrayPushAll(collections, newCollections)

                // do logic to only replace the collection if it was requested.
                this.collections(collections);
                // refresh the selected collection

                if (Utils.NotNull(this.selectedCollection())) {
                    this.selectedCollection(this.GetCollectionById(this.selectedCollection().exampleCollectionId));
                }
            }
        });
    }

    SetSelectedCollection(selectedCollectionId: number) {
        if (Utils.IsNull(this.selectedCollection()) || this.selectedCollection().exampleCollectionId != selectedCollectionId) {
            this.selectedCollection(null);

            // if we haven't saved it to the server yet, just work locally.
            this.selectedCollection(this.GetCollectionById(selectedCollectionId));
            if (this.selectedCollection().isCreate() || this.selectedCollection().isModified()) {
                // don't bother loading data from the server if it hasn't been saved yet.
            } else {
                // We need to load the contents haven't saved it to the server yet, just work locally.
                let request: server.GetCollectionRequest = {
                    ExampleCollectionId: selectedCollectionId,
                    IncludeItems: true
                };

                Utils.Post("GetCollection", this.isGettingSelectedCollection, request,
                    (response: server.GetCollectionResponse) => {
                        let serverCollection: CollectionVM = new CollectionVM(response.Collection);
                        if (this.selectedCollection().isModified()) {
                            serverCollection.name(this.selectedCollection().name());

                            let serverItems: ItemVM[] = serverCollection.exampleItems();

                            // loop over the items currently in the list and compare them to the ones from the server
                            ko.utils.arrayForEach(this.selectedCollection().exampleItems(), (item: ItemVM) => {
                                // new item, wouldn't be on the server yet so just keep it
                                if (item.isCreate()) {
                                    serverItems.push(item);
                                } else if (item.isModified() || item.isDelete()) {
                                    // we have an item that was modified, see if we have it in the server list
                                    var exists = ko.utils.arrayFirst(serverItems, (serverItem: ItemVM) => {
                                        return serverItem.exampleItemId == item.exampleItemId;
                                    });
                                    // if so, remove it from the server items
                                    if (Utils.NotNull(exists)) {
                                        let index: number = ko.utils.arrayIndexOf(serverItems, exists);
                                        console.log("Index: " + index);
                                        serverItems.splice(index, 1, (item));
                                        //ko.utils.arrayRemoveItem(serverItems, exists);
                                        // and push our modified one
                                    } else {
                                        // if it wasn't in the server collection... don't bother adding it
                                    }
                                }
                            });

                            serverCollection.exampleItems(serverItems);
                        }

                        let collections: CollectionVM[] = this.collections();
                        let index: number = ko.utils.arrayIndexOf(collections, this.selectedCollection());
                        if (this.selectedCollection().isDelete()) {
                            serverCollection.isDelete(true);
                        };
                        collections.splice(index, 1, serverCollection);
                        this.collections(collections);

                        this.selectedCollection(this.GetCollectionById(selectedCollectionId));
                    });
            }
        }
    }

    SaveItem(collectionId: number, itemId: number) {
        let collection: CollectionVM = ko.utils.arrayFirst(this.collections(), (collectionVM: CollectionVM) => {
            return collectionVM.exampleCollectionId == collectionId;
        });

        if (Utils.NotNull(collection)) {
            let item: ItemVM = ko.utils.arrayFirst(collection.exampleItems(), (itemVM: ItemVM) => {
                return itemVM.exampleItemId === itemId;
            });

            let items: server.ItemDTO[] = [];
            if (Utils.NotNull(item)) {
                items.push(item.AsDto());

                let request: server.UpdateItemsRequest = {
                    Items: items,
                    CollectionId: collectionId
                };

                Utils.Post("UpdateItems", item.isSaving, request, (response: server.UpdateItemsResponse) => {
                    this.GetItems(collectionId, response.UpdatedItemIds);
                });
            }
        }
    }

    // Save changes to all collections and all DTOs that have changed, optionally just save the collections of the ids passed in.
    SaveCollections(collectionIds: number[] = []) {
        let filtered: CollectionVM[] = [];

        filtered = ko.utils.arrayFilter(this.collections(), (item: CollectionVM) => {
            let result: boolean = false;
            if (Utils.NotNull(collectionIds)) {
                let exists = ko.utils.arrayFirst(collectionIds, (collectionId: number) => {
                    return collectionId === item.exampleCollectionId;
                });
                result = Utils.NotNull(exists);
            }
            else {
                result = item.isModified() || item.isCreate() || item.isDelete();
            }
            return result;
        });

        let collections = ko.utils.arrayMap(filtered, (collectionVM: CollectionVM) => {
            let collectionDTO = collectionVM.AsDto();
            collectionDTO.UpdateType = collectionVM.GetUpdateType();
            return collectionDTO;
        });

        let request: server.UpdateCollectionsRequest = {
            Collections: collections
        };

        ko.utils.arrayForEach(collections, (item: server.CollectionDTO) => {
            if (Utils.NotNull(this.selectedCollection()) && (item.UpdateType === server.UpdateType.isDelete) && (item.ExampleCollectionId === this.selectedCollection().exampleCollectionId)) {
                this.selectedCollection(null);
            }
        });

        Utils.Post("UpdateCollections", this.isSavingCollections, request, (response: server.UpdateCollectionsResponse) => {
            console.log("UpdateCollections: " + response.UpdatedCollectionIds);
            if (Utils.NotNull(response.UpdatedCollectionIds)) {
                this.GetCollections(response.UpdatedCollectionIds, true);
            }
        });
    }

    AddNewCollection() {
        let newCollection: CollectionVM = new CollectionVM();
        newCollection.name("New Collection");
        newCollection.isCreate(true);
        let collectionIds: number[] = ko.utils.arrayMap(this.collections(), (item: CollectionVM) => { return item.exampleCollectionId; });
        let minCollectionId: number = Math.min(...collectionIds) - 1;
        if (minCollectionId > 0) {
            minCollectionId = 0;
        }
        newCollection.exampleCollectionId = minCollectionId;
        this.collections.push(newCollection);
    }

    deleteAllToggle: KnockoutObservable<boolean> = ko.observable(false);
    DeleteAll(): void {
        this.deleteAllToggle(!this.deleteAllToggle());
        let collections: CollectionVM[] = this.collections();
        this.DeleteCollections(ko.utils.arrayMap(collections, (item: CollectionVM) => {
            return item.exampleCollectionId;
        }), true);
    }

    deleteAllItemsToggle: KnockoutObservable<boolean> = ko.observable(true);
    DeleteAllItems(): void {
        this.deleteAllItemsToggle(!this.deleteAllItemsToggle());
        let collection: CollectionVM = this.selectedCollection();
        let items: ItemVM[] = collection.exampleItems();
        this.DeleteItems(collection.exampleCollectionId, ko.utils.arrayMap(items, (item: ItemVM) => {
            return item.exampleItemId;
        }), true);
    }

    DeleteCollections(collectionIds: number[], useToggle: boolean = false) {
        let collections: CollectionVM[] = this.collections();
        ko.utils.arrayForEach(collectionIds, (exampleCollectionId: number) => {
            let collection = this.GetCollectionById(exampleCollectionId);
            if (exampleCollectionId <= 0) {
                ko.utils.arrayRemoveItem(collections, collection);
            } else {
                if (useToggle) {
                    collection.isDelete(this.deleteAllToggle());
                } else {
                    collection.isDelete(!collection.isDelete());
                }

            }
        });
        this.collections(collections);
    }

    DeleteItems(collectionId: number, itemIds: number[], useToggle: boolean = false) {
        let collection: CollectionVM = this.GetCollectionById(collectionId);
        let items: ItemVM[] = collection.exampleItems();
        ko.utils.arrayForEach(itemIds, (exampleItemId: number) => {
            let item: ItemVM = ko.utils.arrayFirst(items, (item: ItemVM) => {
                return item.exampleItemId == exampleItemId;
            });
            if (Utils.NotNull(item)) {
                if (exampleItemId <= 0) {
                    ko.utils.arrayRemoveItem(items, item);
                } else {
                    if (useToggle) {
                        item.isDelete(this.deleteAllItemsToggle());
                    } else {
                        item.isDelete(!item.isDelete());
                    }
                    item.isDelete(!item.isDelete());
                }
            }
        });
        collection.exampleItems(items);
    }

    ResetAll(): void {
        ko.utils.arrayForEach(this.collections(), (item: CollectionVM) => {
            item.Reset();
        });
    }

    ResetCollection(collectionId: number) {
        let collection = this.GetCollectionById(collectionId);
        collection.Reset();
    }

    ResetItem(collectionId: number, itemId: number) {

    }

    GetCollectionById(collectionId: number): CollectionVM {
        let collection = ko.utils.arrayFirst(this.collections(), (item: CollectionVM) => {
            return item.exampleCollectionId == collectionId;
        });
        return collection;
    }

    AddNewItem() {

        let itemIds: number[] = ko.utils.arrayMap(this.selectedCollection().exampleItems(), (item: ItemVM) => { return item.exampleItemId; });
        let minItemId: number = Math.min(...itemIds) - 1;
        if (minItemId > 0) {
            minItemId = 0;
        }

        let newItem = new ItemVM(null, this.selectedCollection());

        newItem.exampleItemId = minItemId;
        newItem.itemString("New Item");
        newItem.itemInt(0);
        newItem.itemBool(false);

        let items: ItemVM[] = this.selectedCollection().exampleItems();
        items.push(newItem);
        this.selectedCollection().exampleItems(items);
        this.selectedCollection().CheckIfModified();
    }

    isModified: KnockoutObservable<boolean> = ko.observable();

    CheckIfModified(): void {
        let isModified: boolean = false;
        let exists: CollectionVM = ko.utils.arrayFirst(this.collections(), (item: CollectionVM) => {
            return item.isModified() || item.isCreate() || item.isDelete();
        });

        this.isModified(Utils.NotNull(exists));
    }

    constructor() {
        this.GetCollections();

        this.collections.subscribe((newValue: CollectionVM[]) => { this.CheckIfModified() });
        this.selectedCollection.subscribe((newValue: CollectionVM) => { this.deleteAllItemsToggle(true);});
    }
}