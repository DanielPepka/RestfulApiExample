using System.Collections.Generic;

namespace RestfulApiExample.Data
{
    /// <summary>
    /// ExampleCollection is an example of an object that contains a colletion of other database objects.
    /// </summary>
    public class ExampleCollection
    {
        public ExampleCollection()
        {
            // Do this so we never run into a situation where ExampleItems is null
            this.ExampleItems = new HashSet<ExampleItem>();
        }

        // Primary Key
        public int ExampleCollectionId { get; set; }
        public string Name { get; set; }

        // Entity Framework join table
        public virtual ICollection<ExampleItem> ExampleItems { get; set; }
    }
}
