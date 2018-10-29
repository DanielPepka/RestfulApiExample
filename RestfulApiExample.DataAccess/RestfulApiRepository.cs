using RestfulApiExample.Data;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;

namespace RestfulApiExample.DataAccess
{
   

    public partial class RestfulApiRepo : IDisposable
    {
        private RestfulApiExampleContext Context { get; set; }

        /// <summary>
        /// This repo is the shell over the context to consolidate where these operations exist.
        /// </summary>
        /// <param name="context"></param>
        public RestfulApiRepo(RestfulApiExampleContext context = null)
        {
            if (context == null)
            {
                this.Context = new RestfulApiExampleContext();
            }
            else
            {
                this.Context = context;
            }
        }

        #region ExampleCollection
        public int CreateCollection(string name, List<ExampleItem> items = null)
        {
            var newCollection = new Data.ExampleCollection
            {
                Name = name
            };
            this.Context.ExampleCollections.Add(newCollection);
            this.Context.SaveChanges();

            if (items != null)
            {
                foreach (var item in items)
                {
                    CreateItem(newCollection.ExampleCollectionId, item.ItemBool, item.ItemInt, item.ItemString);
                }
            }

            return newCollection.ExampleCollectionId;
        }

        public ExampleCollection GetCollection(int exampleCollectionId, bool includeItems = true)
        {
            IQueryable<ExampleCollection> query = this.Context.ExampleCollections;
            if (includeItems == true)
            {
                query = query.Include(q => q.ExampleItems);
            }

            return query.SingleOrDefault(q => q.ExampleCollectionId == exampleCollectionId);
        }

        public void DeleteCollection(int exampleCollectionId)
        {
            var collection = GetCollection(exampleCollectionId);
            this.Context.ExampleItems.RemoveRange(collection.ExampleItems);
            collection.ExampleItems.Clear();
            this.Context.SaveChanges();
            this.Context.ExampleCollections.Remove(collection);
            this.Context.SaveChanges();
        }

        public List<ExampleCollection> GetCollections(List<int> collectionIds = null, bool includeItems = false)
        {
            IQueryable<ExampleCollection> query = this.Context.ExampleCollections;

            if(collectionIds != null && collectionIds.Count > 0)
            {
                query = query.Where(c => collectionIds.Any(id => id == c.ExampleCollectionId));
            }

            if (includeItems == true)
            {
                query = query.Include(q => q.ExampleItems);
            }

            return query.ToList();
        }

        public void UpdateCollection(int collectionId, string name)
        {
            var collection = this.GetCollection(collectionId);

            if (collection != null)
            {
                var changed = false;

                if (collection.Name != name)
                {
                    changed = true;
                    collection.Name = name;
                }

                if (changed)
                {
                    this.Context.SaveChanges();
                }
            }

        }
        #endregion ExampleCollection

        #region ExampleItem

        public int CreateItem(int exampleCollectionId, bool itemBool, int itemInt, string itemString)
        {
            var newItem = new Data.ExampleItem
            {
                ItemBool = itemBool,
                ItemInt = itemInt,
                ItemString = itemString,
            };

            this.Context.SaveChanges();
            var collection = this.GetCollection(exampleCollectionId);
            collection.ExampleItems.Add(newItem);
            this.Context.SaveChanges();
            return newItem.ExampleItemId;
        }

        public ExampleItem GetItem(int exampleItemId)
        {
            IQueryable<ExampleItem> query = this.Context.ExampleItems;

            return query.SingleOrDefault(q => q.ExampleItemId == exampleItemId);
        }

        public void DeleteItem(int exampleItemId)
        {
            var item = GetItem(exampleItemId);
            this.Context.ExampleItems.Remove(item);
            this.Context.SaveChanges();
        }

        public List<ExampleItem> GetItems(int? collectionId = null)
        {
            IQueryable<ExampleItem> query = this.Context.ExampleItems;
            if (collectionId.HasValue)
            {
                query = query.Where(i => i.ExampleCollectionId == collectionId.Value);
            }

            return query.ToList();
        }

        public void UpdateItem(int itemId, bool itemBool, int itemInt, string itemString)
        {
            var existingItem = this.GetItem(itemId);
            if (existingItem != null)
            {
                var changed = false;

                if (existingItem.ItemBool != itemBool)
                {
                    changed = true;
                    existingItem.ItemBool = itemBool;
                }
                if (existingItem.ItemInt != itemInt)
                {
                    changed = true;
                    existingItem.ItemInt = itemInt;
                }
                if (existingItem.ItemString != itemString)
                {
                    changed = true;
                    existingItem.ItemString = itemString;
                }

                if (changed)
                {
                    this.Context.SaveChanges();
                }
            }
        }

        #endregion ExampleItem

        #region IDisposable Support
        private bool disposedValue = false; // To detect redundant calls

        protected virtual void Dispose(bool disposing)
        {
            if (!disposedValue)
            {
                if (disposing)
                {
                    // TODO: dispose managed state (managed objects).
                    this.Context.Dispose();
                }

                // TODO: free unmanaged resources (unmanaged objects) and override a finalizer below.
                // TODO: set large fields to null.

                disposedValue = true;
            }
        }

        // TODO: override a finalizer only if Dispose(bool disposing) above has code to free unmanaged resources.
        // ~RestfulApiRepo() {
        //   // Do not change this code. Put cleanup code in Dispose(bool disposing) above.
        //   Dispose(false);
        // }

        // This code added to correctly implement the disposable pattern.
        public void Dispose()
        {
            // Do not change this code. Put cleanup code in Dispose(bool disposing) above.
            Dispose(true);
            // TODO: uncomment the following line if the finalizer is overridden above.
            // GC.SuppressFinalize(this);
        }
        #endregion

    }
}