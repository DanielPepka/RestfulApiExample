using RestfulApiExample.Data;
using RestfulApiExample.DataAccess;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace RestfulApiExample.Web.Controllers.api
{



    public class UpdateCollectionsController : ApiController
    {
        // POST: api/UpdateCollections
        /// <summary>
        /// UpdateCollections takes a list of collections that need to be updated. Does not update collection items.
        /// </summary>
        /// <param name="request"></param>
        /// <returns>UpdateCollectionsResponse</returns>
        public UpdateCollectionsResponse Post(UpdateCollectionsRequest request)
        {
            var response = new UpdateCollectionsResponse { };

            var repo = new RestfulApiRepo();
            try
            {
                if (request.Collections != null && request.Collections.Count > 0)
                {
                    foreach (var collectionDTO in request.Collections)
                    {
                        var collection = repo.GetCollection(collectionDTO.ExampleCollectionId);

                        // check 
                        switch (collectionDTO.UpdateType)
                        {
                            case UpdateType.IsCreate:
                                repo.CreateCollection(collectionDTO.Name, collectionDTO.ItemDTOs.Select(i => new ExampleItem
                                {
                                    ItemString = i.ItemString,
                                    ItemBool = i.ItemBool,
                                    ItemInt = i.ItemInt
                                }).ToList());
                                break;
                            case UpdateType.IsUpdate:
                                repo.UpdateCollection(collectionDTO.ExampleCollectionId, collectionDTO.Name);
                                if (collectionDTO.ItemDTOs != null)
                                {
                                    foreach (var itemDTO in collectionDTO.ItemDTOs)
                                    {
                                        switch (itemDTO.UpdateType)
                                        {
                                            case UpdateType.IsCreate:
                                                repo.CreateItem(collectionDTO.ExampleCollectionId, itemDTO.ItemBool, itemDTO.ItemInt, itemDTO.ItemString);
                                                break;
                                            case UpdateType.IsUpdate:
                                                repo.UpdateItem(itemDTO.ExampleItemId, itemDTO.ItemBool, itemDTO.ItemInt, itemDTO.ItemString);
                                                break;
                                            case UpdateType.IsDelete:
                                                repo.DeleteItem(itemDTO.ExampleItemId);
                                                break;
                                            default:
                                                break;
                                        }
                                    }
                                }

                                break;
                            case UpdateType.IsDelete:
                                repo.DeleteCollection(collectionDTO.ExampleCollectionId);
                                break;
                            default:
                                break;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                response.Fail("UpdateCollections", ex);
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
