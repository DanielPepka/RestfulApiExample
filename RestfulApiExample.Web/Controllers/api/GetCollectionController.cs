using RestfulApiExample.DataAccess;
using RestfulApiExample.Web.Extensions;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace RestfulApiExample.Web.Controllers.api
{
    public class GetCollectionController : ApiController
    {
        // POST: api/GetCollection
        /// <summary>
        ///  GetCollection requests a collection and its items
        /// </summary>
        /// <param name="request"></param>
        /// <returns>GetCollectionResponse</returns>
        public GetCollectionResponse Post(GetCollectionRequest request)
        {
            var response = new GetCollectionResponse { };

            var repo = new RestfulApiRepo();
            try
            {
                var query = repo.GetCollection(request.ExampleCollectionId, request.IncludeItems);
                response.Collection = query.AsItemCollectionDTO(request.IncludeItems);
            }
            catch (Exception ex)
            {
                response.Fail("GetCollection", ex);
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
