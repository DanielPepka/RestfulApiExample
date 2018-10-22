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
        console.log("checking modified: ");
        this.MyName();
        if (Utils.NotNull(this.original)) {
            isModified = isModified || (this.original.ItemString !== this.itemString());
            isModified = isModified || (this.original.ItemInt !== this.itemInt());
            isModified = isModified || (this.original.ItemBool !== this.itemBool());
        }

        this.isModified(isModified);
    }

    constructor(dto: server.ItemDTO = null) {
        super(dto);
        this.isCreate(dto == null);
        if (!this.isCreate()) {
            this.Load(dto);
        }
        this.itemString.subscribe((newValue: string) => { this.CheckIfModified(); });
        this.itemInt.subscribe((newValue: number) => { this.CheckIfModified(); });
        this.itemBool.subscribe((newValue: boolean) => { this.CheckIfModified(); });
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
                    return new ItemVM(i);
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

        return dto;
    }

    AsDtoWithItems(): server.CollectionDTO {
        let dto = this.AsDto();

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
            isModified = isModified || item.isModified();
        });

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
        this.exampleItems.subscribe((newValue: ItemVM[]) => { this.CheckIfModified(); });
    }
}

class IndexViewModel {
    MyName(): void {
        console.log("IndexViewModel");
    }

    collections: KnockoutObservableArray<CollectionVM> = ko.observableArray([]);
    selectedCollection: KnockoutObservable<CollectionVM> = ko.observable(null);

    isGettingCollections: AjaxTracker = new AjaxTracker();
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

    GetCollections() {
        this.collections([]);
        let request: server.GetCollectionsRequest = {
            CollectionIds: [],
            IncludeItems: false
        };

        Utils.Post("GetCollections", this.isGettingCollections, request, (response: server.GetCollectionsResponse) => {
            if (response.Collections.length > 0) {
                let collections: CollectionVM[] = ko.utils.arrayMap(response.Collections, (i: server.CollectionDTO) => {
                    return new CollectionVM(i);
                });
                this.collections(collections);
            }
        });
    }

    SetSelectedCollection(selectedCollectionId: number) {
        this.selectedCollection(null);
        let request: server.GetCollectionRequest = {
            ExampleCollectionId: selectedCollectionId,
            IncludeItems: true
        };

        // if we haven't saved it to the server yet, just work locally.
        let collection: CollectionVM = this.GetCollectionById(selectedCollectionId);
        this.selectedCollection(collection);
        if (selectedCollectionId <= 0) {
        } else {
            // We need to load the contents haven't saved it to the server yet, just work locally.
            Utils.Post("GetCollection", this.isGettingSelectedCollection, request,
                (response: server.GetCollectionResponse) => {
                    let serverCollection: CollectionVM = new CollectionVM(response.Collection);
                    let selectedCollectionItems: ItemVM[] = collection.exampleItems();

                    ko.utils.arrayForEach(collection.exampleItems(), (selectedCollectionItem: ItemVM) => {
                        if (!selectedCollectionItem.isModified()) {
                            // then we should update with the server version, otherwise keep local
                            let serverItem: ItemVM = ko.utils.arrayFirst(serverCollection.exampleItems(), (serverItem: ItemVM) => { return serverItem.exampleItemId === selectedCollectionItem.exampleItemId });
                            if (Utils.NotNull(serverItem)) {

                            } else {
                                // if the server version doesn't exist then we should remove it from the array. 
                                ko.utils.arrayRemoveItem(selectedCollectionItems, selectedCollectionItem);
                            }
                        }
                    });


                    collection.exampleItems(selectedCollectionItems);

                    this.selectedCollection();
                });
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

                Utils.Post("UpdateItems", item.isSaving, request, (response: server.UpdateItemsRequest) => {
                    console.log("UpdateItems: " + JSON.stringify(response));
                });
            }
        }
    }

    SaveCollection(collectionId: number, includeItems: boolean = false) {
        let collections: server.CollectionDTO[] = [];
        let collection: CollectionVM = ko.utils.arrayFirst(this.collections(), (collectionVM: CollectionVM) => {
            return collectionVM.exampleCollectionId == collectionId;
        });

        if (Utils.NotNull(collection)) {
            if (includeItems) {
                collections.push(collection.AsDtoWithItems());
            } else {
                collections.push(collection.AsDto());
            }

            let request: server.UpdateCollectionsRequest = {
                Collections: collections
            };

            Utils.Post("UpdateCollections", collection.isSaving, request, (response: server.UpdateCollectionsResponse) => {
                console.log("UpdateCollections: " + JSON.stringify(response));
            });
        }
    }

    // Save changes to all collections and all DTOs that have changed
    SaveCollections() {
        let filtered: CollectionVM[] = ko.utils.arrayFilter(this.collections(), (item: CollectionVM) => {
            return item.isModified() || item.isCreate() || item.isDelete();
        });

        let collections = ko.utils.arrayMap(filtered, (collectionVM: CollectionVM) => {
            let collectionDTO = collectionVM.AsDtoWithItems();
            collectionDTO.UpdateType = collectionVM.GetUpdateType();
            return collectionDTO;
        });

        let request: server.UpdateCollectionsRequest = {
            Collections: collections
        };

        Utils.Post("UpdateCollections", this.isSavingCollections, request, (response: server.GetCollectionResponse) => {
            this.GetCollections();
        });
    }

    AddNewCollection() {
        let newCollection: CollectionVM = new CollectionVM();
        newCollection.name("New Collection");
        newCollection.isCreate(true);
        let collectionIds: number[] = ko.utils.arrayMap(this.collections(), (item: CollectionVM) => { return item.exampleCollectionId; });
        let minCollectionId: number = Math.min(...collectionIds);
        newCollection.exampleCollectionId = minCollectionId > 0 ? 0 : minCollectionId - 1;
        this.collections.push(newCollection);
    }

    DeleteAll(): void {
        let collections: CollectionVM[] = this.collections();
        this.DeleteCollections(ko.utils.arrayMap(collections, (item: CollectionVM) => {
            return item.exampleCollectionId;
        }));
    }

    DeleteCollections(collectionIds: number[]) {
        let collections: CollectionVM[] = this.collections();
        ko.utils.arrayForEach(collectionIds, (exampleCollectionId: number) => {
            let collection = this.GetCollectionById(exampleCollectionId);
            if (exampleCollectionId <= 0) {
                ko.utils.arrayRemoveItem(collections, collection);
            } else {
                collection.isDelete(!collection.isDelete());
            }
        });
        this.collections(collections);
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

    private GetCollectionById(collectionId: number): CollectionVM {
        let collection = ko.utils.arrayFirst(this.collections(), (item: CollectionVM) => {
            return item.exampleCollectionId == collectionId;
        });
        return collection;
    }

    AddNewItem(selectedCollectionId: number) {
        // grab the collection
        var collection = this.GetCollectionById(selectedCollectionId);
        // add the item

        let itemIds: number[] = ko.utils.arrayMap(collection.exampleItems(), (item: ItemVM) => { return item.exampleItemId; });
        let minItemId: number = Math.min(...itemIds);

        let newItem = new ItemVM();
        newItem.exampleItemId = minItemId - 1;
        newItem.itemString("New Item");
        newItem.itemInt(0);
        newItem.itemBool(false);

        let items: ItemVM[] = collection.exampleItems();
        items.push(newItem);
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
    }
}