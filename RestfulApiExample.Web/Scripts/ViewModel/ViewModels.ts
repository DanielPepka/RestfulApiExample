interface Window {
    indexViewModel: IndexViewModel;
}

class AjaxTracker {
    MyName(): void {
        console.log("AjaxTracker");
    }

    postCount: KnockoutObservable<number> = ko.observable(0);
    isPosting: KnockoutObservable<boolean> = ko.observable(false);

    Start(): void {
        this.postCount(this.postCount() + 1);
        console.log("Start count: " + this.postCount());
    }

    Stop(): void {
        this.postCount(this.postCount() - 1);
        this.isPosting(this.postCount() >= 0);
        console.log("Stop count: " + this.postCount());
    }
}

class Utils {
    MyName(): void {
        console.log("Utils");
    }

    static Post(apiEndpoint: string, tracker: AjaxTracker, request: any, callback: (response: any) => any): void {
        tracker.Start();
        $.post(apiEndpoint, request)
            .done((response: server.GetCollectionsResponse) => {
                callback(response);
            })
            .fail((data: any) => {
                console.log("FAIL(" + apiEndpoint + "): " + JSON.stringify(data));
            })
            .always(() => {
                tracker.Stop();
            });
    }
}

/// <summary>
///  ViewModelBase is the base class for any server DTO.  
///  It keeps a backup of the original value, and requires implementation of
///  a Load method, a AsDto method, and a CheckIfModified methods.
/// </summary>
abstract class ViewModelBase<Type> {
    MyName(): void {
        console.log("ViewModelBase");
    }

    // The original value for the view model that created this. 
    original: Type = null;

    // All VM's should know if they are modified or not
    isModified: KnockoutObservable<boolean> = ko.observable(false);
    isMarkedForDelete: KnockoutObservable<boolean> = ko.observable(false);

    abstract Load(item: Type): void;
    abstract AsDto(): Type;
    abstract CheckIfModified(): void;

    // Resets the ViewModel to the unmodified version we fetched from the server.
    Reset() {
        this.Load(this.original);
        this.isModified(false);
        this.isMarkedForDelete(false);
    }

    constructor(dto: Type) {
        this.original = dto;
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
    Load(item: server.ItemDTO = null): void {
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

    // Convert our KnockoutVM object back into our c# server model
    AsDto(): server.ItemDTO {
        var item: server.ItemDTO = {
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
    }

    CheckIfModified(): void {
        var isModified = false;

        isModified = isModified || (this.original.Value.ItemString !== this.itemString());
        isModified = isModified || (this.original.Value.ItemInt !== this.itemInt());
        isModified = isModified || (this.original.Value.ItemBool !== this.itemBool());

        this.isModified(isModified);
    }

    constructor(dto: server.ItemDTO = null) {
        super(dto);
        if (dto != null) {
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
            this.MyName();
            // store the collection info
            this.exampleCollectionId = item.Value.ExampleCollectionId;
            this.name(item.Value.Name);

            // check if there are any example items, if so load those too
            if (item.Value.ExampleItems !== null && item.Value.ExampleItems !== undefined) {
                var collectionItems: ItemVM[] = ko.utils.arrayMap(item.Value.ExampleItems, (i: server.ItemDTO) => {
                    return new ItemVM(i);
                });

                this.exampleItems(collectionItems);
            }
        }
    };

    // Convert our KnockoutVM object back into our c# server model
    AsDto(): server.CollectionDTO {
        var dto: server.CollectionDTO = {
            UpdateType: null,
            Value: {
                ExampleCollectionId: this.exampleCollectionId,
                Name: this.name(),
                ExampleItems: null
            }
        };

        return dto;
    }

    CheckIfModified(): void {
        var isModified = false;
        isModified = isModified || (this.original.Value.Name !== this.name());
        this.isModified(isModified);
    }

    constructor(dto: server.CollectionDTO = null) {
        super(dto);
        if (dto != null) {
            this.Load(dto);
        }

        this.name.subscribe((newValue: string) => { this.CheckIfModified(); });
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

    GetCollections() {
        this.collections([]);
        var request: server.GetCollectionsRequest = {
            CollectionIds: [],
            IncludeItems: false
        };

        Utils.Post("Api/GetCollections", this.isGettingCollections, request,
            (response: server.GetCollectionsResponse) => {
                console.log("collections: " + JSON.stringify(response));
                if (response.Collections.length > 0) {
                    var collections: CollectionVM[] = ko.utils.arrayMap(response.Collections, (i: server.CollectionDTO) => {
                        return new CollectionVM(i);
                    });
                    console.log("collections: " + JSON.stringify(response));
                    this.collections(collections);
                }
            });
    }

    SetSelectedCollection(selectedCollectionId: number) {
        this.selectedCollection(null);
        var request: server.GetCollectionRequest = {
            ExampleCollectionId: selectedCollectionId
        };

        Utils.Post("Api/GetCollection", this.isGettingSelectedCollection, request,
            (response: server.GetCollectionResponse) => {
                this.selectedCollection(new CollectionVM(response.Collection));
            });
    }

    constructor() {
        this.GetCollections();
    }
}