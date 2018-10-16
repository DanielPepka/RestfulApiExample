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
            return response;
        }
    }
}
