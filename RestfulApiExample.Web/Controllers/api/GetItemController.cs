using RestfulApiExample.DataAccess;
using RestfulApiExample.Web.Extensions;
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

            var repo = new RestfulApiRepo();
            try
            {
                var query = repo.GetItem(request.ExampleItemId);
                response.Item = query.AsItemDTO();
            }
            catch (Exception ex)
            {
                response.Fail("GetItem", ex);
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
