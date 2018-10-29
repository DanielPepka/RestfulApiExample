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
    isCreate: KnockoutObservable<boolean> = ko.observable(false);
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
        if (Utils.NotNull(this.original)) {
            this.Load(this.original);
        }
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
    Load(dto: server.ItemDTO): void {
        if (dto != null) {
            this.isCreate(dto.UpdateType === server.UpdateType.isCreate);
            // backup the original object
            this.original = dto;
            this.exampleItemId = dto.ExampleItemId;
            this.itemString(dto.ItemString);
            this.itemInt(dto.ItemInt);
            this.itemBool(dto.ItemBool);
            this.exampleCollectionId = dto.ExampleCollectionId;
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

    // ItemVM needs a reference back to its collection to inform of it being changed
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
    Load(dto: server.CollectionDTO = null): void {
        if (dto != null) {
            // backup the original object
            this.original = dto;
            this.isCreate(dto.UpdateType === server.UpdateType.isCreate);
            // store the collection info
            this.exampleCollectionId = dto.ExampleCollectionId;
            this.name(dto.Name);

            // check if there are any example items, if so load those too
            if (dto.ItemDTOs !== null && dto.ItemDTOs !== undefined) {
                let collectionItems: ItemVM[] = ko.utils.arrayMap(dto.ItemDTOs, (i: server.ItemDTO) => {
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


    GetCollections(collectionIds: number[] = [], includeItems: boolean = false) {
        let request: server.GetCollectionsRequest = {
            RequestTime: new Date(),
            // no point in requesting collections that had a temp id
            CollectionIds: collectionIds,
            IncludeItems: includeItems
        };

        Utils.Post("GetCollections", this.isGettingCollections, request, (response: server.GetCollectionsResponse) => {
            if (Utils.NotNull(response.Collections)) {
                let collections: CollectionVM[] = this.collections();

                // so for each item fetched, look for it in the list of existing items
                ko.utils.arrayForEach(response.Collections, (collectionDTO: server.CollectionDTO) => {
                    let collectionVM: CollectionVM = ko.utils.arrayFirst(collections, (collection: CollectionVM) => {
                        return collection.exampleCollectionId === collectionDTO.ExampleCollectionId;
                    });

                    let updatedCollection: CollectionVM = new CollectionVM(collectionDTO);
                    // if we found it, then splice it in to replace the old version
                    if (Utils.NotNull(collectionVM)) {
                        let index: number = ko.utils.arrayIndexOf(collections, collectionVM);
                        collections.splice(index, 1, updatedCollection);
                    }
                    // we don't have it in the list, which means it is new so just add it
                    else {
                        collections.push(updatedCollection);
                    }
                });

                this.collections(collections);
                // now update the modified value
                this.CheckIfModified();

                // do logic to only replace the displayed collection if the item modified was in that collection
                if (Utils.NotNull(this.selectedCollection())) {
                    let selectedCollectionModified: server.CollectionDTO = ko.utils.arrayFirst(response.Collections, (collectionDTO: server.CollectionDTO) => {
                        return collectionDTO.ExampleCollectionId === this.selectedCollection().exampleCollectionId
                    });

                    // if the selected collection is modified, we need to refresh it with the updated version stored in the list
                    if (Utils.NotNull(selectedCollectionModified)) {
                        this.selectedCollection(this.GetCollectionById(this.selectedCollection().exampleCollectionId));
                    }
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
                    RequestTime: new Date(),
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
        // First lookup the collection
        let collection: CollectionVM = ko.utils.arrayFirst(this.collections(), (collectionVM: CollectionVM) => {
            return collectionVM.exampleCollectionId == collectionId;
        });

        // if it exists
        if (Utils.NotNull(collection)) {
            // look for the item requested to be saved
            let item: ItemVM = ko.utils.arrayFirst(collection.exampleItems(), (itemVM: ItemVM) => {
                return itemVM.exampleItemId === itemId;
            });

            // if it exists
            if (Utils.NotNull(item)) {
                let request: server.UpdateItemsRequest = {
                    RequestTime: new Date(),
                    Items: [item.AsDto()]
                };

                Utils.Post("UpdateItems", item.isSaving, request, (response: server.UpdateItemsResponse) => {
                    let items: ItemVM[] = collection.exampleItems();
                    // so we finished the update, look for the item and change its id to reflect the new value

                    let updatedItem: server.UpdatedItem = ko.utils.arrayFirst(response.UpdatedItemIds, (updatedItem: server.UpdatedItem) => {
                        return updatedItem.OrigionalId == item.exampleItemId;
                    });

                    // then request that it be updated
                    if (Utils.NotNull(updatedItem)) {
                        item.exampleItemId = updatedItem.NewId;

                        if (Utils.IsNull(updatedItem.NewId)) {
                            ko.utils.arrayRemoveItem(items, item);

                            if (Utils.NotNull(collection.original)) {
                                let origItem: server.ItemDTO = ko.utils.arrayFirst(collection.original.ItemDTOs, (item: server.ItemDTO) => {
                                    return item.ExampleItemId === updatedItem.OrigionalId
                                });
                                ko.utils.arrayRemoveItem(collection.original.ItemDTOs, origItem);
                            }

                            collection.exampleItems(items);
                        } else {
                            this.GetItemsForCollection(collectionId, [updatedItem.NewId]);
                        }
                    }
                    collection.CheckIfModified();
                });
            }
        }


    }

    GetItemsForCollection(collectionId: number, itemIds: number[] = []) {
        // if the list of items is null
        let request: server.GetItemsRequest = {
            RequestTime: new Date(),
            // no point in requesting an item that has a temp id
            ItemIds: ko.utils.arrayFilter(itemIds, (item: number) => { return item > 0; })
        };

        Utils.Post("GetItems", this.isGettingItems, request, (response: server.GetItemsResponse) => {
            if (Utils.NotNull(response.Items)) {
                let collection: CollectionVM = this.GetCollectionById(collectionId);
                // now add all of them back
                // TODO: splicing back in the same place to give a better user experience
                let items = collection.exampleItems();

                // so for each item fetched, look for it in the list of existing items
                ko.utils.arrayForEach(response.Items, (i: server.ItemDTO) => {
                    let itemVM: ItemVM = ko.utils.arrayFirst(items, (item: ItemVM) => {
                        return item.exampleItemId === i.ExampleItemId;
                    });

                    let updatedItem: ItemVM = new ItemVM(i, collection);
                    // if we found it, then splice it in to replace the old version
                    if (Utils.NotNull(itemVM)) {
                        let index: number = ko.utils.arrayIndexOf(items, itemVM);
                        items.splice(index, 1, updatedItem);
                    }
                    // we don't have it in the list, which means it is new so just add it
                    else {
                        items.push(updatedItem);
                    }
                });

                collection.exampleItems(items);
                // now update the modified value
                collection.CheckIfModified();

                // do logic to only replace the displayed collection if the item modified was in that collection
                if (Utils.NotNull(this.selectedCollection()) && this.selectedCollection().exampleCollectionId == collectionId) {
                    this.selectedCollection(this.GetCollectionById(this.selectedCollection().exampleCollectionId));
                }
            }
        });
    }

    // Save changes to all collections and all DTOs that have changed, optionally just save the collections of the ids passed in.
    // save collections also saves the items
    SaveCollections(collectionIds: number[] = []) {
        let filtered: CollectionVM[] = [];

        // first find each of the collections that were requested to be saved and put them in a list
        filtered = ko.utils.arrayFilter(this.collections(), (item: CollectionVM) => {
            let result: boolean = false;
            // so if the collection ids aren't null, look 
            if (Utils.NotNull(collectionIds)) {
                let exists = ko.utils.arrayFirst(collectionIds, (collectionId: number) => {
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
        let collectionDTOs: server.CollectionDTO[] = ko.utils.arrayMap(filtered, (collectionVM: CollectionVM) => {
            return collectionVM.AsDto();
        });

        let request: server.UpdateCollectionsRequest = {
            RequestTime: new Date(),
            Collections: collectionDTOs
        };

        Utils.Post("UpdateCollections", this.isSavingCollections, request, (response: server.UpdateCollectionsResponse) => {
            // so now we updated the collections, look for any that were created new or removed
            if (Utils.NotNull(response.UpdatedCollectionIds)) {
                let collections: CollectionVM[] = this.collections();
                let collectionIds: number[] = [];
                // so we finished the update, look for each collection that was added and collection and change its id to reflect the new value
                ko.utils.arrayForEach(response.UpdatedCollectionIds, (updatedCollection: server.UpdatedCollection) => {
                    // find the original collection
                    let collectionVM: CollectionVM = ko.utils.arrayFirst(collections, (collection: CollectionVM) => {
                        return collection.exampleCollectionId === updatedCollection.OrigionalId;
                    });

                    if (Utils.IsNull(updatedCollection.NewId)) {
                        ko.utils.arrayRemoveItem(collections, collectionVM);
                    } else {
                        // if the original value is 0 or less then we were adding a new collection
                        collectionIds.push(updatedCollection.NewId);
                        if (updatedCollection.OrigionalId <= 0) {
                            if (Utils.NotNull(collectionVM)) {
                                collectionVM.exampleCollectionId = updatedCollection.NewId;
                            }
                        }
                    }
                    // if the updated value is null, we removed it
                });
                this.collections(collections);

                this.GetCollections(collectionIds, true);
            }
        });
    }

    AddNewCollection() {
        let collectionIds: number[] = ko.utils.arrayMap(this.collections(), (item: CollectionVM) => { return item.exampleCollectionId; });
        let minCollectionId: number = Math.min(...collectionIds) - 1;
        if (minCollectionId > 0) {
            minCollectionId = 0;
        }

        let newCollectionDTO: server.CollectionDTO = {
            Name: "New Collection",
            ExampleCollectionId: minCollectionId,
            ItemDTOs: [],
            UpdateType: server.UpdateType.isCreate
        };
        let newCollection: CollectionVM = new CollectionVM(newCollectionDTO);

        this.collections.push(newCollection);
    }

    deleteAllCollectionsToggle: KnockoutObservable<boolean> = ko.observable(false);
    DeleteAll(): void {
        this.deleteAllCollectionsToggle(!this.deleteAllCollectionsToggle());
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
                    collection.isDelete(this.deleteAllCollectionsToggle());
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
                }
            }
        });
        collection.exampleItems(items);

    }

    ResetAll() {
        let collections: CollectionVM[] = this.collections();
        ko.utils.arrayForEach(collections, (collection: CollectionVM) => {
            if (Utils.NotNull(collection)) {
                collection.Reset();
            }
        });
        this.collections(collections);
    }

    ResetSelectedCollection() {
        let collection = this.selectedCollection();
        let items = collection.exampleItems();
        if (Utils.NotNull(items)) {
            ko.utils.arrayForEach(collection.exampleItems(), (exampleItem: ItemVM) => {
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
        newItem.itemBool( false);
        newItem.exampleCollectionId = this.selectedCollection().exampleCollectionId;
        newItem.isCreate(true);

        let items: ItemVM[] = this.selectedCollection().exampleItems();
        items.push(newItem);
        this.selectedCollection().exampleItems(items);
        this.selectedCollection().isModified(true);
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

        this.collections.subscribe((newValue: CollectionVM[]) => {
            this.CheckIfModified();
            // update the selected collection
            if (Utils.NotNull(this.selectedCollection())) {
                this.selectedCollection(this.GetCollectionById(this.selectedCollection().exampleCollectionId));
            }
        });
        this.selectedCollection.subscribe((newValue: CollectionVM) => { this.deleteAllItemsToggle(true); });
    }
}