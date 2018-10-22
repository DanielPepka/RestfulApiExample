using RestfulApiExample.Data;
using RestfulApiExample.Web.Controllers.api;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace RestfulApiExample.Web.Extensions
{
    public static class MyExtensions
    {
        public static ItemDTO AsItemDTO(this ExampleItem item)
        {
            return new ItemDTO
            {
                ExampleCollectionId = item.ExampleCollectionId,
                ExampleItemId = item.ExampleItemId,
                ItemBool = item.ItemBool,
                ItemInt = item.ItemInt,
                ItemString = item.ItemString,
                UpdateType = UpdateType.IsUnchanged
            };
        }

        public static CollectionDTO AsItemCollectionDTO(this ExampleCollection collection, bool includeItems)
        {
            var itemDTOs = new List<ItemDTO>();

            if (includeItems && collection.ExampleItems != null)
            {
                itemDTOs = collection.ExampleItems.Select(i => i.AsItemDTO()).ToList();
            }

            var collectionDTO = new CollectionDTO
            {
                ExampleCollectionId = collection.ExampleCollectionId,
                Name = collection.Name,
                ItemDTOs = itemDTOs,
                UpdateType = UpdateType.IsUnchanged
            };

            return collectionDTO;
        }
    }
}