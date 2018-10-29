using RestfulApiExample.DataAccess;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace RestfulApiExample.Web.Controllers.api
{
    public class UpdateItemsController : ApiController
    {
        // POST: api/UpdateCollections

        /// <summary>
        /// UpdateItemsRequest takes a list of items to be updated
        /// </summary>
        /// <param name="request"></param>
        /// <returns>UpdateItemsResponse</returns>
        public UpdateItemsResponse Post(UpdateItemsRequest request)
        {
            var response = new UpdateItemsResponse { };
            var repo = new RestfulApiRepo();
            try
            {
                var itemsGroupedByCollection = request.Items.GroupBy(i => i.ExampleCollectionId).ToList();
                foreach(var collectionItemGrouping in itemsGroupedByCollection)
                {
                    foreach (var item in collectionItemGrouping)
                    {
                        switch (item.UpdateType)
                        {
                            case UpdateType.IsCreate:
                                var itemId = repo.CreateItem(item.ExampleCollectionId, item.ItemBool, item.ItemInt, "" + item.ItemString);
                                response.UpdatedItemIds.Add(new UpdatedItem { OrigionalId = item.ExampleItemId, NewId = itemId });
                                break;
                            case UpdateType.IsUpdate:
                                repo.UpdateItem(
                                    item.ExampleItemId,
                                    item.ItemBool,
                                    item.ItemInt,
                                    item.ItemString
                                );
                                response.UpdatedItemIds.Add(new UpdatedItem { OrigionalId = item.ExampleItemId, NewId = item.ExampleItemId });
                                break;
                            case UpdateType.IsDelete:
                                repo.DeleteItem(item.ExampleItemId);
                                response.UpdatedItemIds.Add(new UpdatedItem { OrigionalId = item.ExampleItemId, NewId = null });
                                break;
                            default:
                                break;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                response.Fail("UpdateItems", ex);
            }
            finally
            {
                repo.Dispose();
            }

            response.End();
            return response;
        }
    }
}
