using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace RestfulApiExample.Web.Controllers.api
{
    public class GetItemController : ApiController
    {
        // POST: api/GetItem
        /// <summary>
        /// GetItem requests an Item by id
        /// </summary>
        /// <param name="request"></param>
        /// <returns>GetItemResponse</returns>
        public GetItemResponse Post(GetItemRequest request)
        {
            var response = new GetItemResponse { };
            return response;
        }
    }
}
