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
    public class GetItemsController : ApiController
    {
        // POST: api/GetItem
        /// <summary>
        /// GetItem requests an Item by id
        /// </summary>
        /// <param name="request"></param>
        /// <returns>GetItemResponse</returns>
        public GetItemsResponse Post(GetItemsRequest request)
        {
            var response = new GetItemsResponse { };

            var repo = new RestfulApiRepo();
            try
            {
                foreach (var itemId in request.ItemIds)
                {
                    var query = repo.GetItem(itemId);
                    response.Items.Add(query.AsItemDTO());
                }
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
