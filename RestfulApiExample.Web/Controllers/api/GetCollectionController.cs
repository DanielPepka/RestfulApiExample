using RestfulApiExample.DataAccess;
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

            var context = new RestfulApiExampleContext();

            var query = context.ExampleCollections
                .Where(a => a.ExampleCollectionId == request.ExampleCollectionId)
                .Include(a => a.ExampleItems)
                .Select(a => a);

            return response;
        }
    }
}
