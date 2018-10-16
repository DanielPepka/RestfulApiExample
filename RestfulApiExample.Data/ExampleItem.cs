namespace RestfulApiExample.Data
{
    /// <summary>
    /// ExampleItem is an example of an object that has required reference to another database object.
    /// </summary>
    public class ExampleItem
    { 
        // Primary Key
        public int ExampleItemId { get; set; }

        // Example Property Types
        public string ItemString { get; set; }
        public int ItemInt { get; set; }
        public bool ItemBool { get; set; }

        // Entity Framework foreign key
        public int ExampleCollectionId { get; set; }
        // Virtual object allows entity framework to use join table objects directly.
        public virtual ExampleCollection ExampleCollection { get; set; }
    }
}
