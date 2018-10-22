using RestfulApiExample.Data;
using System;
using System.Collections.Generic;

namespace RestfulApiExample.Web.Controllers.api
{
    public class GenericResponse
    {
        public GenericResponse()
        {
            this.Success = true;
            this.Messages = new List<string>();
            this.StartTime = DateTime.Now;
            this.EndTime = DateTime.Now;
        }

        public void End(bool? success = null)
        {
            if (success.HasValue)
            {
                this.Success = success.Value;
            }
            this.EndTime = DateTime.Now;
        }
        public void Fail(string controllerName, Exception ex)
        {
            var count = 1;
            do
            {
                this.Messages.Add($"{controllerName} ({count}): {ex.Message}");
                count++;
                ex = ex.InnerException;
            } while (ex != null);

            this.Success = false;
        }

        public bool Success { get; set; }
        public List<string> Messages { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
    }

    public enum UpdateType
    {
        IsCreate,
        IsUpdate,
        IsDelete,
        IsUnchanged
    }

    public class IGenericDTO
    {
        public UpdateType UpdateType { get; set; }
    }


    public class ItemDTO : IGenericDTO
    {
        // Primary Key
        public int ExampleItemId { get; set; }

        // Example Property Types
        public string ItemString { get; set; }
        public int ItemInt { get; set; }
        public bool ItemBool { get; set; }
        public int ExampleCollectionId { get; set; }
    }

    public class CollectionDTO : IGenericDTO
    {
        public CollectionDTO()
        {
            // Do this so we never run into a situation where ExampleItems is null
            this.ItemDTOs = new HashSet<ItemDTO>();
        }

        // Primary Key
        public int ExampleCollectionId { get; set; }
        public string Name { get; set; }

        // Collection of ItemDTO's, might be null if items are not requested
        public virtual ICollection<ItemDTO> ItemDTOs { get; set; }
    }
    
    /// <summary>
    /// GetCollectionsRequest can request specific collections, if none are specified it will return all.
    /// It can also specify if it should include the items as part of the request. 
    /// </summary>
    public class GetCollectionsRequest
    {
        public GetCollectionsRequest()
        {
            this.CollectionIds = new List<int>();
        }

        public List<int> CollectionIds { get; set; }
        public bool IncludeItems { get; set; }
    }

    /// <summary>
    /// GetCollectionsResponse returns the list of collections that were requested 
    /// </summary>
    public class GetCollectionsResponse : GenericResponse
    {
        public GetCollectionsResponse() : base()
        {
            this.Collections = new List<CollectionDTO>();
        }

        public List<CollectionDTO> Collections { get; set; }
    }

    /// <summary>
    /// GetCollectionRequest requests a collection and its items
    /// </summary>
    public class GetCollectionRequest
    {
        public int ExampleCollectionId { get; set; }
        public bool IncludeItems { get; set; }
    }

    /// <summary>
    /// GetCollectionResponse returns the collection that was requested and all of its items.
    /// </summary>
    public class GetCollectionResponse : GenericResponse
    {
        public GetCollectionResponse() : base()
        {
        }

        public CollectionDTO Collection { get; set; }
    }

    /// <summary>
    /// UpdateCollectionsRequest takes a list of collections that need to be updated. Does not update collection items.
    /// </summary>
    public class UpdateCollectionsRequest
    {
        public UpdateCollectionsRequest()
        {
            this.Collections = new List<CollectionDTO>();
        }

        public List<CollectionDTO> Collections { get; set; }
    }
    /// <summary>
    /// UpdateCollectionsResponse - returns success or a list of failure messages
    /// </summary>
    public class UpdateCollectionsResponse : GenericResponse
    {
        public UpdateCollectionsResponse() : base()
        {
        }
    }

    /// <summary>
    /// GetItemRequest requests a Item
    /// </summary>
    public class GetItemRequest
    {
        public int ExampleItemId { get; set; }
    }

    /// <summary>
    /// GetItemResponse returns the Item that was requested and all of its items.
    /// </summary>
    public class GetItemResponse : GenericResponse
    {
        public GetItemResponse() : base()
        {
        }
        public ItemDTO Item { get; set; }
    }

    /// <summary>
    /// UpdateItemsRequest Passes a list of items to be updated
    /// </summary>
    public class UpdateItemsRequest
    {
        public int CollectionId { get; set; }
        public List<ItemDTO> Items { get; set; }
    }

    /// <summary>
    /// UpdateItemsResponse - returns success or 
    /// </summary>
    public class UpdateItemsResponse : GenericResponse
    {
        public UpdateItemsResponse() : base()
        {
        }
    }
}
