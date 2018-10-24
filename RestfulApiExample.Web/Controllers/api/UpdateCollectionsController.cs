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
                                var newCollectionId = repo.CreateCollection(collectionDTO.Name, collectionDTO.ItemDTOs.Select(i => new ExampleItem
                                {
                                    ItemString = i.ItemString,
                                    ItemBool = i.ItemBool,
                                    ItemInt = i.ItemInt
                                }).ToList());
                                response.UpdatedCollectionIds.Add(collectionDTO.ExampleCollectionId);
                                response.UpdatedCollectionIds.Add(newCollectionId);

                                break;
                            case UpdateType.IsUpdate:
                                repo.UpdateCollection(collectionDTO.ExampleCollectionId, collectionDTO.Name);
                                response.UpdatedCollectionIds.Add(collectionDTO.ExampleCollectionId);
                                if (collectionDTO.ItemDTOs != null)
                                {
                                    (new UpdateItemsController()).Post(new UpdateItemsRequest { CollectionId = collectionDTO.ExampleCollectionId, Items = collectionDTO.ItemDTOs.ToList() });
                                }

                                break;
                            case UpdateType.IsDelete:
                                repo.DeleteCollection(collectionDTO.ExampleCollectionId);
                                response.UpdatedCollectionIds.Add(collectionDTO.ExampleCollectionId);
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
