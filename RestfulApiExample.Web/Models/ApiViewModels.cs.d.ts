declare module server {
	interface GenericResponse {
		Success: boolean;
		Messages: string[];
		StartTime: Date;
		EndTime: Date;
	}
	const enum UpdateType {
		isCreate,
		isUpdate,
		isDelete,
	}
	interface GenericDTO {
		UpdateType: server.UpdateType;
	}
	interface CollectionDTO extends GenericDTO {
		Value: {
			ExampleCollectionId: number;
			Name: string;
			ExampleItems: any[];
		};
	}
	interface ItemDTO extends GenericDTO {
		Value: {
			ExampleItemId: number;
			ItemString: string;
			ItemInt: number;
			ItemBool: boolean;
			ExampleCollectionId: number;
			ExampleCollection: {
				ExampleCollectionId: number;
				Name: string;
				ExampleItems: any[];
			};
		};
	}
	/** GetCollectionsRequest can request specific collections, if none are specified it will return all.It can also specify if it should include the items as part of the request. */
	interface GetCollectionsRequest {
		CollectionIds: number[];
		IncludeItems: boolean;
	}
	/** GetCollectionsResponse returns the list of collections that were requested */
	interface GetCollectionsResponse extends GenericResponse {
		Collections: server.CollectionDTO[];
	}
	/** GetCollectionRequest requests a collection and its items */
	interface GetCollectionRequest {
		ExampleCollectionId: number;
	}
	/** GetCollectionResponse returns the collection that was requested and all of its items. */
	interface GetCollectionResponse extends GenericResponse {
		Collection: server.CollectionDTO;
	}
	/** UpdateCollectionsRequest takes a list of collections that need to be updated. Does not update collection items. */
	interface UpdateCollectionsRequest {
		Collections: server.CollectionDTO[];
	}
	/** UpdateCollectionsResponse - returns success or a list of failure messages */
	interface UpdateCollectionsResponse extends GenericResponse {
	}
	/** GetItemRequest requests a Item */
	interface GetItemRequest {
		ExampleItemId: number;
	}
	/** GetItemResponse returns the Item that was requested and all of its items. */
	interface GetItemResponse extends GenericResponse {
		Item: server.ItemDTO;
	}
	/** UpdateItemsRequest Passes a list of items to be updated */
	interface UpdateItemsRequest {
		CollectionId: number;
		Items: server.ItemDTO[];
	}
	/** UpdateItemsResponse - returns success or */
	interface UpdateItemsResponse extends GenericResponse {
	}
}
