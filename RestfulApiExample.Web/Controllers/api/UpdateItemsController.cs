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
            return response;
        }
    }
}
