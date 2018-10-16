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

            var context = new RestfulApiExampleContext();

            //context.ExampleCollections.Add(new ExampleCollection{Name = "New Item 2"});
            //context.SaveChanges();

            response.Collections = context.ExampleCollections.Select(a => new CollectionDTO { Value = a }).ToList();

     

            return response;
        }
    }
}
