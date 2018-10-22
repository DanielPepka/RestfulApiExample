using RestfulApiExample.Data;
using RestfulApiExample.DataAccess;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Data.Entity;
using RestfulApiExample.Web.Extensions;

namespace RestfulApiExample.Web.Controllers.api
{
    public class GetCollectionsController : ApiController
    {
        // POST: api/GetCollections
        /// <summary>
        /// GetCollections can request specific collections, if none are specified it will return all.
        /// It can also specify if it should include the items as part of the request. 
        /// </summary>
        /// <param name="request"></param>
        /// <returns>GetCollectionsResponse</returns>
        public GetCollectionsResponse Post(GetCollectionsRequest request)
        {
            var response = new GetCollectionsResponse { };

            var repo = new RestfulApiRepo();
            try
            {
                List<ExampleCollection> query = repo.GetCollections(request.IncludeItems);
                response.Collections = query.Select(i => i.AsItemCollectionDTO(request.IncludeItems)).ToList();
            }
            catch (Exception ex)
            {
                response.Fail("GetCollections", ex);
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
