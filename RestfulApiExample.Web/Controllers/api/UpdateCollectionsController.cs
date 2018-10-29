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
                                // create the collection
                                var newCollectionId = repo.CreateCollection(collectionDTO.Name);

                                // create the updated collection response
                                var createdCollection = new UpdatedCollection { OrigionalId = collectionDTO.ExampleCollectionId, NewId = newCollectionId };

                                // check if any items need to be updated along with the collection
                                if (collectionDTO.ItemDTOs != null)
                                {
                                    var items = collectionDTO.ItemDTOs.Select(i => new ItemDTO
                                    {
                                        ExampleCollectionId = newCollectionId,
                                        ItemString = i.ItemString,
                                        ItemBool = i.ItemBool,
                                        ItemInt = i.ItemInt
                                    }).ToList();

                                    var updatedItemsResponse = (new UpdateItemsController()).Post(new UpdateItemsRequest {
                                        RequestTime = request.RequestTime,
                                        Items = items.ToList()
                                    });
                                    // update the response list for the items too
                                    createdCollection.UpdatedItemIds = updatedItemsResponse.UpdatedItemIds;
                                }

                                response.UpdatedCollectionIds.Add( createdCollection );

                                break;
                            case UpdateType.IsUpdate:
                                repo.UpdateCollection(collectionDTO.ExampleCollectionId, collectionDTO.Name);
                          
                                var updatedCollection = new UpdatedCollection {
                                    OrigionalId = collectionDTO.ExampleCollectionId,
                                    NewId = collectionDTO.ExampleCollectionId
                                };

                                // check if any items need to be updated along with the collection
                                if (collectionDTO.ItemDTOs != null)
                                {
                                    var updatedItemsResponse = (new UpdateItemsController()).Post(new UpdateItemsRequest {
                                        RequestTime = request.RequestTime,
                                        Items = collectionDTO.ItemDTOs.ToList()
                                    });
                                    // update the response list for the items too
                                    updatedCollection.UpdatedItemIds = updatedItemsResponse.UpdatedItemIds;
                                }

                                response.UpdatedCollectionIds.Add(updatedCollection);
                                break;
                            case UpdateType.IsDelete:
                                repo.DeleteCollection(collectionDTO.ExampleCollectionId);
                                response.UpdatedCollectionIds.Add(new UpdatedCollection {
                                    OrigionalId = collectionDTO.ExampleCollectionId,
                                    NewId = null
                                });
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
