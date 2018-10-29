declare module server {
	interface UpdatedRecord {
		OrigionalId: number;
		NewId?: number;
	}
	interface UpdatedItem extends UpdatedRecord {
	}
	interface UpdatedCollection extends UpdatedRecord {
		UpdatedItemIds: server.UpdatedItem[];
	}
	interface GenericRequest {
		RequestTime: Date;
	}
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
		isUnchanged,
	}
	interface IGenericDTO {
		UpdateType: server.UpdateType;
	}
	interface ItemDTO extends IGenericDTO {
		/** Primary Key */
		ExampleItemId: number;
		/** Example Property Types */
		ItemString: string;
		ItemInt: number;
		ItemBool: boolean;
		ExampleCollectionId: number;
	}
	interface CollectionDTO extends IGenericDTO {
		/** Primary Key */
		ExampleCollectionId: number;
		Name: string;
		/** Collection of ItemDTO's, might be null if items are not requested */
		ItemDTOs: server.ItemDTO[];
	}
	/** GetCollectionsRequest can request specific collections, if none are specified it will return all.It can also specify if it should include the items as part of the request. */
	interface GetCollectionsRequest extends GenericRequest {
		CollectionIds: number[];
		IncludeItems: boolean;
	}
	/** GetCollectionsResponse returns the list of collections that were requested */
	interface GetCollectionsResponse extends GenericResponse {
		Collections: server.CollectionDTO[];
	}
	/** GetCollectionRequest requests a collection and its items */
	interface GetCollectionRequest extends GenericRequest {
		ExampleCollectionId: number;
		IncludeItems: boolean;
	}
	/** GetCollectionResponse returns the collection that was requested and all of its items. */
	interface GetCollectionResponse extends GenericResponse {
		Collection: server.CollectionDTO;
	}
	/** UpdateCollectionsRequest takes a list of collections that need to be updated. Does not update collection items. */
	interface UpdateCollectionsRequest extends GenericRequest {
		Collections: server.CollectionDTO[];
	}
	/** UpdateCollectionsResponse - returns success or a list of failure messages */
	interface UpdateCollectionsResponse extends GenericResponse {
		UpdatedCollectionIds: server.UpdatedCollection[];
	}
	/** GetItemRequest requests a Item */
	interface GetItemsRequest extends GenericRequest {
		ItemIds: number[];
	}
	/** GetItemResponse returns the Item that was requested and all of its items. */
	interface GetItemsResponse extends GenericResponse {
		Items: server.ItemDTO[];
	}
	/** UpdateItemsRequest Passes a list of items to be updated */
	interface UpdateItemsRequest extends GenericRequest {
		Items: server.ItemDTO[];
	}
	/** UpdateItemsResponse - returns success or */
	interface UpdateItemsResponse extends GenericResponse {
		UpdatedItemIds: server.UpdatedItem[];
	}
}
